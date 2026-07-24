<script setup>
import { useQuizGradesStrikeToastBridge } from "@/stores/quizGradesStrikeToastBridge";

const { locale } = useI18n();
const strikeToastBridge = useQuizGradesStrikeToastBridge();

function onGlobalToastClick(payload) {
    strikeToastBridge.handleToastClick(payload);
}
</script>

<template>
    <router-view />
    <Toast
        :position="locale === 'ar' ? 'bottom-left' : 'bottom-right'"
        :onClick="onGlobalToastClick"
    />
</template>

<style scoped></style>
