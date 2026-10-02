import axios from "axios";
import { useToastStore } from "@/stores/toastStore";
import i18n from "@/i18n";

const ROOT_URL = import.meta.env.VITE_ROOT_URL || "https://localhost:7048";

const apiClient = axios.create({
  baseURL: ROOT_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json"
  },
  timeout: 30000
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers["Accept-Language"] = localStorage.getItem("selectedLocale") || "ar";
    return config;
  },
  (error) => Promise.reject(error)
);

function getLocalizedText(arText, enText) {
  const locale = i18n.global.locale.value || "ar";
  return locale === "ar" ? arText : enText;
}

apiClient.interceptors.response.use(
  (response) => {
    const toastStore = useToastStore();
    const data = response?.data;
    const disableToast = response.config.headers?.disableToast;

    // Handle custom backend API status envelopes (e.g. { isDone: false, returnMessage: "..." })
    if (data && typeof data === "object") {
      if (data.errorCode === 404) {
        if (!disableToast) {
          toastStore.addWarningToast(data.returnMessage || getLocalizedText("السجل المطلوب غير موجود", "Requested record not found"));
        }
      } else if (data.errorCode != null && data.errorCode !== 200 && data.errorCode !== 0) {
        if (!disableToast) {
          toastStore.addErrorToast(data.returnMessage || getLocalizedText("حدث خطأ أثناء معالجة الطلب", "An error occurred while processing the request"));
        }
      } else if (data.isDone === false) {
        if (!disableToast) {
          toastStore.addErrorToast(data.returnMessage || getLocalizedText("تعذر إتمام العملية", "Operation could not be completed"));
        }
      } else if (response.config.method !== "get" && !disableToast) {
        if (data.returnMessage) {
          toastStore.addSuccessToast(data.returnMessage);
        }
      }
    }
    return response;
  },
  (error) => {
    const toastStore = useToastStore();
    const disableToast = error?.config?.headers?.disableToast;
    const status = error?.response?.status;
    const data = error?.response?.data;

    // Only log technical details to developer console
    console.error("[Ohda API Error Interceptor]:", {
      status,
      url: error?.config?.url,
      method: error?.config?.method,
      data
    });

    if (!disableToast) {
      if (!error.response) {
        // Network or connection timeout
        toastStore.addErrorToast(
          getLocalizedText(
            "تعذر الاتصال بالخادم. يرجى التحقق من اتصال الشبكة وإعادة المحاولة.",
            "Network error: Unable to reach the server. Please check your connection."
          )
        );
      } else if (status === 401) {
        toastStore.addErrorToast(
          getLocalizedText(
            "انتهت صلاحية الجلسة، يرجى تسجيل الدخول من جديد.",
            "Session expired. Please sign in again."
          )
        );
        // Optional redirect
        if (window.location.pathname !== "/ohda/login") {
          setTimeout(() => {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("ohdaUser");
            window.location.assign("/ohda/login");
          }, 1500);
        }
      } else if (status === 403) {
        toastStore.addErrorToast(
          getLocalizedText(
            "ليس لديك الصلاحية الكافية لتنفيذ هذا الإجراء.",
            "Access denied: You do not have permission for this action."
          )
        );
      } else if (status === 404) {
        const msg = data?.returnMessage || getLocalizedText("العنصر المطلوب غير موجود أو تم حذفه.", "The requested item was not found or has been removed.");
        toastStore.addWarningToast(msg);
      } else if (status === 409) {
        const msg = data?.returnMessage || getLocalizedText("تعارض في البيانات. السجل موجود مسبقاً أو مرتبط بعمليات أخرى.", "Data conflict: Record already exists or is in use.");
        toastStore.addErrorToast(msg);
      } else if (status === 400 || status === 422) {
        let msg = data?.returnMessage || data?.title;
        if (!msg && data?.errors && typeof data.errors === "object") {
          const firstKey = Object.keys(data.errors)[0];
          if (firstKey && data.errors[firstKey]?.length) {
            msg = data.errors[firstKey][0];
          }
        }
        toastStore.addErrorToast(
          msg || getLocalizedText("يرجى مراجعة البيانات المدخلة والتأكد من صحتها.", "Invalid data provided. Please check the fields and try again.")
        );
      } else if (status >= 500) {
        toastStore.addErrorToast(
          getLocalizedText(
            "حدث خطأ غير متوقع في الخادم. تم تسجيل المشكلة وسيتم معالجتها.",
            "Internal server error occurred. Please try again shortly."
          )
        );
      } else {
        toastStore.addErrorToast(
          data?.returnMessage || getLocalizedText("حدث خطأ أثناء معالجة العملية.", "An error occurred while processing the request.")
        );
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;

