import {
  getCounterDefinition,
  getLevelConfig,
  normalizeCounterConfig,
  renderCounterFormat,
  resolveLevelRef,
  type CounterConfig,
  type CounterOperation,
  type CounterSnapshot,
  type CounterTimeline,
  type NormalizedCounterConfig,
} from "./counter";

export type CounterStateSnapshot = ReadonlyMap<string, readonly number[]>;

export interface CounterTimelineState {
  timeline: CounterTimeline;
  checkpoints: readonly CounterStateSnapshot[];
}

export function buildCounterTimelineState(
  operations: readonly CounterOperation[],
  config: CounterConfig | NormalizedCounterConfig | undefined,
  previous?: CounterTimelineState,
  rebuildFromSlide = 1,
  slideCount = 0,
): CounterTimelineState {
  const normalized = isNormalizedCounterConfig(config)
    ? config
    : normalizeCounterConfig(config);
  const sorted = [...operations].sort((a, b) => {
    return a.slideNo - b.slideNo || a.order - b.order;
  });
  const startSlide = Math.max(1, rebuildFromSlide);
  const previousCheckpoint = previous?.checkpoints[startSlide - 1];
  const canReusePrefix = Boolean(previous && previousCheckpoint);
  const snapshots: Record<string, CounterSnapshot> = {};
  const states = canReusePrefix
    ? cloneStates(previousCheckpoint)
    : new Map<string, number[]>();
  const maxSlideNo = Math.max(
    slideCount,
    startSlide - 1,
    ...sorted.map((operation) => operation.slideNo),
  );
  const checkpoints: Array<CounterStateSnapshot | undefined> = [];

  if (canReusePrefix && previous) {
    for (let slideNo = 0; slideNo < startSlide; slideNo += 1) {
      checkpoints[slideNo] = cloneStates(previous.checkpoints[slideNo]);
    }

    for (const operation of previous.timeline.operations) {
      if (operation.slideNo >= startSlide) {
        continue;
      }

      const snapshot = previous.timeline.snapshots[operation.id];
      if (snapshot) {
        snapshots[operation.id] = snapshot;
      }
    }
  } else {
    checkpoints[0] = new Map();
  }

  let operationIndex = sorted.findIndex(
    (operation) => operation.slideNo >= startSlide,
  );
  if (operationIndex < 0) {
    operationIndex = sorted.length;
  }

  for (let slideNo = startSlide; slideNo <= maxSlideNo; slideNo += 1) {
    while (sorted[operationIndex]?.slideNo === slideNo) {
      const operation = sorted[operationIndex];
      const counter = getCounterDefinition(normalized, operation.counter);
      const level =
        operation.level == null
          ? counter.defaultLevel
          : resolveLevelRef(counter, operation.level, 1);
      const counts = states.get(operation.counter) ?? [];

      if (operation.action === "step" || operation.action === "increment") {
        for (let index = 0; index < level - 1; index += 1) {
          counts[index] ??= getLevelConfig(counter, index + 1).start;
        }

        const levelConfig = getLevelConfig(counter, level);
        const currentValue = counts[level - 1];
        const nextValue =
          currentValue == null ? levelConfig.start : currentValue + 1;

        if (!Number.isSafeInteger(nextValue)) {
          throw new RangeError(
            `Counter "${counter.id}" level ${level} exceeded the maximum safe integer value.`,
          );
        }

        counts[level - 1] = nextValue;

        if (levelConfig.reset === "lower") {
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
      operationIndex += 1;
    }

    checkpoints[slideNo] = cloneStates(states);
  }

  return {
    timeline: {
      snapshots,
      operations: sorted,
    },
    checkpoints: checkpoints.map(
      (checkpoint) => checkpoint ?? new Map<string, readonly number[]>(),
    ),
  };
}

function isNormalizedCounterConfig(
  config: CounterConfig | NormalizedCounterConfig | undefined,
): config is NormalizedCounterConfig {
  return config?.counters instanceof Map;
}

function cloneStates(
  states: CounterStateSnapshot | undefined,
): Map<string, number[]> {
  if (!states) {
    return new Map();
  }

  return new Map(
    [...states].map(([counter, counts]) => [counter, [...counts]]),
  );
}
