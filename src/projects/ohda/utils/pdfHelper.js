import apiClient from "@/utilities/apiClient";
import { useToastStore } from "@/stores/toastStore";

export async function downloadServerPdf(url, fileName = "document.pdf") {
  try {
    const res = await apiClient.get(url, { responseType: "blob" });
    if (!res || !res.data) {
      const toastStore = useToastStore();
      toastStore.addWarningToast("لم يتم استلام ملف من الخادم");
      return;
    }

    // If server returned a JSON error wrapped in a blob
    if (res.data.type === "application/json") {
      const text = await res.data.text();
      let msg = "تعذر تحميل ملف الـ PDF";
      try {
        const errObj = JSON.parse(text);
        msg = errObj.returnMessage || errObj.detail || errObj.title || msg;
      } catch (_) {}
      const toastStore = useToastStore();
      toastStore.addErrorToast(msg);
      return;
    }

    const blob = new Blob([res.data], { type: "application/pdf" });
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
  } catch (err) {
    console.error("PDF download failed:", err);
    let msg = "تعذر تحميل ملف الـ PDF من الخادم.";
    try {
      if (err?.response?.data instanceof Blob) {
        const text = await err.response.data.text();
        const json = JSON.parse(text);
        msg = json.returnMessage || json.detail || json.title || msg;
      } else if (err?.response?.data?.returnMessage) {
        msg = err.response.data.returnMessage;
      } else if (err?.message) {
        msg = err.message;
      }
    } catch (_) {}
    const toastStore = useToastStore();
    toastStore.addErrorToast(msg);
  }
}

