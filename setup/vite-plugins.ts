import { existsSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

import { createJiti } from "jiti";

import { type CounterConfig } from "../src/counter";

const CONFIG_FILE = "slidev-addon-counter.config.ts";
const VIRTUAL_ID = "virtual:slidev-addon-counter/snapshots";
const RESOLVED_VIRTUAL_ID = "\0virtual:slidev-addon-counter/snapshots";
const DIRECT_VIRTUAL_PATHS = [
  "/virtual:slidev-addon-counter/snapshots",
  "/@slidev-addon-counter/snapshots",
];

export default function counterVitePlugins(options: {
  userRoot: string;
  data: {
    slides: Array<{
      index: number;
      title?: string;
      source: {
        content: string;
        filepath: string;
      };
    }>;
  };
}) {
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
      configureServer(server: {
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
      }) {
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
    },
  ];
}

async function createSnapshotModule(options: {
  userRoot: string;
}): Promise<string> {
  const rawConfig = await loadUserConfig(options.userRoot);

  return [
    `export const counterConfig = ${JSON.stringify(rawConfig ?? {}, null, 2)}`,
    "export const snapshots = {}",
    "export const operations = []",
  ].join("\n");
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
