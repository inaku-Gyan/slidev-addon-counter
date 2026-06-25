import { describe, expect, it } from "vitest";

import {
  buildCounterEntries,
  formatCounter,
  formatCounterValue,
} from "./counter";

describe("formatCounterValue", () => {
  it("formats decimal and zero-padded values", () => {
    expect(formatCounterValue(3)).toBe("3");
    expect(formatCounterValue(3, "zero")).toBe("03");
  });

  it("formats alphabetic values", () => {
    expect(formatCounterValue(1, "lower-alpha")).toBe("a");
    expect(formatCounterValue(27, "upper-alpha")).toBe("AA");
  });
});

describe("formatCounter", () => {
  it("joins multi-level counts", () => {
    expect(formatCounter([1, 2, 3])).toBe("1.2.3");
    expect(formatCounter([1, 2, 3], { separator: "-" })).toBe("1-2-3");
  });
});

describe("buildCounterEntries", () => {
  it("increments levels and resets lower levels", () => {
    expect(
      buildCounterEntries([
        { level: 1, title: "Intro" },
        { level: 2, title: "Motivation" },
        { level: 2, title: "API" },
        { level: 1, title: "Implementation" },
      ]),
    ).toEqual([
      { counts: [1], level: 1, number: "1", title: "Intro" },
      { counts: [1, 1], level: 2, number: "1.1", title: "Motivation" },
      { counts: [1, 2], level: 2, number: "1.2", title: "API" },
      { counts: [2], level: 1, number: "2", title: "Implementation" },
    ]);
  });
});
