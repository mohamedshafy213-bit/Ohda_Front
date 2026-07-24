<template>
    <button
        type="button"
        @click.stop="toggle"
        class="sf-sync-trigger"
        :class="
            dense
                ? 'px-3 py-1 rounded-lg text-xs font-semibold border border-surface-200 dark:border-surface-600 bg-transparent text-surface-700 dark:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800'
                : 'qzc-sync-final-btn'
        "
    >
        <slot name="icon">
            <Landmark class="sf-sync-ico" />
        </slot>
        <span class="sf-sync-label">{{ $t("sis.quiz.actions.syncFinalGrades") }}</span>
    </button>
    <Popover ref="menu">
        <div class="flex flex-col justify-between gap-6">
            <div
                v-if="!loading"
                class="flex flex-col gap-2 justify-center text-center max-w-[min(20rem,calc(100vw-4rem))]"
            >
                <p class="text-sm text-surface-700 dark:text-surface-200">
                    {{ $t("sis.quiz.actions.syncFinalGradesConfirm", { quizName: itemName }) }}
                </p>
                <div class="flex flex-wrap gap-2 w-full justify-center">
                    <Button
                        class="p-1.5! h-7 bg-primary! hover:bg-primary-600! border-none text-sm min-w-max"
                        @click="confirmAction"
                        ><span class="text-white">{{
                            $t("sis.quiz.actions.syncFinalGradesYes")
                        }}</span></Button
                    >
                    <Button
                        class="p-1.5! h-7 bg-surface-500! hover:bg-surface-700! border-none text-sm min-w-max"
                        @click="menu.hide()"
                        ><span class="text-white">{{
                            $t("deleteDialog.noCancel")
                        }}</span></Button
                    >
                </div>
            </div>
            <div
                v-if="loading"
                class="w-full flex justify-center items-center text-center gap-2"
            >
                <div
                    class="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"
                ></div>
                <span class="ml-2 text-surface-600 dark:text-surface-400 text-sm">{{
                    $t("sis.quiz.actions.syncFinalGradesProgress", {
                        quizName: itemName,
                    })
                }}</span>
            </div>
        </div>
    </Popover>
</template>
<script setup>
import { Landmark } from "lucide-vue-next";

const menu = ref();
const toggle = (event) => {
    menu.value?.toggle(event);
};
const props = defineProps({
    itemName: {
        type: String,
        default: "",
    },
    dense: {
        type: Boolean,
        default: false,
    },
    confirm: {
        type: Function,
        default: () => {},
    },
});
const loading = ref(false);
const confirmAction = async () => {
    loading.value = true;
    try {
        await props.confirm();
    } finally {
        menu.value?.hide();
        loading.value = false;
    }
};
</script>
<style scoped>
.sf-sync-trigger.qzc-sync-final-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;
    min-height: 2.4rem;
    font-size: 0.65rem;
    font-weight: 700;
    line-height: 1.2;
    padding: 0.3rem 0.45rem;
    border-radius: 0.45rem;
    background: #f5f3ff;
    color: #5b21b6;
    border: 1.5px solid #ddd6fe;
    cursor: pointer;
    transition: all 0.15s;
    max-width: 100%;
}
.sf-sync-trigger.qzc-sync-final-btn:hover {
    background: #ede9fe;
    border-color: #c4b5fd;
    color: #4c1d95;
}
:global(.dark) .sf-sync-trigger.qzc-sync-final-btn {
    background: rgba(91, 33, 182, 0.2);
    border-color: rgba(167, 139, 250, 0.45);
    color: #c4b5fd;
}
:global(.dark) .sf-sync-trigger.qzc-sync-final-btn:hover {
    background: rgba(91, 33, 182, 0.35);
    color: #e9d5ff;
}
.sf-sync-ico {
    width: 0.8rem;
    height: 0.8rem;
    flex-shrink: 0;
}
.sf-sync-label {
    min-width: 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-align: center;
    word-break: break-word;
    hyphens: auto;
}
</style>
