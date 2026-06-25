export type CounterStyle =
  | "decimal"
  | "zero"
  | "lower-alpha"
  | "upper-alpha"
  | "lower-roman"
  | "upper-roman"
  | "cjk";

export type CounterReset = "lower" | "none";
export type CounterAction = "step" | "increment" | "display";
export type LevelRef = number | string;

export interface CounterLevelConfig {
  level: number;
  alias?: string;
  style?: CounterStyle;
  format?: string;
  reset?: CounterReset;
}

export interface CounterDefinition {
  levels?: CounterLevelConfig[];
}

export interface CounterConfig {
  counters?: Record<string, CounterDefinition>;
}

export interface NormalizedCounterLevel {
  level: number;
  alias?: string;
  style: CounterStyle;
  format: string;
  reset: CounterReset;
}

export interface NormalizedCounterDefinition {
  id: string;
  levels: Map<number, NormalizedCounterLevel>;
  aliases: Map<string, number>;
}

export interface NormalizedCounterConfig {
  counters: Map<string, NormalizedCounterDefinition>;
}

export interface CounterOperation {
  id: string;
  counter: string;
  level: LevelRef;
  action: CounterAction;
  slideNo: number;
  order: number;
  title?: string;
}

export interface CounterSnapshot {
  id: string;
  counter: string;
  level: number;
  action: CounterAction;
  counts: number[];
  display: string;
}

export interface CounterTimeline {
  snapshots: Record<string, CounterSnapshot>;
  operations: CounterOperation[];
}

interface RenderContext {
  counts: readonly number[];
  counter: NormalizedCounterDefinition;
  currentLevel: number;
  stack: number[];
}

const BUILTIN_STYLES = new Set<CounterStyle>([
  "decimal",
  "zero",
  "lower-alpha",
  "upper-alpha",
  "lower-roman",
  "upper-roman",
  "cjk",
]);

const BUILTIN_RESETS = new Set<CounterReset>(["lower", "none"]);
const BUILTIN_PLACEHOLDER_KINDS = new Set(["value", "raw", "full"]);
const PLACEHOLDER_RE = /%\{([^}]*)\}/g;

export function defineCounterConfig<T extends CounterConfig>(config: T): T {
  return config;
}

export function normalizeCounterConfig(
  config: CounterConfig | undefined,
): NormalizedCounterConfig {
  const inputCounters = config?.counters ?? { default: {} };
  const counters = new Map<string, NormalizedCounterDefinition>();

  for (const [id, definition] of Object.entries(inputCounters)) {
    if (!id) {
      throw new Error("counters contains an empty counter id.");
    }

    const levels = new Map<number, NormalizedCounterLevel>();
    const aliases = new Map<string, number>();

    for (const [index, levelConfig] of (definition.levels ?? []).entries()) {
      const path = `counters.${id}.levels[${index}]`;

      if (!Number.isInteger(levelConfig.level) || levelConfig.level < 1) {
        throw new Error(`${path}.level must be a positive integer.`);
      }

      if (levels.has(levelConfig.level)) {
        throw new Error(`${path}.level duplicates level ${levelConfig.level}.`);
      }

      if (levelConfig.alias != null) {
        validateAlias(levelConfig.alias, `${path}.alias`);
        if (aliases.has(levelConfig.alias)) {
          throw new Error(
            `${path}.alias duplicates alias "${levelConfig.alias}".`,
          );
        }
        aliases.set(levelConfig.alias, levelConfig.level);
      }

      const style = levelConfig.style ?? "decimal";
      if (!BUILTIN_STYLES.has(style)) {
        throw new Error(`${path}.style "${style}" is not supported.`);
      }

      const reset = levelConfig.reset ?? "lower";
      if (!BUILTIN_RESETS.has(reset)) {
        throw new Error(`${path}.reset "${reset}" is not supported.`);
      }

      levels.set(levelConfig.level, {
        level: levelConfig.level,
        alias: levelConfig.alias,
        style,
        format: levelConfig.format ?? getDefaultFormat(levelConfig.level),
        reset,
      });
    }

    counters.set(id, { id, levels, aliases });
  }

  if (counters.size === 0) {
    counters.set("default", {
      id: "default",
      levels: new Map(),
      aliases: new Map(),
    });
  }

  return { counters };
}

export function getCounterDefinition(
  config: NormalizedCounterConfig,
  counterId: string,
): NormalizedCounterDefinition {
  const definition = config.counters.get(counterId);
  if (definition) {
    return definition;
  }

  throw new Error(`Counter "${counterId}" is not defined.`);
}

export function getLevelConfig(
  counter: NormalizedCounterDefinition,
  level: number,
): NormalizedCounterLevel {
  return (
    counter.levels.get(level) ?? {
      level,
      style: "decimal",
      format: getDefaultFormat(level),
      reset: "lower",
    }
  );
}

export function resolveLevelRef(
  counter: NormalizedCounterDefinition,
  ref: LevelRef | undefined,
  currentLevel: number,
): number {
  if (ref == null || ref === "") {
    return currentLevel;
  }

  if (typeof ref === "number") {
    validateLevel(ref, `level reference "${ref}"`);
    return ref;
  }

  if (/^@[+-]?\d+$/.test(ref)) {
    const level = currentLevel + Number(ref.slice(1));
    validateLevel(level, `relative level reference "${ref}"`);
    return level;
  }

  if (ref.startsWith("@")) {
    throw new Error(`Relative level reference "${ref}" is not valid.`);
  }

  if (/^\d+$/.test(ref)) {
    const level = Number(ref);
    validateLevel(level, `level reference "${ref}"`);
    return level;
  }

  const aliasLevel = counter.aliases.get(ref);
  if (aliasLevel != null) {
    return aliasLevel;
  }

  throw new Error(
    `format reference "${ref}" references unknown level "${ref}" in counter "${counter.id}".`,
  );
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

  if (style === "lower-roman" || style === "upper-roman") {
    const roman = toRoman(value);
    return style === "upper-roman" ? roman.toUpperCase() : roman;
  }

  if (style === "cjk") {
    return toCjk(value);
  }

  return String(value);
}

export function renderCounterFormat(
  counter: NormalizedCounterDefinition,
  counts: readonly number[],
  targetLevel: number,
): string {
  validateLevel(targetLevel, `target level "${targetLevel}"`);

  return renderFullLevel({
    counts,
    counter,
    currentLevel: targetLevel,
    stack: [],
  });
}

export function buildCounterTimeline(
  operations: readonly CounterOperation[],
  config: CounterConfig | NormalizedCounterConfig | undefined,
): CounterTimeline {
  const normalized = isNormalizedCounterConfig(config)
    ? config
    : normalizeCounterConfig(config);

  const sorted = [...operations].sort((a, b) => {
    return a.slideNo - b.slideNo || a.order - b.order;
  });

  const states = new Map<string, number[]>();
  const snapshots: Record<string, CounterSnapshot> = {};

  for (const operation of sorted) {
    const counter = getCounterDefinition(normalized, operation.counter);
    const level = resolveLevelRef(counter, operation.level, 1);
    const counts = states.get(operation.counter) ?? [];

    if (operation.action === "step" || operation.action === "increment") {
      for (let i = 0; i < level - 1; i += 1) {
        counts[i] ??= 0;
      }

      counts[level - 1] = (counts[level - 1] ?? 0) + 1;

      if (getLevelConfig(counter, level).reset === "lower") {
        counts.length = level;
      }

      states.set(operation.counter, counts);
    }

    const snapshotCounts = [...counts];
    snapshots[operation.id] = {
      id: operation.id,
      counter: operation.counter,
      level,
      action: operation.action,
      counts: snapshotCounts,
      display: renderCounterFormat(counter, snapshotCounts, level),
    };
  }

  return {
    snapshots,
    operations: sorted,
  };
}

function isNormalizedCounterConfig(
  config: CounterConfig | NormalizedCounterConfig | undefined,
): config is NormalizedCounterConfig {
  return config?.counters instanceof Map;
}

export function extractCounterOperations(
  content: string,
  slideNo: number,
  title?: string,
): CounterOperation[] {
  const operations: CounterOperation[] = [];

  for (const match of content.matchAll(COUNTER_TAG_RE)) {
    const [, component, attrs = ""] = match;
    const id =
      readStringAttribute(attrs, "op") ??
      getCounterOperationId(slideNo, operations.length);
    const counter = readStringAttribute(attrs, "id") ?? "default";
    const level = readLevelAttribute(attrs);
    const action = getAction(component, readStringAttribute(attrs, "action"));

    if (level == null) {
      throw new Error(
        `<${component}> on slide ${slideNo} is missing required prop "level".`,
      );
    }

    operations.push({
      id,
      counter,
      level,
      action,
      slideNo,
      order: operations.length,
      title,
    });
  }

  return operations;
}

export function getCounterOperationId(slideNo: number, order: number): string {
  return `counter-s${slideNo}-o${order}`;
}

export function injectCounterOperationIds(
  content: string,
  slideNo: number,
): Array<{ index: number; value: string }> {
  const edits: Array<{ index: number; value: string }> = [];
  let order = 0;

  for (const match of content.matchAll(COUNTER_TAG_RE)) {
    const [tag, component, attrs = ""] = match;
    if (/\sop\s*=/.test(attrs)) {
      order += 1;
      continue;
    }

    edits.push({
      index: match.index + 1 + component.length,
      value: ` op="${getCounterOperationId(slideNo, order)}"`,
    });
    order += 1;

    if (tag.includes("\n")) {
      throw new Error(
        `<${component}> on slide ${slideNo} must keep its opening tag on one line.`,
      );
    }
  }

  return edits;
}

function renderFullLevel(context: RenderContext): string {
  const { counter, currentLevel, stack } = context;
  if (stack.includes(currentLevel)) {
    throw new Error(
      `format for counter "${counter.id}" level ${currentLevel} recursively references itself.`,
    );
  }

  const levelConfig = getLevelConfig(counter, currentLevel);
  const nextContext = {
    ...context,
    stack: [...stack, currentLevel],
  };

  return levelConfig.format.replace(
    PLACEHOLDER_RE,
    (placeholder: string, body: string) => {
      const { ref, kind } = parsePlaceholder(
        placeholder,
        body,
        levelConfig.format,
      );

      if (kind === "value") {
        return renderLevelValue(nextContext, ref);
      }

      if (kind === "raw") {
        const level = resolveLevelRef(counter, ref, currentLevel);
        return String(context.counts[level - 1] ?? 0);
      }

      if (kind === "full") {
        return renderRefFull(nextContext, ref);
      }

      throw new Error(`Unknown counter format placeholder "${placeholder}".`);
    },
  );
}

function renderLevelValue(context: RenderContext, ref: string): string {
  const level = resolveLevelRef(context.counter, ref, context.currentLevel);
  const levelConfig = getLevelConfig(context.counter, level);
  return formatCounterValue(context.counts[level - 1] ?? 0, levelConfig.style);
}

function renderRefFull(context: RenderContext, ref: string): string {
  const level = resolveLevelRef(context.counter, ref, context.currentLevel);
  if (level === context.currentLevel) {
    throw new Error(
      `format for counter "${context.counter.id}" level ${context.currentLevel} recursively references itself.`,
    );
  }

  if (level > context.currentLevel) {
    throw new Error(
      `format for counter "${context.counter.id}" level ${context.currentLevel} cannot use full reference to deeper level ${level}.`,
    );
  }

  return renderFullLevel({
    ...context,
    currentLevel: level,
  });
}

function getDefaultFormat(level: number): string {
  validateLevel(level, `level "${level}"`);
  return level === 1 ? "%{:value}" : "%{@-1:full}.%{:value}";
}

function validateLevel(level: number, label: string): void {
  if (!Number.isInteger(level) || level < 1) {
    throw new Error(`${label} must be a positive integer.`);
  }
}

function validateAlias(alias: string, path: string): void {
  if (!/^[A-Za-z_][\w-]*$/.test(alias)) {
    throw new Error(`${path} must be an identifier-like string.`);
  }

  if (/^\d+$/.test(alias) || alias.startsWith("@") || alias.includes(":")) {
    throw new Error(`${path} "${alias}" is reserved.`);
  }
}

function parsePlaceholder(
  placeholder: string,
  body: string,
  format: string,
): { ref: string; kind: string } {
  const parts = body.split(":");
  if (parts.length !== 2) {
    throw new Error(
      `format "${format}" uses placeholder "${placeholder}" without required ref:kind syntax.`,
    );
  }

  const [ref, kind] = parts;
  if (!BUILTIN_PLACEHOLDER_KINDS.has(kind)) {
    throw new Error(`Unknown counter format placeholder "${placeholder}".`);
  }

  return { ref, kind };
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

function toRoman(value: number): string {
  if (!Number.isInteger(value) || value < 1 || value > 3999) {
    throw new RangeError(
      `Roman counter value must be an integer between 1 and 3999, got ${value}.`,
    );
  }

  const parts: Array<[number, string]> = [
    [1000, "m"],
    [900, "cm"],
    [500, "d"],
    [400, "cd"],
    [100, "c"],
    [90, "xc"],
    [50, "l"],
    [40, "xl"],
    [10, "x"],
    [9, "ix"],
    [5, "v"],
    [4, "iv"],
    [1, "i"],
  ];

  let remaining = value;
  let result = "";

  for (const [amount, numeral] of parts) {
    while (remaining >= amount) {
      result += numeral;
      remaining -= amount;
    }
  }

  return result;
}

function toCjk(value: number): string {
  if (!Number.isInteger(value) || value < 0 || value > 9999) {
    throw new RangeError(
      `CJK counter value must be an integer between 0 and 9999, got ${value}.`,
    );
  }

  const digits = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
  if (value < 10) {
    return digits[value];
  }

  const units = ["", "十", "百", "千"];
  const chars = String(value).split("").map(Number).reverse();

  let result = "";
  let pendingZero = false;

  chars.forEach((digit, index) => {
    if (digit === 0) {
      pendingZero = result.length > 0;
      return;
    }

    const part = `${digits[digit]}${units[index]}`;
    result = pendingZero ? `${part}零${result}` : `${part}${result}`;
    pendingZero = false;
  });

  return result.replace(/^一十/, "十");
}

const COUNTER_TAG_RE =
  /<(Counter|CounterStep|CounterIncrement|CounterDisplay)\b([^<>]*?)(?:\/>|>)/g;

function readStringAttribute(attrs: string, name: string): string | undefined {
  const match = attrs.match(
    new RegExp(`(?:^|\\s)${name}\\s*=\\s*["']([^"']+)["']`),
  );
  return match?.[1];
}

function readLevelAttribute(attrs: string): LevelRef | undefined {
  const staticLevel = readStringAttribute(attrs, "level");
  if (staticLevel != null) {
    return /^\d+$/.test(staticLevel) ? Number(staticLevel) : staticLevel;
  }

  const boundLevel = attrs.match(/(?:^|\s):level\s*=\s*["']([^"']+)["']/)?.[1];
  if (boundLevel == null) {
    return undefined;
  }

  if (/^\d+$/.test(boundLevel.trim())) {
    return Number(boundLevel.trim());
  }

  const stringLiteral = boundLevel.trim().match(/^['"]([^'"]+)['"]$/)?.[1];
  if (stringLiteral != null) {
    return /^\d+$/.test(stringLiteral) ? Number(stringLiteral) : stringLiteral;
  }

  throw new Error(
    `Counter level binding ":level=\\"${boundLevel}\\"" must be a string or number literal.`,
  );
}

function getAction(
  component: string,
  actionAttribute: string | undefined,
): CounterAction {
  if (actionAttribute != null) {
    if (
      actionAttribute === "step" ||
      actionAttribute === "increment" ||
      actionAttribute === "display"
    ) {
      return actionAttribute;
    }

    throw new Error(`Counter action "${actionAttribute}" is not supported.`);
  }

  if (component === "CounterIncrement") {
    return "increment";
  }

  if (component === "CounterDisplay") {
    return "display";
  }

  return "step";
}
