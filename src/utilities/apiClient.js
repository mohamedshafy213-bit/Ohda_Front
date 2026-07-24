import axios from "axios";
import { useToastStore } from "@/stores/toastStore";

const ROOT_URL = import.meta.env.VITE_ROOT_URL || "https://localhost:7048";

const apiClient = axios.create({
  baseURL: ROOT_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json"
  }
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

apiClient.interceptors.response.use(
  (response) => {
    const toastStore = useToastStore();
    if (response?.data?.errorCode === 404) {
      toastStore.addWarningToast(response.data.returnMessage || "Not found");
    } else if (
      response?.data?.errorCode != null &&
      response.data.errorCode !== 200 &&
      response.data.errorCode !== 0
    ) {
      toastStore.addErrorToast(response.data.returnMessage || "Error occurred");
    } else if (response.config.method !== "get" && !response.config.headers?.disableToast) {
      if (response?.data?.returnMessage) {
        toastStore.addSuccessToast(response.data.returnMessage);
      }
    }
    return response;
  },
  (error) => {
    const toastStore = useToastStore();
    const status = error?.response?.status;
    if (status === 401) {
      toastStore.addErrorToast("يرجى تسجيل الدخول من جديد");
    } else if (status === 403) {
      toastStore.addErrorToast("ليس لديك صلاحية للوصول لهذا الإجراء");
    }
    return Promise.reject(error);
  }
);

export default apiClient;
