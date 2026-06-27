<script setup lang="ts">
defineProps<{
  id?: string;
  level?: number | string;
  op?: string;
}>();
</script>

<template>
  <Counter :id="id" :level="level" :op="op" action="display" />
</template>
