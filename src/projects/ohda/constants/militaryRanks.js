export const MILITARY_RANK_VALUES = [
  { value: 1, key: "rank_1", defaultLabel: "جندي (مجند)" },
  { value: 2, key: "rank_2", defaultLabel: "عريف" },
  { value: 3, key: "rank_3", defaultLabel: "رقيب" },
  { value: 4, key: "rank_4", defaultLabel: "رقيب أول" },
  { value: 5, key: "rank_5", defaultLabel: "مساعد" },
  { value: 6, key: "rank_6", defaultLabel: "مساعد أول" },
  { value: 7, key: "rank_7", defaultLabel: "طالب" },
  { value: 8, key: "rank_8", defaultLabel: "ملازم" },
  { value: 9, key: "rank_9", defaultLabel: "ملازم أول" },
  { value: 10, key: "rank_10", defaultLabel: "نقيب" },
  { value: 11, key: "rank_11", defaultLabel: "رائد" },
  { value: 12, key: "rank_12", defaultLabel: "مقدم" },
  { value: 13, key: "rank_13", defaultLabel: "عقيد" },
  { value: 14, key: "rank_14", defaultLabel: "عميد" },
  { value: 15, key: "rank_15", defaultLabel: "لواء" }
];

export function getRankLabel(rankValue, t = null) {
  if (!rankValue) return "";
  const num = Number(rankValue);
  const found = MILITARY_RANK_VALUES.find((r) => r.value === num);
  if (!found) return "";
  if (t && typeof t === "function") {
    const i18nKey = `ohda.militaryRanks.${found.key}`;
    const translated = t(i18nKey);
    if (translated && translated !== i18nKey) return translated;
  }
  return found.defaultLabel;
}

export function getMilitaryRankOptions(t = null) {
  return MILITARY_RANK_VALUES.map((r) => ({
    value: r.value,
    label: getRankLabel(r.value, t)
  }));
}

export const MILITARY_RANKS = MILITARY_RANK_VALUES.map((r) => ({
  value: r.value,
  label: r.defaultLabel
}));
