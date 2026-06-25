export type CounterStyle = "decimal" | "zero" | "lower-alpha" | "upper-alpha";

export interface CounterFormatOptions {
  style?: CounterStyle;
  separator?: string;
}

export interface CounterInput {
  level: number;
  title: string;
}

export interface CounterEntry {
  counts: number[];
  level: number;
  number: string;
  title: string;
}

export function formatCounterValue(
  value: number,
  style: CounterStyle = "decimal",
): string {
  if (style === "zero") {
    return String(value).padStart(2, "0");
  }

  if (style === "lower-alpha" || style === "upper-alpha") {
    const alphabetic = toAlphabetic(value);
    return style === "upper-alpha" ? alphabetic.toUpperCase() : alphabetic;
  }

  return String(value);
}

export function formatCounter(
  counts: readonly number[],
  options: CounterFormatOptions = {},
): string {
  const separator = options.separator ?? ".";
  return counts
    .map((count) => formatCounterValue(count, options.style))
    .join(separator);
}

export function buildCounterEntries(
  items: readonly CounterInput[],
): CounterEntry[] {
  const counts: number[] = [];

  return items.map((item) => {
    if (!Number.isInteger(item.level) || item.level < 1) {
      throw new RangeError(
        `Counter level must be a positive integer, got ${item.level}.`,
      );
    }

    const index = item.level - 1;
    counts[index] = (counts[index] ?? 0) + 1;
    counts.length = item.level;

    const currentCounts = [...counts];

    return {
      counts: currentCounts,
      level: item.level,
      number: formatCounter(currentCounts),
      title: item.title,
    };
  });
}

function toAlphabetic(value: number): string {
  if (!Number.isInteger(value) || value < 1) {
    throw new RangeError(
      `Alphabetic counter value must be a positive integer, got ${value}.`,
    );
  }

  let remaining = value;
  let result = "";

  while (remaining > 0) {
    remaining -= 1;
    result = String.fromCharCode(97 + (remaining % 26)) + result;
    remaining = Math.floor(remaining / 26);
  }

  return result;
}
