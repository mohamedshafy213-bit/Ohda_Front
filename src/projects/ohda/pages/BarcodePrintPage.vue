<template>
  <div class="space-y-6">
    <!-- Non-printable Header & Controls -->
    <div class="no-print space-y-6">
      <!-- Title Bar -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-brand-white dark:bg-white/5 p-6 rounded-2xl border border-brand-gray/10 shadow-sm">
        <div>
          <h1 class="text-2xl font-bold text-brand-dark dark:text-white flex items-center gap-3">
            <Printer class="w-7 h-7 text-brand-accent" />
            <span>طباعة الباركود والملصقات</span>
          </h1>
          <p class="text-xs text-brand-gray mt-1">
            توليد وتخصيص ملصقات الباركود و الـ QR للأصناف والأجهزة، مع دعم الطابعات الحرارية وورق A4
          </p>
        </div>

        <div class="flex items-center gap-3">
          <Button
            @click="handlePrint"
            :disabled="!selectedProduct"
            class="!bg-brand-accent hover:!bg-brand-accent/90 !text-brand-dark !font-bold !px-5 !py-2.5 !rounded-xl !text-xs flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
          >
            <Printer class="w-4 h-4" />
            <span>طباعة الملصقات الآن</span>
          </Button>
        </div>
      </div>

      <!-- Main Layout: Settings on Left, Live Preview on Right -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- Configuration Panel (Col 5) -->
        <div class="lg:col-span-5 space-y-5">
          <!-- 1. Product Selection Card -->
          <div class="bg-brand-white dark:bg-white/5 p-5 rounded-2xl border border-brand-gray/10 shadow-sm space-y-4">
            <h3 class="text-xs font-bold text-brand-dark dark:text-white flex items-center gap-2 border-b border-brand-gray/10 pb-3">
              <Package class="w-4 h-4 text-brand-accent" />
              <span>1. اختيار الصنف المراد طباعة باركود له</span>
            </h3>

            <!-- Search / Filter Products -->
            <div>
              <label class="block text-[11px] font-semibold text-brand-gray mb-1">اختر الصنف من المخزون</label>
              <select
                v-model="selectedProductId"
                @change="onProductChange"
                class="w-full px-3 py-2.5 rounded-xl text-xs bg-brand-light dark:bg-brand-dark/50 border border-brand-gray/25 text-brand-dark dark:text-white focus:outline-none focus:border-brand-accent cursor-pointer font-medium"
              >
                <option :value="null" disabled>-- اختر الصنف --</option>
                <option v-for="p in inventoryStore.products" :key="p.id" :value="p.id">
                  {{ p.name }} (باركود: {{ p.barcode || p.sku }}) - المتوفر: {{ p.quantity || p.amount || 0 }}
                </option>
              </select>
            </div>

            <!-- Selected Product Quick Summary -->
            <div v-if="selectedProduct" class="p-3 bg-brand-soft/60 dark:bg-white/5 rounded-xl border border-brand-accent/20 space-y-1.5 text-xs">
              <div class="flex items-center justify-between">
                <span class="font-bold text-brand-dark dark:text-white">{{ selectedProduct.name }}</span>
                <span class="px-2 py-0.5 rounded-md bg-brand-accent/20 text-brand-dark dark:text-brand-accent font-mono font-bold text-[10px]">
                  {{ selectedProduct.sku }}
                </span>
              </div>
              <div class="flex items-center justify-between text-[11px] text-brand-gray">
                <span>الباركود المسجل:</span>
                <span class="font-mono font-semibold text-brand-dark dark:text-white">{{ selectedProduct.barcode || 'تلقائي' }}</span>
              </div>
              <div class="flex items-center justify-between text-[11px] text-brand-gray">
                <span>الفئة:</span>
                <span>{{ selectedProduct.categoryName || 'عام' }}</span>
              </div>
              <div v-if="selectedProduct.unitPrice" class="flex items-center justify-between text-[11px] text-brand-gray">
                <span>السعر:</span>
                <span class="font-bold text-emerald-600 font-mono">{{ selectedProduct.unitPrice }} ر.س</span>
              </div>
            </div>

            <!-- Print Mode: Product Barcode vs Specific Item Serials -->
            <div v-if="selectedProduct && productSerials.length > 0">
              <label class="block text-[11px] font-semibold text-brand-gray mb-1.5">نوع الملصق المطلوب:</label>
              <div class="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  @click="printMode = 'product'"
                  class="p-2 rounded-xl text-xs font-semibold border text-center transition-all cursor-pointer"
                  :class="printMode === 'product' ? 'bg-brand-accent/15 text-brand-dark dark:text-brand-accent border-brand-accent' : 'bg-brand-light text-brand-gray border-brand-gray/20'"
                >
                  ملصق الصنف العام
                </button>
                <button
                  type="button"
                  @click="printMode = 'serials'"
                  class="p-2 rounded-xl text-xs font-semibold border text-center transition-all cursor-pointer"
                  :class="printMode === 'serials' ? 'bg-brand-accent/15 text-brand-dark dark:text-brand-accent border-brand-accent' : 'bg-brand-light text-brand-gray border-brand-gray/20'"
                >
                  ملصقات السيريال ({{ productSerials.length }})
                </button>
              </div>
            </div>
          </div>

          <!-- 2. Print Layout & Paper Settings -->
          <div class="bg-brand-white dark:bg-white/5 p-5 rounded-2xl border border-brand-gray/10 shadow-sm space-y-4">
            <h3 class="text-xs font-bold text-brand-dark dark:text-white flex items-center gap-2 border-b border-brand-gray/10 pb-3">
              <Sliders class="w-4 h-4 text-brand-accent" />
              <span>2. إعدادات القالب ومقاس الورق</span>
            </h3>

            <!-- Template selection -->
            <div>
              <label class="block text-[11px] font-semibold text-brand-gray mb-1.5">قالب ومقاس الملصق</label>
              <div class="space-y-2">
                <label
                  v-for="tpl in templateOptions"
                  :key="tpl.id"
                  class="flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all text-xs"
                  :class="selectedTemplate === tpl.id ? 'bg-brand-accent/10 border-brand-accent text-brand-dark dark:text-white font-bold' : 'border-brand-gray/15 hover:bg-brand-light dark:hover:bg-white/5 text-brand-gray'"
                >
                  <div class="flex items-center gap-2.5">
                    <input
                      type="radio"
                      :value="tpl.id"
                      v-model="selectedTemplate"
                      class="text-brand-accent focus:ring-brand-accent"
                    />
                    <div>
                      <span>{{ tpl.label }}</span>
                      <span class="block text-[10px] opacity-75 font-normal">{{ tpl.desc }}</span>
                    </div>
                  </div>
                  <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-black/5 dark:bg-white/10">{{ tpl.size }}</span>
                </label>
              </div>
            </div>

            <!-- Number of copies (if product mode) -->
            <div v-if="printMode === 'product'" class="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label class="block text-[11px] font-semibold text-brand-gray mb-1">عدد الملصقات المطلوب</label>
                <input
                  v-model.number="printQuantity"
                  type="number"
                  min="1"
                  max="500"
                  class="w-full px-3 py-2 rounded-xl text-xs bg-brand-light dark:bg-brand-dark/50 border border-brand-gray/25 text-brand-dark dark:text-white focus:outline-none focus:border-brand-accent font-mono font-bold"
                />
              </div>
              <div class="flex items-end">
                <button
                  type="button"
                  @click="printQuantity = selectedProduct?.quantity || selectedProduct?.amount || 10"
                  class="w-full py-2 px-3 rounded-xl text-[11px] font-bold bg-brand-light hover:bg-brand-soft text-brand-dark border border-brand-gray/20 transition cursor-pointer"
                >
                  مطابقة الكمية بالمخزن
                </button>
              </div>
            </div>

            <!-- Content toggles -->
            <div class="pt-2 border-t border-brand-gray/10 space-y-2 text-xs">
              <span class="block font-bold text-brand-dark dark:text-white text-[11px]">محتويات الملصق:</span>
              
              <div class="grid grid-cols-2 gap-2">
                <label class="flex items-center gap-2 cursor-pointer select-none">
                  <input type="checkbox" v-model="labelOptions.showName" class="rounded text-brand-accent" />
                  <span>اسم المنتج</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer select-none">
                  <input type="checkbox" v-model="labelOptions.showSku" class="rounded text-brand-accent" />
                  <span>رمز SKU</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer select-none">
                  <input type="checkbox" v-model="labelOptions.showBarcode" class="rounded text-brand-accent" />
                  <span>الباركود الخطي</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer select-none">
                  <input type="checkbox" v-model="labelOptions.showQr" class="rounded text-brand-accent" />
                  <span>رمز QR Code</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer select-none">
                  <input type="checkbox" v-model="labelOptions.showPrice" class="rounded text-brand-accent" />
                  <span>السعر (إن وجد)</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer select-none">
                  <input type="checkbox" v-model="labelOptions.showBranch" class="rounded text-brand-accent" />
                  <span>اسم الفرع</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Live Preview Panel (Col 7) -->
        <div class="lg:col-span-7 space-y-4">
          <div class="bg-brand-white dark:bg-white/5 p-5 rounded-2xl border border-brand-gray/10 shadow-sm space-y-4">
            <div class="flex items-center justify-between border-b border-brand-gray/10 pb-3">
              <h3 class="text-xs font-bold text-brand-dark dark:text-white flex items-center gap-2">
                <Eye class="w-4 h-4 text-brand-accent" />
                <span>المعاينة المباشرة قبل الطباعة (Live Preview)</span>
              </h3>

              <span class="text-[11px] text-brand-gray font-mono">
                إجمالي الملصقات: {{ previewItems.length }} ملصق
              </span>
            </div>

            <!-- Empty state if no product chosen -->
            <div v-if="!selectedProduct" class="py-16 text-center text-brand-gray space-y-2">
              <Barcode class="w-12 h-12 mx-auto text-brand-gray/40 stroke-[1.5]" />
              <p class="text-xs font-bold">يرجى اختيار صنف من القائمة لعرض وطباعة ملصقات الباركود</p>
              <p class="text-[11px] opacity-75">يمكنك طباعة باركود الصنف للمنتجات التي ليس لها أرقام تسلسلية ولصقها مباشرة عليها</p>
            </div>

            <!-- Preview Container -->
            <div v-else class="bg-slate-100 dark:bg-black/30 p-6 rounded-xl border border-brand-gray/15 max-h-[620px] overflow-y-auto">
              <!-- Render Preview Grid according to selected template -->
              <div :class="getPreviewContainerClass()">
                <div
                  v-for="(item, idx) in previewItems.slice(0, 36)"
                  :key="idx"
                  class="bg-white text-black p-2.5 rounded-lg shadow-sm border border-slate-200 flex flex-col justify-between items-center text-center overflow-hidden transition-transform hover:scale-[1.02]"
                  :style="getLabelItemStyle()"
                >
                  <!-- Header: Branch & SKU -->
                  <div class="w-full flex items-center justify-between text-[9px] font-semibold text-slate-500 border-b border-slate-100 pb-1 mb-1">
                    <span v-if="labelOptions.showBranch" class="truncate">{{ authStore.branchName || 'نظام العهدة' }}</span>
                    <span v-if="labelOptions.showSku" class="font-mono">{{ item.sku }}</span>
                  </div>

                  <!-- Product Name -->
                  <div v-if="labelOptions.showName" class="font-bold text-[11px] leading-tight line-clamp-2 text-slate-900 mb-1 w-full text-center">
                    {{ item.name }}
                  </div>

                  <!-- Middle Section: Barcode & QR Code -->
                  <div class="w-full flex items-center justify-center gap-2 my-auto">
                    <!-- Barcode SVG -->
                    <div v-if="labelOptions.showBarcode" class="flex-1 flex flex-col items-center justify-center min-w-0">
                      <div class="w-full h-9 flex items-center justify-center" v-html="generateBarcodeSvg(item.barcode)"></div>
                    </div>

                    <!-- QR Code (if enabled) -->
                    <div v-if="labelOptions.showQr" class="shrink-0">
                      <img :src="item.qrDataUrl" class="w-10 h-10 object-contain border border-slate-100 rounded" alt="QR" />
                    </div>
                  </div>

                  <!-- Footer: Price & Serial -->
                  <div class="w-full flex items-center justify-between text-[9px] font-mono text-slate-600 border-t border-slate-100 pt-1 mt-1">
                    <span v-if="item.serial" class="font-bold text-slate-800 truncate">S/N: {{ item.serial }}</span>
                    <span v-else class="text-[8px] text-slate-400">صنف مخزني</span>
                    <span v-if="labelOptions.showPrice && item.price" class="font-bold text-emerald-700 font-mono">
                      {{ item.price }} ر.س
                    </span>
                  </div>
                </div>
              </div>

              <div v-if="previewItems.length > 36" class="text-center mt-4 text-[11px] text-brand-gray">
                تم عرض أول 36 ملصق بالمعاينة. ستتم طباعة كافة الـ {{ previewItems.length }} ملصق عند الضغط على زر الطباعة.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Printable Area (Hidden on screen, Visible on Print) -->
    <div id="print-area" class="print-only">
      <div :class="getPrintContainerClass()">
        <div
          v-for="(item, idx) in previewItems"
          :key="idx"
          class="print-label-item"
          :style="getLabelItemStyle()"
        >
          <!-- Header: Branch & SKU -->
          <div class="label-header">
            <span v-if="labelOptions.showBranch" class="branch-name">{{ authStore.branchName || 'نظام العهدة' }}</span>
            <span v-if="labelOptions.showSku" class="sku-text">{{ item.sku }}</span>
          </div>

          <!-- Product Name -->
          <div v-if="labelOptions.showName" class="product-name">
            {{ item.name }}
          </div>

          <!-- Barcode and QR -->
          <div class="barcode-wrapper">
            <div v-if="labelOptions.showBarcode" class="barcode-svg-container" v-html="generateBarcodeSvg(item.barcode)"></div>
            <img v-if="labelOptions.showQr" :src="item.qrDataUrl" class="qr-code-img" alt="QR" />
          </div>

          <!-- Footer: Serial & Price -->
          <div class="label-footer">
            <span v-if="item.serial" class="serial-text">S/N: {{ item.serial }}</span>
            <span v-else class="serial-text">#{{ item.barcode }}</span>
            <span v-if="labelOptions.showPrice && item.price" class="price-text">
              {{ item.price }} ر.س
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { useOhdaInventoryStore } from "../stores/useOhdaInventoryStore";
import { useOhdaAuthStore } from "../stores/useOhdaAuthStore";
import { apiGet } from "@/utilities/fetchApi";
import { generateBarcodeSvgString } from "@/utilities/barcodeSvg";
import QRCode from "qrcode";
import {
  Printer,
  Package,
  Sliders,
  Eye,
  Barcode
} from "lucide-vue-next";

const route = useRoute();
const inventoryStore = useOhdaInventoryStore();
const authStore = useOhdaAuthStore();

const selectedProductId = ref(null);
const selectedProduct = ref(null);
const printMode = ref("product"); // "product" | "serials"
const printQuantity = ref(12);
const productSerials = ref([]);
const qrMap = ref({});

const selectedTemplate = ref("thermal_50x25");

const templateOptions = [
  {
    id: "thermal_50x25",
    label: "ملصق طابعة حرارية صغير",
    desc: "ملصق فردي لطابعات الباركود الحرارية (Zebra / Xprinter)",
    size: "50 × 25 مم"
  },
  {
    id: "thermal_60x40",
    label: "ملصق طابعة حرارية قياسي",
    desc: "ملصق حراري واسع مع باركود و QR وبيانات كاملة",
    size: "60 × 40 مم"
  },
  {
    id: "a4_24",
    label: "ورقة A4 ملصقات جاهزة (24 ملصق)",
    desc: "شبكة 3 أعمدة × 8 صفوف للطباعة على ورق ملصقات A4",
    size: "70 × 37 مم"
  },
  {
    id: "a4_30",
    label: "ورقة A4 ملصقات جاهزة (30 ملصق)",
    desc: "شبكة 3 أعمدة × 10 صفوف للكميات الكبيرة",
    size: "70 × 29 مم"
  },
  {
    id: "shelf_tag",
    label: "بطاقة رف / كرت مستودع",
    desc: "بطاقة باركود بحجم بطاقة العمل لتعليقها على الأرفف",
    size: "85 × 50 مم"
  }
];

const labelOptions = ref({
  showName: true,
  showSku: true,
  showBarcode: true,
  showQr: true,
  showPrice: false,
  showBranch: true
});

onMounted(async () => {
  await inventoryStore.fetchProducts();

  // If productId passed in query
  if (route.query.productId) {
    const pId = parseInt(route.query.productId, 10);
    if (pId) {
      selectedProductId.value = pId;
      await onProductChange();
    }
  } else if (inventoryStore.products.length > 0) {
    selectedProductId.value = inventoryStore.products[0].id;
    await onProductChange();
  }
});

async function onProductChange() {
  if (!selectedProductId.value) {
    selectedProduct.value = null;
    productSerials.value = [];
    return;
  }
  selectedProduct.value = inventoryStore.products.find(p => p.id === selectedProductId.value) || null;
  if (!selectedProduct.value) return;

  printQuantity.value = selectedProduct.value.quantity || selectedProduct.value.amount || 12;

  // Pre-generate QR for product master barcode
  const masterCode = selectedProduct.value.barcode || selectedProduct.value.sku || "PROD";
  try {
    qrMap.value[masterCode] = await QRCode.toDataURL(masterCode, { margin: 1, width: 120 });
  } catch (e) {
    console.error(e);
  }

  // Fetch individual item serials if available
  try {
    const res = await apiGet(`/api/ProductItem/product/${selectedProduct.value.id}`);
    if (res?.data?.isDone) {
      const items = res.data.objects || (res.data.singleObject ? [res.data.singleObject] : []);
      productSerials.value = items;
      for (const item of items) {
        const code = item.serialNumber || item.qrCode || masterCode;
        if (!qrMap.value[code]) {
          qrMap.value[code] = await QRCode.toDataURL(code, { margin: 1, width: 120 });
        }
      }
    }
  } catch (err) {
    console.error("Error fetching serials for product:", err);
  }
}

const previewItems = computed(() => {
  if (!selectedProduct.value) return [];

  const masterCode = selectedProduct.value.barcode || selectedProduct.value.sku || "PROD";
  const masterQr = qrMap.value[masterCode] || "";

  if (printMode.value === "serials" && productSerials.value.length > 0) {
    return productSerials.value.map(item => ({
      name: selectedProduct.value.name,
      sku: selectedProduct.value.sku,
      barcode: item.serialNumber || masterCode,
      serial: item.serialNumber,
      price: selectedProduct.value.unitPrice,
      qrDataUrl: qrMap.value[item.serialNumber] || masterQr
    }));
  }

  // Product mode: repeat master product barcode for printQuantity
  const qty = Math.max(1, Math.min(500, printQuantity.value || 1));
  const list = [];
  for (let i = 0; i < qty; i++) {
    list.push({
      name: selectedProduct.value.name,
      sku: selectedProduct.value.sku,
      barcode: masterCode,
      serial: null,
      price: selectedProduct.value.unitPrice,
      qrDataUrl: masterQr
    });
  }
  return list;
});

function generateBarcodeSvg(code) {
  return generateBarcodeSvgString(code, {
    height: 35,
    barWidth: 1.5,
    showText: true,
    fontSize: 10
  });
}

function getPreviewContainerClass() {
  switch (selectedTemplate.value) {
    case "thermal_50x25":
    case "thermal_60x40":
      return "grid grid-cols-1 sm:grid-cols-2 gap-4";
    case "a4_24":
    case "a4_30":
      return "grid grid-cols-2 sm:grid-cols-3 gap-3";
    case "shelf_tag":
      return "grid grid-cols-1 sm:grid-cols-2 gap-4";
    default:
      return "grid grid-cols-2 gap-3";
  }
}

function getPrintContainerClass() {
  switch (selectedTemplate.value) {
    case "thermal_50x25":
      return "print-thermal-50x25";
    case "thermal_60x40":
      return "print-thermal-60x40";
    case "a4_24":
      return "print-a4-24";
    case "a4_30":
      return "print-a4-30";
    case "shelf_tag":
      return "print-shelf-tag";
    default:
      return "print-a4-24";
  }
}

function getLabelItemStyle() {
  switch (selectedTemplate.value) {
    case "thermal_50x25":
      return { minHeight: "110px", width: "100%" };
    case "thermal_60x40":
      return { minHeight: "150px", width: "100%" };
    case "a4_24":
      return { minHeight: "135px", width: "100%" };
    case "a4_30":
      return { minHeight: "115px", width: "100%" };
    case "shelf_tag":
      return { minHeight: "180px", width: "100%" };
    default:
      return { minHeight: "120px", width: "100%" };
  }
}

function handlePrint() {
  window.print();
}
</script>

<style scoped>
/* Screen & Print media rules */
@media screen {
  .print-only {
    display: none !important;
  }
}

@media print {
  /* Hide all app chrome */
  body * {
    visibility: hidden !important;
  }

  .no-print,
  .no-print * {
    display: none !important;
  }

  #print-area,
  #print-area * {
    visibility: visible !important;
  }

  #print-area {
    position: absolute !important;
    left: 0 !important;
    top: 0 !important;
    width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    background: #ffffff !important;
  }

  /* Grid Layouts for standard A4 */
  .print-a4-24 {
    display: grid !important;
    grid-template-columns: repeat(3, 1fr) !important;
    gap: 8px !important;
    padding: 10mm 5mm !important;
    page-break-inside: auto !important;
  }

  .print-a4-30 {
    display: grid !important;
    grid-template-columns: repeat(3, 1fr) !important;
    gap: 6px !important;
    padding: 8mm 5mm !important;
    page-break-inside: auto !important;
  }

  /* Thermal roll printing */
  .print-thermal-50x25,
  .print-thermal-60x40,
  .print-shelf-tag {
    display: block !important;
    width: 100% !important;
  }

  .print-thermal-50x25 .print-label-item {
    page-break-after: always !important;
    page-break-inside: avoid !important;
    width: 50mm !important;
    height: 25mm !important;
    margin: 0 auto !important;
    box-sizing: border-box !important;
  }

  .print-thermal-60x40 .print-label-item {
    page-break-after: always !important;
    page-break-inside: avoid !important;
    width: 60mm !important;
    height: 40mm !important;
    margin: 0 auto !important;
    box-sizing: border-box !important;
  }

  .print-label-item {
    border: 1px solid #ddd !important;
    padding: 4px 6px !important;
    display: flex !important;
    flex-direction: column !important;
    justify-content: space-between !important;
    align-items: center !important;
    text-align: center !important;
    box-sizing: border-box !important;
    break-inside: avoid !important;
    background: #fff !important;
    color: #000 !important;
  }

  .label-header {
    width: 100% !important;
    display: flex !important;
    justify-content: space-between !important;
    font-size: 8pt !important;
    font-weight: bold !important;
    border-bottom: 0.5pt solid #eee !important;
    padding-bottom: 2px !important;
  }

  .product-name {
    font-size: 9pt !important;
    font-weight: bold !important;
    margin: 2px 0 !important;
    line-height: 1.1 !important;
  }

  .barcode-wrapper {
    width: 100% !important;
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
    gap: 4px !important;
    margin: auto 0 !important;
  }

  .barcode-svg-container {
    flex: 1 !important;
    height: 30px !important;
  }

  .qr-code-img {
    width: 32px !important;
    height: 32px !important;
  }

  .label-footer {
    width: 100% !important;
    display: flex !important;
    justify-content: space-between !important;
    font-size: 8pt !important;
    font-family: monospace !important;
    border-top: 0.5pt solid #eee !important;
    padding-top: 2px !important;
  }
}
</style>
