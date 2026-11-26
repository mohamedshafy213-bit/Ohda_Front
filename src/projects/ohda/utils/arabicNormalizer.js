/**
 * Normalizes Arabic text for instant, variant-tolerant search:
 * - أ / إ / آ / ٱ -> ا
 * - ة -> ه
 * - ى / ئ -> ي
 * - ؤ -> و
 * - Strips diacritics (Tashkeel) and Tatweel
 * - Converts Arabic-Indic digits (٠-٩) to ASCII (0-9)
 */
export function normalizeArabic(text) {
  if (!text) return "";
  return String(text)
    .trim()
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670\u0640]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/[ىئ]/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06F0))
    .replace(/\s+/g, " ");
}
