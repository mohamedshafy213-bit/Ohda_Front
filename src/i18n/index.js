import { createI18n } from "vue-i18n";
import constants from "./constants";
import ohdaTranslations from "@/projects/ohda/translations/ohdaTranslations";

// Get saved locale from localStorage or default to 'ar'
const savedLocale = localStorage.getItem("selectedLocale") || "ar";

const i18n = createI18n({
    legacy: false,
    locale: savedLocale,
    fallbackLocale: "ar",
    messages: {
        en: {
            ...constants.en,
            ...ohdaTranslations.en,
        },
        ar: {
            ...constants.ar,
            ...ohdaTranslations.ar,
        },
    },
});

export const supportedLocales = {
    en: { name: "English" },
    ar: { name: "العربية (Arabic)" },
};

export function setLocale(locale) {
    if (supportedLocales[locale]) {
        i18n.global.locale.value = locale;
        localStorage.setItem("selectedLocale", locale);
        const isRTL = locale === "ar";
        document.documentElement.setAttribute("dir", isRTL ? "rtl" : "ltr");
    }
}

export function getCurrentLocale() {
    return i18n.global.locale.value;
}

export default i18n;
