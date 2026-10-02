<template>
  <div class="relative w-full">
    <Search
      class="absolute top-1/2 -translate-y-1/2 text-brand-gray start-3 z-1 w-4 h-4 pointer-events-none"
    />
    <InputText
      v-model="searchValue"
      :placeholder="resolvedPlaceholder"
      :aria-label="resolvedPlaceholder"
      class="w-full !ps-9 !pe-8 !py-2 !text-xs !bg-brand-light dark:!bg-brand-dark/50 !border-brand-gray/25 focus:!border-brand-accent !rounded-xl !text-brand-dark dark:!text-white transition-all shadow-xs"
      @input="onSearchChange"
    />
    <button
      v-if="searchValue"
      type="button"
      @click="clearSearch"
      class="absolute top-1/2 -translate-y-1/2 end-2.5 p-1 text-brand-gray hover:text-brand-dark dark:hover:text-white rounded-md transition cursor-pointer"
      :title="$t('clear') || 'مسح'"
    >
      <X class="w-3.5 h-3.5" />
    </button>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";

const { t, te } = useI18n();

const props = defineProps({
  placeholder: {
    type: String,
    default: "ohda.common.search"
  }
});

const searchValue = defineModel();
const emit = defineEmits(["searchChange", "input", "clear"]);

const resolvedPlaceholder = computed(() => {
  if (te(props.placeholder)) {
    return t(props.placeholder);
  }
  return props.placeholder || t("ohda.common.search") || "بحث...";
});

const onSearchChange = () => {
  emit("input", searchValue.value);
  emit("searchChange", searchValue.value);
};

const clearSearch = () => {
  searchValue.value = "";
  emit("input", "");
  emit("searchChange", "");
  emit("clear");
};
</script>

