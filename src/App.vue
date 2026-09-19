<script setup>
import { ref, onErrorCaptured } from "vue";
import { useQuizGradesStrikeToastBridge } from "@/stores/quizGradesStrikeToastBridge";

const { locale } = useI18n();
const strikeToastBridge = useQuizGradesStrikeToastBridge();
const routeError = ref(null);

onErrorCaptured((err, instance, info) => {
    console.error("[App Error Boundary]", err, info);
    routeError.value = err;
    return false; // Stop error from propagating further
});

function retryRender() {
    routeError.value = null;
}

function onGlobalToastClick(payload) {
    strikeToastBridge.handleToastClick(payload);
}
</script>

<template>
    <div v-if="routeError" class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div class="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl text-center border border-red-200 dark:border-red-900/30">
            <div class="w-12 h-12 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span class="text-xl font-bold">!</span>
            </div>
            <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-2">حدث خطأ غير متوقع أثناء عرض الصفحة</h2>
            <p class="text-xs text-gray-500 mb-6">{{ routeError?.message || 'يرجى إعادة المحاولة' }}</p>
            <button
                type="button"
                @click="retryRender"
                class="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl text-xs transition cursor-pointer"
            >
                إعادة المحاولة
            </button>
        </div>
    </div>
    <router-view v-else />
    <Toast
        :position="locale === 'ar' ? 'bottom-left' : 'bottom-right'"
        :onClick="onGlobalToastClick"
    />
</template>

<style scoped></style>
