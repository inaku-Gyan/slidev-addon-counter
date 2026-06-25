<script setup lang="ts">
import { computed, useAttrs } from "vue";

import { snapshots } from "virtual:slidev-addon-counter/snapshots";

const props = withDefaults(
  defineProps<{
    action?: "step" | "increment" | "display";
    as?: string;
    className?: string;
    counter?: string;
    level: number | string;
    op?: string;
  }>(),
  {
    action: "step",
    as: "span",
    className: "",
    counter: "default",
    op: "",
  },
);

const attrs = useAttrs();
const snapshot = computed(() => (props.op ? snapshots[props.op] : undefined));
const shouldRender = computed(() => props.action !== "increment");
const classes = computed(() => [
  "slidev-addon-counter",
  props.className,
  attrs.class,
]);
</script>

<template>
  <component :is="as" v-if="shouldRender" v-bind="{ ...attrs, class: classes }">
    {{ snapshot?.display ?? "" }}
  </component>
</template>
