/**
 * High-performance, zero-dependency Code 128 (Subset B) SVG Barcode Generator
 */
const CODE128_PATTERNS = [
  "212222", "222122", "222221", "121223", "121322", "131222", "122213", "122312", "132212", "221213",
  "221312", "231212", "112232", "122132", "122231", "113222", "123122", "123221", "223211", "221132",
  "221231", "213212", "223112", "312131", "311222", "321122", "321221", "312212", "322112", "322211",
  "212123", "212321", "232121", "111323", "131123", "131321", "112313", "132113", "132311", "211313",
  "231113", "231311", "112133", "112331", "132131", "113123", "113321", "133121", "313121", "211331",
  "231131", "213113", "213311", "213131", "311123", "311321", "331121", "312113", "312311", "332111",
  "314111", "221411", "431111", "111224", "111422", "121124", "121421", "141122", "141221", "112214",
  "112412", "122114", "122411", "142112", "142211", "241211", "221114", "413111", "241112", "134111",
  "111242", "121142", "121241", "114212", "124112", "124211", "411212", "421112", "421211", "212141",
  "214121", "412121", "111143", "111341", "131141", "114113", "114311", "411113", "411311", "113141",
  "114131", "311141", "411131", "211412", "211214", "211232", "2331112"
];

const START_B = 104;
const STOP = 106;

export function generateBarcodeSvgString(text, options = {}) {
  const safeText = String(text || "").trim() || "000000";
  const height = options.height || 50;
  const barWidth = options.barWidth || 2;
  const showText = options.showText !== false;
  const quietZone = options.quietZone !== false ? 10 : 0;
  const fontSize = options.fontSize || 12;

  // Encode Code 128 Subset B (ASCII 32 to 126)
  const codes = [START_B];
  let checksum = START_B;

  for (let i = 0; i < safeText.length; i++) {
    const charCode = safeText.charCodeAt(i);
    let codeVal = charCode - 32;
    if (codeVal < 0 || codeVal > 95) {
      codeVal = 0; // fallback to space
    }
    codes.push(codeVal);
    checksum += codeVal * (i + 1);
  }

  const checkVal = checksum % 103;
  codes.push(checkVal);
  codes.push(STOP);

  // Convert codes to bar pattern string
  let pattern = "";
  for (const code of codes) {
    pattern += CODE128_PATTERNS[code] || CODE128_PATTERNS[0];
  }

  // Calculate widths and draw SVG rects
  let rects = "";
  let currentX = quietZone;
  let isBar = true;

  for (let i = 0; i < pattern.length; i++) {
    const moduleCount = parseInt(pattern[i], 10);
    const w = moduleCount * barWidth;
    if (isBar) {
      rects += `<rect x="${currentX}" y="0" width="${w}" height="${height}" fill="#000000"/>`;
    }
    currentX += w;
    isBar = !isBar;
  }

  const totalWidth = currentX + quietZone;
  const totalHeight = showText ? height + fontSize + 6 : height;

  let textElement = "";
  if (showText) {
    textElement = `<text x="${totalWidth / 2}" y="${height + fontSize + 2}" font-family="monospace, sans-serif" font-size="${fontSize}" font-weight="600" text-anchor="middle" fill="#111827">${safeText}</text>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalWidth} ${totalHeight}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
    <rect width="${totalWidth}" height="${totalHeight}" fill="#ffffff"/>
    ${rects}
    ${textElement}
  </svg>`;
}
