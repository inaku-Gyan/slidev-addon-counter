<script setup lang="ts">
import { computed } from "vue";

import { revision, snapshots } from "virtual:slidev-addon-counter/snapshots";

const props = withDefaults(
  defineProps<{
    action?: "step" | "increment" | "display";
    id?: string;
    level?: number | string;
    op?: string;
  }>(),
  {
    action: "step",
    id: "default",
    op: "",
  },
);

const displayText = computed(() => {
  if (props.action === "increment") {
    return "";
  }

  return props.op ? (snapshots[props.op]?.display ?? "") : "";
});

const isBenchmark =
  import.meta.env.DEV &&
  typeof window !== "undefined" &&
  new URLSearchParams(window.location.search).has("counter-bench");
</script>

<template>
  <span v-if="isBenchmark" :data-counter-bench-revision="revision">
    {{ displayText }}
  </span>
  <template v-else>{{ displayText }}</template>
</template>
