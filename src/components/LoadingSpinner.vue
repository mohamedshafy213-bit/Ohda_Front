<template>
    <div
        class="h-full flex-grow flex items-center justify-center bg-surface-50 dark:bg-surface-900 rounded-2xl"
    >
        <div class="flex flex-col gap-4 items-center">
            <div
                class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"
            ></div>
            <span class="ml-2 text-surface-600 dark:text-surface-400">{{
                $t("loading")
            }}</span>
        </div>
    </div>
</template>

<script setup>
// No props needed - this is a simple loading spinner component
</script>
