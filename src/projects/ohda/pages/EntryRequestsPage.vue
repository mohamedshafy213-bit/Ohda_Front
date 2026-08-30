<template>
  <div class="space-y-6">
    <!-- Header Title & Action Bar -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-brand-white p-6 rounded-2xl border border-brand-gray/10 shadow-sm">
      <div>
        <h1 class="text-2xl font-bold text-brand-dark flex items-center gap-3">
          <Download class="w-7 h-7 text-brand-accent" />
          {{ $t('ohda.entryRequests.title') }} (متعدد الأصناف)
        </h1>
        <p class="text-xs text-brand-gray mt-1">
          {{ $t('ohda.entryRequests.subTitle') }} - يدعم الإضافة المتعددة ومسح الباركود المستمر للمخازن.
        </p>
      </div>

      <Button
        @click="openCreateModal"
        class="!bg-brand-accent hover:!bg-brand-accent/90 !text-brand-dark !font-bold !rounded-xl !px-4 !py-2.5 !text-xs flex items-center gap-2 shadow-md shadow-brand-accent/10"
      >
        <Plus class="w-4 h-4" />
        {{ $t('ohda.entryRequests.createRequest') }}
      </Button>
    </div>

    <!-- Status Filter Tabs -->
    <div class="flex items-center gap-2 border-b border-brand-gray/10 pb-3 overflow-x-auto">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="activeTab = tab.id"
        class="px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2"
        :class="activeTab === tab.id ? 'bg-brand-soft text-brand-accent border border-brand-accent/30' : 'bg-brand-white text-brand-gray border border-brand-gray/10 hover:text-brand-dark shadow-sm'"
      >
        <span>{{ tab.name }}</span>
        <span class="px-2 py-0.5 rounded-full text-[10px] bg-brand-light text-brand-dark font-bold">
          {{ tab.count }}
        </span>
      </button>
    </div>

    <!-- Entry Requests Volt DataTable -->
    <div class="bg-brand-white border border-brand-gray/10 rounded-2xl overflow-hidden shadow-sm">
      <DataTable :value="filteredRequests" class="w-full text-xs">
        <Column field="id" :header="$t('ohda.exitRequests.requestID')">
          <template #body="{ data }">
            <span class="font-mono text-brand-accent font-bold cursor-pointer hover:underline" @click="viewDetails(data)">
              #{{ data.id }}
            </span>
          </template>
        </Column>

        <Column :header="'الأصناف الموردة'">
          <template #body="{ data }">
            <div>
              <div class="font-semibold text-brand-dark">
                {{ data.items ? data.items.length : 0 }} صنف (أصناف)
              </div>
              <div class="text-[10px] text-brand-gray mt-0.5">
                {{ data.items ? data.items.map(i => `${i.productName || 'منتج'} (x${i.quantity}) [${i.productStateName || 'جديد'}]`).join('، ') : '-' }}
              </div>
            </div>
          </template>
        </Column>

        <Column field="fromSource" :header="$t('ohda.entryRequests.fromSource')">
          <template #body="{ data }">
            <span class="font-semibold text-brand-dark">{{ data.fromSource }}</span>
          </template>
        </Column>

        <Column field="invoiceNumber" :header="$t('ohda.entryRequests.invoiceNumber')">
          <template #body="{ data }">
            <span class="font-mono text-brand-dark">{{ data.invoiceNumber }}</span>
          </template>
        </Column>

        <Column field="departmentName" :header="'القسم'">
          <template #body="{ data }">
            <span class="text-brand-dark">{{ data.departmentName || '-' }}</span>
          </template>
        </Column>

        <Column field="notes" :header="$t('ohda.entryRequests.notes')">
          <template #body="{ data }">
            <span class="text-brand-gray max-w-xs truncate block">{{ data.notes || '-' }}</span>
          </template>
        </Column>

        <Column :header="$t('ohda.exitRequests.approversAudit')">
          <template #body="{ data }">
            <div class="flex flex-col gap-1 items-start">
              <div class="flex items-center gap-1 text-[10px]">
                <span class="text-brand-gray">المدير:</span>
                <span v-if="data.managerId" class="px-1.5 py-0.5 rounded bg-brand-soft text-brand-accent font-bold">
                  {{ data.managerUsername || 'Manager' }}
                </span>
                <span v-else class="text-brand-gray italic">بانتظار الاعتماد</span>
              </div>

              <div class="flex items-center gap-1 text-[10px]">
                <span class="text-brand-gray">المشرف:</span>
                <span v-if="data.supervisorId" class="px-1.5 py-0.5 rounded bg-brand-soft text-brand-accent font-bold">
                  {{ data.supervisorUsername || 'Supervisor' }}
                </span>
                <span v-else class="text-brand-gray italic">بانتظار التوثيق</span>
              </div>
            </div>
          </template>
        </Column>

        <Column :header="$t('ohda.common.status')">
          <template #body="{ data }">
            <span
              class="px-3 py-1 rounded-full text-[10px] font-bold border inline-block cursor-pointer"
              :class="getStatusClass(data.status)"
              @click="viewDetails(data)"
            >
              {{ getStatusLabel(data.status) }}
            </span>
            <p v-if="data.status === 4 && data.rejectionReason" class="text-[10px] text-red-500 mt-1 italic max-w-xs">
              السبب: {{ data.rejectionReason }}
            </p>
          </template>
        </Column>

        <Column :header="$t('ohda.common.actions')">
          <template #body="{ data }">
            <Button
              @click="viewDetails(data)"
              class="!w-full !px-3 !py-1.5 !bg-brand-light hover:!bg-brand-gray/10 !text-brand-dark !border !border-brand-gray/20 !rounded-lg !text-[11px] !font-bold flex items-center justify-center gap-1"
            >
              <Eye class="w-3 h-3 text-brand-accent" />
              عرض التفاصيل
            </Button>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Create Entry Request Volt Dialog -->
    <Dialog v-model:visible="showCreateModal" modal :header="$t('ohda.entryRequests.createRequest')" class="!bg-brand-white !border-brand-gray/15 max-w-4xl w-full !text-brand-dark" @hide="stopScanner">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs" @keydown.enter.prevent="">
        
        <!-- Left Column: Form & Items Table -->
        <div class="lg:col-span-8 space-y-4">
          <!-- Request Header Info -->
          <div class="grid grid-cols-2 gap-3 bg-brand-light p-4 rounded-xl border border-brand-gray/10">
            <div>
              <label class="block font-semibold text-brand-dark mb-1">القسم المسترجع منه *</label>
              <Select v-model="createForm.departmentId" :options="departments" optionLabel="name" optionValue="id" class="w-full !bg-brand-white" placeholder="حدد القسم المسترجع منه" required />
            </div>

            <div>
              <label class="block font-semibold text-brand-dark mb-1">اسم الشخص مقدم طلب الإرجاع *</label>
              <InputText v-model="createForm.fromSource" required class="w-full !bg-brand-white !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark" placeholder="اسم الشخص المرجع" />
            </div>

            <div>
              <label class="block font-semibold text-brand-dark mb-1">رقم سند الصرف الأصلي *</label>
              <Select
                v-model="selectedExitRequestId"
                :options="availableExitRequests"
                optionValue="id"
                class="w-full !bg-brand-white"
                placeholder="حدد سند الصرف الأصلي لتحميل أجهزته"
                :disabled="!createForm.departmentId"
                required
              >
                <template #option="slotProps">
                  <span class="text-xs">سند صرف #{{ slotProps.option.id }} - المستلم: {{ slotProps.option.recipientName }} ({{ formatDate(slotProps.option.insertDate) }})</span>
                </template>
                <template #value="slotProps">
                  <span class="text-xs font-bold text-brand-dark" v-if="slotProps.value">سند صرف #{{ slotProps.value }}</span>
                  <span class="text-xs text-brand-gray" v-else>حدد سند الصرف الأصلي</span>
                </template>
              </Select>
            </div>

            <div>
              <label class="block font-semibold text-brand-dark mb-1">الملاحظات</label>
              <InputText v-model="createForm.notes" class="w-full !bg-brand-white !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark" placeholder="ملاحظات حول الإرجاع" />
            </div>
          </div>

          <!-- Department Custody Items (Assets return selector) -->
          <div v-if="selectedExitRequestId" class="border border-brand-gray/10 rounded-xl overflow-hidden shadow-sm">
            <div class="bg-brand-light p-3 border-b border-brand-gray/10 flex items-center justify-between">
              <span class="font-bold text-brand-dark flex items-center gap-2">
                <Box class="w-4 h-4 text-brand-accent" />
                أجهزة العهدة المنصرفة بالسند المحدد (اختر المراد إرجاعها):
              </span>
              <span class="text-brand-gray text-[10px]" v-if="loadingDeptItems">جاري تحميل العهد...</span>
              <span class="text-brand-accent font-bold font-mono" v-else>{{ departmentItems.length }} أجهزة عهدة</span>
            </div>

            <DataTable :value="departmentItems" class="text-xs" emptyMessage="لا توجد أجهزة منصرفة كعهدة لهذا السند حالياً.">
              <Column field="serialNumber" header="الرقم التسلسلي">
                <template #body="{ data }">
                  <span class="font-mono font-bold text-brand-accent select-all text-xs">{{ data.serialNumber }}</span>
                </template>
              </Column>
              <Column field="productName" header="اسم الجهاز"></Column>
              <Column field="productSKU" header="SKU" class="font-mono"></Column>
              <Column field="productBarcode" header="الباركود" class="font-mono"></Column>
              <Column header="إجراء">
                <template #body="{ data }">
                  <button
                    type="button"
                    @click="toggleDeptSerial(data)"
                    class="px-3 py-1 rounded-xl font-bold cursor-pointer transition-all border text-[10px]"
                    :class="selectedDeptSerials.includes(data.serialNumber) ? 'bg-red-500/10 text-red-600 border-red-500/20' : 'bg-brand-soft text-brand-accent border-brand-accent/25 hover:bg-brand-accent hover:text-brand-dark'"
                  >
                    {{ selectedDeptSerials.includes(data.serialNumber) ? 'إلغاء الإرجاع' : 'إرجاع للمستودع' }}
                  </button>
                </template>
              </Column>
            </DataTable>
          </div>

          <!-- Added Items List Table -->
          <div class="border border-brand-gray/10 rounded-xl overflow-hidden shadow-sm">
            <div class="bg-brand-light p-3 border-b border-brand-gray/10 flex items-center justify-between">
              <span class="font-bold text-brand-dark">أصناف التوريد المضافة:</span>
              <span class="text-brand-accent font-bold font-mono">{{ createForm.items.length }} أصناف</span>
            </div>
            
            <DataTable :value="createForm.items" class="text-xs" emptyMessage="لا توجد أصناف مضافة حالياً. استخدم المسح الضوئي أو الاختيار اليدوي لإضافة أصناف.">
              <Column field="productName" header="اسم الصنف"></Column>
              <Column field="quantity" header="الكمية الموردة">
                <template #body="{ data }">
                  <span class="font-bold text-brand-dark">{{ data.quantity }}</span>
                </template>
              </Column>
              <Column field="productStateName" header="الحالة"></Column>
              <Column header="إجراء">
                <template #body="{ index }">
                  <Button @click="removeRequestItem(index)" class="!p-1.5 !bg-red-500/10 hover:!bg-red-500/20 !text-red-600 !border-0 !rounded-lg">
                    <Trash2 class="w-4 h-4" />
                  </Button>
                </template>
              </Column>
            </DataTable>
          </div>

          <!-- Dialog Form Buttons -->
          <div class="flex items-center justify-end gap-3 pt-4 border-t border-brand-gray/10">
            <SecondaryButton type="button" @click="showCreateModal = false">
              {{ $t('ohda.common.cancel') }}
            </SecondaryButton>
            <Button @click="handleCreateEntry" class="!bg-brand-accent hover:!bg-brand-accent/90 !text-brand-dark !font-bold">
              {{ $t('ohda.entryRequests.createRequest') }}
            </Button>
          </div>
        </div>

        <!-- Right Column: Barcode Scan & Manual Selector -->
        <div class="lg:col-span-4 space-y-4 border-r lg:border-r border-brand-gray/10 lg:pr-4">
          <!-- Hardware Barcode Reader -->
          <div class="bg-brand-light border border-brand-gray/10 p-4 rounded-xl space-y-2">
            <span class="font-bold text-brand-dark flex items-center gap-2">
              <QrCode class="w-4 h-4 text-brand-accent" />
              القارئ اليدوي (Barcode Reader)
            </span>
            <InputText
              v-model="hardwareScanText"
              @keydown.enter.prevent="handleHardwareScan"
              placeholder="اضغط هنا ثم امسح الباركود..."
              class="w-full !bg-brand-white !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark font-mono"
            />
            <p class="text-[10px] text-brand-gray">
              قم بالتركيز على هذا الحقل ثم امسح باركود الجهاز أو رقم السيريال بالقارئ اليدوي.
            </p>
          </div>

          <!-- Continuous Scanner Card -->
          <div class="bg-brand-light border border-brand-gray/10 p-4 rounded-xl space-y-3">
            <div class="flex items-center justify-between">
              <span class="font-bold text-brand-dark flex items-center gap-2">
                <Camera class="w-4 h-4 text-brand-accent" />
                ماسح الباركود / QR المستمر
              </span>
              <button
                type="button"
                @click="toggleScanner"
                class="px-3 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                :class="isScanning ? 'bg-red-500 text-white' : 'bg-brand-accent text-brand-dark'"
              >
                {{ isScanning ? 'إيقاف الكاميرا' : 'تشغيل الكاميرا' }}
              </button>
            </div>

            <!-- Visual Flash Notice -->
            <div v-if="scanFeedback" class="p-2 text-center text-[10px] font-bold bg-brand-soft text-brand-accent border border-brand-accent/30 rounded-lg animate-pulse">
              {{ scanFeedback }}
            </div>

            <div v-show="isScanning" id="entry-qr-reader" class="rounded-xl overflow-hidden border border-brand-gray/20 bg-black aspect-square max-w-[240px] mx-auto shadow-md"></div>
            
            <p class="text-[10px] text-brand-gray leading-relaxed text-center">
              قم بتوجيه الكاميرا نحو باركود الصنف أو كود المنتج لتسجيل توريده تلقائياً وتكرار المسح لزيادة الكمية.
            </p>
          </div>

          <!-- Manual Selection Form -->
          <div class="bg-brand-light border border-brand-gray/10 p-4 rounded-xl space-y-3">
            <span class="font-bold text-brand-dark block">إضافة صنف يدوياً</span>
            
            <div>
              <label class="block text-brand-gray mb-1">اختر الصنف من الكتالوج</label>
              <Select v-model="manualItem.productId" :options="inventoryStore.products" optionLabel="name" optionValue="id" class="w-full !bg-white" placeholder="حدد المنتج" />
            </div>

            <div>
              <label class="block text-brand-gray mb-1">حالة المنتج</label>
              <Select v-model="manualItem.productStateId" :options="productStates" optionLabel="name" optionValue="id" class="w-full !bg-white" placeholder="حدد الحالة (جديد/مستعمل)" />
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block text-brand-gray mb-1">الكمية</label>
                <InputNumber v-model="manualItem.quantity" class="w-full" :min="1" />
              </div>
              <div class="flex items-end">
                <Button @click="addManualItem" class="!w-full !bg-brand-accent hover:!bg-brand-accent/90 !text-brand-dark !font-bold">
                  إضافة للطلب
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Dialog>

    <!-- Request Details & Partial Approval Volt Dialog -->
    <Dialog v-model:visible="showDetailsModal" modal :header="`تفاصيل طلب التوريد #${selectedRequest?.id}`" class="!bg-brand-white !border-brand-gray/15 max-w-3xl w-full !text-brand-dark">
      <div v-if="selectedRequest" class="space-y-6 text-xs">
        
        <!-- Header Info Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-brand-light p-4 rounded-xl border border-brand-gray/10">
          <div>
            <span class="text-brand-gray block mb-0.5">مصدر التوريد</span>
            <span class="font-bold text-brand-dark">{{ selectedRequest.fromSource }}</span>
          </div>
          <div>
            <span class="text-brand-gray block mb-0.5">رقم الفاتورة</span>
            <span class="font-bold text-brand-dark font-mono">{{ selectedRequest.invoiceNumber }}</span>
          </div>
          <div>
            <span class="text-brand-gray block mb-0.5">القسم المستلم</span>
            <span class="font-bold text-brand-dark">{{ selectedRequest.departmentName || '-' }}</span>
          </div>
          <div>
            <span class="text-brand-gray block mb-0.5">الملاحظات</span>
            <span class="font-bold text-brand-dark">{{ selectedRequest.notes || '-' }}</span>
          </div>
          <div>
            <span class="text-brand-gray block mb-0.5">استلم بواسطة</span>
            <span class="font-bold text-brand-dark">{{ selectedRequest.receivedByUsername }}</span>
          </div>
          <div>
            <span class="text-brand-gray block mb-0.5">تاريخ التوريد</span>
            <span class="font-bold text-brand-dark font-mono">{{ formatDate(selectedRequest.insertDate) }}</span>
          </div>
        </div>

        <!-- Line Items Table -->
        <div class="space-y-2">
          <span class="font-bold text-brand-dark block text-sm">أصناف وعناصر طلب التوريد:</span>
          
          <div class="border border-brand-gray/10 rounded-xl overflow-hidden">
            <DataTable :value="selectedRequest.items" class="text-xs">
              <Column field="productName" header="اسم الصنف"></Column>
              <Column field="productSKU" header="SKU" class="font-mono"></Column>
              <Column field="productStateName" header="حالة المنتج"></Column>
              <Column field="quantity" header="الكمية المطلوبة">
                <template #body="{ data }">
                  <span class="font-bold text-brand-accent text-sm">+{{ data.quantity }}</span>
                </template>
              </Column>
              <Column header="حالة العنصر">
                <template #body="{ data }">
                  <span
                    class="px-2.5 py-0.5 rounded text-[10px] font-bold border inline-block"
                    :class="getItemStatusClass(data.status)"
                  >
                    {{ getItemStatusLabel(data.status) }}
                  </span>
                </template>
              </Column>

              <!-- Partial Approval Action Columns (Only shown in review stages) -->
              <Column v-if="canReviewSelectedRequest" header="قرار الاعتماد (جزئي)">
                <template #body="{ data }">
                  <div class="flex items-center gap-1">
                    <button
                      type="button"
                      @click="toggleItemDecision(data.id, 5)"
                      class="px-2 py-1 rounded text-[10px] font-bold cursor-pointer transition-colors"
                      :class="getItemDecision(data.id) === 5 ? 'bg-brand-soft text-brand-accent border border-brand-accent/30' : 'bg-brand-light text-brand-gray border border-brand-gray/10 hover:text-brand-dark'"
                    >
                      موافق
                    </button>
                    <button
                      type="button"
                      @click="toggleItemDecision(data.id, 4)"
                      class="px-2 py-1 rounded text-[10px] font-bold cursor-pointer transition-colors"
                      :class="getItemDecision(data.id) === 4 ? 'bg-red-500/10 text-red-600 border border-red-500/30' : 'bg-brand-light text-brand-gray border border-brand-gray/10 hover:text-brand-dark'"
                    >
                      مرفوض
                    </button>
                  </div>
                </template>
              </Column>
            </DataTable>
          </div>
        </div>

        <!-- Rejection Reason input (Only shown when reviewing) -->
        <div v-if="canReviewSelectedRequest" class="space-y-2">
          <label class="block font-semibold text-brand-dark">سبب الرفض (إلزامي في حال رفض أي صنف أو رفض كلي):</label>
          <Textarea v-model="rejectionReason" rows="2" class="w-full !bg-brand-light !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark" placeholder="أدخل سبب الرفض بالتفصيل هنا..." />
        </div>

        <!-- Dialog Footer Actions -->
        <div class="flex items-center justify-between gap-3 pt-4 border-t border-brand-gray/10">
          <div>
            <!-- Left Side: Status display -->
            <span class="text-xs text-brand-gray">حالة الطلب العامة:</span>
            <span class="px-2.5 py-0.5 rounded font-bold border inline-block ml-2 text-[10px]" :class="getStatusClass(selectedRequest.status)">
              {{ getStatusLabel(selectedRequest.status) }}
            </span>
          </div>

          <div class="flex items-center gap-3">
            <SecondaryButton type="button" @click="showDetailsModal = false">
              إغلاق
            </SecondaryButton>

            <!-- Manager Stage Approvals -->
            <template v-if="selectedRequest.status === 1 && canApproveAsManager">
              <Button @click="submitApprovalDecisions(true)" class="!bg-brand-accent hover:!bg-brand-accent/90 !text-brand-dark !font-bold">
                تقديم قرارات المدير
              </Button>
              <Button @click="rejectEntireRequest" class="!bg-red-500 hover:!bg-red-600 !text-white !font-bold">
                رفض كلي للطلب
              </Button>
            </template>

            <!-- Supervisor Stage Approvals -->
            <template v-if="selectedRequest.status === 3 && canApproveAsSupervisor">
              <Button @click="submitApprovalDecisions(false)" class="!bg-brand-accent hover:!bg-brand-accent/90 !text-brand-dark !font-bold">
                توثيق واعتماد المشرف النهائي
              </Button>
              <Button @click="rejectEntireRequest" class="!bg-red-500 hover:!bg-red-600 !text-white !font-bold">
                رفض كلي للطلب
              </Button>
            </template>
          </div>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useOhdaAuthStore } from "../stores/useOhdaAuthStore";
import { useOhdaInventoryStore } from "../stores/useOhdaInventoryStore";
import { useOhdaRequestsStore } from "../stores/useOhdaRequestsStore";
import { useOhdaApprovalConfigStore } from "../stores/useOhdaApprovalConfigStore";
import { apiGet, apiPost } from "@/utilities/fetchApi";
import { Html5Qrcode } from "html5-qrcode";

const authStore = useOhdaAuthStore();
const inventoryStore = useOhdaInventoryStore();
const requestsStore = useOhdaRequestsStore();
const approvalConfigStore = useOhdaApprovalConfigStore();

const departments = ref([]);
const productStates = ref([]);

// Scanning states
const html5Qrcode = ref(null);
const isScanning = ref(false);
const scanFeedback = ref("");
const lastScanned = ref({ code: "", time: 0 });

let pollInterval = null;

onMounted(async () => {
  await Promise.all([
    requestsStore.fetchEntryRequests(),
    requestsStore.fetchExitRequests(),
    inventoryStore.fetchProducts(),
    approvalConfigStore.fetchApprovalConfigs(),
    loadDepartments(),
    loadProductStates()
  ]);

  pollInterval = setInterval(async () => {
    await requestsStore.fetchEntryRequests();
  }, 10000);
});

onUnmounted(() => {
  if (pollInterval) {
    clearInterval(pollInterval);
  }
});

async function loadDepartments() {
  try {
    const d = await apiGet('/api/Department');
    departments.value = d?.data?.objects || d?.data?.singleObject || [];
  } catch (e) {
    console.warn('Departments load failed', e);
  }
}

async function loadProductStates() {
  try {
    const s = await apiGet('/api/ProductState');
    productStates.value = s?.data?.objects || s?.data?.singleObject || [];
  } catch (e) {
    console.warn('ProductStates load failed', e);
  }
}

const activeTab = ref("all");
const showCreateModal = ref(false);
const showDetailsModal = ref(false);
const selectedRequest = ref(null);
const rejectionReason = ref("");
const itemDecisions = ref({}); // { [itemId]: status }

// Scanning & Return custody states
const hardwareScanText = ref("");
const departmentItems = ref([]);
const loadingDeptItems = ref(false);
const selectedDeptSerials = ref([]);
const selectedExitRequestId = ref(null);

const availableExitRequests = computed(() => {
  if (!createForm.value.departmentId) return [];
  return requestsStore.exitRequests.filter(
    r => r.departmentId === createForm.value.departmentId && r.status === 2
  );
});

const createForm = ref({
  fromSource: "",
  invoiceNumber: "",
  notes: "",
  departmentId: null,
  items: []
});

const manualItem = ref({
  productId: null,
  productStateId: null,
  quantity: 1
});

// Watch product selection to prefill new state (default to first available state)
watch(() => manualItem.value.productId, () => {
  if (productStates.value.length > 0 && !manualItem.value.productStateId) {
    manualItem.value.productStateId = productStates.value[0].id;
  }
});

function openCreateModal() {
  selectedDeptSerials.value = [];
  departmentItems.value = [];
  selectedExitRequestId.value = null;
  createForm.value = {
    fromSource: "",
    invoiceNumber: "",
    notes: "",
    departmentId: null,
    items: []
  };
  manualItem.value = {
    productId: null,
    productStateId: productStates.value[0]?.id || null,
    quantity: 1
  };
  showCreateModal.value = true;
}

// Camera Scanner toggle
const toggleScanner = async () => {
  if (isScanning.value) {
    await stopScanner();
  } else {
    await startScanner();
  }
};

const playBeep = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.value = 1000;
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.15);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  } catch (e) {
    console.warn("AudioContext beep failed", e);
  }
};

const startScanner = async () => {
  isScanning.value = true;
  scanFeedback.value = "جاري تشغيل الكاميرا...";
  setTimeout(async () => {
    try {
      html5Qrcode.value = new Html5Qrcode("entry-qr-reader");
      await html5Qrcode.value.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 200, height: 200 }
        },
        (decodedText) => {
          onCodeScanned(decodedText);
        },
        () => {}
      );
      scanFeedback.value = "الماسح جاهز! وجه العدسة نحو الباركود";
    } catch (err) {
      console.error("Camera start failed", err);
      scanFeedback.value = "خطأ: فشل تشغيل الكاميرا";
      isScanning.value = false;
    }
  }, 150);
};

const stopScanner = async () => {
  if (html5Qrcode.value) {
    try {
      if (html5Qrcode.value.isScanning) {
        await html5Qrcode.value.stop();
      }
    } catch (e) {}
    html5Qrcode.value = null;
  }
  isScanning.value = false;
  scanFeedback.value = "";
};

const onCodeScanned = (decodedText) => {
  const now = Date.now();
  if (lastScanned.value.code === decodedText && now - lastScanned.value.time < 1200) {
    return; // Debounce rapid duplicate scans
  }
  lastScanned.value = { code: decodedText, time: now };
  playBeep();

  // Search product catalog by barcode/SKU
  const product = inventoryStore.products.find(p => p.barcode === decodedText || p.sku === decodedText);
  if (product) {
    // Default to New product state
    const defaultStateId = productStates.value[0]?.id || null;
    const defaultStateName = productStates.value[0]?.name || "جديد";

    const existing = createForm.value.items.find(
      i => i.productId === product.id && i.productStateId === defaultStateId
    );

    if (existing) {
      existing.quantity += 1;
    } else {
      createForm.value.items.push({
        productId: product.id,
        productName: product.name,
        productStateId: defaultStateId,
        productStateName: defaultStateName,
        quantity: 1,
        notes: "مضاف عبر مسح الباركود"
      });
    }
    scanFeedback.value = `تمت إضافة: ${product.name} (+1)`;
  } else {
    scanFeedback.value = `الرمز "${decodedText}" غير مطابق لكتالوج المنتجات!`;
  }
};

// Add manual item
function addManualItem() {
  if (!manualItem.value.productId) {
    alert("يرجى اختيار الصنف أولاً!");
    return;
  }
  const product = inventoryStore.products.find(p => p.id === manualItem.value.productId);
  const state = productStates.value.find(s => s.id === manualItem.value.productStateId);
  if (!product) return;

  const requested = manualItem.value.quantity;
  const stateId = manualItem.value.productStateId || null;
  const stateName = state ? state.name : "جديد";

  // Check duplicate and merge
  const existing = createForm.value.items.find(
    i => i.productId === product.id && i.productStateId === stateId
  );

  if (existing) {
    existing.quantity += requested;
  } else {
    createForm.value.items.push({
      productId: product.id,
      productName: product.name,
      productStateId: stateId,
      productStateName: stateName,
      quantity: requested,
      notes: "إدخال يدوي"
    });
  }

  // Reset manual form inputs
  manualItem.value = {
    productId: null,
    productStateId: productStates.value[0]?.id || null,
    quantity: 1
  };
}

function removeRequestItem(index) {
  createForm.value.items.splice(index, 1);
}

async function handleCreateEntry() {
  if (createForm.value.items.length === 0) {
    alert("يرجى إضافة صنف واحد على الأقل للمتابعة.");
    return;
  }
  if (!createForm.value.fromSource || !createForm.value.invoiceNumber) {
    alert("يرجى ملء مصدر التوريد ورقم الفاتورة.");
    return;
  }

  // Format selected serial numbers into item notes
  const payload = JSON.parse(JSON.stringify(createForm.value));
  payload.items.forEach((item, idx) => {
    const origItem = createForm.value.items[idx];
    if (origItem.selectedSerials && origItem.selectedSerials.length > 0) {
      item.notes = `[${origItem.selectedSerials.join(", ")}] ${item.notes || ""}`;
    }
  });

  const result = await requestsStore.createEntryRequest(payload, authStore.user);
  if (result.success) {
    showCreateModal.value = false;
    await stopScanner();
    requestsStore.fetchEntryRequests();
    selectedDeptSerials.value = [];
    departmentItems.value = [];
  } else {
    alert(result.message || "فشل إنشاء طلب التوريد");
  }
}

// Watch department to reset exit request and fetch its items
watch(() => createForm.value.departmentId, () => {
  selectedExitRequestId.value = null;
  departmentItems.value = [];
  selectedDeptSerials.value = [];
});

watch(selectedExitRequestId, () => {
  if (selectedExitRequestId.value) {
    createForm.value.invoiceNumber = "REQ-" + selectedExitRequestId.value;
  } else {
    createForm.value.invoiceNumber = "";
  }
  fetchExitRequestItems();
});

async function fetchExitRequestItems() {
  if (!selectedExitRequestId.value) {
    departmentItems.value = [];
    selectedDeptSerials.value = [];
    return;
  }
  loadingDeptItems.value = true;
  try {
    const res = await apiGet(`/api/ProductItem/exit-request/${selectedExitRequestId.value}`);
    if (res?.data?.isDone) {
      departmentItems.value = res.data.objects || [];
    } else {
      departmentItems.value = [];
    }
  } catch (e) {
    console.error(e);
    departmentItems.value = [];
  } finally {
    loadingDeptItems.value = false;
  }
}

function toggleDeptSerial(item) {
  const index = selectedDeptSerials.value.indexOf(item.serialNumber);
  if (index > -1) {
    selectedDeptSerials.value.splice(index, 1);
    removeSerialFromFormItems(item);
  } else {
    selectedDeptSerials.value.push(item.serialNumber);
    addSerialToFormItems(item);
  }
}

function addSerialToFormItems(item) {
  const existing = createForm.value.items.find(i => i.productId === item.productId);
  if (existing) {
    if (!existing.selectedSerials) existing.selectedSerials = [];
    if (!existing.selectedSerials.includes(item.serialNumber)) {
      existing.selectedSerials.push(item.serialNumber);
      existing.quantity += 1;
    }
  } else {
    createForm.value.items.push({
      productId: item.productId,
      productName: item.productName || item.product?.name || "Unknown Product",
      productStateId: item.productStateId || productStates.value[0]?.id || null,
      productStateName: item.productStateName || productStates.value[0]?.name || "جديد",
      quantity: 1,
      selectedSerials: [item.serialNumber],
      notes: ""
    });
  }
}

function removeSerialFromFormItems(item) {
  const existing = createForm.value.items.find(i => i.productId === item.productId);
  if (existing) {
    existing.quantity -= 1;
    if (existing.selectedSerials) {
      existing.selectedSerials = existing.selectedSerials.filter(s => s !== item.serialNumber);
    }
    if (existing.quantity <= 0) {
      createForm.value.items = createForm.value.items.filter(i => i.productId !== item.productId);
    }
  }
}

async function handleHardwareScan() {
  const code = hardwareScanText.value.trim();
  if (!code) return;

  // 1. Check if department is selected and matches department serials
  if (createForm.value.departmentId && departmentItems.value.length > 0) {
    const foundItem = departmentItems.value.find(
      pi => pi.serialNumber.toLowerCase() === code.toLowerCase() ||
            (pi.productBarcode && pi.productBarcode.toLowerCase() === code.toLowerCase())
    );
    if (foundItem) {
      toggleDeptSerial(foundItem);
      playBeep();
      hardwareScanText.value = "";
      return;
    }
  }

  // 2. Lookup in global catalog
  const product = inventoryStore.products.find(
    p => p.barcode?.toLowerCase() === code.toLowerCase() || p.sku?.toLowerCase() === code.toLowerCase()
  );
  if (product) {
    manualItem.value.productId = product.id;
    manualItem.value.productStateId = productStates.value[0]?.id || null;
    manualItem.value.quantity = 1;
    playBeep();
  } else {
    // 3. Search via API directly
    try {
      const res = await apiGet(`/api/ProductItem/serial/${code}`);
      if (res?.data?.isDone && res.data.singleObject) {
        const item = res.data.singleObject;
        addSerialToFormItems(item);
        if (!selectedDeptSerials.value.includes(item.serialNumber)) {
          selectedDeptSerials.value.push(item.serialNumber);
        }
        playBeep();
      } else {
        alert(`الرمز "${code}" غير مطابق للمنتجات أو الأرقام التسلسلية!`);
      }
    } catch (e) {
      alert(`الرمز "${code}" غير مطابق للمنتجات أو الأرقام التسلسلية!`);
    }
  }
  hardwareScanText.value = "";
}

// Details & Approval decisions
async function viewDetails(request) {
  try {
    const res = await apiGet(`/api/ProductEntryRequest/${request.id}`);
    if (res?.data?.isDone && res.data.singleObject) {
      selectedRequest.value = res.data.singleObject;
    } else {
      selectedRequest.value = request;
    }
  } catch (e) {
    selectedRequest.value = request;
  }

  rejectionReason.value = "";
  itemDecisions.value = {};
  
  if (selectedRequest.value.items) {
    selectedRequest.value.items.forEach(i => {
      itemDecisions.value[i.id] = i.status === 4 ? 4 : 5;
    });
  }

  showDetailsModal.value = true;
}

const canReviewSelectedRequest = computed(() => {
  if (!selectedRequest.value) return false;
  if (selectedRequest.value.status === 1 && canApproveAsManager.value) return true;
  if (selectedRequest.value.status === 3 && canApproveAsSupervisor.value) return true;
  return false;
});

function toggleItemDecision(itemId, status) {
  itemDecisions.value[itemId] = status;
}

function getItemDecision(itemId) {
  return itemDecisions.value[itemId] || 5;
}

// Submit decisions (Approve/Reject individual line items)
async function submitApprovalDecisions(isManager) {
  const itemsPayload = Object.keys(itemDecisions.value).map(key => ({
    itemId: parseInt(key),
    status: itemDecisions.value[key]
  }));

  const anyRejected = itemsPayload.some(i => i.status === 4);
  if (anyRejected && !rejectionReason.value) {
    alert("يرجى إدخال سبب الرفض لوجود أصناف مرفوضة.");
    return;
  }

  const payload = {
    items: itemsPayload
  };

  let result;
  if (isManager) {
    result = await requestsStore.managerApproveEntry(selectedRequest.value.id, authStore.user, payload);
  } else {
    result = await requestsStore.supervisorApproveEntry(selectedRequest.value.id, authStore.user, payload);
  }

  if (result.success) {
    showDetailsModal.value = false;
    requestsStore.fetchEntryRequests();
    inventoryStore.fetchProducts();
  } else {
    alert(result.message || "فشل تقديم قرارات الاعتماد.");
  }
}

async function rejectEntireRequest() {
  if (!rejectionReason.value) {
    alert("يرجى إدخال سبب الرفض أولاً.");
    return;
  }
  const result = await requestsStore.rejectEntryRequest(selectedRequest.value.id, rejectionReason.value, authStore.user);
  if (result.success) {
    showDetailsModal.value = false;
    requestsStore.fetchEntryRequests();
    inventoryStore.fetchProducts();
  } else {
    alert(result.message || "فشل رفض الطلب");
  }
}

const tabs = computed(() => [
  { id: "all", name: "جميع الطلبات", count: requestsStore.entryRequests.length },
  { id: "pending", name: "قيد الانتظار (مرحلة 1)", count: requestsStore.entryRequests.filter(r => r.status === 1).length },
  { id: "managerApproved", name: "موافقة المدير (مرحلة 2)", count: requestsStore.entryRequests.filter(r => r.status === 3).length },
  { id: "supervisorApproved", name: "مكتمل وموثق نهائياً", count: requestsStore.entryRequests.filter(r => r.status === 2).length },
  { id: "rejected", name: "مرفوض", count: requestsStore.entryRequests.filter(r => r.status === 4).length }
]);

const filteredRequests = computed(() => {
  if (activeTab.value === "pending") return requestsStore.entryRequests.filter(r => r.status === 1);
  if (activeTab.value === "managerApproved") return requestsStore.entryRequests.filter(r => r.status === 3);
  if (activeTab.value === "supervisorApproved") return requestsStore.entryRequests.filter(r => r.status === 2);
  if (activeTab.value === "rejected") return requestsStore.entryRequests.filter(r => r.status === 4);
  return requestsStore.entryRequests;
});

function getStatusClass(status) {
  if (status === 1) return "bg-brand-light text-brand-gray border-brand-gray/20";
  if (status === 3) return "bg-amber-500/10 text-amber-700 border-amber-500/20";
  if (status === 2) return "bg-brand-soft text-brand-accent border-brand-accent/25";
  if (status === 4) return "bg-red-500/10 text-red-700 border-red-500/20";
  return "bg-brand-light text-brand-gray";
}

function getStatusLabel(status) {
  if (status === 1) return "قيد الانتظار (مرحلة 1)";
  if (status === 3) return "موافقة المدير (مرحلة 2)";
  if (status === 2) return "مكتمل وموثق نهائياً";
  if (status === 4) return "مرفوض";
  return "غير معروف";
}

function getItemStatusClass(status) {
  if (status === 1) return "bg-brand-light text-brand-gray border-brand-gray/10";
  if (status === 5) return "bg-brand-soft text-brand-accent border-brand-accent/15";
  if (status === 4) return "bg-red-500/10 text-red-600 border-red-500/15";
  return "bg-brand-light text-brand-gray";
}

function getItemStatusLabel(status) {
  if (status === 1) return "قيد الانتظار";
  if (status === 5) return "تمت الموافقة";
  if (status === 4) return "مرفوض";
  return "غير معروف";
}

function formatDate(dStr) {
  if (!dStr) return "-";
  try {
    const d = new Date(dStr);
    return d.toLocaleString("ar-SA", { hour12: true });
  } catch (e) {
    return dStr;
  }
}

const canApproveAsManager = computed(() => {
  if (authStore.isAdmin) return true;
  const userGroupId = authStore.user?.userGroupId || authStore.user?.userGroup?.id;
  if (!userGroupId) return false;
  return approvalConfigStore.configs.some(c => c.isActive && c.requestType === 1 && c.userGroupId === userGroupId && c.workflowRole === 2);
});

const canApproveAsSupervisor = computed(() => {
  if (authStore.isAdmin) return true;
  const userGroupId = authStore.user?.userGroupId || authStore.user?.userGroup?.id;
  if (!userGroupId) return false;
  return approvalConfigStore.configs.some(c => c.isActive && c.requestType === 1 && c.userGroupId === userGroupId && c.workflowRole === 3);
});
</script>

<style scoped>
#entry-qr-reader {
  width: 100% !important;
}
#entry-qr-reader video {
  object-fit: cover !important;
}
</style>
