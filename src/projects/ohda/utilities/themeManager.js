// Theme Manager for Ohda AutoCare
// Manages system-wide dynamic color palette, branding tokens, and workshop identity settings

export const PRESET_PALETTES = [
  {
    id: "emerald",
    nameAr: "أخضر زمردي (الافتراضي)",
    nameEn: "Emerald Green (Default)",
    color: "#10b981",
    soft: "#ecfdf5",
    hover: "#059669",
    darkHover: "#34d399",
    description: "الهوية الأساسية المعتمدة لنظام العهدة وإدارة الورش"
  },
  {
    id: "volt",
    nameAr: "أخضر ليموني رياضي",
    nameEn: "Volt Lime Neon",
    color: "#84cc16",
    soft: "#f7fee7",
    hover: "#65a30d",
    darkHover: "#a3e635",
    description: "طابع عصري رياضي مفعم بالحيوية لمراكز العناية الفائقة"
  },
  {
    id: "sapphire",
    nameAr: "أزرق ملكي كلاسيكي",
    nameEn: "Royal Sapphire Blue",
    color: "#2563eb",
    soft: "#eff6ff",
    hover: "#1d4ed8",
    darkHover: "#60a5fa",
    description: "مظهر رسمي تقني موثوق لمراكز الصيانة المعتمدة والوكالات"
  },
  {
    id: "ruby",
    nameAr: "أحمر سباقات ديناميكي",
    nameEn: "Speed Ruby Red",
    color: "#ef4444",
    soft: "#fef2f2",
    hover: "#dc2626",
    darkHover: "#f87171",
    description: "طابع جريء ومتحمس لمراكز التعديل وضبط المحركات"
  },
  {
    id: "amber",
    nameAr: "ذهبي كهرماني فخم",
    nameEn: "Amber Gold Luxury",
    color: "#f59e0b",
    soft: "#fffbeb",
    hover: "#d97706",
    darkHover: "#fbbf24",
    description: "فخامة وأناقة تليق بمراكز العناية بالسيارات الفارهة والنانو سيراميك"
  },
  {
    id: "purple",
    nameAr: "بنفسجي إمبراطوري",
    nameEn: "Imperial Violet",
    color: "#8b5cf6",
    soft: "#f5f3ff",
    hover: "#7c3aed",
    darkHover: "#a78bfa",
    description: "مظهر إبداعي مميز لمراكز التلميع الساطع والتظليل"
  },
  {
    id: "cyan",
    nameAr: "تركواز بحري منعش",
    nameEn: "Ocean Cyan Teal",
    color: "#06b6d4",
    soft: "#ecfeff",
    hover: "#0891b2",
    darkHover: "#22d3ee",
    description: "طابع نقي ومنعش لمراكز غسيل ودري كلين السيارات الذاتي"
  },
  {
    id: "orange",
    nameAr: "برتقالي بركاني ناري",
    nameEn: "Blaze Orange",
    color: "#f97316",
    soft: "#fff7ed",
    hover: "#ea580c",
    darkHover: "#fb923c",
    description: "طاقة وحيوية لمراكز خدمات الإطارات والبطاريات السريعة"
  },
  {
    id: "carbon",
    nameAr: "رمادي كربوني داكن",
    nameEn: "Carbon Graphite Slate",
    color: "#475569",
    soft: "#f8fafc",
    hover: "#334155",
    darkHover: "#94a3b8",
    description: "طابع صناعي هادئ ومتزن للمستودعات ومراكز الخدمة الميدانية"
  }
];

const STORAGE_KEY_THEME = "ohda_theme_accent";
const STORAGE_KEY_SETTINGS = "ohda_branch_settings";

/**
 * Helper to adjust hex color lightness
 */
function adjustColorBrightness(hex, percent) {
  let num = parseInt(hex.replace("#", ""), 16);
  let r = (num >> 16) + Math.round(255 * (percent / 100));
  let g = ((num >> 8) & 0x00ff) + Math.round(255 * (percent / 100));
  let b = (num & 0x0000ff) + Math.round(255 * (percent / 100));

  r = Math.min(255, Math.max(0, r));
  g = Math.min(255, Math.max(0, g));
  b = Math.min(255, Math.max(0, b));

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

/**
 * Apply the accent color across CSS variables and document root
 */
export function applyTheme(hexColor, save = true) {
  if (!hexColor || !hexColor.startsWith("#")) {
    hexColor = "#10b981";
  }

  const hoverColor = adjustColorBrightness(hexColor, -15);
  const activeColor = adjustColorBrightness(hexColor, -25);
  const softColor = adjustColorBrightness(hexColor, 88);
  const darkSoft = adjustColorBrightness(hexColor, -75);

  const styleId = "ohda-dynamic-theme-vars";
  let styleTag = document.getElementById(styleId);
  if (!styleTag) {
    styleTag = document.createElement("style");
    styleTag.id = styleId;
    document.head.appendChild(styleTag);
  }

  styleTag.innerHTML = `
    :root {
      --color-brand-accent: ${hexColor} !important;
      --color-brand-soft: ${softColor} !important;
      --p-primary-50: ${softColor} !important;
      --p-primary-500: ${hexColor} !important;
      --p-primary-600: ${hoverColor} !important;
      --p-primary-700: ${activeColor} !important;
      --p-primary-color: ${hexColor} !important;
      --p-primary-hover-color: ${hoverColor} !important;
      --p-primary-active-color: ${activeColor} !important;
      --p-highlight-background: ${softColor} !important;
      --p-highlight-color: ${activeColor} !important;
    }
    .dark {
      --color-brand-accent: ${hexColor} !important;
      --color-brand-soft: ${darkSoft} !important;
      --p-primary-50: ${darkSoft} !important;
      --p-primary-500: ${hexColor} !important;
      --p-primary-600: ${hoverColor} !important;
      --p-primary-700: ${activeColor} !important;
      --p-primary-color: ${hexColor} !important;
      --p-primary-hover-color: ${hoverColor} !important;
      --p-highlight-background: ${darkSoft} !important;
    }
  `;

  if (save) {
    localStorage.setItem(STORAGE_KEY_THEME, hexColor);
  }
}

/**
 * Read the stored theme color (defaults to emerald)
 */
export function getStoredThemeColor() {
  try {
    return localStorage.getItem(STORAGE_KEY_THEME) || "#10b981";
  } catch (e) {
    return "#10b981";
  }
}

/**
 * Get branch custom settings (logo, name, phone, invoice disclaimer, etc.)
 */
export function getBranchSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (raw) return JSON.parse(raw);
  } catch (e) { }

  return {
    branchName: "",
    logoUrl: "",
    slogan: "",
    contactPhone: "",
    whatsapp: "",
    contactEmail: "",
    address: "",
    taxNumber: "",
    crNumber: "",
    warrantyTerms: "الضمان سارٍ لمدة 30 يوماً أو 1,000 كم ضد عيوب التركيب وقطع الغيار الأصلية. لا يشمل الضمان سوء الاستخدام.",
    themeColor: "#10b981",
    printFormat: "a4",
    currency: "EGP",
    showLogoOnPrint: true
  };
}

/**
 * Get branch currency symbol (e.g. ج.م, ر.س, د.إ, $)
 */
export function getBranchCurrencySymbol(currencyCode = null) {
  const code = currencyCode || getBranchSettings().currency || "EGP";
  switch (code.toUpperCase()) {
    case "EGP": return "ج.م";
    case "SAR": return "ر.س";
    case "AED": return "د.إ";
    case "KWD": return "د.ك";
    case "QAR": return "ر.ق";
    case "USD": return "$";
    default: return code;
  }
}

/**
 * Format any numeric amount with the branch's active currency
 */
export function formatBranchCurrency(amount, currencyCode = null) {
  if (amount == null || isNaN(amount)) return `0 ${getBranchCurrencySymbol(currencyCode)}`;
  const formatted = Number(amount).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
  return `${formatted} ${getBranchCurrencySymbol(currencyCode)}`;
}
export function saveBranchSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    if (settings.themeColor) {
      applyTheme(settings.themeColor, true);
    }
    // Also update cached user branchName if present
    const rawUser = localStorage.getItem("ohdaUser");
    if (rawUser) {
      const u = JSON.parse(rawUser);
      if (settings.branchName) {
        u.branchName = settings.branchName;
        u.BranchName = settings.branchName;
      }
      localStorage.setItem("ohdaUser", JSON.stringify(u));
    }
  } catch (e) {
    console.error("Error saving branch settings:", e);
  }
}
