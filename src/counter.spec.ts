import { describe, expect, it } from "vitest";

import {
  buildCounterTimeline,
  extractCounterOperations,
  formatCounterValue,
  getCounterDefinition,
  injectCounterOperationIds,
  normalizeCounterConfig,
  renderCounterFormat,
} from "./counter";

describe("formatCounterValue", () => {
  it("formats built-in styles", () => {
    expect(formatCounterValue(3)).toBe("3");
    expect(formatCounterValue(3, "zero")).toBe("03");
    expect(formatCounterValue(27, "lower-alpha")).toBe("aa");
    expect(formatCounterValue(27, "upper-alpha")).toBe("AA");
    expect(formatCounterValue(14, "lower-roman")).toBe("xiv");
    expect(formatCounterValue(14, "upper-roman")).toBe("XIV");
    expect(formatCounterValue(12, "cjk")).toBe("十二");
  });
});

describe("normalizeCounterConfig", () => {
  it("creates a default infinite counter", () => {
    const config = normalizeCounterConfig(undefined);
    const counter = getCounterDefinition(config, "default");

    expect(counter.id).toBe("default");
    expect(counter.defaultLevel).toBe(1);
    expect(counter.levels.size).toBe(0);
  });

  it("adds a default counter alongside configured counters", () => {
    const config = normalizeCounterConfig({
      counters: [{ id: "section" }],
    });
    const counter = getCounterDefinition(config, "default");

    expect(counter.id).toBe("default");
    expect(counter.defaultLevel).toBe(1);
    expect(counter.levels.size).toBe(0);
    expect(getCounterDefinition(config, "section").id).toBe("section");
  });

  it("lets explicit default counter config override the built-in default", () => {
    const config = normalizeCounterConfig({
      counters: [
        {
          id: "default",
          defaultLevel: "section",
          levels: [
            { level: 1, alias: "chapter" },
            { level: 2, alias: "section" },
          ],
        },
      ],
    });
    const counter = getCounterDefinition(config, "default");

    expect(counter.defaultLevel).toBe(2);
    expect(counter.aliases.get("section")).toBe(2);
  });

  it("sorts references through explicit levels and aliases", () => {
    const config = normalizeCounterConfig({
      counters: [
        {
          id: "section",
          levels: [
            { level: 2, alias: "section" },
            { level: 1, alias: "chapter" },
          ],
        },
      ],
    });
    const counter = getCounterDefinition(config, "section");

    expect(counter.aliases.get("chapter")).toBe(1);
    expect(counter.aliases.get("section")).toBe(2);
  });

  it("normalizes numeric and alias default levels", () => {
    const config = normalizeCounterConfig({
      counters: [
        {
          id: "section",
          defaultLevel: "section",
          levels: [
            { level: 1, alias: "chapter" },
            { level: 2, alias: "section" },
          ],
        },
        {
          id: "appendix",
          defaultLevel: 2,
        },
      ],
    });

    expect(getCounterDefinition(config, "section").defaultLevel).toBe(2);
    expect(getCounterDefinition(config, "appendix").defaultLevel).toBe(2);
  });

  it("rejects invalid default levels", () => {
    expect(() =>
      normalizeCounterConfig({
        counters: [{ id: "section", defaultLevel: 0 }],
      }),
    ).toThrow("positive integer");

    expect(() =>
      normalizeCounterConfig({
        counters: [{ id: "section", defaultLevel: "@+1" }],
      }),
    ).toThrow("relative level reference");

    expect(() =>
      normalizeCounterConfig({
        counters: [{ id: "section", defaultLevel: "missing" }],
      }),
    ).toThrow('unknown level alias "missing"');
  });

  it("rejects duplicate aliases and levels", () => {
    expect(() =>
      normalizeCounterConfig({
        counters: [
          {
            id: "section",
            levels: [
              { level: 1, alias: "chapter" },
              { level: 1, alias: "section" },
            ],
          },
        ],
      }),
    ).toThrow("duplicates level 1");

    expect(() =>
      normalizeCounterConfig({
        counters: [
          {
            id: "section",
            levels: [
              { level: 1, alias: "chapter" },
              { level: 2, alias: "chapter" },
            ],
          },
        ],
      }),
    ).toThrow('duplicates alias "chapter"');
  });

  it("rejects missing and duplicate counter ids", () => {
    expect(() =>
      normalizeCounterConfig({
        counters: [{ id: "" }],
      }),
    ).toThrow("non-empty string");

    expect(() =>
      normalizeCounterConfig({
        counters: [{ id: "section" }, { id: "section" }],
      }),
    ).toThrow('duplicates counter id "section"');
  });

  it("rejects aliases that conflict with level refs", () => {
    for (const alias of ["1", "@0", "chapter:one"]) {
      expect(() =>
        normalizeCounterConfig({
          counters: [
            {
              id: "section",
              levels: [{ level: 1, alias }],
            },
          ],
        }),
      ).toThrow("alias");
    }
  });

  it("rejects unsupported styles and reset rules", () => {
    expect(() =>
      normalizeCounterConfig({
        counters: [
          {
            id: "section",
            levels: [{ level: 1, style: "binary" as never }],
          },
        ],
      }),
    ).toThrow("style");

    expect(() =>
      normalizeCounterConfig({
        counters: [
          {
            id: "section",
            levels: [{ level: 1, reset: "parent" as never }],
          },
        ],
      }),
    ).toThrow("reset");
  });
});

describe("renderCounterFormat", () => {
  it("renders value and full placeholders", () => {
    const config = normalizeCounterConfig({
      counters: [
        {
          id: "section",
          levels: [
            { level: 1, alias: "chapter", format: "第 %{:value} 章" },
            { level: 2, alias: "section", format: "%{@-1:full}.%{:value}" },
          ],
        },
      ],
    });
    const counter = getCounterDefinition(config, "section");

    expect(renderCounterFormat(counter, [2, 3], 2)).toBe("第 2 章.3");
    expect(renderCounterFormat(counter, [2, 3], 1)).toBe("第 2 章");
  });

  it("renders value refs and raw refs", () => {
    const config = normalizeCounterConfig({
      counters: [
        {
          id: "theorem",
          levels: [
            {
              level: 1,
              alias: "theorem",
              style: "upper-roman",
              format: "T%{theorem:raw}=%{theorem:value}",
            },
          ],
        },
      ],
    });
    const counter = getCounterDefinition(config, "theorem");

    expect(renderCounterFormat(counter, [4], 1)).toBe("T4=IV");
  });

  it("rejects missing colon syntax, unknown placeholders, and recursive full refs", () => {
    const unknown = getCounterDefinition(
      normalizeCounterConfig({
        counters: [{ id: "c", levels: [{ level: 1, format: "%{missing}" }] }],
      }),
      "c",
    );
    expect(() => renderCounterFormat(unknown, [1], 1)).toThrow(
      "without required ref:kind syntax",
    );

    const unknownKind = getCounterDefinition(
      normalizeCounterConfig({
        counters: [{ id: "c", levels: [{ level: 1, format: "%{:missing}" }] }],
      }),
      "c",
    );
    expect(() => renderCounterFormat(unknownKind, [1], 1)).toThrow(
      'Unknown counter format placeholder "%{:missing}"',
    );

    const recursive = getCounterDefinition(
      normalizeCounterConfig({
        counters: [{ id: "c", levels: [{ level: 1, format: "%{:full}" }] }],
      }),
      "c",
    );
    expect(() => renderCounterFormat(recursive, [1], 1)).toThrow(
      "recursively references itself",
    );
  });

  it("rejects full refs to deeper levels", () => {
    const byNumber = getCounterDefinition(
      normalizeCounterConfig({
        counters: [{ id: "c", levels: [{ level: 2, format: "%{3:full}" }] }],
      }),
      "c",
    );
    expect(() => renderCounterFormat(byNumber, [1, 2, 3], 2)).toThrow(
      "cannot use full reference to deeper level 3",
    );

    const byRelative = getCounterDefinition(
      normalizeCounterConfig({
        counters: [{ id: "c", levels: [{ level: 2, format: "%{@+1:full}" }] }],
      }),
      "c",
    );
    expect(() => renderCounterFormat(byRelative, [1, 2, 3], 2)).toThrow(
      "cannot use full reference to deeper level 3",
    );
  });

  it("rejects invalid relative refs", () => {
    const config = normalizeCounterConfig({
      counters: [
        {
          id: "c",
          levels: [
            { level: 1, format: "%{@-1:value}" },
            { level: 2, format: "%{@foo:value}" },
          ],
        },
      ],
    });
    const counter = getCounterDefinition(config, "c");

    expect(() => renderCounterFormat(counter, [1], 1)).toThrow(
      'relative level reference "@-1"',
    );
    expect(() => renderCounterFormat(counter, [1, 1], 2)).toThrow(
      'Relative level reference "@foo" is not valid',
    );
  });
});

describe("buildCounterTimeline", () => {
  it("keeps multiple counters independent", () => {
    const timeline = buildCounterTimeline(
      [
        {
          id: "a",
          counter: "section",
          level: 1,
          action: "step",
          slideNo: 1,
          order: 0,
        },
        {
          id: "b",
          counter: "theorem",
          level: 1,
          action: "step",
          slideNo: 1,
          order: 1,
        },
        {
          id: "c",
          counter: "section",
          level: 2,
          action: "step",
          slideNo: 2,
          order: 0,
        },
        {
          id: "d",
          counter: "theorem",
          level: 1,
          action: "display",
          slideNo: 2,
          order: 1,
        },
      ],
      {
        counters: [
          { id: "section" },
          {
            id: "theorem",
            levels: [
              { level: 1, style: "upper-roman", format: "Theorem %{:value}" },
            ],
          },
        ],
      },
    );

    expect(timeline.snapshots.a.display).toBe("1");
    expect(timeline.snapshots.b.display).toBe("Theorem I");
    expect(timeline.snapshots.c.display).toBe("1.1");
    expect(timeline.snapshots.d.display).toBe("Theorem I");
  });

  it("supports increment without display and display without increment", () => {
    const timeline = buildCounterTimeline(
      [
        {
          id: "a",
          counter: "default",
          level: 1,
          action: "increment",
          slideNo: 1,
          order: 0,
        },
        {
          id: "b",
          counter: "default",
          level: 1,
          action: "display",
          slideNo: 1,
          order: 1,
        },
      ],
      undefined,
    );

    expect(timeline.snapshots.a.display).toBe("1");
    expect(timeline.snapshots.b.display).toBe("1");
  });

  it("uses level 1 when operation level and config default level are omitted", () => {
    const timeline = buildCounterTimeline(
      [
        {
          id: "a",
          counter: "default",
          action: "step",
          slideNo: 1,
          order: 0,
        },
      ],
      undefined,
    );

    expect(timeline.snapshots.a.level).toBe(1);
    expect(timeline.snapshots.a.display).toBe("1");
  });

  it("uses configured default levels when operation level is omitted", () => {
    const timeline = buildCounterTimeline(
      [
        {
          id: "a",
          counter: "section",
          action: "step",
          slideNo: 1,
          order: 0,
        },
        {
          id: "b",
          counter: "theorem",
          action: "step",
          slideNo: 1,
          order: 1,
        },
      ],
      {
        counters: [
          { id: "section", defaultLevel: 2 },
          {
            id: "theorem",
            defaultLevel: "theorem",
            levels: [
              {
                level: 1,
                alias: "theorem",
                style: "upper-roman",
                format: "Theorem %{:value}",
              },
            ],
          },
        ],
      },
    );

    expect(timeline.snapshots.a.level).toBe(2);
    expect(timeline.snapshots.a.display).toBe("0.1");
    expect(timeline.snapshots.b.level).toBe(1);
    expect(timeline.snapshots.b.display).toBe("Theorem I");
  });

  it("uses the built-in default counter with custom config", () => {
    const timeline = buildCounterTimeline(
      [
        {
          id: "a",
          counter: "default",
          action: "step",
          slideNo: 1,
          order: 0,
        },
      ],
      {
        counters: [{ id: "section" }],
      },
    );

    expect(timeline.snapshots.a.level).toBe(1);
    expect(timeline.snapshots.a.display).toBe("1");
  });

  it("lets explicit operation levels override configured default levels", () => {
    const timeline = buildCounterTimeline(
      [
        {
          id: "a",
          counter: "section",
          level: 1,
          action: "step",
          slideNo: 1,
          order: 0,
        },
      ],
      {
        counters: [{ id: "section", defaultLevel: 2 }],
      },
    );

    expect(timeline.snapshots.a.level).toBe(1);
    expect(timeline.snapshots.a.display).toBe("1");
  });
});

describe("counter component scanner", () => {
  it("extracts only real markdown html counter components", () => {
    const content = [
      "```vue",
      '<Counter id="ignored" level="chapter" />',
      "```",
      '`<Counter id="ignored" level="chapter" />`',
      '<Counter id="section" level="chapter" />',
      'Text <Counter id="section" level="section" />',
      '<CounterInc id="theorem" :level="1" />',
      '<CounterDisplay id="theorem" level="theorem" />',
    ].join("\n");

    expect(extractCounterOperations(content, 3, "Title")).toMatchObject([
      {
        id: "counter-s3-o0",
        counter: "section",
        level: "chapter",
        action: "step",
      },
      {
        id: "counter-s3-o1",
        counter: "section",
        level: "section",
        action: "step",
      },
      {
        id: "counter-s3-o2",
        counter: "theorem",
        level: 1,
        action: "increment",
      },
      {
        id: "counter-s3-o3",
        counter: "theorem",
        level: "theorem",
        action: "display",
      },
    ]);

    expect(injectCounterOperationIds(content, 3)).toEqual([
      { index: 103, value: ' op="counter-s3-o0"' },
      { index: 149, value: ' op="counter-s3-o1"' },
      { index: 193, value: ' op="counter-s3-o2"' },
      { index: 236, value: ' op="counter-s3-o3"' },
    ]);
  });

  it("allows counter components to omit level", () => {
    const operations = extractCounterOperations(
      [
        '<Counter id="section" />',
        '<CounterInc id="section" />',
        '<CounterDisplay id="section" />',
      ].join("\n"),
      1,
    );

    expect(operations).toMatchObject([
      { counter: "section", action: "step" },
      { counter: "section", action: "increment" },
      { counter: "section", action: "display" },
    ]);
    expect(operations.every((operation) => operation.level == null)).toBe(true);
  });
});
