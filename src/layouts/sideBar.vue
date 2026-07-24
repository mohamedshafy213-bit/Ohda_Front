<template>
    <div class="flex flex-col gap-2 min-h-full h-full">
        <!-- Main navigation section -->
        <div
            class="flex flex-col gap-2 bg-surface-0 dark:bg-surface-900 px-2 pt-3 rounded-2xl h-full shadow-xs"
        >
            <div
                @click="openMenu.open = !openMenu.open"
                class="flex justify-start items-center"
            >
                <div
                    :class="[
                        'relative group flex items-center gap-4 h-11  rounded-full cursor-pointer transition-all duration-100 hover:bg-surface-100 dark:hover:bg-surface-800',
                        openMenu.open
                            ? 'px-2 justify-start w-56'
                            : 'p-0 justify-center w-11',
                    ]"
                >
                    <Menu
                        :class="'text-black dark:text-white'"
                        class="w-6 h-6"
                    />
                    <span
                        v-if="openMenu.open"
                        class="text-black dark:text-white"
                        >{{
                            currentLocale === "ar"
                                ? openMenu.nameAr
                                : openMenu.nameEn
                        }}</span
                    >
                </div>
            </div>
            <div class="h-px bg-surface-300 dark:bg-surface-700 mx-1" />
            <div
                v-for="section in baseStore.sections"
                @click="selectSection(section)"
                :key="section.id"
                class="flex justify-start items-center"
            >
                <div
                    :class="[
                        'relative group flex items-center gap-4 h-11  rounded-full cursor-pointer transition-all duration-100',
                        selectedSection.nameEn === section.nameEn
                            ? 'bg-black hover:bg-black dark:bg-white dark:hover:bg-white'
                            : 'hover:bg-surface-100 dark:hover:bg-surface-800',
                        openMenu.open
                            ? 'px-2 justify-start w-56'
                            : 'p-0 justify-center w-11',
                    ]"
                >
                    <component
                        :is="section.icon"
                        :class="
                            selectedSection.nameEn === section.nameEn
                                ? 'text-white dark:text-black'
                                : 'text-black dark:text-white'
                        "
                        class="w-6 h-6"
                    />
                    <span
                        v-if="openMenu.open"
                        :class="[
                            'line-clamp-1 ',
                            selectedSection.nameEn === section.nameEn
                                ? 'text-white dark:text-black'
                                : 'text-black dark:text-white',
                        ]"
                    >
                        {{
                            currentLocale === "ar"
                                ? section.nameAr
                                : section.nameEn
                        }}</span
                    >
                    <!-- Tooltip -->
                    <div
                        v-else
                        class="absolute hidden group-hover:block start-full ms-2 px-2 py-1 bg-surface-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50"
                    >
                        {{
                            currentLocale === "ar"
                                ? section.nameAr
                                : section.nameEn
                        }}
                    </div>
                </div>
            </div>
        </div>

        <!-- Bottom section with logout and settings -->
        <div class="mt-auto">
            <div
                class="flex flex-col gap-4 bg-surface-0 dark:bg-surface-900 rounded-2xl py-6 shadow-sm"
            >
                <div
                    @click="router.push('/user/settings')"
                    class="relative group flex justify-center items-center gap-4 rounded-full cursor-pointer"
                >
                    <Settings class="w-6 h-6 text-black dark:text-white" />

                    <span v-if="openMenu.open" :class="['line-clamp-1 ']">
                        {{ currentLocale === "ar" ? "الإعدادات" : "Settings" }}
                    </span>
                    <!-- Tooltip -->
                    <div
                        v-else
                        class="absolute start-full ms-2 px-2 py-1 bg-surface-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50"
                    >
                        {{ currentLocale === "ar" ? "الإعدادات" : "Settings" }}
                    </div>
                </div>
                <div class="h-px bg-surface-300 dark:bg-surface-700 mx-3" />
                <div
                    @click="logout"
                    class="relative group flex justify-center items-center gap-4 rounded-full cursor-pointer"
                >
                    <LogOut class="w-6 h-6 text-red-500" />

                    <span v-if="openMenu.open" :class="['line-clamp-1 ']">
                        {{ currentLocale === "ar" ? "تسجيل الخروج" : "Logout" }}
                    </span>
                    <!-- Tooltip -->
                    <div
                        v-else
                        class="absolute start-full ms-2 px-2 py-1 bg-surface-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50"
                    >
                        {{ currentLocale === "ar" ? "تسجيل الخروج" : "Logout" }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
import { useBaseStore } from "@/stores/baseStore";
import { useRouter } from "vue-router";
import { getCurrentLocale } from "@/i18n";
const router = useRouter();
const currentLocale = computed(() => getCurrentLocale());
const baseStore = useBaseStore();
const selectSection = (section) => {
    router.push(section.children[0].path);
};
const openMenu = ref({
    nameEn: "Close Menu",
    nameAr: "إغلاق القائمة",
    open: false,
});
const selectedSection = computed(() => {
    const section = baseStore.sections.find((section) =>
        router.currentRoute.value.path.includes(section.path + "/"),
    );
    if (!section) {
        router.push(baseStore.sections[0].children[0].path);
        return baseStore.sections[0];
    }
    return section;
});
const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("useTotp");
    localStorage.removeItem("user");
    router.push("/login");
};
</script>
