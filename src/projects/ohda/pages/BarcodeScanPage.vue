<template>
  <div class="space-y-6">
    <!-- Header Title Bar -->
    <div class="bg-brand-white p-6 rounded-2xl border border-brand-gray/10 shadow-sm">
      <h1 class="text-2xl font-bold text-brand-dark flex items-center gap-3">
        <Barcode class="w-7 h-7 text-brand-accent" />
        {{ $t('ohda.scan.title') }}
      </h1>
      <p class="text-xs text-brand-gray mt-1">
        {{ $t('ohda.scan.subTitle') }}
      </p>
    </div>

    <!-- Scanner Input Card -->
    <div class="bg-brand-white border border-brand-gray/10 p-6 rounded-2xl shadow-sm space-y-4">
      <label class="block text-xs font-semibold text-brand-dark">
        {{ $t('ohda.scan.inputPlaceholder') }}
      </label>
      <div class="flex items-center gap-3">
        <div class="relative flex-1">
          <Barcode class="w-5 h-5 absolute start-3.5 top-3 text-brand-accent z-10" />
          <InputText
            v-model="barcodeInput"
            @keyup.enter="handleScan"
            class="w-full !bg-brand-light !border-brand-gray/25 focus:!border-brand-accent !py-2.5 !ps-11 !pe-4 text-sm font-mono !text-brand-dark placeholder-brand-gray/60"
            placeholder="629110001001"
          />
        </div>
        <Button
          @click="handleScan"
          class="!bg-brand-accent hover:!bg-brand-accent/90 !text-brand-dark !font-bold !rounded-xl !px-6 !py-2.5 !text-xs flex items-center gap-2 shadow-md shadow-brand-accent/10"
        >
          <Search class="w-4 h-4" />
          {{ $t('ohda.scan.scanBtn') }}
        </Button>
      </div>

      <!-- Quick Preset Barcode Chips -->
      <div class="pt-2">
        <span class="text-[11px] font-medium text-brand-gray block mb-2">أكواد باركود سريعة للتجربة:</span>
        <div class="flex flex-wrap gap-2">
          <Button
            v-for="p in inventoryStore.products"
            :key="p.id"
            @click="quickScan(p.barcode)"
            class="!px-3 !py-1.5 !bg-brand-light hover:!bg-brand-light/80 !border !border-brand-gray/20 !rounded-lg !text-xs font-mono !text-brand-dark hover:!text-brand-accent"
          >
            {{ p.barcode }} ({{ p.name.slice(0, 15) }}...)
          </Button>
        </div>
      </div>
    </div>

    <!-- Scanned Product Display Result -->
    <div v-if="scannedProduct" class="bg-brand-white border border-brand-accent/30 rounded-2xl p-6 shadow-md space-y-6">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-brand-gray/10 pb-4">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 bg-brand-soft rounded-xl flex items-center justify-center text-brand-accent border border-brand-accent/20">
            <Check class="w-6 h-6" />
          </div>
          <div>
            <span class="text-[10px] font-bold uppercase tracking-wider text-brand-accent block">
              {{ $t('ohda.scan.foundProduct') }}
            </span>
            <h2 class="text-xl font-bold text-brand-dark">{{ scannedProduct.name }}</h2>
          </div>
        </div>

        <div class="flex items-center gap-4 text-xs font-mono">
          <div class="bg-brand-light px-3 py-1.5 rounded-lg border border-brand-gray/10">
            <span class="text-brand-gray text-[10px] block">SKU</span>
            <span class="text-brand-dark font-bold">{{ scannedProduct.sku }}</span>
          </div>
          <div class="bg-brand-light px-3 py-1.5 rounded-lg border border-brand-gray/10">
            <span class="text-brand-gray text-[10px] block">BARCODE</span>
            <span class="text-brand-accent font-bold">{{ scannedProduct.barcode }}</span>
          </div>
        </div>
      </div>

      <!-- Details Grid -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
        <div class="bg-brand-light p-3 rounded-xl border border-brand-gray/10">
          <span class="text-brand-gray text-[11px] block mb-1">{{ $t('ohda.dashboard.category') }}</span>
          <span class="font-semibold text-brand-dark">{{ scannedProduct.categoryName }}</span>
        </div>
        <div class="bg-brand-light p-3 rounded-xl border border-brand-gray/10">
          <span class="text-brand-gray text-[11px] block mb-1">{{ $t('ohda.dashboard.supplier') }}</span>
          <span class="font-semibold text-brand-dark">{{ scannedProduct.supplierName }}</span>
        </div>
        <div class="bg-brand-light p-3 rounded-xl border border-brand-gray/10">
          <span class="text-brand-gray text-[11px] block mb-1">{{ $t('ohda.products.unitPrice') }}</span>
          <span class="font-bold text-brand-accent">{{ scannedProduct.unitPrice }} ر.س</span>
        </div>
        <div class="bg-brand-light p-3 rounded-xl border border-brand-gray/10">
          <span class="text-brand-gray text-[11px] block mb-1">{{ $t('ohda.dashboard.currentQty') }}</span>
          <span class="font-bold text-xl text-brand-dark">{{ scannedProduct.quantity }}</span>
        </div>
      </div>

      <!-- Quick Action Controls -->
      <div class="bg-brand-light p-5 rounded-xl border border-brand-gray/10 space-y-4">
        <h3 class="text-xs font-bold text-brand-dark uppercase tracking-wider flex items-center gap-2">
          <Zap class="w-4 h-4 text-amber-400" />
          {{ $t('ohda.scan.quickAction') }}
        </h3>

        <div class="flex flex-col sm:flex-row items-center gap-4">
          <div class="flex items-center gap-2 w-full sm:w-auto">
            <label class="text-xs font-semibold text-brand-dark shrink-0">{{ $t('ohda.scan.qtyLabel') }}:</label>
            <InputText
              v-model.number="actionQty"
              type="number"
              min="1"
              class="w-24 !bg-brand-white !border-brand-gray/25 focus:!border-brand-accent !text-center !text-brand-dark font-bold !text-xs"
            />
          </div>

          <div class="flex items-center gap-3 w-full sm:w-auto">
            <Button
              @click="quickExit"
              class="flex-1 sm:flex-initial !px-5 !py-2.5 !bg-red-500/10 hover:!bg-red-500/20 !text-red-600 !border !border-red-500/30 !rounded-xl !text-xs !font-bold flex items-center justify-center gap-2"
            >
              <ArrowUpRight class="w-4 h-4" />
              {{ $t('ohda.scan.quickExit') }}
            </Button>

            <Button
              @click="quickEntry"
              class="flex-1 sm:flex-initial !px-5 !py-2.5 !bg-brand-soft hover:!bg-brand-accent/20 !text-brand-accent !border !border-brand-accent/30 !rounded-xl !text-xs !font-bold flex items-center justify-center gap-2"
            >
              <ArrowDownLeft class="w-4 h-4" />
              {{ $t('ohda.scan.quickEntry') }}
            </Button>
          </div>
        </div>
      </div>
    </div>

    <!-- Scanned Not Found Alert -->
    <div v-else-if="scanAttempted" class="bg-red-500/10 border border-red-500/30 text-red-600 p-6 rounded-2xl text-center space-y-2">
      <AlertTriangle class="w-8 h-8 mx-auto text-red-500" />
      <h3 class="font-bold text-base">لم يتم العثور على أي منتج</h3>
      <p class="text-xs text-red-500/80">الباركود "{{ barcodeInput }}" غير مسجل في قاعدة البيانات</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useOhdaInventoryStore } from "../stores/useOhdaInventoryStore";

const inventoryStore = useOhdaInventoryStore();

onMounted(() => {
  inventoryStore.fetchProducts();
});

const barcodeInput = ref("629110001001");
const scannedProduct = ref(null);
const scanAttempted = ref(false);
const actionQty = ref(1);

function handleScan() {
  scanAttempted.value = true;
  const prod = inventoryStore.findProductByBarcode(barcodeInput.value);
  scannedProduct.value = prod || null;
}

function quickScan(code) {
  barcodeInput.value = code;
  handleScan();
}

async function quickExit() {
  if (!scannedProduct.value) return;
  if (scannedProduct.value.quantity < actionQty.value) {
    alert("الرصيد المتاح غير كافٍ لصرف هذه الكمية!");
    return;
  }

  const payload = {
    ...scannedProduct.value,
    quantity: scannedProduct.value.quantity - actionQty.value
  };
  const res = await inventoryStore.updateProduct(scannedProduct.value.id, payload);
  if (res.success) {
    const updated = inventoryStore.products.find(p => p.id === scannedProduct.value.id);
    if (updated) scannedProduct.value = updated;
    alert(`تم صرف ${actionQty.value} قطعة من "${scannedProduct.value.name}" وتحديث الرصيد بنجاح.`);
  } else {
    alert(res.message || "فشل تحديث الرصيد عبر الخادم");
  }
}

async function quickEntry() {
  if (!scannedProduct.value) return;

  const payload = {
    ...scannedProduct.value,
    quantity: scannedProduct.value.quantity + actionQty.value
  };
  const res = await inventoryStore.updateProduct(scannedProduct.value.id, payload);
  if (res.success) {
    const updated = inventoryStore.products.find(p => p.id === scannedProduct.value.id);
    if (updated) scannedProduct.value = updated;
    alert(`تم إضافة ${actionQty.value} قطعة إلى رصيد "${scannedProduct.value.name}" بنجاح.`);
  } else {
    alert(res.message || "فشل تحديث الرصيد عبر الخادم");
  }
}
</script>
