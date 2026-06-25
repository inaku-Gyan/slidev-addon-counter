<script setup lang="ts">
import { computed } from "vue";

import { snapshots } from "virtual:slidev-addon-counter/snapshots";

const props = withDefaults(
  defineProps<{
    action?: "step" | "increment" | "display";
    counter?: string;
    level: number | string;
    op?: string;
  }>(),
  {
    action: "step",
    counter: "default",
    op: "",
  },
);

const displayText = computed(() => {
  if (props.action === "increment") {
    return "";
  }

  return props.op ? (snapshots[props.op]?.display ?? "") : "";
});
</script>

<template>{{ displayText }}</template>
