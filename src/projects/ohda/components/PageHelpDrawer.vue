<template>
  <Dialog
    v-model:visible="visible"
    modal
    :header="currentGuide ? (isAr ? currentGuide.titleAr : currentGuide.titleEn) : (isAr ? 'الدليل الإرشادي للنظام' : 'System Guide')"
    class="!bg-brand-white dark:!bg-brand-dark !border-brand-gray/20 max-w-4xl w-full !text-brand-dark dark:!text-brand-light"
  >
    <div class="space-y-4">
      <!-- Search & Page Selector Bar -->
      <div class="flex flex-col sm:flex-row items-center justify-between gap-3 bg-brand-light dark:bg-white/5 p-3 rounded-2xl border border-brand-gray/10">
        <!-- Current Page / Switch Page Dropdown -->
        <div class="flex items-center gap-2 w-full sm:w-auto">
          <span class="text-xs font-bold text-brand-gray whitespace-nowrap">
            {{ isAr ? 'دليل شاشة:' : 'Page Guide:' }}
          </span>
          <select
            v-model="selectedPath"
            class="px-3 py-1.5 rounded-xl text-xs font-bold bg-brand-white dark:bg-brand-dark border border-brand-gray/25 text-brand-dark dark:text-white focus:outline-none focus:border-brand-accent cursor-pointer w-full sm:w-64"
          >
            <option v-for="(guide, path) in pageGuides" :key="path" :value="path">
              {{ isAr ? guide.titleAr : guide.titleEn }}
            </option>
          </select>
        </div>

        <!-- In-guide Quick Search -->
        <div class="relative w-full sm:w-72">
          <Search class="w-4 h-4 text-brand-gray absolute start-3 top-1/2 -translate-y-1/2" />
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="isAr ? 'ابحث عن زر، دالة، أو خطوة...' : 'Search action, function, or step...'"
            class="w-full ps-9 pe-3 py-1.5 rounded-xl text-xs bg-brand-white dark:bg-brand-dark border border-brand-gray/25 text-brand-dark dark:text-white focus:outline-none focus:border-brand-accent font-sans"
          />
        </div>
      </div>

      <!-- Main Guide Container -->
      <div v-if="currentGuide" class="space-y-5">
        <!-- Overview Banner -->
        <div class="bg-gradient-to-r from-brand-accent/15 via-brand-soft to-transparent border border-brand-accent/25 p-4 rounded-2xl space-y-2">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-xl bg-brand-accent text-brand-dark flex items-center justify-center font-bold shadow-sm">
                <HelpCircle class="w-5 h-5" />
              </div>
              <h2 class="text-sm font-bold text-brand-dark dark:text-white">
                {{ isAr ? currentGuide.titleAr : currentGuide.titleEn }}
              </h2>
            </div>
            <span class="text-[11px] font-mono px-2.5 py-0.5 rounded-lg bg-brand-accent/20 text-brand-dark dark:text-brand-accent font-bold">
              {{ currentGuide.path }}
            </span>
          </div>

          <p class="text-xs text-brand-dark/90 dark:text-brand-light/90 leading-relaxed font-medium">
            {{ isAr ? currentGuide.summaryAr : currentGuide.summaryEn }}
          </p>

          <div class="pt-1 flex items-center gap-2 text-[11px] text-brand-gray">
            <span class="font-bold text-brand-dark dark:text-white">
              {{ isAr ? 'الفئات المستفيدة:' : 'Target Audience:' }}
            </span>
            <span>{{ isAr ? currentGuide.whoUsesAr : currentGuide.whoUsesEn }}</span>
          </div>
        </div>

        <!-- Navigation Tabs for Guide Sections -->
        <div class="flex items-center gap-2 border-b border-brand-gray/15 pb-2">
          <button
            @click="activeSection = 'actions'"
            type="button"
            class="px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2"
            :class="activeSection === 'actions' ? 'bg-brand-accent text-brand-dark shadow-sm' : 'text-brand-gray hover:text-brand-dark dark:hover:text-white'"
          >
            <Sliders class="w-4 h-4" />
            <span>{{ isAr ? 'الأزرار والوظائف المتاحة' : 'Actions & Functions' }}</span>
            <span class="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10">
              {{ filteredActions.length }}
            </span>
          </button>

          <button
            @click="activeSection = 'steps'"
            type="button"
            class="px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2"
            :class="activeSection === 'steps' ? 'bg-brand-accent text-brand-dark shadow-sm' : 'text-brand-gray hover:text-brand-dark dark:hover:text-white'"
          >
            <CheckSquare class="w-4 h-4" />
            <span>{{ isAr ? 'دليل العمل خطوة بخطوة' : 'Step-by-Step Workflow' }}</span>
            <span class="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10">
              {{ currentGuide.steps ? currentGuide.steps.length : 0 }}
            </span>
          </button>

          <button
            v-if="currentGuide.rules && currentGuide.rules.length"
            @click="activeSection = 'rules'"
            type="button"
            class="px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2"
            :class="activeSection === 'rules' ? 'bg-brand-accent text-brand-dark shadow-sm' : 'text-brand-gray hover:text-brand-dark dark:hover:text-white'"
          >
            <AlertCircle class="w-4 h-4" />
            <span>{{ isAr ? 'شروط وقواعد النظام' : 'Rules & Best Practices' }}</span>
          </button>
        </div>

        <!-- Section 1: Actions & Functions Dictionary -->
        <div v-show="activeSection === 'actions'" class="space-y-3">
          <div v-if="filteredActions.length === 0" class="text-center py-6 text-xs text-brand-gray">
            {{ isAr ? 'لم يتم العثور على إجراءات تطابق البحث.' : 'No actions match search query.' }}
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pe-1">
            <div
              v-for="(act, idx) in filteredActions"
              :key="idx"
              class="p-3.5 rounded-xl border border-brand-gray/15 bg-brand-light/50 dark:bg-white/5 hover:border-brand-accent/50 transition-all space-y-1.5"
            >
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-brand-dark dark:text-white flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-brand-accent"></span>
                  {{ isAr ? act.nameAr : act.nameEn }}
                </span>
              </div>
              <p class="text-[11px] text-brand-gray leading-relaxed">
                {{ isAr ? act.descriptionAr : act.descriptionEn }}
              </p>
            </div>
          </div>
        </div>

        <!-- Section 2: Step-by-Step Workflow -->
        <div v-show="activeSection === 'steps'" class="space-y-3">
          <div class="space-y-3 max-h-[380px] overflow-y-auto pe-1">
            <div
              v-for="step in currentGuide.steps"
              :key="step.stepNumber"
              class="flex items-start gap-3 p-3.5 rounded-xl border border-brand-gray/15 bg-brand-light/40 dark:bg-white/5"
            >
              <div class="w-7 h-7 rounded-lg bg-brand-dark dark:bg-white text-brand-accent dark:text-brand-dark font-mono font-bold flex items-center justify-center text-xs shrink-0 shadow-sm">
                {{ step.stepNumber }}
              </div>
              <div class="space-y-1">
                <h4 class="text-xs font-bold text-brand-dark dark:text-white">
                  {{ isAr ? step.titleAr : step.titleEn }}
                </h4>
                <p class="text-[11px] text-brand-gray leading-relaxed">
                  {{ isAr ? step.detailAr : step.detailEn }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Section 3: Rules & Best Practices -->
        <div v-show="activeSection === 'rules'" class="space-y-3">
          <div class="space-y-3 max-h-[380px] overflow-y-auto pe-1">
            <div
              v-for="(rule, idx) in currentGuide.rules"
              :key="idx"
              class="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 dark:bg-amber-500/5 space-y-1 text-xs"
            >
              <h4 class="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-2">
                <AlertTriangle class="w-4 h-4" />
                {{ isAr ? rule.titleAr : rule.titleEn }}
              </h4>
              <p class="text-[11px] text-brand-dark dark:text-brand-light leading-relaxed">
                {{ isAr ? rule.tipAr : rule.tipEn }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer Close & Keyboard Hint -->
      <div class="flex items-center justify-between pt-3 border-t border-brand-gray/15 text-xs text-brand-gray">
        <div class="flex items-center gap-2">
          <span class="px-2 py-0.5 rounded bg-brand-light dark:bg-white/10 font-mono text-[10px] font-bold">F1</span>
          <span class="text-[10px]">
            {{ isAr ? 'اضغط F1 لفتح هذا الدليل في أي وقت' : 'Press F1 anytime to open guide' }}
          </span>
        </div>
        <SecondaryButton @click="visible = false" class="!text-xs">
          {{ isAr ? 'إغلاق' : 'Close' }}
        </SecondaryButton>
      </div>
    </div>
  </Dialog>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { pageGuides } from "../constants/pageGuides.js";
import { getCurrentLocale } from "@/i18n";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(["update:modelValue"]);

const route = useRoute();
const { locale } = useI18n();

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val)
});

const isAr = computed(() => (getCurrentLocale ? getCurrentLocale() === "ar" : locale.value === "ar"));

const selectedPath = ref("/ohda/dashboard");
const activeSection = ref("actions");
const searchQuery = ref("");

// Auto-sync selectedPath with active route when modal opens
watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      const path = route.path;
      if (pageGuides[path]) {
        selectedPath.value = path;
      } else {
        selectedPath.value = "/ohda/dashboard";
      }
      activeSection.value = "actions";
      searchQuery.value = "";
    }
  }
);

const currentGuide = computed(() => {
  return pageGuides[selectedPath.value] || pageGuides["/ohda/dashboard"];
});

const filteredActions = computed(() => {
  if (!currentGuide.value || !currentGuide.value.actions) return [];
  if (!searchQuery.value.trim()) return currentGuide.value.actions;
  const q = searchQuery.value.toLowerCase().trim();
  return currentGuide.value.actions.filter(
    (act) =>
      act.nameAr?.toLowerCase().includes(q) ||
      act.nameEn?.toLowerCase().includes(q) ||
      act.descriptionAr?.toLowerCase().includes(q) ||
      act.descriptionEn?.toLowerCase().includes(q)
  );
});

// F1 Global Shortcut Listener
function handleKeyDown(e) {
  if (e.key === "F1") {
    e.preventDefault();
    visible.value = !visible.value;
  }
}

onMounted(() => {
  window.addEventListener("keydown", handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeyDown);
});
</script>
