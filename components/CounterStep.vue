<script setup lang="ts">
defineProps<{
  as?: string;
  className?: string;
  counter?: string;
  level: number | string;
  op?: string;
}>();
</script>

<template>
  <Counter
    :as="as"
    :class-name="className"
    :counter="counter"
    :level="level"
    :op="op"
    action="step"
  />
</template>
