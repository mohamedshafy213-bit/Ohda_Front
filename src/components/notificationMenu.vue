<template>
    <button
        @click="toggle"
        class="w-9 h-9 rounded-full bg-surface-0 dark:bg-surface-800 flex items-center justify-center hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
    >
        <BellRing class="w-5 h-5 text-black dark:text-white" />
    </button>
    <Popover ref="menu">
        <div class="flex flex-col gap-2 min-w-96">
            <h1 class="text-lg font-bold text-black dark:text-white">
                {{ $t("notifications") }}
            </h1>
            <hr class="border-surface-200 dark:border-surface-700" />
            <div v-for="group in groupedNotifications" :key="group.title">
                <span
                    class="text-sm font-semibold text-surface-500 dark:text-surface-0"
                    >{{ $t(group.title) }}</span
                >
                <div
                    v-if="group.items.length > 0"
                    v-for="item in group.items"
                    @click="viewEvent(item)"
                    :key="item.title"
                >
                    <div class="flex items-start gap-2 p-1.5 cursor-pointer">
                        <div
                            class="w-7 h-7 rounded-md flex items-center justify-center"
                            :style="{ backgroundColor: item.color }"
                        >
                            <component
                                :is="typeIcons(item.typeName)"
                                class="w-4 h-4 text-white"
                            />
                        </div>
                        <div class="flex flex-col gap-2">
                            <span class="font-semibold">{{ item.title }}</span>
                            <span
                                class="text-xs font-semibold text-primary-500 dark:text-primary-0"
                                >{{ formatDate(item.start) }}</span
                            >
                        </div>
                    </div>
                </div>
                <div class="w-full text-center" v-else>
                    <span class="text-sm text-surface-500 dark:text-surface-0">
                        {{ $t("cm.notifications.noNotifications") }}
                    </span>
                </div>
            </div>
            <hr class="border-surface-200 dark:border-surface-700" />
            <div class="w-full text-center">
                <span
                    @click="viewAll"
                    class="text-sm text-surface-500 dark:text-surface-0 cursor-pointer hover:text-surface-700 dark:hover:text-surface-300 transition-colors"
                >
                    {{ $t("viewAll") }}
                </span>
            </div>
        </div>
    </Popover>
</template>

<script setup>
import { useRouter } from "vue-router";
import { useCalenderStore } from "@/projects/correspondence/stores/calenderStore";
import { formatDate } from "@/utilities/functions";
const calenderStore = useCalenderStore();
const router = useRouter();
const toggle = (event) => {
    menu.value.toggle(event);
};
const menu = ref();
const typeIcons = (typeName) => {
    switch (typeName) {
        case "Conference":
            return "GraduationCap";
        case "Incoming Task":
            return "ClipboardList";
        default:
            return "ClipboardList";
    }
};

const groupedNotifications = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const groups = [
        {
            title: "today",
            items: [],
        },
        {
            title: "yesterday",
            items: [],
        },
        {
            title: "cm.notifications.older",
            items: [],
        },
    ];

    calenderStore.events.forEach((item) => {
        const itemDate = new Date(item.start);
        itemDate.setHours(0, 0, 0, 0);
        if (itemDate.getTime() === today.getTime()) {
            groups[0].items.push(item);
        } else if (itemDate.getTime() === yesterday.getTime()) {
            groups[1].items.push(item);
        } else {
            groups[2].items.push(item);
        }
    });

    return groups;
});
const viewEvent = (item) => {
    router.push(item.url);
    toggle();
};
const viewAll = () => {
    toggle();
    router.push({
        name: "Calendar",
    });
};
onMounted(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    //calenderStore.getEvents(thirtyDaysAgo.toISOString(), today.toISOString());
});
</script>
