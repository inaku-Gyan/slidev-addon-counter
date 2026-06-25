<script setup lang="ts">
import { counterConfig } from "virtual:slidev-addon-counter/snapshots";
import type { CounterConfig } from "../src/counter";
import { useRuntimeCounter } from "../src/runtime";

const props = withDefaults(
  defineProps<{
    action?: "step" | "increment" | "display";
    id?: string;
    level: number | string;
    op?: string;
  }>(),
  {
    action: "step",
    id: "default",
    op: "",
  },
);

const displayText = useRuntimeCounter(
  () => ({
    counter: props.id,
    level: props.level,
    action: props.action,
    slideNo: 1,
  }),
  counterConfig as CounterConfig,
);
</script>

<template>{{ displayText }}</template>
