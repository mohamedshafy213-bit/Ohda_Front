import { createApp } from "vue";
import { createPinia } from "pinia";
import i18n from "./i18n";
import App from "./App.vue";
import PrimeVue from "primevue/config";
import router from "./router";
import "./assets/main.css";
import ToastService from "primevue/toastservice";
import Tooltip from "primevue/tooltip";
import { importIcons } from "@/assets/icons/icons.js";
import Column from "primevue/column";
import Tag from "primevue/tag";
import ProgressSpinner from "primevue/progressspinner";
import { VueCal } from "vue-cal";
import "vue-cal/style";
import { disableDevTools } from "@/utilities/disableDevTools.js";

disableDevTools();

// Initialize document direction based on saved locale
const savedLocale = localStorage.getItem("selectedLocale") || "ar";
const isRTL = savedLocale === "ar";
document.documentElement.setAttribute("dir", isRTL ? "rtl" : "ltr");
import { setLocale } from "yup";
setLocale({
    mixed: {
        default: "غير صالحة",
        required: "هذا الحقل مطلوب",
    },
    string: {
        min: ({ min }) => `يجب أن يكون هذا الحقل على الأقل ${min} حرفاً`,
        max: ({ max }) => `يجب أن يكون هذا الحقل أقل من ${max} حرفاً`,
        email: "يجب إدخال بريد إلكتروني صحيح",
    },
    number: {
        min: ({ min }) => `يجب أن تكون القيمة أكبر من أو تساوي ${min}`,
    },
});
const app = createApp(App);
app.component("Column", Column);
app.component("Tag", Tag);
app.component("ProgressSpinner", ProgressSpinner);
app.directive("tooltip", Tooltip);
app.component("VueCal", VueCal);
importIcons(app);
app.use(createPinia());
app.use(router);
app.use(PrimeVue, {
    unstyled: true,
    pt: {
        directives: {
            tooltip: {
                root: {
                    class: "absolute z-[1100] pointer-events-none drop-shadow-md",
                },
                text: {
                    class: "bg-surface-800 text-surface-0 p-2 rounded-md text-sm leading-none whitespace-pre-wrap break-words",
                },
                arrow: {
                    class: "absolute w-0 h-0 border-transparent border-solid",
                    style: ({ context }) => {
                        const borderSize = "5px";
                        if (context.right)
                            return {
                                borderRightColor: "var(--p-surface-800)",
                                borderTopWidth: borderSize,
                                borderBottomWidth: borderSize,
                                borderRightWidth: borderSize,
                                marginLeft: "-5px",
                            };
                        if (context.left)
                            return {
                                borderLeftColor: "var(--p-surface-800)",
                                borderTopWidth: borderSize,
                                borderBottomWidth: borderSize,
                                borderLeftWidth: borderSize,
                                marginRight: "-5px",
                            };
                        if (context.top)
                            return {
                                borderTopColor: "var(--p-surface-800)",
                                borderLeftWidth: borderSize,
                                borderRightWidth: borderSize,
                                borderTopWidth: borderSize,
                                marginBottom: "-5px",
                            };
                        if (context.bottom)
                            return {
                                borderBottomColor: "var(--p-surface-800)",
                                borderLeftWidth: borderSize,
                                borderRightWidth: borderSize,
                                borderBottomWidth: borderSize,
                                marginTop: "-5px",
                            };
                    },
                },
            },
        },
    },
});
app.use(ToastService);
app.use(i18n);
app.mount("#app");
