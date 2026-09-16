import { describe, expect, it, vi } from "vitest";

import counterVitePlugins from "./vite-plugins";

const RESOLVED_VIRTUAL_ID = "\0virtual:slidev-addon-counter/snapshots";

function createFixture() {
  const slides = [
    {
      index: 0,
      title: "One",
      source: {
        content: '<Counter op="one" />',
        filepath: "/deck.md",
      },
    },
    {
      index: 1,
      title: "Two",
      source: {
        content: '<Counter op="two" />',
        filepath: "/deck.md",
      },
    },
  ];
  const plugin = counterVitePlugins({
    userRoot: "/tmp/slidev-addon-counter-test",
    data: { slides },
  })[0] as {
    handleHotUpdate: (ctx: {
      file: string;
      modules?: object[];
      server: unknown;
    }) => Promise<unknown>;
    load: (id: string) => Promise<string | undefined>;
  };
  const snapshotModule = { id: RESOLVED_VIRTUAL_ID };
  const server = {
    moduleGraph: {
      getModuleById: vi.fn((id: string) =>
        id === RESOLVED_VIRTUAL_ID ? snapshotModule : undefined,
      ),
      getModuleByUrl: vi.fn(async () => undefined),
      invalidateModule: vi.fn(),
    },
    watcher: { add: vi.fn() },
    ws: { send: vi.fn() },
  };

  return { plugin, slides, server, snapshotModule };
}

describe("counter Vite plugin", () => {
  it("updates the virtual snapshot module without a full reload", async () => {
    const { plugin, slides, server, snapshotModule } = createFixture();
    const slideModule = { id: "/deck.md__slidev_2.md" };

    await plugin.load(RESOLVED_VIRTUAL_ID);
    slides[1].source.content = '<CounterDisplay op="two" />';

    const modules = await plugin.handleHotUpdate({
      file: "/deck.md",
      modules: [slideModule],
      server,
    });
    const updatedCode = await plugin.load(RESOLVED_VIRTUAL_ID);

    expect(modules).toContain(snapshotModule);
    expect(modules).toContain(slideModule);
    expect(server.ws.send).not.toHaveBeenCalled();
    expect(updatedCode).toContain("export const revision = 1");
    expect(updatedCode).toContain('"display": "1"');
  });

  it("recognizes a config path even when the file is absent", async () => {
    const { plugin, server, snapshotModule } = createFixture();

    const modules = await plugin.handleHotUpdate({
      file: "/tmp/slidev-addon-counter-test/slidev-addon-counter.config.ts",
      server,
    });

    expect(modules).toContain(snapshotModule);
    expect(server.ws.send).not.toHaveBeenCalled();
  });

  it("coalesces multiple dependency events into one HMR update", async () => {
    vi.useFakeTimers();
    try {
      const { plugin, server, snapshotModule } = createFixture();
      const firstSlideModule = { id: "/deck.md__slidev_1.md" };
      const secondSlideModule = { id: "/deck.md__slidev_2.md" };
      const firstUpdate = plugin.handleHotUpdate({
        file: "/deck.md",
        modules: [firstSlideModule],
        server,
      });
      const secondUpdate = plugin.handleHotUpdate({
        file: "/deck.md",
        modules: [secondSlideModule],
        server,
      });

      await vi.advanceTimersByTimeAsync(10);
      const [firstModules, secondModules] = await Promise.all([
        firstUpdate,
        secondUpdate,
      ]);

      expect(firstModules).toContain(snapshotModule);
      expect(firstModules).toContain(firstSlideModule);
      expect(firstModules).toContain(secondSlideModule);
      expect(secondModules).toEqual([]);
      expect(server.ws.send).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });
});
