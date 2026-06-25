<script setup lang="ts">
defineProps<{
  counter?: string;
  level: number | string;
  op?: string;
}>();
</script>

<template>
  <Counter :counter="counter" :level="level" :op="op" action="increment" />
</template>
