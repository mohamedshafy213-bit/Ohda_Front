<template>
    <div
        v-if="selectedSection.children.length > 1"
        class="rounded-2xl bg-surface-0 dark:bg-surface-900 p-2 flex flex-row items-center gap-4 flex-wrap"
    >
        <div
            v-for="route in selectedSection.children"
            :key="route.id"
            @click="navigateTo(route)"
            :class="[
                'flex flex-row justify-center items-center gap-2 cursor-pointer rounded-xl p-2 min-w-20 transition-all duration-100',
                selectedRoute === route.nameEn
                    ? 'bg-black dark:bg-white text-white dark:text-black'
                    : ' hover:bg-surface-100 dark:hover:bg-surface-800',
            ]"
        >
            <component
                v-if="selectedRoute === route.nameEn"
                :is="route.icon"
                :class="[
                    'w-5 h-5',
                    selectedRoute === route.nameEn
                        ? 'text-white dark:text-black'
                        : 'text-black dark:text-white',
                ]"
            />
            <span
                :class="[
                    'font-medium ',
                    selectedRoute === route.nameEn
                        ? 'text-white dark:text-black'
                        : 'text-black dark:text-white',
                ]"
                >{{
                    currentLocale === "ar" ? route.nameAr : route.nameEn
                }}</span
            >
        </div>
    </div>
</template>
<script setup>
import { useBaseStore } from "@/stores/baseStore";
import { useRouter } from "vue-router";
import { getCurrentLocale } from "@/i18n";

const currentLocale = computed(() => getCurrentLocale());
const router = useRouter();
const baseStore = useBaseStore();
const navigateTo = (route) => {
    router.push(route.path);
};
const selectedRoute = computed(() => {
    const currentPath = router.currentRoute.value.path;
    return selectedSection.value.children.find((route) => {
        // Exact match
        if (currentPath === route.path) {
            return true;
        }
        // Match with dynamic segment (e.g., /correspondence/inbox/incoming/1)
        // This regex ensures the path ends with a slash followed by digits only
        const dynamicSegmentRegex = new RegExp(
            `^${route.path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/\\d+$`
        );
        return dynamicSegmentRegex.test(currentPath);
    })?.nameEn;
});
const selectedSection = computed(() => {
    const section = baseStore.sections.find((section) =>
        router.currentRoute.value.path.includes(section.path + "/")
    );
    if (!section) {
        router.push(baseStore.sections[0].children[0].path);
        return baseStore.sections[0];
    }
    return section;
});
</script>
<style scoped></style>
