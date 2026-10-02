<template>
  <div v-if="type === 'cards'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    <div
      v-for="i in count"
      :key="i"
      class="bg-brand-white dark:bg-white/5 border border-brand-gray/10 rounded-2xl p-5 shadow-sm space-y-4 animate-pulse"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-brand-gray/15 rounded-xl"></div>
          <div class="space-y-1.5">
            <div class="h-4 w-28 bg-brand-gray/20 rounded-md"></div>
            <div class="h-2.5 w-16 bg-brand-gray/15 rounded-md"></div>
          </div>
        </div>
        <div class="flex gap-1">
          <div class="w-7 h-7 bg-brand-gray/15 rounded-full"></div>
          <div class="w-7 h-7 bg-brand-gray/15 rounded-full"></div>
        </div>
      </div>
      <div class="space-y-2 pt-2 border-t border-brand-gray/10">
        <div class="h-3 w-3/4 bg-brand-gray/15 rounded-md"></div>
        <div class="h-3 w-1/2 bg-brand-gray/10 rounded-md"></div>
      </div>
    </div>
  </div>

  <div v-else class="space-y-2 p-4 bg-brand-white dark:bg-white/5 border border-brand-gray/10 rounded-2xl animate-pulse">
    <div class="h-10 bg-brand-gray/10 rounded-xl mb-3"></div>
    <div v-for="i in count" :key="i" class="flex items-center gap-4 py-3 border-b border-brand-gray/5 last:border-none">
      <div class="h-4 w-20 bg-brand-gray/15 rounded-md"></div>
      <div class="h-4 w-36 bg-brand-gray/20 rounded-md"></div>
      <div class="h-4 flex-1 bg-brand-gray/10 rounded-md"></div>
      <div class="h-4 w-16 bg-brand-gray/15 rounded-md"></div>
      <div class="h-6 w-20 bg-brand-gray/15 rounded-full"></div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  type: {
    type: String,
    default: "table" // 'table' | 'cards'
  },
  count: {
    type: Number,
    default: 5
  }
});
</script>
