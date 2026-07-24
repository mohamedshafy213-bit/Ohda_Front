<template>
    <ContextMenu
        ref="el"
        unstyled
        :pt="theme"
        :ptOptions="{
            mergeProps: ptViewMerge,
        }"
    >
        <template #submenuicon="slotProps">
            <slot name="submenuicon" v-bind="slotProps ?? {}">
                <ChevronRight class="w-4 h-4" />
            </slot>
        </template>
        <template v-for="(_, slotName) in $slots" #[slotName]="slotProps">
            <slot :name="slotName" v-bind="slotProps ?? {}" />
        </template>
    </ContextMenu>
</template>

<script setup lang="ts">
import ContextMenu, {
    type ContextMenuPassThroughOptions,
    type ContextMenuProps,
} from "primevue/contextmenu";
import { ref } from "vue";
import { ptViewMerge } from "./utils";

interface Props extends /* @vue-ignore */ ContextMenuProps {}
defineProps<Props>();

const theme = ref<ContextMenuPassThroughOptions>({
    root: `fixed z-[1100]
        bg-surface-0 dark:bg-surface-900 text-surface-700 dark:text-surface-0
        border border-surface-200 dark:border-surface-700
        rounded-md shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)]
        min-w-[7.5rem] outline-none`,
    rootList: `list-none m-0 p-1 outline-none flex flex-col`,
    item: `relative`,
    itemContent: `flex items-center cursor-pointer select-none no-underline overflow-hidden`,
    itemLink: `flex items-center gap-2 flex-1 py-2 px-3 text-surface-700 dark:text-surface-0
        hover:bg-surface-100 dark:hover:bg-surface-800
        p-focus:bg-surface-100 dark:p-focus:bg-surface-800
        p-disabled:opacity-60 p-disabled:pointer-events-none
        transition-colors duration-200 rounded-sm`,
    itemIcon: `shrink-0 text-surface-500 dark:text-surface-400`,
    itemLabel: `flex-1`,
    submenuIcon: `ms-auto w-4 h-4 text-surface-500 dark:text-surface-400`,
    separator: `border-t border-surface-200 dark:border-surface-700 my-1`,
    submenu: `list-none m-0 p-1 outline-none min-w-[12.5rem] 
        bg-surface-0 dark:bg-surface-900
        border border-surface-200 dark:border-surface-700
        rounded-md shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)]
        absolute z-[1100]`,
    transition: {
        enterFromClass: "opacity-0 scale-95",
        enterActiveClass: "transition duration-120 ease-[cubic-bezier(0,0,0.2,1)]",
        leaveActiveClass: "transition-opacity duration-100 ease-linear",
        leaveToClass: "opacity-0",
    },
});

const el = ref<InstanceType<typeof ContextMenu>>();
defineExpose({
    show: (event: Event) => el.value?.show(event),
    hide: () => el.value?.hide(),
});
</script>
