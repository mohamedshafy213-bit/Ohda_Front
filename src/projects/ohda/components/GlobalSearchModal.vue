<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4">
    <!-- Backdrop -->
    <div
      class="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      @click="close"
    ></div>

    <!-- Modal Box -->
    <div
      class="relative w-full max-w-2xl bg-brand-white dark:bg-brand-dark rounded-2xl shadow-2xl border border-brand-gray/20 dark:border-white/10 overflow-hidden flex flex-col max-h-[80vh] z-10"
      @keydown.esc="close"
      @keydown.down.prevent="navigateResults(1)"
      @keydown.up.prevent="navigateResults(-1)"
      @keydown.enter.prevent="selectActiveResult"
    >
      <!-- Search Input Header -->
      <div class="p-4 border-b border-brand-gray/10 dark:border-white/10 flex items-center gap-3">
        <Search class="w-5 h-5 text-brand-accent shrink-0" />
        <input
          ref="searchInput"
          type="text"
          v-model="query"
          @input="onInput"
          placeholder="بحث سريع (عميل، هاتف، لوحة، صنف، أمر شغل، فاتورة)..."
          class="w-full bg-transparent text-sm font-semibold text-brand-dark dark:text-white placeholder-slate-400 focus:outline-hidden"
          autofocus
        />
        <div class="flex items-center gap-1.5 shrink-0">
          <span class="px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 text-[10px] font-mono text-slate-400 border border-brand-gray/15">
            ESC للإغلاق
          </span>
          <button @click="close" class="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer">
            <X class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Results Body -->
      <div class="flex-1 overflow-y-auto p-3 space-y-4 text-xs no-scrollbar">
        <!-- Loading -->
        <div v-if="loading" class="py-8 text-center text-slate-400 text-xs">
          جاري البحث...
        </div>

        <!-- Empty Query Hint -->
        <div v-else-if="!query.trim()" class="py-8 text-center space-y-2 text-slate-400">
          <p class="text-xs">اكتب حرفين على الأقل للبحث الفوري في كافة سجلات النظام</p>
          <div class="flex justify-center gap-2 text-[10px] text-slate-500">
            <span class="px-2 py-0.5 rounded bg-black/5 dark:bg-white/5 border border-brand-gray/10">اسم العميل</span>
            <span class="px-2 py-0.5 rounded bg-black/5 dark:bg-white/5 border border-brand-gray/10">رقم الهاتف</span>
            <span class="px-2 py-0.5 rounded bg-black/5 dark:bg-white/5 border border-brand-gray/10">رقم اللوحة</span>
            <span class="px-2 py-0.5 rounded bg-black/5 dark:bg-white/5 border border-brand-gray/10">اسم / باركود القطعة</span>
            <span class="px-2 py-0.5 rounded bg-black/5 dark:bg-white/5 border border-brand-gray/10">رقم أمر الشغل</span>
          </div>
        </div>

        <!-- No Results -->
        <div v-else-if="results.length === 0" class="py-10 text-center text-slate-400 text-xs">
          لا توجد نتائج مطابقة لـ "{{ query }}"
        </div>

        <!-- Grouped Results -->
        <div v-else class="space-y-3">
          <div v-for="(group, gIdx) in groupedResults" :key="gIdx" class="space-y-1">
            <div class="text-[10px] font-bold text-brand-gray px-2 uppercase tracking-wider">
              {{ group.category }} ({{ group.items.length }})
            </div>

            <div
              v-for="item in group.items"
              :key="item.type + item.referenceId + item.title"
              @click="goToResult(item)"
              class="p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between"
              :class="activeIndex === getGlobalIndex(item) ? 'bg-brand-accent/20 border-brand-accent text-brand-dark dark:text-white shadow-xs' : 'border-brand-gray/10 hover:bg-black/5 dark:hover:bg-white/5 text-slate-700 dark:text-slate-200'"
            >
              <div class="flex items-center gap-2.5 min-w-0">
                <div class="w-7 h-7 rounded-lg bg-black/5 dark:bg-white/10 flex items-center justify-center shrink-0">
                  <component :is="getIcon(item.type)" class="w-3.5 h-3.5 text-brand-accent" />
                </div>
                <div class="min-w-0">
                  <div class="font-bold text-xs truncate">{{ item.title }}</div>
                  <div class="text-[11px] text-slate-400 truncate">{{ item.subtitle }}</div>
                </div>
              </div>

              <span class="text-[10px] font-mono text-slate-400 shrink-0 ms-2">
                انتقال &larr;
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer Hints -->
      <div class="p-2.5 bg-black/5 dark:bg-white/5 border-t border-brand-gray/10 dark:border-white/10 flex items-center justify-between text-[10px] text-slate-400">
        <div class="flex items-center gap-3">
          <span>&uarr;&darr; للتنقل</span>
          <span>Enter للاختيار</span>
          <span>ESC للإغلاق</span>
        </div>
        <span class="font-mono text-brand-accent">البحث الموحد v2.5</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from "vue";
import { useRouter } from "vue-router";
import apiClient from "@/utilities/apiClient";
import {
  Search,
  X,
  Users,
  FileText,
  Package,
  ShoppingCart,
  CalendarDays
} from "lucide-vue-next";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(["update:modelValue"]);

const router = useRouter();
const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val)
});

const searchInput = ref(null);
const query = ref("");
const loading = ref(false);
const results = ref([]);
const activeIndex = ref(0);

let debounceTimer = null;

function onInput() {
  clearTimeout(debounceTimer);
  if (!query.value || query.value.trim().length < 2) {
    results.value = [];
    loading.value = false;
    return;
  }
  loading.value = true;
  debounceTimer = setTimeout(async () => {
    try {
      const res = await apiClient.get("/api/QuickSearch", {
        params: { q: query.value.trim() }
      });
      results.value = res.data?.objects || [];
      activeIndex.value = 0;
    } catch (err) {
      console.error("Search error:", err);
      results.value = [];
    } finally {
      loading.value = false;
    }
  }, 250);
}

const groupedResults = computed(() => {
  const map = {};
  for (const item of results.value) {
    if (!map[item.category]) {
      map[item.category] = { category: item.category, items: [] };
    }
    map[item.category].items.push(item);
  }
  return Object.values(map);
});

function getGlobalIndex(targetItem) {
  return results.value.indexOf(targetItem);
}

function navigateResults(delta) {
  if (!results.value.length) return;
  const newIndex = activeIndex.value + delta;
  if (newIndex >= 0 && newIndex < results.value.length) {
    activeIndex.value = newIndex;
  }
}

function selectActiveResult() {
  if (results.value.length && results.value[activeIndex.value]) {
    goToResult(results.value[activeIndex.value]);
  }
}

function goToResult(item) {
  close();
  if (item.route) {
    router.push(item.route);
  }
}

function close() {
  isOpen.value = false;
  query.value = "";
  results.value = [];
}

function getIcon(type) {
  switch (type) {
    case "client": return Users;
    case "job": return FileText;
    case "product": return Package;
    case "pos": return ShoppingCart;
    case "booking": return CalendarDays;
    default: return Search;
  }
}

function handleKeydown(e) {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
    e.preventDefault();
    isOpen.value = !isOpen.value;
    if (isOpen.value) {
      nextTick(() => {
        searchInput.value?.focus();
      });
    }
  }
}

watch(isOpen, (newVal) => {
  if (newVal) {
    nextTick(() => {
      searchInput.value?.focus();
    });
  }
});

onMounted(() => {
  window.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeydown);
});
</script>
