import { computed, onUnmounted, shallowRef, watchEffect } from "vue";

import {
  buildCounterTimeline,
  type CounterAction,
  type CounterConfig,
  type CounterOperation,
  type LevelRef,
} from "./counter";

export interface RuntimeCounterInput {
  counter: string;
  level: LevelRef;
  action: CounterAction;
  slideNo: number;
}

const operations = new Map<string, CounterOperation>();
const displays = shallowRef<Record<string, string>>({});
let nextRuntimeOrder = 0;

export function useRuntimeCounter(
  input: () => RuntimeCounterInput,
  config: CounterConfig | undefined,
) {
  const key = `runtime-counter-${nextRuntimeOrder}`;
  const order = nextRuntimeOrder;
  nextRuntimeOrder += 1;

  watchEffect(() => {
    const value = input();
    operations.set(key, {
      id: key,
      counter: value.counter,
      level: value.level,
      action: value.action,
      slideNo: value.slideNo,
      order,
    });
    rebuildDisplays(config);
  });

  onUnmounted(() => {
    operations.delete(key);
    rebuildDisplays(config);
  });

  return computed(() => {
    const value = input();
    if (value.action === "increment") {
      return "";
    }

    return displays.value[key] ?? "";
  });
}

function rebuildDisplays(config: CounterConfig | undefined): void {
  const timeline = buildCounterTimeline([...operations.values()], config);
  displays.value = Object.fromEntries(
    Object.entries(timeline.snapshots).map(([id, snapshot]) => [
      id,
      snapshot.display,
    ]),
  );
}
