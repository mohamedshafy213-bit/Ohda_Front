<template>
  <div class="space-y-6 font-sans">
    <!-- Header Title Bar -->
    <div class="bg-brand-white p-6 rounded-2xl border border-brand-gray/10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-brand-dark flex items-center gap-3">
          <ScanBarcode class="w-7 h-7 text-brand-accent" />
          {{ $t('ohda.scan.title') }}
        </h1>
        <p class="text-xs text-brand-gray mt-1">
          فحص وتتبع الأجهزة والأصناف بالباركود أو الرقم التسلسلي (S/N) أو رمز SKU لمعرفة أماكن تواجدها وحالتها
        </p>
      </div>

      <!-- Mode indicator badges -->
      <div class="flex items-center gap-2 text-xs">
        <span class="px-3 py-1 rounded-xl bg-brand-soft text-brand-accent font-bold border border-brand-accent/20">
          دعم: السيريال (S/N) | الباركود | SKU
        </span>
      </div>
    </div>

    <!-- Scanner & Search Input Card -->
    <div class="bg-brand-white border border-brand-gray/10 p-6 rounded-2xl shadow-sm space-y-4">
      <label class="block text-xs font-semibold text-brand-dark">
        امسح الباركود / السيريال بالقارئ أو أدخل الرمز هنا:
      </label>

      <div class="flex items-center gap-3">
        <div class="relative flex-1">
          <Barcode class="w-5 h-5 absolute start-3.5 top-3 text-brand-accent z-10" />
          <InputText
            v-model="barcodeInput"
            @keyup.enter="handleScan"
            class="w-full !bg-brand-light !border-brand-gray/25 focus:!border-brand-accent !py-2.5 !ps-11 !pe-4 text-sm font-mono !text-brand-dark placeholder-brand-gray/60"
            placeholder="امسح الرقم التسلسلي (S/N) أو الباركود أو رمز SKU..."
            autofocus
          />
        </div>

        <Button
          @click="handleScan"
          :loading="searching"
          class="!bg-brand-accent hover:!bg-brand-accent/90 !text-brand-dark !font-bold !rounded-xl !px-6 !py-2.5 !text-xs flex items-center gap-2 shadow-md shadow-brand-accent/10 cursor-pointer"
        >
          <Search class="w-4 h-4" />
          فحص وتتبع
        </Button>
      </div>

      <!-- Quick Preset Suggestions -->
      <div v-if="inventoryStore.products.length > 0" class="pt-2">
        <span class="text-[11px] font-medium text-brand-gray block mb-2">أكواد سريعة للتجربة:</span>
        <div class="flex flex-wrap gap-2">
          <Button
            v-for="p in inventoryStore.products.slice(0, 6)"
            :key="p.id"
            @click="quickScan(p.barcode || p.sku)"
            class="!px-3 !py-1.5 !bg-brand-light hover:!bg-brand-light/80 !border !border-brand-gray/20 !rounded-lg !text-xs font-mono !text-brand-dark hover:!text-brand-accent cursor-pointer"
          >
            {{ p.barcode || p.sku }} ({{ p.name.slice(0, 15) }})
          </Button>
        </div>
      </div>
    </div>

    <!-- Case A: Specific Serialized Device Found (Single Item S/N) -->
    <div v-if="scannedDeviceItem" class="bg-brand-white border border-brand-accent/30 rounded-2xl p-6 shadow-md space-y-6">
      <!-- Device Top Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-brand-gray/10 pb-4">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 bg-brand-soft rounded-xl flex items-center justify-center text-brand-accent border border-brand-accent/20 shrink-0">
            <Check class="w-6 h-6" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-[10px] font-bold uppercase tracking-wider text-brand-accent">
                تم العثور على جهاز محدد برقم تسلسلي
              </span>
              <span
                class="px-2.5 py-0.5 rounded-full text-[11px] font-bold"
                :class="getItemStatusBadgeClass(scannedDeviceItem.status)"
              >
                {{ getItemStatusLabel(scannedDeviceItem.status) }}
              </span>
            </div>
            <h2 class="text-xl font-bold text-brand-dark mt-0.5">{{ scannedDeviceItem.productName }}</h2>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-3 text-xs font-mono">
          <div class="bg-brand-light px-3 py-1.5 rounded-xl border border-brand-gray/10">
            <span class="text-brand-gray text-[10px] block">SERIAL NUMBER (S/N)</span>
            <span class="text-brand-accent font-black text-sm select-all">{{ scannedDeviceItem.serialNumber }}</span>
          </div>
          <div v-if="scannedDeviceItem.productSKU" class="bg-brand-light px-3 py-1.5 rounded-xl border border-brand-gray/10">
            <span class="text-brand-gray text-[10px] block">SKU</span>
            <span class="text-brand-dark font-bold">{{ scannedDeviceItem.productSKU }}</span>
          </div>
          <div v-if="scannedDeviceItem.productBarcode" class="bg-brand-light px-3 py-1.5 rounded-xl border border-brand-gray/10">
            <span class="text-brand-gray text-[10px] block">BARCODE</span>
            <span class="text-brand-dark font-bold">{{ scannedDeviceItem.productBarcode }}</span>
          </div>
        </div>
      </div>

      <!-- Current Location & Custody Status Spotlight -->
      <div class="p-5 rounded-2xl bg-brand-light/70 border border-brand-gray/15 space-y-3">
        <h3 class="text-xs font-bold text-brand-dark uppercase tracking-wider flex items-center gap-2 border-b border-brand-gray/10 pb-2">
          <MapPin class="w-4 h-4 text-rose-500" />
          مكان وتواجد الجهاز الحالي
        </h3>

        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <!-- Location Status -->
          <div class="p-3.5 bg-brand-white rounded-xl border border-brand-gray/10 shadow-2xs">
            <span class="text-brand-gray text-[11px] block mb-1">الموقع الحالي:</span>
            <div class="font-bold text-sm text-brand-dark flex items-center gap-1.5">
              <span v-if="scannedDeviceItem.status === 1 || scannedDeviceItem.status === 'InStock'" class="text-emerald-700">
                داخل المستودع الرئيسي
              </span>
              <span v-else class="text-rose-600">
                منصرف كعهدة خارجية
              </span>
            </div>
          </div>

          <!-- Warehouse Bin -->
          <div class="p-3.5 bg-brand-white rounded-xl border border-brand-gray/10 shadow-2xs">
            <span class="text-brand-gray text-[11px] block mb-1">رف التخزين بالمستودع:</span>
            <span class="font-bold text-brand-dark">
              {{ scannedDeviceItem.binName || scannedDeviceItem.binCode || 'غير محدد' }}
            </span>
          </div>

          <!-- Custody Holder / Recipient -->
          <div class="p-3.5 bg-brand-white rounded-xl border border-brand-gray/10 shadow-2xs">
            <span class="text-brand-gray text-[11px] block mb-1">المستلم / حامل العهدة:</span>
            <span class="font-bold text-brand-accent">
              {{ scannedDeviceItem.recipientName || 'في عهدة أمين المستودع' }}
            </span>
          </div>

          <!-- Department / Place -->
          <div class="p-3.5 bg-brand-white rounded-xl border border-brand-gray/10 shadow-2xs">
            <span class="text-brand-gray text-[11px] block mb-1">الجهة / القسم:</span>
            <span class="font-semibold text-brand-dark">
              {{ scannedDeviceItem.place || '-' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Additional Device Details Grid -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div class="bg-brand-light p-3 rounded-xl border border-brand-gray/10">
          <span class="text-brand-gray text-[10px] block mb-0.5">التصنيف:</span>
          <span class="font-semibold text-brand-dark">{{ scannedDeviceItem.categoryName || 'عام' }}</span>
        </div>

        <div class="bg-brand-light p-3 rounded-xl border border-brand-gray/10">
          <span class="text-brand-gray text-[10px] block mb-0.5">تاريخ الصرف / الخروج:</span>
          <span class="font-mono text-brand-dark">{{ formatDate(scannedDeviceItem.exitDate) }}</span>
        </div>

        <div class="bg-brand-light p-3 rounded-xl border border-brand-gray/10">
          <span class="text-brand-gray text-[10px] block mb-0.5">سند الصرف المرجعي:</span>
          <span class="font-mono font-bold text-brand-accent">
            {{ scannedDeviceItem.productExitRequestId ? `#طلب صرف ${scannedDeviceItem.productExitRequestId}` : 'إدخال مباشر' }}
          </span>
        </div>

        <div class="bg-brand-light p-3 rounded-xl border border-brand-gray/10">
          <span class="text-brand-gray text-[10px] block mb-0.5">الملاحظات:</span>
          <span class="text-brand-dark truncate block">{{ scannedDeviceItem.notes || '-' }}</span>
        </div>
      </div>
    </div>

    <!-- Case B: Product / SKU Found (Catalog Level with All Child Devices Grid) -->
    <div v-else-if="scannedProduct" class="bg-brand-white border border-brand-accent/30 rounded-2xl p-6 shadow-md space-y-6">
      <!-- Product Top Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-brand-gray/10 pb-4">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 bg-brand-soft rounded-xl flex items-center justify-center text-brand-accent border border-brand-accent/20 shrink-0">
            <Check class="w-6 h-6" />
          </div>
          <div>
            <span class="text-[10px] font-bold uppercase tracking-wider text-brand-accent block">
              تم العثور على الصنف / المنتج العام
            </span>
            <h2 class="text-xl font-bold text-brand-dark">{{ scannedProduct.name }}</h2>
          </div>
        </div>

        <div class="flex items-center gap-4 text-xs font-mono">
          <div class="bg-brand-light px-3 py-1.5 rounded-xl border border-brand-gray/10">
            <span class="text-brand-gray text-[10px] block">SKU</span>
            <span class="text-brand-dark font-bold">{{ scannedProduct.sku }}</span>
          </div>
          <div class="bg-brand-light px-3 py-1.5 rounded-xl border border-brand-gray/10">
            <span class="text-brand-gray text-[10px] block">BARCODE</span>
            <span class="text-brand-accent font-bold">{{ scannedProduct.barcode }}</span>
          </div>
        </div>
      </div>

      <!-- Details Summary Grid -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
        <div class="bg-brand-light p-3.5 rounded-xl border border-brand-gray/10">
          <span class="text-brand-gray text-[11px] block mb-1">{{ $t('ohda.dashboard.category') }}</span>
          <span class="font-semibold text-brand-dark">{{ scannedProduct.categoryName || '-' }}</span>
        </div>
        <div class="bg-brand-light p-3.5 rounded-xl border border-brand-gray/10">
          <span class="text-brand-gray text-[11px] block mb-1">{{ $t('ohda.dashboard.supplier') }}</span>
          <span class="font-semibold text-brand-dark">{{ scannedProduct.supplierName || '-' }}</span>
        </div>
        <div class="bg-brand-light p-3.5 rounded-xl border border-brand-gray/10">
          <span class="text-brand-gray text-[11px] block mb-1">{{ $t('ohda.products.unitPrice') }}</span>
          <span class="font-bold text-brand-accent">{{ scannedProduct.unitPrice }} ر.س</span>
        </div>
        <div class="bg-brand-light p-3.5 rounded-xl border border-brand-gray/10">
          <span class="text-brand-gray text-[11px] block mb-1">الرصيد المتاح بالمستودع</span>
          <span class="font-bold text-xl text-emerald-700">{{ scannedProduct.quantity }}</span>
        </div>
      </div>

      <!-- All Serialized Device Instances / Locations under this SKU -->
      <div class="space-y-3 pt-2">
        <div class="flex items-center justify-between">
          <h3 class="text-xs font-bold text-brand-dark uppercase tracking-wider flex items-center gap-2">
            <Boxes class="w-4 h-4 text-brand-accent" />
            أماكن تواجد كافة الأجهزة والقطع التابعة لهذا الصنف ({{ productUnits.length }} أجهزة مسجلة)
          </h3>
          <span class="text-xs text-brand-gray font-mono">
            اضغط على أيقونة العين لعرض تفاصيل كل جهاز
          </span>
        </div>

        <div class="border border-brand-gray/15 rounded-2xl overflow-hidden shadow-2xs">
          <DataTable
            :value="productUnits"
            class="w-full text-xs"
            :loading="loadingUnits"
            emptyMessage="لا توجد قطع بأرقام تسلسلية مسجلة لهذا الصنف حالياً."
          >
            <Column field="serialNumber" header="الرقم التسلسلي (S/N)">
              <template #body="{ data }">
                <span class="font-mono font-bold text-brand-accent select-all bg-brand-soft px-2 py-0.5 rounded border border-brand-accent/20">
                  {{ data.serialNumber }}
                </span>
              </template>
            </Column>

            <Column header="حالة التواجد">
              <template #body="{ data }">
                <span
                  class="px-2.5 py-0.5 rounded-full text-[11px] font-bold border"
                  :class="getItemStatusBadgeClass(data.status)"
                >
                  {{ getItemStatusLabel(data.status) }}
                </span>
              </template>
            </Column>

            <Column header="الموقع / مكان التواجد">
              <template #body="{ data }">
                <span v-if="data.status === 1 || data.status === 'InStock'" class="font-semibold text-emerald-700">
                  المستودع (رف: {{ data.binName || data.binCode || 'افتراضي' }})
                </span>
                <span v-else class="text-rose-600 font-medium">
                  منصرف - {{ data.place || 'مكتب/قسم خارجي' }}
                </span>
              </template>
            </Column>

            <Column field="recipientName" header="حامل العهدة / المستلم">
              <template #body="{ data }">
                <span class="font-semibold text-brand-dark">{{ data.recipientName || 'في المستودع' }}</span>
              </template>
            </Column>

            <Column field="exitDate" header="تاريخ الحركة">
              <template #body="{ data }">
                <span class="font-mono text-brand-gray text-[11px]">{{ formatDate(data.exitDate) }}</span>
              </template>
            </Column>

            <!-- Eye Action Modal Column -->
            <Column header="تفاصيل الجهاز" headerClass="text-center" bodyClass="text-center" style="width: 90px">
              <template #body="{ data }">
                <button
                  @click="openItemModal(data)"
                  title="عرض كافة تفاصيل الجهاز وموقعه"
                  class="w-8 h-8 rounded-xl bg-brand-soft hover:bg-brand-accent/20 text-brand-accent border border-brand-accent/25 flex items-center justify-center transition-all cursor-pointer shadow-sm hover:scale-105 mx-auto"
                >
                  <Eye class="w-4 h-4" />
                </button>
              </template>
            </Column>
          </DataTable>
        </div>
      </div>
    </div>

    <!-- Scanned Not Found Alert -->
    <div v-else-if="scanAttempted" class="bg-rose-500/10 border border-rose-500/30 text-rose-600 p-6 rounded-2xl text-center space-y-2">
      <AlertTriangle class="w-8 h-8 mx-auto text-rose-500" />
      <h3 class="font-bold text-base">لم يتم العثور على أي جهاز أو منتج</h3>
      <p class="text-xs text-rose-600/80">الرمز "{{ barcodeInput }}" غير مسجل في قاعدة البيانات أو الأرقام التسلسلية</p>
    </div>

    <!-- Device Details Modal (Eye Action for SKU child items) -->
    <Dialog
      v-model:visible="showItemModal"
      modal
      :header="`تفاصيل الجهاز: ${selectedItem?.productName || ''} (${selectedItem?.serialNumber || ''})`"
      class="!bg-brand-white !border-brand-gray/15 max-w-lg w-full !text-brand-dark font-sans"
    >
      <div v-if="selectedItem" class="space-y-4 text-xs">
        <div class="p-4 rounded-2xl bg-brand-light border border-brand-gray/15 flex items-center justify-between">
          <div>
            <span class="text-[10px] text-brand-gray font-semibold block">الرقم التسلسلي (S/N)</span>
            <span class="font-mono text-base font-black text-brand-accent select-all">{{ selectedItem.serialNumber }}</span>
          </div>
          <span
            class="px-3 py-1 rounded-xl text-xs font-black border"
            :class="getItemStatusBadgeClass(selectedItem.status)"
          >
            {{ getItemStatusLabel(selectedItem.status) }}
          </span>
        </div>

        <div class="space-y-2.5 p-4 bg-brand-white rounded-2xl border border-brand-gray/15">
          <div class="flex items-center justify-between">
            <span class="text-brand-gray">اسم الصنف:</span>
            <span class="font-bold text-brand-dark">{{ selectedItem.productName }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-brand-gray">رمز SKU:</span>
            <span class="font-mono font-bold text-brand-dark">{{ selectedItem.productSKU || '-' }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-brand-gray">الباركود العام:</span>
            <span class="font-mono text-brand-dark">{{ selectedItem.productBarcode || '-' }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-brand-gray">الموقع الحالي:</span>
            <span class="font-bold" :class="selectedItem.status === 1 || selectedItem.status === 'InStock' ? 'text-emerald-700' : 'text-rose-600'">
              {{ selectedItem.status === 1 || selectedItem.status === 'InStock' ? `المستودع (رف: ${selectedItem.binName || selectedItem.binCode || 'افتراضي'})` : `منصرف - ${selectedItem.place || 'جهة خارجية'}` }}
            </span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-brand-gray">حامل العهدة / المستلم:</span>
            <span class="font-bold text-brand-accent">{{ selectedItem.recipientName || 'أمين المستودع' }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-brand-gray">تاريخ الحركة:</span>
            <span class="font-mono text-brand-dark">{{ formatDate(selectedItem.exitDate) }}</span>
          </div>
          <div v-if="selectedItem.productExitRequestId" class="flex items-center justify-between">
            <span class="text-brand-gray">رقم طلب الصرف:</span>
            <span class="font-mono font-bold text-brand-dark">#{{ selectedItem.productExitRequestId }}</span>
          </div>
          <div v-if="selectedItem.notes" class="pt-2 border-t border-brand-gray/10">
            <span class="text-brand-gray block mb-1">الملاحظات:</span>
            <p class="text-brand-dark text-[11px] leading-relaxed">{{ selectedItem.notes }}</p>
          </div>
        </div>

        <div class="flex justify-end pt-2">
          <SecondaryButton @click="showItemModal = false">إغلاق</SecondaryButton>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useOhdaInventoryStore } from "../stores/useOhdaInventoryStore";
import { apiGet } from "@/utilities/fetchApi";

const inventoryStore = useOhdaInventoryStore();

onMounted(() => {
  inventoryStore.fetchProducts();
});

const barcodeInput = ref("");
const scannedProduct = ref(null);
const scannedDeviceItem = ref(null);
const productUnits = ref([]);
const scanAttempted = ref(false);
const searching = ref(false);
const loadingUnits = ref(false);

// Modal state
const showItemModal = ref(false);
const selectedItem = ref(null);

function openItemModal(item) {
  selectedItem.value = item;
  showItemModal.value = true;
}

async function handleScan() {
  const code = barcodeInput.value?.trim();
  if (!code) return;

  scanAttempted.value = true;
  searching.value = true;
  scannedProduct.value = null;
  scannedDeviceItem.value = null;
  productUnits.value = [];

  try {
    // 1. Try finding as Serialized Device Item (S/N) first
    const serialRes = await apiGet(`/api/ProductItem/serial/${encodeURIComponent(code)}`);
    if (serialRes?.data?.isDone && serialRes.data.singleObject) {
      scannedDeviceItem.value = serialRes.data.singleObject;
      searching.value = false;
      return;
    }

    // 2. Try finding as Catalog Product by Barcode, SKU, or Name
    let prod = inventoryStore.products.find(
      p => (p.barcode && p.barcode.toLowerCase() === code.toLowerCase()) ||
           (p.sku && p.sku.toLowerCase() === code.toLowerCase()) ||
           (p.name && p.name.toLowerCase().includes(code.toLowerCase()))
    );

    if (!prod) {
      // Refresh inventory and check once more
      await inventoryStore.fetchProducts();
      prod = inventoryStore.products.find(
        p => (p.barcode && p.barcode.toLowerCase() === code.toLowerCase()) ||
             (p.sku && p.sku.toLowerCase() === code.toLowerCase()) ||
             (p.name && p.name.toLowerCase().includes(code.toLowerCase()))
      );
    }

    if (prod) {
      scannedProduct.value = prod;
      // Load all serialized units for this product
      loadingUnits.value = true;
      try {
        const unitsRes = await apiGet(`/api/ProductItem/product/${prod.id}`);
        if (unitsRes?.data?.isDone && unitsRes.data.objects) {
          productUnits.value = unitsRes.data.objects;
        } else {
          productUnits.value = [];
        }
      } catch (err) {
        console.error("Failed to load product units", err);
        productUnits.value = [];
      } finally {
        loadingUnits.value = false;
      }
    }
  } catch (err) {
    console.error("Search failed", err);
  } finally {
    searching.value = false;
  }
}

function quickScan(code) {
  barcodeInput.value = code;
  handleScan();
}

function getItemStatusBadgeClass(status) {
  if (status === 1 || status === "InStock") {
    return "bg-emerald-500/15 text-emerald-700 border-emerald-500/30";
  }
  if (status === 2 || status === "Exited") {
    return "bg-rose-500/15 text-rose-700 border-rose-500/30";
  }
  return "bg-amber-500/15 text-amber-700 border-amber-500/30";
}

function getItemStatusLabel(status) {
  if (status === 1 || status === "InStock") return "في المستودع (متاح)";
  if (status === 2 || status === "Exited") return "منصرف كعهدة";
  if (status === 3 || status === "InTransfer") return "قيد التحويل";
  return "غير محدد";
}

function formatDate(dStr) {
  if (!dStr) return "-";
  try {
    const d = new Date(dStr);
    return d.toLocaleString("ar-SA", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
  } catch (_) {
    return dStr;
  }
}
</script>
