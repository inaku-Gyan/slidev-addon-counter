import { existsSync } from "node:fs";
import { join } from "node:path";
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
      async load(id: string) {
        if (id !== RESOLVED_VIRTUAL_ID) {
          return undefined;
        }

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
      },
    },
  ];
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
