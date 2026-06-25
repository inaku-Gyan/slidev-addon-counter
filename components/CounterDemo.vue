<script setup lang="ts">
import { computed } from "vue";

import { formatCounter } from "../src/counter";

const props = withDefaults(
  defineProps<{
    counts?: number[];
    title?: string;
  }>(),
  {
    counts: () => [1],
    title: "Counter Demo",
  },
);

const number = computed(() => formatCounter(props.counts));
</script>

<template>
  <div class="slidev-addon-counter-demo">
    <span class="slidev-addon-counter-demo__number">{{ number }}</span>
    <span class="slidev-addon-counter-demo__title">{{ title }}</span>
  </div>
</template>
