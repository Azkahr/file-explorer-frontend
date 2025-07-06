<template>
  <div
    v-if="visible"
    :style="{ top: `${y}px`, left: `${x}px` }"
    class="fixed z-50 bg-white border rounded shadow text-sm w-40"
  >
    <ul>
      <li
        v-for="item in items"
        :key="item.label"
        class="px-3 py-2 hover:bg-gray-100 cursor-pointer"
        :class="item.class"
        @click="item.action"
      >
        {{ item.label }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  visible: boolean;
  x: number;
  y: number;
  items: { label: string; action: () => void; class?: string }[];
}>();
</script>
