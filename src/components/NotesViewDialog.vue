<template>
  <Dialog
    v-model:visible="displayDialog"
    :header="'ملاحظات - ' + (employeeName || '')"
    :style="{ width: '50vw' }"
    :modal="true"
    :closable="true"
    class="notes-dialog"
    dir="rtl"
    @update:visible="emitClose"
  >
    <div class="p-4">
      <div class="bg-slate-50 items-center text-center rounded-lg p-4 min-h-[150px]">
        <p class="text-slate-700 whitespace-pre-wrap">{{ notes || 'لا توجد ملاحظات' }}</p>
      </div>
    </div>
    <template #footer>
      <Button label="إغلاق" @click="emitClose" outlined />
    </template>
  </Dialog>
</template>

<script setup>
import { computed } from "vue";
import Dialog from "primevue/dialog";
import Button from "primevue/button";

const displayDialog = defineModel();

const props = defineProps({
  employeeName: {
    type: String,
    default: "",
  },
  notes: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["close"]);

const emitClose = () => {
  displayDialog.value = false;
  emit("close");
};
</script>

<style scoped>
/* Notes dialog styles can be added here if needed */
</style>

