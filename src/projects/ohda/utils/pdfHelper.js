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
    setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
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

export async function printServerPdf(url, fileName = "document.pdf") {
  const toastStore = useToastStore();
  try {
    const res = await apiClient.get(url, { responseType: "blob" });
    if (!res || !res.data) {
      toastStore.addWarningToast("لم يتم استلام ملف للطباعة من الخادم");
      return;
    }

    // If server returned a JSON error wrapped in a blob
    if (res.data.type === "application/json") {
      const text = await res.data.text();
      let msg = "تعذر استلام ملف الطباعة";
      try {
        const errObj = JSON.parse(text);
        msg = errObj.returnMessage || errObj.detail || errObj.title || msg;
      } catch (_) {}
      toastStore.addErrorToast(msg);
      return;
    }

    const blob = new Blob([res.data], { type: "application/pdf" });
    const blobUrl = URL.createObjectURL(blob);

    // Create a hidden iframe for direct PDF printing
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "none";
    iframe.style.opacity = "0";
    iframe.style.pointerEvents = "none";
    iframe.setAttribute("aria-hidden", "true");
    document.body.appendChild(iframe);

    let printed = false;
    const triggerPrint = () => {
      if (printed) return;
      printed = true;
      try {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      } catch (printErr) {
        console.warn("Iframe direct print threw, falling back to window.open:", printErr);
        const win = window.open(blobUrl, "_blank");
        if (win) {
          win.focus();
          setTimeout(() => {
            try { win.print(); } catch (_) {}
          }, 600);
        }
      }
    };

    iframe.onload = () => {
      // 500ms delay ensures Chrome PDF viewer plugin finishes painting vector pages
      setTimeout(triggerPrint, 500);
    };

    iframe.src = blobUrl;

    // Safety timeout in case onload event is suppressed by browser PDF plugin
    setTimeout(() => {
      if (!printed) {
        triggerPrint();
      }
    }, 1500);

    // Clean up memory and DOM after print dialog has initialized
    setTimeout(() => {
      try {
        URL.revokeObjectURL(blobUrl);
        if (iframe.parentNode) {
          iframe.parentNode.removeChild(iframe);
        }
      } catch (_) {}
    }, 60000);
  } catch (err) {
    console.error("PDF print request failed:", err);
    let msg = "تعذر طباعة المستند من الخادم.";
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
    toastStore.addErrorToast(msg);
  }
}
