import { defineStore } from "pinia";
import { ref } from "vue";

export const useOhdaConfirmStore = defineStore("ohdaConfirm", () => {
  const visible = ref(false);
  const title = ref("تأكيد العملية");
  const message = ref("هل أنت متأكد من رغبتك في المتابعة؟");
  const confirmText = ref("تأكيد");
  const cancelText = ref("إلغاء");
  const isDestructive = ref(true);
  let resolvePromise = null;

  function showConfirm(options = {}) {
    title.value = options.title || (options.isDestructive !== false ? "تأكيد الحذف" : "تأكيد العملية");
    message.value = options.message || "هل أنت متأكد من رغبتك في المتابعة؟ لا يمكن التراجع عن هذا الإجراء.";
    confirmText.value = options.confirmText || (options.isDestructive !== false ? "نعم، حذف" : "تأكيد");
    cancelText.value = options.cancelText || "إلغاء";
    isDestructive.value = options.isDestructive !== false;
    visible.value = true;

    return new Promise((resolve) => {
      resolvePromise = resolve;
    });
  }

  function handleConfirm() {
    visible.value = false;
    if (resolvePromise) {
      resolvePromise(true);
      resolvePromise = null;
    }
  }

  function handleCancel() {
    visible.value = false;
    if (resolvePromise) {
      resolvePromise(false);
      resolvePromise = null;
    }
  }

  return {
    visible,
    title,
    message,
    confirmText,
    cancelText,
    isDestructive,
    showConfirm,
    handleConfirm,
    handleCancel
  };
});
