<template>
    <Dialog
        :closable="false"
        :showHeader="false"
        :visible="displayDeleteDialog"
        modal
        :style="{ width: '34vw' }"
        class="transition-all duration-300"
    >
        <div class="p-3 !rounded-[20px] flex flex-col justify-between gap-6">
            <div
                class="w-full flex justify-center items-center text-center pt-5"
            >
                <div
                    v-if="isDeactivate"
                    class="rounded-full border-2 outline-4 outline-orange-200 border-orange-500 p-2 w-20 h-20 flex items-center justify-center"
                >
                    <CircleOff class="w-10 h-10 !text-orange-500" />
                </div>
                <div
                    v-else-if="isActivate"
                    class="rounded-full border-2 outline-4 outline-green-200 border-green-500 p-2 w-20 h-20 flex items-center justify-center"
                >
                    <CheckCircle class="w-10 h-10 !text-green-500" />
                </div>
                <div
                    v-else
                    class="rounded-full border-2 outline-4 outline-red-200 border-red-500 p-2 w-20 h-20 flex items-center justify-center"
                >
                    <Trash class="w-10 h-10 !text-red-500" />
                </div>
            </div>
            <div
                v-if="!loading"
                class="w-full flex justify-center items-center text-center"
            >
                <p class="font-[700] text-2xl">
                    {{
                        isDeactivate
                            ? $t("deleteDialog.deactivateDialogTitle", {
                                  itemType: itemType,
                              })
                            : isActivate
                            ? $t("deleteDialog.activateDialogTitle", {
                                  itemType: itemType,
                              })
                            : $t("deleteDialog.deleteDialogTitle", {
                                  itemType: itemType,
                              })
                    }}
                </p>
            </div>
            <div
                v-if="loading"
                class="w-full flex justify-center items-center text-center gap-2"
            >
                <div
                    :class="
                        isDeactivate
                            ? 'animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600'
                            : isActivate
                            ? 'animate-spin rounded-full h-8 w-8 border-b-2 border-green-600'
                            : 'animate-spin rounded-full h-8 w-8 border-b-2 border-red-600'
                    "
                ></div>
                <span
                    v-if="isDeactivate"
                    class="ml-2 text-surface-600 dark:text-surface-400"
                    >{{
                        $t("deleteDialog.deactivating", {
                            itemType: itemType,
                            itemName: itemName,
                        })
                    }}</span
                >
                <span
                    v-else-if="isActivate"
                    class="ml-2 text-surface-600 dark:text-surface-400"
                    >{{
                        $t("deleteDialog.activating", {
                            itemType: itemType,
                            itemName: itemName,
                        })
                    }}</span
                >
                <span
                    v-else
                    class="ml-2 text-surface-600 dark:text-surface-400"
                    >{{
                        $t("deleteDialog.deleting", {
                            itemType: itemType,
                            itemName: itemName,
                        })
                    }}</span
                >
            </div>
            <div
                v-if="!loading"
                class="flex flex-col gap-2 justify-center text-center"
            >
                <p
                    class="text-xl font-[500] text-surface-500 dark:text-surface-400"
                >
                    {{
                        isDeactivate
                            ? $t("deleteDialog.deactivateDialogSubtitle", {
                                  itemType: itemType,
                                  itemName: itemName,
                              })
                            : isActivate
                            ? $t("deleteDialog.activateDialogSubtitle", {
                                  itemType: itemType,
                                  itemName: itemName,
                              })
                            : $t("deleteDialog.deleteDialogSubtitle", {
                                  itemType: itemType,
                                  itemName: itemName,
                              })
                    }}
                </p>
            </div>

            <div v-if="!loading" class="flex mt-6 gap-2">
                <Button
                    v-if="isDeactivate"
                    class="w-full !bg-orange-500/20 !text-orange-700 dark:!text-orange-300 hover:!bg-orange-500/30 border-none text-lg font-bold"
                    @click="confirmDelete"
                    >{{ $t("deleteDialog.yesDeactivate") }}</Button
                >
                <Button
                    v-else-if="isActivate"
                    class="w-full !bg-green-500/20 !text-green-700 dark:!text-green-300 hover:!bg-green-500/30 border-none text-lg font-bold"
                    @click="confirmDelete"
                    >{{ $t("deleteDialog.yesActivate") }}</Button
                >
                <Button
                    v-else
                    class="w-full bg-red-500/20 text-red-700 dark:text-red-300 hover:!bg-red-500/30 border-none text-lg font-bold"
                    @click="confirmDelete"
                    >{{ $t("deleteDialog.yesDelete") }}</Button
                >
                <Button
                    class="w-full bg-surface-500/20 text-surface-700 dark:text-surface-300 hover:!bg-surface-500/30 border-none text-lg font-bold"
                    @click="displayDeleteDialog = false"
                    @keydown="displayDeleteDialog = false"
                    >{{ $t("deleteDialog.noCancel") }}</Button
                >
            </div>
        </div>
    </Dialog>
</template>

<script setup>
const displayDeleteDialog = defineModel();
const props = defineProps({
    itemType: String,
    itemName: String,
    isDeactivate: {
        type: Boolean,
        default: false,
    },
    isActivate: {
        type: Boolean,
        default: false,
    },
    confirm: {
        type: Function,
        default: () => {},
    },
});
const loading = ref(false);
const confirmDelete = async () => {
    loading.value = true;
    await props.confirm();
    displayDeleteDialog.value = false;
    loading.value = false;
};
</script>
