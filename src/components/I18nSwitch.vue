<script setup>
import { setLocale, getCurrentLocale } from "@/i18n";
import { Globe } from "lucide-vue-next";
const currentLocale = ref(getCurrentLocale());

function toggleLanguage() {
    // Toggle between 'en' and 'ar'
    const newLocale = currentLocale.value === "ar" ? "en" : "ar";
    setLocale(newLocale);
    currentLocale.value = newLocale;
}
</script>

<template>
    <Button
        type="button"
        @click="toggleLanguage()"
        aria-haspopup="true"
        aria-controls="overlay_menu"
        rounded
        :pt="{
            root: 'bg-surface-0 dark:bg-surface-800 dark:hover:bg-surface-700 hover:bg-surface-100 rounded-md aspect-square h-9 flex items-center justify-center dark:text-white px-2',
        }"
    >
        <span class="flex items-center justify-center gap-1">
            <Globe size="16" />
            <span class="text-sm font-medium">{{
                currentLocale === "ar" ? "ع" : "En"
            }}</span>
        </span>
    </Button>
</template>
