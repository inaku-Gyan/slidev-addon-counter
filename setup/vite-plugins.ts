import { existsSync } from "node:fs";
import { join, normalize } from "node:path";
import { pathToFileURL } from "node:url";

import { createJiti } from "jiti";

import {
  buildCounterTimeline,
  extractCounterOperations,
  normalizeCounterConfig,
  type CounterConfig,
} from "../src/counter";

const CONFIG_FILE = "slidev-addon-counter.config.ts";
const VIRTUAL_ID = "virtual:slidev-addon-counter/snapshots";
const RESOLVED_VIRTUAL_ID = "\0virtual:slidev-addon-counter/snapshots";
const DIRECT_VIRTUAL_PATHS = [
  "/virtual:slidev-addon-counter/snapshots",
  "/@slidev-addon-counter/snapshots",
];

interface CounterPluginOptions {
  userRoot: string;
  data: {
    slides: SlideSource[];
  };
}

interface SlideSource {
  index: number;
  title?: string;
  source: {
    content: string;
    filepath: string;
  };
}

interface ViteDevServerLike {
  middlewares: {
    use: (
      handler: (
        req: { url?: string },
        res: {
          end: (chunk?: string) => void;
          setHeader: (name: string, value: string) => void;
          statusCode: number;
        },
        next: (error?: unknown) => void,
      ) => void,
    ) => void;
  };
  moduleGraph: {
    getModuleById: (id: string) => unknown;
    getModuleByUrl?: (url: string) => Promise<unknown>;
    invalidateModule: (module: unknown) => void;
  };
  watcher: {
    add: (path: string | string[]) => void;
  };
  ws: {
    send: (payload: {
      path?: string;
      timestamp?: number;
      type: string;
    }) => void;
  };
}

export default function counterVitePlugins(
  options: CounterPluginOptions,
): unknown[] {
  return [
    {
      name: "slidev-addon-counter",
      async buildStart(this: { addWatchFile: (id: string) => void }) {
        const configPath = getConfigPath(options.userRoot);
        if (configPath) {
          this.addWatchFile(configPath);
        }
        for (const slide of options.data.slides) {
          this.addWatchFile(slide.source.filepath);
        }
      },
      resolveId(id: string) {
        return id === VIRTUAL_ID ? RESOLVED_VIRTUAL_ID : undefined;
      },
      configureServer(server: ViteDevServerLike) {
        watchCounterDependencies(server, options);

        server.middlewares.use((req, res, next) => {
          if (!isDirectVirtualRequest(req.url)) {
            next();
            return;
          }

          createSnapshotModule(options)
            .then((code) => {
              res.statusCode = 200;
              res.setHeader("Content-Type", "text/javascript");
              res.end(code);
            })
            .catch(next);
        });
      },
      async load(id: string) {
        if (id !== RESOLVED_VIRTUAL_ID) {
          return undefined;
        }

        return createSnapshotModule(options);
      },
      async handleHotUpdate(ctx: { file: string; server: ViteDevServerLike }) {
        if (!isCounterDependency(ctx.file, options)) {
          return undefined;
        }

        await invalidateSnapshotModule(ctx.server);
        queueFullReload(ctx.server);

        return undefined;
      },
    },
  ];
}

async function createSnapshotModule(
  options: CounterPluginOptions,
): Promise<string> {
  const rawConfig = await loadUserConfig(options.userRoot);
  const config = normalizeCounterConfig(rawConfig);
  const operations = options.data.slides.flatMap((slide) =>
    extractCounterOperations(
      slide.source.content,
      slide.index + 1,
      slide.title,
    ),
  );
  const timeline = buildCounterTimeline(operations, config);

  return [
    `export const snapshots = ${JSON.stringify(timeline.snapshots, null, 2)}`,
    `export const operations = ${JSON.stringify(timeline.operations, null, 2)}`,
  ].join("\n");
}

function watchCounterDependencies(
  server: ViteDevServerLike,
  options: CounterPluginOptions,
): void {
  const configPath = getConfigPath(options.userRoot);
  const paths = [
    ...(configPath ? [configPath] : []),
    ...options.data.slides.map((slide) => slide.source.filepath),
  ];

  server.watcher.add([...new Set(paths)]);
}

async function invalidateSnapshotModule(
  server: ViteDevServerLike,
): Promise<void> {
  const modules = [
    server.moduleGraph.getModuleById(RESOLVED_VIRTUAL_ID),
    server.moduleGraph.getModuleById(VIRTUAL_ID),
    ...(await Promise.all(
      DIRECT_VIRTUAL_PATHS.map((path) =>
        server.moduleGraph.getModuleByUrl?.(path),
      ),
    )),
  ].filter((module): module is object => Boolean(module));

  for (const module of modules) {
    server.moduleGraph.invalidateModule(module);
  }
}

async function loadUserConfig(
  userRoot: string,
): Promise<CounterConfig | undefined> {
  const configPath = getConfigPath(userRoot);
  if (!configPath) {
    return undefined;
  }

  const jiti = createJiti(import.meta.url, { moduleCache: false });
  const configModule = await jiti.import<{ default?: CounterConfig }>(
    pathToFileURL(configPath).href,
  );
  return configModule.default;
}

function getConfigPath(userRoot: string): string | undefined {
  const configPath = join(userRoot, CONFIG_FILE);
  return existsSync(configPath) ? configPath : undefined;
}

function isDirectVirtualRequest(url: string | undefined): boolean {
  if (!url) {
    return false;
  }

  const pathname = url.split("?", 1)[0];
  return DIRECT_VIRTUAL_PATHS.includes(pathname);
}

function isCounterDependency(
  file: string,
  options: CounterPluginOptions,
): boolean {
  const normalizedFile = normalize(file);
  if (isCounterConfigFile(normalizedFile, options)) {
    return true;
  }

  return options.data.slides.some(
    (slide) => normalize(slide.source.filepath) === normalizedFile,
  );
}

function isCounterConfigFile(
  file: string,
  options: CounterPluginOptions,
): boolean {
  const normalizedFile = normalize(file);
  const configPath = getConfigPath(options.userRoot);
  if (configPath && normalize(configPath) === normalizedFile) {
    return true;
  }

  return false;
}

function queueFullReload(server: ViteDevServerLike): void {
  setTimeout(() => {
    server.ws.send({
      type: "full-reload",
      path: "*",
      timestamp: Date.now(),
    });
  }, 50);
}
