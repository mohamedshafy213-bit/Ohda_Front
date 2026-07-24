<template>
    <div
        v-if="totalItems > 0"
        :class="
            compact
                ? 'px-1.5 py-1'
                : 'px-6 py-3 border-t border-surface-200 dark:border-surface-700'
        "
    >
        <div class="flex items-center justify-center">
            <div
                :class="compact ? 'flex items-center gap-1' : 'flex items-center gap-2'"
            >
                <button
                    type="button"
                    @click="goToPage(currentPage - 1)"
                    :disabled="currentPage <= 1"
                    :class="navBtnClass"
                >
                    <ChevronLeft
                        :class="[iconSize, 'rtl:rotate-180 shrink-0']"
                    />
                    <span :class="compact ? 'sr-only' : ''">{{ t("previous") }}</span>
                </button>

                <div
                    :class="compact ? 'flex items-center gap-0.5 mx-1' : 'flex items-center gap-1 mx-3'"
                >
                    <template v-for="(page, pi) in visiblePages" :key="`p-${pi}-${page}`">
                        <button
                            v-if="page !== '...'"
                            type="button"
                            @click="goToPage(page)"
                            :class="pageNumClass(!!(page === currentPage))"
                        >
                            {{ page }}
                        </button>
                        <span
                            v-else
                            :class="
                                compact
                                    ? 'px-1 py-0.5 text-xs text-surface-500 dark:text-surface-400'
                                    : 'px-2 py-2 text-sm text-surface-500 dark:text-surface-400'
                            "
                        >
                            ...
                        </span>
                    </template>
                </div>

                <button
                    type="button"
                    @click="goToPage(currentPage + 1)"
                    :disabled="currentPage >= totalPages"
                    :class="navBtnClass"
                >
                    <span :class="compact ? 'sr-only' : ''">{{ t("next") }}</span>
                    <ChevronRight
                        :class="[iconSize, 'rtl:rotate-180 shrink-0']"
                    />
                </button>
            </div>
        </div>

        <div :class="compact ? 'text-center mt-0.5' : 'text-center mt-2'">
            <span :class="metaClass">
                {{ t("page") }} {{ currentPage }} {{ t("of") }} {{ totalPages }} ({{
                    t("total")
                }}
                {{ totalItems }} {{ t("items") }})
            </span>
        </div>
    </div>
</template>

<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { ChevronLeft, ChevronRight } from "lucide-vue-next";

const { t } = useI18n();

const props = defineProps({
    currentPage: {
        type: Number,
        required: true,
        default: 1,
    },
    itemsPerPage: {
        type: Number,
        required: true,
        default: 10,
    },
    totalItems: {
        type: Number,
        required: true,
        default: 0,
    },
    maxVisiblePages: {
        type: Number,
        default: 7,
    },
    /** Smaller controls and no outer border (use when a parent already has a top border). */
    compact: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits(["page-change"]);

const navBtnClass = computed(() =>
    props.compact
        ? "px-2 py-0.5 text-xs border border-surface-300 dark:border-surface-600 text-surface-700 dark:text-surface-300 bg-surface-50 dark:bg-surface-800 hover:bg-surface-100 dark:hover:bg-surface-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors font-medium inline-flex items-center gap-0.5"
        : "px-3 py-2 text-sm border border-surface-300 dark:border-surface-600 text-surface-700 dark:text-surface-300 bg-surface-50 dark:bg-surface-800 hover:bg-surface-100 dark:hover:bg-surface-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors font-medium flex items-center gap-1",
);

const iconSize = computed(() => (props.compact ? "w-3.5 h-3.5" : "w-4 h-4"));

const metaClass = computed(() =>
    props.compact
        ? "text-[10px] text-surface-500 dark:text-surface-500"
        : "text-xs text-surface-600 dark:text-surface-400",
);

function pageNumClass(active) {
    const base = props.compact
        ? "min-w-6 px-1.5 py-0.5 text-xs rounded-md font-medium transition-colors"
        : "px-3 py-2 text-sm rounded-lg font-medium transition-colors";
    if (active) {
        return `${base} bg-primary-900 dark:bg-primary-50 dark:text-primary-900 text-white shadow-sm`;
    }
    return `${base} text-surface-700 dark:text-surface-300 bg-surface-50 dark:bg-surface-800 border border-surface-300 dark:border-surface-600 hover:bg-surface-100 dark:hover:bg-surface-700`;
}

const totalPages = computed(() => {
    return Math.ceil(props.totalItems / props.itemsPerPage);
});

const visiblePages = computed(() => {
    const total = totalPages.value;
    const current = props.currentPage;
    const maxVisible = props.maxVisiblePages;
    const pages = [];

    if (total <= maxVisible) {
        for (let i = 1; i <= total; i++) {
            pages.push(i);
        }
    } else {
        pages.push(1);

        if (current <= 4) {
            for (let i = 2; i <= 5; i++) {
                pages.push(i);
            }
            pages.push("...");
            pages.push(total);
        } else if (current >= total - 3) {
            pages.push("...");
            for (let i = total - 4; i <= total; i++) {
                pages.push(i);
            }
        } else {
            pages.push("...");
            for (let i = current - 1; i <= current + 1; i++) {
                pages.push(i);
            }
            pages.push("...");
            pages.push(total);
        }
    }

    return pages;
});

const goToPage = (page) => {
    if (page >= 1 && page <= totalPages.value && page !== props.currentPage) {
        emit("page-change", page);
    }
};
</script>

<style scoped>
/* Component-specific styles can be added here if needed */
</style>
