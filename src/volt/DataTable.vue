<template>
    <DataTable
        ref="el"
        unstyled
        :pt="theme"
        :ptOptions="{
            mergeProps: ptViewMerge
        }"
    >
        <template #paginatorcontainer="{ page, pageCount, pageLinks, changePageCallback, firstPageCallback, lastPageCallback, prevPageCallback, nextPageCallback }">
            <div class="flex flex-wrap gap-2 items-center justify-center">
                <SecondaryButton text rounded @click="firstPageCallback" :disabled="page === 0">
                    <template #icon>
                        <AngleDoubleLeftIcon />
                    </template>
                </SecondaryButton>
                <SecondaryButton text rounded @click="prevPageCallback" :disabled="page === 0">
                    <template #icon>
                        <AngleLeftIcon />
                    </template>
                </SecondaryButton>
                <div class="items-center justify-center gap-2 hidden sm:flex">
                    <SecondaryButton v-for="pageLink of pageLinks" :key="pageLink" :text="page + 1 !== pageLink" rounded @click="() => changePageCallback(pageLink - 1)" :class="['shrink-0 min-w-10 h-10', { 'bg-highlight!': page + 1 === pageLink }]"
                        >{{ pageLink }}
                    </SecondaryButton>
                </div>
                <SecondaryButton text rounded @click="nextPageCallback" :disabled="page === pageCount! - 1">
                    <template #icon>
                        <AngleRightIcon />
                    </template>
                </SecondaryButton>
                <SecondaryButton text rounded @click="lastPageCallback" :disabled="page === pageCount! - 1">
                    <template #icon>
                        <AngleDoubleRightIcon />
                    </template>
                </SecondaryButton>
            </div>
        </template>
        <template #loadingicon>
            <SpinnerIcon class="animate-spin text-[2rem] w-8 h-8" />
        </template>
        <template v-for="(_, slotName) in $slots" #[slotName]="slotProps">
            <slot :name="slotName" v-bind="slotProps ?? {}"  />
        </template>
    </DataTable>
</template>

<script setup lang="ts">
import AngleDoubleLeftIcon from '@primevue/icons/angledoubleleft';
import AngleDoubleRightIcon from '@primevue/icons/angledoubleright';
import AngleLeftIcon from '@primevue/icons/angleleft';
import AngleRightIcon from '@primevue/icons/angleright';
import SpinnerIcon from '@primevue/icons/spinner';
import DataTable, { type DataTablePassThroughOptions, type DataTableProps } from 'primevue/datatable';
import { ref } from 'vue';
import SecondaryButton from './SecondaryButton.vue';
import { ptViewMerge } from './utils';

interface Props extends /* @vue-ignore */ DataTableProps {}
defineProps<Props>();

const theme = ref<DataTablePassThroughOptions>({
    root: `relative p-flex-scrollable:flex p-flex-scrollable:flex-col p-flex-scrollable:h-full !rounded-2xl`,
    tableContainer: `p-scrollable:relative p-flex-scrollable:flex p-flex-scrollable:flex-col p-flex-scrollable:flex-1 p-flex-scrollable:h-full !rounded-2xl`,
    header: `py-3 px-4 border-b border-brand-gray/10 bg-transparent text-brand-dark`,
    table: `border-spacing-0 w-full border-separate`,
    thead: `p-scrollable:bg-brand-light p-scrollable:top-0 p-scrollable:z-10 backdrop-blur`,
    tbody: `p-hoverable:*:hover:bg-brand-light transition-colors p-frozen:sticky p-frozen:z-10`,
    bodyRow: `bg-transparent text-brand-dark p-selectable:cursor-pointer p-selected:bg-brand-soft!`,
    tfoot: `p-scrollable:bg-brand-light p-scrollable:bottom-0 p-scrollable:z-10 backdrop-blur`,
    footer: `py-3 px-4 border-b border-brand-gray/10 bg-transparent text-brand-dark`,
    mask: `bg-brand-dark/20 text-brand-dark absolute z-10 flex items-center justify-center w-full h-full backdrop-blur-sm`,
    column: {
        root: ``,
        headerCell: `group py-3 px-4 font-semibold text-start transition-colors duration-200
            border-b border-brand-gray/10
            bg-brand-light
            text-brand-gray
            p-sortable:cursor-pointer p-sortable:select-none p-sortable:focus-visible:outline p-sortable:focus-visible:outline-1 p-sortable:focus-visible:-outline-offset-1 p-sortable:focus-visible:outline-brand-accent
            p-sortable:not-p-sorted:hover:bg-brand-light p-sortable:not-p-sorted:hover:text-brand-dark
            p-sorted:bg-brand-soft p-sorted:text-brand-accent
            p-frozen:sticky p-frozen:bg-brand-light p-frozen:z-10
        `,
        columnHeaderContent: `flex items-center gap-2`,
        columnTitle: `font-bold`,
        bodyCell: `text-start py-3 px-4 border-b border-brand-gray/10
            p-frozen:sticky p-frozen:bg-brand-white`,
        bodyCellContent: ``,
        footerCell: `text-start py-3 px-4 border-b border-brand-gray/10
            bg-transparent
            text-brand-dark
            p-frozen:sticky p-frozen:bg-brand-white`,
        columnFooter: `font-semibold`,
        columnResizer: `block absolute top-0 end-0 m-0 w-2 h-full p-0 cursor-col-resize border border-transparent`,
        sort: ``,
        sortIcon: `text-brand-gray transition-colors duration-200
            group-p-sortable:not-group-p-sorted:group-hover:text-brand-dark
            group-p-sorted:text-brand-accent`,
        pcSortBadge: {
            root: `bg-brand-accent text-brand-dark rounded-full min-w-6 h-6 inline-flex items-center justify-center text-xs font-bold`
        },
        pcHeaderCheckbox: {
            root: `relative inline-flex select-none w-5 h-5 align-bottom`,
            input: `peer cursor-pointer disabled:cursor-default appearance-none 
                absolute start-0 top-0 w-full h-full m-0 p-0 opacity-0 z-10
                border border-transparent rounded-xs`,
            box: `flex justify-center items-center rounded-sm w-5 h-5
                border border-brand-gray/30 bg-brand-light text-brand-dark
                peer-enabled:peer-hover:border-brand-accent/50
                p-checked:border-brand-accent p-checked:bg-brand-accent p-checked:text-brand-dark
                peer-focus-visible:outline-1 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-accent peer-focus-visible:outline 
                p-disabled:bg-brand-light p-disabled:border-brand-gray/25 p-disabled:text-brand-gray
                shadow-sm transition-colors duration-200`,
            icon: `text-sm w-[0.875rem] h-[0.875rem] transition-none`
        },
        pcRowRadiobutton: {
            root: `relative inline-flex select-none w-5 h-5`,
            input: `peer cursor-pointer disabled:cursor-default appearance-none absolute start-0 top-0 w-full h-full m-0 p-0 opacity-0 z-10
                border border-transparent rounded-full`,
            box: `flex justify-center items-center rounded-full
                border border-brand-gray/30 bg-brand-light
                peer-enabled:peer-hover:border-brand-accent/50
                p-checked:border-brand-accent p-checked:bg-brand-accent
                peer-focus-visible:outline-1 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-accent peer-focus-visible:outline 
                p-invalid:border-red-500
                p-disabled:bg-brand-light p-disabled:border-brand-gray/25
                shadow-sm transition-colors duration-200
                w-5 h-5`,
            icon: `bg-transparent text-xs w-3 h-3 rounded-full
                transition-all duration-200 backface-hidden scale-[0.1]
                p-checked:bg-brand-dark p-checked:visible p-checked:scale-100
                p-disabled:bg-brand-gray`
        },
        pcRowCheckbox: {
            root: `relative inline-flex select-none w-5 h-5 align-bottom`,
            input: `peer cursor-pointer disabled:cursor-default appearance-none 
                absolute start-0 top-0 w-full h-full m-0 p-0 opacity-0 z-10
                border border-transparent rounded-xs`,
            box: `flex justify-center items-center rounded-sm w-5 h-5
                border border-brand-gray/30 bg-brand-light text-brand-dark
                peer-enabled:peer-hover:border-brand-accent/50
                p-checked:border-brand-accent p-checked:bg-brand-accent p-checked:text-brand-dark
                peer-focus-visible:outline-1 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-accent peer-focus-visible:outline 
                p-disabled:bg-brand-light p-disabled:border-brand-gray/25 p-disabled:text-brand-gray
                shadow-sm transition-colors duration-200`,
            icon: `text-sm w-[0.875rem] h-[0.875rem] transition-none`
        },
        rowToggleButton: `inline-flex items-center justify-center overflow-hidden relative w-7 h-7 cursor-pointer select-none
            transition-colors duration-200 rounded-full border-none bg-transparent
            text-brand-gray enabled:hover:bg-brand-light enabled:hover:text-brand-dark
            focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-brand-accent
            p-selected:hover:bg-brand-soft p-selected:hover:text-brand-accent`,
        rowToggleIcon: ``,
        reorderableRowHandle: ``
    },
    loadingIcon: ``,
    pcPaginator: {
        paginatorContainer: `p-bottom:border-b border-brand-gray/10`,
        root: `flex items-center justify-center flex-wrap py-2 px-4 rounded-md gap-1
            bg-transparent text-brand-dark`
    },
    columnResizeIndicator: `w-px absolute z-10 hidden bg-brand-accent`,
    rowReorderIndicatorUp: `absolute hidden`,
    rowReorderIndicatorDown: `absolute hidden`
});

const el = ref();
defineExpose({
    exportCSV: () => el.value.exportCSV()
});
</script>
