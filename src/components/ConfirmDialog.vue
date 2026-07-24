<template>
  <Dialog 
    :closable="false" 
    :showHeader="false" 
    :visible="displayDialog" 
    modal 
    :style="{ width: '42vw' }"
    class="confirm-dialog" 
    @update:visible="emitClose"
  >
    <div class="p-3 !rounded-[20px] w-[730] bg-white flex flex-col justify-between" :class="showNotes ? 'min-h-[450px]' : 'h-[300px]'" dir="rtl">
      <div class="w-full flex justify-center items-center">
        <p class="font-[700] text-2xl">{{ title }}</p>
      </div>

      <div class="flex flex-col gap-3 justify-start flex-1 overflow-y-auto">
        <p class="text-xl mt-2 font-[500]">
          {{ message }} (<span class="font-bold !text-red-600">{{ itemName }}</span>)؟
        </p>
        <div 
          style="width: 100%;background-color: #EFF6FF"
          class="border-s-8 border-[#c73245] !text-red-700 p-3 flex flex-col items-start"
        >
          <div class="flex gap-2">
            <svg width="25" height="21" viewBox="0 0 25 21" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M24.1309 18.8482L13.0376 0.741244C12.8722 0.472155 12.5869 0.338867 12.2989 0.338867C12.0109 0.338867 11.7229 0.472155 11.5602 0.741244L0.466905 18.8482C0.138905 19.3864 0.549571 20.0553 1.20557 20.0553H23.3922C24.0482 20.0553 24.4589 19.3864 24.1309 18.8482ZM11.4456 7.78284C11.4456 7.67219 11.5416 7.58165 11.6589 7.58165H12.9389C13.0562 7.58165 13.1522 7.67219 13.1522 7.78284V12.4102C13.1522 12.5208 13.0562 12.6114 12.9389 12.6114H11.6589C11.5416 12.6114 11.4456 12.5208 11.4456 12.4102V7.78284ZM12.2989 16.6351C11.964 16.6287 11.645 16.4987 11.4106 16.273C11.1761 16.0473 11.0448 15.744 11.0448 15.428C11.0448 15.1121 11.1761 14.8087 11.4106 14.583C11.645 14.3573 11.964 14.2273 12.2989 14.2209C12.6339 14.2273 12.9528 14.3573 13.1873 14.583C13.4217 14.8087 13.553 15.1121 13.553 15.428C13.553 15.744 13.4217 16.0473 13.1873 16.273C12.9528 16.4987 12.6339 16.6287 12.2989 16.6351Z"
                fill="#c73245"
              />
            </svg>
            <p style="color: #c73245;" class="font-bold">تنبيه</p>
          </div>
          <div>
            <p style="color: #c73245;">{{ warningMessage }}</p>
          </div>
        </div>
        
        <!-- Notes field (optional) -->
        <div v-if="showNotes" class="w-full mt-2">
          <label class="block text-sm font-medium text-slate-700 mb-2">ملاحظات (اختياري)</label>
          <Textarea 
            v-model="notesValue" 
            :rows="3" 
            class="w-full"
            placeholder="أدخل ملاحظاتك هنا..."
          />
        </div>
      </div>

      <div class="flex justify-between mt-4">
        <Button severity="danger" class="confirm-button" @click="confirmAction">{{ confirmText }}</Button>
        <Button class="cancel-button" @click="cancelAction">{{ cancelText }}</Button>
      </div>
    </div>
  </Dialog>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import Textarea from "primevue/textarea";

const displayDialog = defineModel();

const props = defineProps({
  itemName: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    default: "تأكيد العملية",
  },
  message: {
    type: String,
    default: "هل تريد تنفيذ العملية",
  },
  warningMessage: {
    type: String,
    default: "لن تتمكن من إلغاء هذه العملية مرة أخرى",
  },
  confirmText: {
    type: String,
    default: "نعم، تأكيد",
  },
  cancelText: {
    type: String,
    default: "لا، إلغاء",
  },
  showNotes: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["confirm", "cancel"]);

const notesValue = ref("");

// Reset notes when dialog closes
watch(displayDialog, (newVal) => {
  if (!newVal) {
    notesValue.value = "";
  }
});

const emitClose = () => {
  displayDialog.value = false;
};

const confirmAction = () => {
  emit("confirm", notesValue.value || null);
  emitClose();
};

const cancelAction = () => {
  emit("cancel");
  emitClose();
};
</script>

<style scoped>
/* Custom Styling */
.confirm-dialog ::v-deep(.p-dialog-mask) {
  background-color: rgba(0, 0, 0, 0.7) !important;
}

.cancel-button {
  background-color: #1e293b;
  color: white;
  padding: 10px 20px;
  border-radius: 0px !important;
  font-weight: 500;
  font-size: 20px;
  transition: 0.3s;
}

.cancel-button:hover {
  background-color: #2d3748;
}

.confirm-button {
  background-color: #c73245;
  color: white;
  border: 1px solid #c73245;
  padding: 10px 20px;
  border-radius: 0px !important;
  font-weight: 500;
  font-size: 20px;
  transition: 0.3s;
}

.confirm-button:hover {
  background-color: #c73245;
  border-color: #c73245;
}

.confirm-button:focus {
  box-shadow: 0 0 #0000 !important;
}

/* Textarea styling */
:deep(.p-textarea) {
  width: 100%;
}

:deep(.p-textarea .p-inputtext) {
  width: 100%;
  border: 1px solid #cbd5e1;
  border-radius: 0.375rem;
  padding: 0.5rem;
}

:deep(.p-textarea .p-inputtext:focus) {
  border-color: #c73245;
  box-shadow: 0 0 0 3px rgba(#c73245, 0.1);
  outline: none;
}

:deep(.p-textarea .p-inputtext::placeholder) {
  color: #c73245;
}
</style>

