import { existsSync } from "node:fs";
import { join, normalize } from "node:path";
import { pathToFileURL } from "node:url";

import { createJiti } from "jiti";

import type { CounterConfig } from "../src/counter";
import {
  createCounterSnapshotStore,
  type SnapshotSlide,
} from "./snapshot-store";

const CONFIG_FILE = "slidev-addon-counter.config.ts";
const VIRTUAL_ID = "virtual:slidev-addon-counter/snapshots";
const RESOLVED_VIRTUAL_ID = "\0virtual:slidev-addon-counter/snapshots";
const DIRECT_VIRTUAL_PATHS = [
  "/virtual:slidev-addon-counter/snapshots",
  "/@slidev-addon-counter/snapshots",
];
const HMR_BATCH_WINDOW_MS = 10;

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
}

interface HotUpdateWaiter {
  modules: readonly object[];
  resolve: (modules: object[]) => void;
  reject: (error: unknown) => void;
}

interface PendingHotUpdate {
  server: ViteDevServerLike;
  configChanged: boolean;
  waiters: HotUpdateWaiter[];
}

export default function counterVitePlugins(
  options: CounterPluginOptions,
): unknown[] {
  const snapshotStore = createCounterSnapshotStore();
  let configRevision = 0;
  let loadedConfigRevision: number | undefined;
  let loadedConfig: CounterConfig | undefined;
  let revision = 0;
  let pendingHotUpdate: PendingHotUpdate | undefined;

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

          getSnapshotModule()
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

        return getSnapshotModule();
      },
      async handleHotUpdate(ctx: {
        file: string;
        modules?: object[];
        server: ViteDevServerLike;
      }) {
        if (!isCounterDependency(ctx.file, options)) {
          return undefined;
        }

        return queueHotUpdate(
          ctx.server,
          isCounterConfigFile(ctx.file, options),
          ctx.modules ?? [],
        );
      },
    },
  ];

  function queueHotUpdate(
    server: ViteDevServerLike,
    configChanged: boolean,
    modules: readonly object[],
  ): Promise<object[]> {
    return new Promise((resolve, reject) => {
      if (!pendingHotUpdate) {
        pendingHotUpdate = {
          server,
          configChanged,
          waiters: [],
        };
        setTimeout(() => {
          if (pendingHotUpdate) {
            void flushHotUpdate(pendingHotUpdate);
          }
        }, HMR_BATCH_WINDOW_MS);
      } else {
        pendingHotUpdate.configChanged ||= configChanged;
      }

      pendingHotUpdate.waiters.push({ modules, resolve, reject });
    });
  }

  async function flushHotUpdate(batch: PendingHotUpdate): Promise<void> {
    if (pendingHotUpdate !== batch) {
      return;
    }
    pendingHotUpdate = undefined;

    try {
      if (batch.configChanged) {
        configRevision += 1;
      }
      revision += 1;
      const modules = uniqueModules([
        ...batch.waiters.flatMap((waiter) => waiter.modules),
        ...(await invalidateSnapshotModule(batch.server)),
      ]);
      batch.waiters.forEach((waiter, index) => {
        waiter.resolve(index === 0 ? modules : []);
      });
    } catch (error) {
      for (const waiter of batch.waiters) {
        waiter.reject(error);
      }
    }
  }

  async function getUserConfig(): Promise<CounterConfig | undefined> {
    if (loadedConfigRevision === configRevision) {
      return loadedConfig;
    }

    const nextConfig = await loadUserConfig(options.userRoot);
    loadedConfig = nextConfig;
    loadedConfigRevision = configRevision;
    return nextConfig;
  }

  async function getSnapshotModule(): Promise<string> {
    const result = snapshotStore.createSnapshotModule(
      toSnapshotSlides(options.data.slides),
      await getUserConfig(),
      configRevision,
      revision,
    );
    return result.code;
  }
}

function toSnapshotSlides(slides: readonly SlideSource[]): SnapshotSlide[] {
  return slides.map((slide) => ({
    index: slide.index,
    title: slide.title,
    content: slide.source.content,
    filepath: slide.source.filepath,
  }));
}

function watchCounterDependencies(
  server: ViteDevServerLike,
  options: CounterPluginOptions,
): void {
  const paths = [
    getConfigFilePath(options.userRoot),
    ...options.data.slides.map((slide) => slide.source.filepath),
  ];

  server.watcher.add([...new Set(paths)]);
}

async function invalidateSnapshotModule(
  server: ViteDevServerLike,
): Promise<object[]> {
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

  return modules;
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
  const configPath = getConfigFilePath(userRoot);
  return existsSync(configPath) ? configPath : undefined;
}

function getConfigFilePath(userRoot: string): string {
  return join(userRoot, CONFIG_FILE);
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
  return normalize(getConfigFilePath(options.userRoot)) === normalizedFile;
}

function uniqueModules(modules: readonly object[]): object[] {
  return [...new Set(modules)];
}
