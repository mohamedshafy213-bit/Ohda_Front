<template>
  <div class="space-y-4">
    <!-- Optional Table Header / Toolbar Slot -->
    <div v-if="$slots.toolbar" class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <slot name="toolbar" />
    </div>

    <!-- Table Container -->
    <div class="bg-brand-white dark:bg-brand-dark rounded-2xl border border-brand-gray/15 overflow-hidden shadow-xs">
      <div class="overflow-x-auto">
        <table class="w-full text-xs text-right border-collapse" style="table-layout: fixed;">
          <!-- Table Header -->
          <thead>
            <tr class="bg-brand-light/70 dark:bg-white/5 border-b border-brand-gray/15 text-brand-gray dark:text-brand-gray/80 font-bold select-none">
              <th
                v-for="col in columns"
                :key="col.field || col.header"
                :style="col.width ? { width: col.width } : {}"
                class="py-3 px-4 transition-colors"
                :class="[
                  col.align === 'center' ? 'text-center' : col.align === 'left' ? 'text-left' : 'text-right',
                  col.sortable ? 'cursor-pointer hover:text-brand-dark dark:hover:text-white' : '',
                  col.headerClass || ''
                ]"
                @click="col.sortable && toggleSort(col.field)"
              >
                <div
                  class="flex items-center gap-1.5"
                  :class="col.align === 'center' ? 'justify-center' : col.align === 'left' ? 'justify-end' : 'justify-start'"
                >
                  <span class="truncate">{{ col.header }}</span>
                  <span v-if="col.sortable" class="text-brand-gray/60 inline-flex items-center">
                    <ArrowUpDown v-if="sortField !== col.field" class="w-3.5 h-3.5" />
                    <ArrowUp v-else-if="sortOrder === 1" class="w-3.5 h-3.5 text-brand-accent font-bold" />
                    <ArrowDown v-else class="w-3.5 h-3.5 text-brand-accent font-bold" />
                  </span>
                </div>
              </th>
            </tr>
          </thead>

          <!-- Table Body -->
          <tbody v-if="loading" class="divide-y divide-brand-gray/10">
            <tr v-for="n in 5" :key="n" class="animate-pulse">
              <td v-for="col in columns" :key="col.field || col.header" class="py-4 px-4">
                <div class="h-4 bg-brand-gray/10 rounded-md w-3/4"></div>
              </td>
            </tr>
          </tbody>

          <tbody v-else-if="paginatedItems.length > 0" class="divide-y divide-brand-gray/10 text-brand-dark dark:text-white">
            <tr
              v-for="(row, idx) in paginatedItems"
              :key="row.id || idx"
              class="hover:bg-brand-light/40 dark:hover:bg-white/5 transition-colors"
            >
              <td
                v-for="col in columns"
                :key="col.field || col.header"
                class="py-3.5 px-4 align-middle"
                :class="[
                  col.align === 'center' ? 'text-center' : col.align === 'left' ? 'text-left' : 'text-right',
                  col.cellClass || ''
                ]"
              >
                <!-- Custom Slot for Field -->
                <slot :name="col.field" :data="row" :index="idx">
                  <span v-if="row[col.field] !== undefined && row[col.field] !== null">
                    {{ row[col.field] }}
                  </span>
                  <span v-else class="text-brand-gray/40">—</span>
                </slot>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Clean Empty State (Displayed when not loading & 0 records) -->
      <div v-if="!loading && paginatedItems.length === 0" class="p-12 text-center bg-brand-white dark:bg-brand-dark">
        <div class="w-16 h-16 rounded-3xl bg-brand-light dark:bg-white/5 text-brand-gray flex items-center justify-center mx-auto mb-3 border border-brand-gray/10">
          <component :is="emptyIcon || Inbox" class="w-8 h-8 text-brand-gray/70" />
        </div>
        <h4 class="text-sm font-bold text-brand-dark dark:text-white">
          {{ emptyTitle }}
        </h4>
        <p class="text-xs text-brand-gray mt-1 max-w-sm mx-auto">
          {{ emptyMessage }}
        </p>
        <div v-if="$slots['empty-action']" class="mt-4">
          <slot name="empty-action" />
        </div>
      </div>

      <!-- Visible Pagination Bar -->
      <div
        v-if="totalRecordsCount > 0"
        class="p-4 px-6 border-t border-brand-gray/10 bg-brand-light/30 dark:bg-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-brand-gray"
      >
        <!-- Range Summary -->
        <div class="flex items-center gap-2">
          <span>عرض</span>
          <span class="font-bold text-brand-dark dark:text-white font-mono">{{ startIndex + 1 }}</span>
          <span>-</span>
          <span class="font-bold text-brand-dark dark:text-white font-mono">{{ endIndex }}</span>
          <span>من إجمالي</span>
          <span class="font-bold text-brand-dark dark:text-white font-mono">{{ totalRecordsCount }}</span>
          <span>سجل</span>
        </div>

        <!-- Controls (Rows per page + Page numbers + Prev/Next) -->
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-1.5">
            <span class="text-[11px]">الصفوف:</span>
            <select
              v-model="perPage"
              class="bg-brand-white dark:bg-brand-dark border border-brand-gray/25 rounded-lg px-2 py-1 text-xs text-brand-dark dark:text-white focus:border-brand-accent cursor-pointer"
            >
              <option :value="5">5</option>
              <option :value="10">10</option>
              <option :value="15">15</option>
              <option :value="25">25</option>
              <option :value="50">50</option>
            </select>
          </div>

          <!-- Page Navigation Buttons -->
          <div class="flex items-center gap-1">
            <button
              type="button"
              @click="currentPage = 1"
              :disabled="currentPage === 1"
              class="p-1.5 rounded-lg border border-brand-gray/20 hover:bg-brand-light dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="الصفحة الأولى"
            >
              <ChevronsRight class="w-4 h-4 rtl:rotate-0" />
            </button>
            <button
              type="button"
              @click="currentPage = Math.max(1, currentPage - 1)"
              :disabled="currentPage === 1"
              class="p-1.5 rounded-lg border border-brand-gray/20 hover:bg-brand-light dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="الصفحة السابقة"
            >
              <ChevronRight class="w-4 h-4 rtl:rotate-0" />
            </button>

            <span class="px-3 py-1 font-mono font-bold text-xs text-brand-dark dark:text-white">
              {{ currentPage }} / {{ totalPages || 1 }}
            </span>

            <button
              type="button"
              @click="currentPage = Math.min(totalPages, currentPage + 1)"
              :disabled="currentPage >= totalPages"
              class="p-1.5 rounded-lg border border-brand-gray/20 hover:bg-brand-light dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="الصفحة التالية"
            >
              <ChevronLeft class="w-4 h-4 rtl:rotate-0" />
            </button>
            <button
              type="button"
              @click="currentPage = totalPages"
              :disabled="currentPage >= totalPages"
              class="p-1.5 rounded-lg border border-brand-gray/20 hover:bg-brand-light dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="الصفحة الأخيرة"
            >
              <ChevronsLeft class="w-4 h-4 rtl:rotate-0" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import {
  Inbox,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronRight,
  ChevronLeft,
  ChevronsRight,
  ChevronsLeft
} from "lucide-vue-next";

const props = defineProps({
  columns: {
    type: Array,
    required: true
  },
  items: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  rowsPerPage: {
    type: Number,
    default: 10
  },
  emptyTitle: {
    type: String,
    default: "لا توجد سجلات مطابقة"
  },
  emptyMessage: {
    type: String,
    default: "لم يتم العثور على أي عناصر لعرضها حالياً."
  },
  emptyIcon: {
    type: [Object, Function],
    default: null
  }
});

const currentPage = ref(1);
const perPage = ref(props.rowsPerPage || 10);
const sortField = ref("");
const sortOrder = ref(1); // 1 = asc, -1 = desc

function toggleSort(field) {
  if (sortField.value === field) {
    if (sortOrder.value === 1) {
      sortOrder.value = -1;
    } else {
      sortField.value = "";
      sortOrder.value = 1;
    }
  } else {
    sortField.value = field;
    sortOrder.value = 1;
  }
}

// Reset page when items array changes
watch(() => props.items.length, () => {
  if (currentPage.value > totalPages.value) {
    currentPage.value = Math.max(1, totalPages.value);
  }
});

const sortedItems = computed(() => {
  if (!sortField.value) return props.items;
  return [...props.items].sort((a, b) => {
    const valA = a[sortField.value];
    const valB = b[sortField.value];
    if (valA === valB) return 0;
    if (valA === null || valA === undefined) return 1;
    if (valB === null || valB === undefined) return -1;
    if (typeof valA === "number" && typeof valB === "number") {
      return (valA - valB) * sortOrder.value;
    }
    return String(valA).localeCompare(String(valB), "ar") * sortOrder.value;
  });
});

const totalRecordsCount = computed(() => props.items?.length || 0);
const totalPages = computed(() => Math.ceil(totalRecordsCount.value / perPage.value) || 1);

const startIndex = computed(() => (currentPage.value - 1) * perPage.value);
const endIndex = computed(() => Math.min(startIndex.value + perPage.value, totalRecordsCount.value));

const paginatedItems = computed(() => {
  return sortedItems.value.slice(startIndex.value, endIndex.value);
});
</script>
