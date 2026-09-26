<template>
  <div class="space-y-6">
    <!-- Header Title & Action Bar -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-brand-white p-6 rounded-2xl border border-brand-gray/10 shadow-sm">
      <div>
        <h1 class="text-2xl font-bold text-brand-dark flex items-center gap-3">
          <FileText class="w-7 h-7 text-brand-accent" />
          {{ $t('ohda.exitRequests.title') }} (متعدد الأصناف)
        </h1>
        <p class="text-xs text-brand-gray mt-1">
          {{ $t('ohda.exitRequests.subTitle') }} - يدعم الإضافة المتعددة ومسح الباركود المستمر.
        </p>
      </div>

      <Button
        @click="openCreateModal"
        class="!bg-brand-accent hover:!bg-brand-accent/90 !text-brand-dark !font-bold !rounded-xl !px-4 !py-2.5 !text-xs flex items-center gap-2 shadow-md shadow-brand-accent/10"
      >
        <Plus class="w-4 h-4" />
        {{ $t('ohda.exitRequests.createRequest') }}
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

    <!-- Exit Requests Volt DataTable -->
    <div class="bg-brand-white border border-brand-gray/10 rounded-2xl overflow-hidden shadow-sm">
      <DataTable :value="filteredRequests" :dataKey="'id'" paginator :rows="10" :rowsPerPageOptions="[5, 10, 20, 50]" class="w-full text-xs">
        <Column field="id" :header="$t('ohda.exitRequests.requestID')">
          <template #body="{ data }">
            <span class="font-mono text-brand-accent font-bold cursor-pointer hover:underline" @click="viewDetails(data)">
              #{{ data.id }}
            </span>
          </template>
        </Column>

        <Column :header="'الأصناف المطلوبة'">
          <template #body="{ data }">
            <div>
              <div class="font-semibold text-brand-dark">
                {{ data.items ? data.items.length : 0 }} صنف (أصناف)
              </div>
              <div class="text-[10px] text-brand-gray mt-0.5">
                {{ data.items ? data.items.map(i => `${i.productName || 'منتج'} (x${i.quantity})`).join('، ') : '-' }}
              </div>
            </div>
          </template>
        </Column>

        <Column field="recipientName" :header="$t('ohda.exitRequests.recipientName')">
          <template #body="{ data }">
            <div>
              <div class="font-semibold text-brand-dark">{{ data.recipientName }}</div>
              <div class="text-[10px] text-brand-gray">{{ data.departmentName || '-' }}</div>
            </div>
          </template>
        </Column>

        <Column field="purpose" :header="$t('ohda.exitRequests.purpose')">
          <template #body="{ data }">
            <span class="text-brand-dark max-w-xs truncate block">{{ data.purpose }}</span>
          </template>
        </Column>

        <Column field="requestedByUsername" :header="$t('ohda.exitRequests.requestedBy')">
          <template #body="{ data }">
            <span class="font-semibold text-brand-dark">{{ data.requestedByUsername }}</span>
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

    <!-- Create Exit Request Volt Dialog -->
    <Dialog v-model:visible="showCreateModal" modal :header="$t('ohda.exitRequests.createRequest')" class="!bg-brand-white !border-brand-gray/15 max-w-4xl w-full !text-brand-dark" @hide="stopScanner">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs" @keydown.enter.prevent="">
        
        <!-- Left Column: Form & Items Table -->
        <div class="lg:col-span-8 space-y-4">
          <!-- Request Header Info -->
          <div class="grid grid-cols-3 gap-3 bg-brand-light p-4 rounded-xl border border-brand-gray/10">
            <div>
              <label class="block font-semibold text-brand-dark mb-1">{{ $t('ohda.exitRequests.recipientName') }} *</label>
              <InputText v-model="createForm.recipientName" required class="w-full !bg-brand-white !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark" placeholder="أحمد محمود" />
            </div>
            <div>
              <label class="block font-semibold text-brand-dark mb-1">{{ $t('ohda.exitRequests.recipientDepartment') }} *</label>
              <Select v-model="createForm.departmentId" :options="departments" optionLabel="name" optionValue="id" class="w-full !bg-brand-white !border-brand-gray/25 focus:!border-brand-accent" placeholder="حدد قسم العمل" required />
            </div>
            <div>
              <label class="block font-semibold text-brand-dark mb-1">الغرض من الصرف *</label>
              <InputText v-model="createForm.purpose" required class="w-full !bg-brand-white !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark" placeholder="تسليم عهدة موظف جديد" />
            </div>
          </div>

          <!-- Direct Execution Toggle Option -->
          <div
            class="p-3.5 rounded-xl border flex items-center justify-between transition-all"
            :class="createForm.autoApprove ? 'bg-amber-500/10 border-amber-500/30 ring-1 ring-amber-500/20' : 'bg-brand-light border-brand-gray/15'"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors"
                :class="createForm.autoApprove ? 'bg-amber-600 text-white shadow-sm' : 'bg-brand-gray/15 text-brand-gray'"
              >
                <Zap class="w-5 h-5" />
              </div>
              <div>
                <div class="font-bold text-xs text-brand-dark flex items-center gap-2">
                  <span>صرف مباشر وفوري (اعتماد تلقائي بدون دورة موافقات)</span>
                  <span v-if="createForm.autoApprove" class="px-2 py-0.5 rounded text-[10px] font-black bg-amber-500/20 text-amber-700">
                    مباشر وفوري
                  </span>
                </div>
                <p class="text-[11px] text-brand-gray mt-0.5 leading-relaxed">
                  خصم الكميات من المخزون والأرفف فور إنشاء الطلب واعتماده كطلب مكتمل وموثق نهائياً دون انتظار موافقة المدير أو المشرف.
                </p>
              </div>
            </div>
            <ToggleSwitch v-model="createForm.autoApprove" />
          </div>

          <!-- Added Items List Table -->
          <div class="border border-brand-gray/10 rounded-xl overflow-hidden shadow-sm">
            <div class="bg-brand-light p-3 border-b border-brand-gray/10 flex items-center justify-between">
              <span class="font-bold text-brand-dark">أصناف الطلب المضافة:</span>
              <span class="text-brand-accent font-bold font-mono">{{ createForm.items.length }} أصناف</span>
            </div>
            
            <DataTable :value="createForm.items" class="text-xs" emptyMessage="لا توجد أصناف مضافة حالياً. استخدم المسح أو الاختيار اليدوي لإضافة أصناف.">
              <Column field="productName" header="اسم الصنف"></Column>
              <Column field="quantity" header="الكمية المطلوبة">
                <template #body="{ data }">
                  <span class="font-bold text-brand-dark">{{ data.quantity }}</span>
                </template>
              </Column>
              <Column header="الأرقام التسلسلية المحددة">
                <template #body="{ data }">
                  <div class="flex flex-wrap gap-1 max-w-xs">
                    <span v-for="snId in getSerialsForProduct(data.productId)" :key="snId" class="px-1.5 py-0.5 bg-brand-soft text-brand-accent text-[9px] font-mono rounded border border-brand-accent/10 flex items-center gap-1">
                      {{ getSerialNoById(snId) }}
                      <X class="w-2.5 h-2.5 cursor-pointer text-red-500 hover:text-red-700" @click="removeSerialSelection(snId)" />
                    </span>
                    <span v-if="getSerialsForProduct(data.productId).length === 0" class="text-brand-gray italic text-[10px]">
                      توزيع تلقائي (بدون سيريالات محددة)
                    </span>
                  </div>
                </template>
              </Column>
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
            <Button @click="handleCreateExit" :disabled="isSubmitting" :loading="isSubmitting" class="!bg-brand-accent hover:!bg-brand-accent/90 !text-brand-dark !font-bold">
              {{ $t('ohda.exitRequests.createRequest') }}
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

            <div v-show="isScanning" id="exit-qr-reader" class="rounded-xl overflow-hidden border border-brand-gray/20 bg-black aspect-square max-w-[240px] mx-auto shadow-md"></div>
            
            <p class="text-[10px] text-brand-gray leading-relaxed text-center">
              قم بتوجيه الكاميرا نحو باركود الصنف أو كود QR التسلسلي للجهاز. سيقوم النظام بالتعرف التلقائي وإضافته للطلب مع تشغيل صوت تنبيه.
            </p>
          </div>

          <!-- Manual Selection Form -->
          <div class="bg-brand-light border border-brand-gray/10 p-4 rounded-xl space-y-3">
            <span class="font-bold text-brand-dark block">إضافة صنف يدوياً</span>
            
            <div>
              <label class="block text-brand-gray mb-1">اختر الصنف من الكتالوج</label>
              <Select v-model="manualItem.productId" :options="inventoryStore.products" optionLabel="name" optionValue="id" class="w-full !bg-white" placeholder="حدد المنتج" />
            </div>

            <div v-if="manualItem.productId" class="space-y-2 pt-2">
              <div class="flex items-center justify-between text-[11px]">
                <span class="font-semibold text-brand-dark">حدد الأرقام التسلسلية المتوفرة:</span>
                <span class="text-brand-accent font-bold font-mono">المحدد: {{ manualItem.selectedSerials.length }}</span>
              </div>

              <div v-if="loadingSerials" class="text-center py-2">
                <span class="text-[10px] text-brand-gray">جاري تحميل السيريالات...</span>
              </div>

              <div v-else-if="availableSerials.length === 0" class="p-2 text-center text-[10px] text-red-600 bg-red-500/5 border border-red-500/10 rounded-lg">
                لا توجد أجهزة متوفرة في المخزن لهذا الصنف! يمكنك كتابة سريال افتراضي أو الضغط على إضافة بدون سريال.
              </div>

              <div v-else class="grid grid-cols-1 gap-1.5 max-h-28 overflow-y-auto border border-brand-gray/20 p-2 rounded-lg bg-white">
                <label
                  v-for="s in availableSerials"
                  :key="s.id"
                  class="flex items-center gap-2 p-1 border border-brand-gray/10 rounded font-mono text-[9px] select-none cursor-pointer transition-colors"
                  :class="manualItem.selectedSerials.includes(s.id) ? 'bg-brand-soft text-brand-dark border-brand-accent/30' : 'text-brand-gray'"
                >
                  <input
                    type="checkbox"
                    :value="s.id"
                    v-model="manualItem.selectedSerials"
                    class="rounded text-brand-accent border-brand-gray/30 h-3 w-3 cursor-pointer"
                  />
                  <span class="font-semibold truncate">{{ s.serialNumber }}</span>
                </label>
              </div>
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
    <Dialog v-model:visible="showDetailsModal" modal :header="`تفاصيل طلب الصرف #${selectedRequest?.id}`" class="!bg-brand-white !border-brand-gray/15 max-w-3xl w-full !text-brand-dark">
      <div v-if="selectedRequest" class="space-y-6 text-xs">
        
        <!-- Header Info Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-brand-light p-4 rounded-xl border border-brand-gray/10">
          <div>
            <span class="text-brand-gray block mb-0.5">اسم المستلم</span>
            <span class="font-bold text-brand-dark">{{ selectedRequest.recipientName }}</span>
          </div>
          <div>
            <span class="text-brand-gray block mb-0.5">{{ $t('ohda.exitRequests.recipientDepartment') }}</span>
            <span class="font-bold text-brand-dark">{{ selectedRequest.departmentName || '-' }}</span>
          </div>
          <div>
            <span class="text-brand-gray block mb-0.5">الغرض من الصرف</span>
            <span class="font-bold text-brand-dark">{{ selectedRequest.purpose }}</span>
          </div>
          <div>
            <span class="text-brand-gray block mb-0.5">أنشئ بواسطة</span>
            <span class="font-bold text-brand-dark">{{ selectedRequest.requestedByUsername }}</span>
          </div>
          <div>
            <span class="text-brand-gray block mb-0.5">تاريخ الطلب</span>
            <span class="font-bold text-brand-dark font-mono">{{ formatDate(selectedRequest.insertDate) }}</span>
          </div>
        </div>

        <!-- Line Items Table -->
        <div class="space-y-2">
          <span class="font-bold text-brand-dark block text-sm">أصناف وعناصر طلب الصرف:</span>
          
          <div class="border border-brand-gray/10 rounded-xl overflow-hidden">
            <DataTable :value="selectedRequest.items" class="text-xs">
              <Column field="productName" header="اسم الصنف"></Column>
              <Column field="productSKU" header="SKU" class="font-mono"></Column>
              <Column header="مكان التخزين (الرف)">
                <template #body="{ data }">
                  <span v-if="data.binCode" class="px-2 py-0.5 rounded-lg bg-brand-soft text-brand-accent font-mono font-bold text-[10px] border border-brand-accent/30 inline-flex items-center gap-1">
                    <Layers class="w-3 h-3" />
                    {{ data.binCode }}
                  </span>
                  <span v-else class="text-brand-gray text-[10px]">-</span>
                </template>
              </Column>
              <Column field="quantity" header="الكمية المطلوبة">
                <template #body="{ data }">
                  <span class="font-bold text-brand-dark text-sm">{{ data.quantity }}</span>
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

          <div class="flex flex-wrap items-center gap-2">
            <SecondaryButton type="button" @click="showDetailsModal = false">
              إغلاق
            </SecondaryButton>

            <!-- 1-Step Direct Final Approval (Pending -> Supervisor Approved in 1 click) -->
            <template v-if="selectedRequest.status === 1 && (canApproveAsSupervisor || authStore.isAdmin)">
              <Button
                @click="directSingleStepApproval"
                :disabled="isSubmitting"
                :loading="isSubmitting"
                class="!bg-emerald-600 hover:!bg-emerald-700 !text-white !font-bold flex items-center gap-1.5 shadow-sm"
                title="اعتماد نهائي وصرف مباشر للأصناف فوراً دون الحاجة لمراجعة إدارية"
              >
                <CheckCheck class="w-4 h-4" />
                اعتماد نهائي وصرف مباشر (خطوة واحدة)
              </Button>
            </template>

            <!-- Manager Stage Approvals -->
            <template v-if="selectedRequest.status === 1 && canApproveAsManager">
              <Button @click="submitApprovalDecisions(true)" :disabled="isSubmitting" :loading="isSubmitting" class="!bg-brand-accent hover:!bg-brand-accent/90 !text-brand-dark !font-bold">
                تقديم قرارات المدير
              </Button>
              <Button @click="rejectEntireRequest" :disabled="isSubmitting" :loading="isSubmitting" class="!bg-red-500 hover:!bg-red-600 !text-white !font-bold">
                رفض كلي للطلب
              </Button>
            </template>

            <!-- Supervisor Stage Approvals -->
            <template v-if="selectedRequest.status === 3 && canApproveAsSupervisor">
              <Button @click="submitApprovalDecisions(false)" :disabled="isSubmitting" :loading="isSubmitting" class="!bg-brand-accent hover:!bg-brand-accent/90 !text-brand-dark !font-bold">
                توثيق واعتماد المشرف النهائي
              </Button>
              <Button @click="rejectEntireRequest" :disabled="isSubmitting" :loading="isSubmitting" class="!bg-red-500 hover:!bg-red-600 !text-white !font-bold">
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
import { Zap, CheckCheck } from "lucide-vue-next";
import { useOhdaAuthStore } from "../stores/useOhdaAuthStore";
import { useOhdaInventoryStore } from "../stores/useOhdaInventoryStore";
import { useOhdaWarehouseBinStore } from "../stores/useOhdaWarehouseBinStore";
import { useOhdaRequestsStore } from "../stores/useOhdaRequestsStore";
import { useOhdaApprovalConfigStore } from "../stores/useOhdaApprovalConfigStore";
import { apiGet, apiPost } from "@/utilities/fetchApi";

const authStore = useOhdaAuthStore();
const inventoryStore = useOhdaInventoryStore();
const binStore = useOhdaWarehouseBinStore();
const requestsStore = useOhdaRequestsStore();
const approvalConfigStore = useOhdaApprovalConfigStore();

const availableSerials = ref([]);
const loadingSerials = ref(false);
const isSubmitting = ref(false);
const departments = ref([]);
const allInStockSerials = ref([]);

// Scanning states
const html5Qrcode = ref(null);
const isScanning = ref(false);
const scanFeedback = ref("");
const lastScanned = ref({ code: "", time: 0 });
const hardwareScanText = ref("");

let pollInterval = null;

onMounted(async () => {
  await Promise.all([
    requestsStore.fetchExitRequests(),
    inventoryStore.fetchProducts(),
    approvalConfigStore.fetchApprovalConfigs(),
    loadDepartments(),
    loadAllInStockSerials()
  ]);

  pollInterval = setInterval(async () => {
    // Only refresh when tab is visible and do it silently to avoid UI flicker
    if (document.visibilityState === "visible") {
      await requestsStore.fetchExitRequests({ silent: true });
    }
  }, 10000);
});

onUnmounted(async () => {
  if (pollInterval) {
    clearInterval(pollInterval);
  }
  await stopScanner();
});

async function loadDepartments() {
  try {
    const d = await apiGet('/api/Department');
    departments.value = d?.data?.objects || d?.data?.singleObject || [];
  } catch (e) {
    console.warn('Departments load failed', e);
  }
}

async function loadAllInStockSerials() {
  allInStockSerials.value = [];
  try {
    // Optimized: Single endpoint call instead of N+1 requests
    const res = await apiGet('/api/ProductItem/instock');
    const items = res?.data?.objects || (res?.data?.singleObject ? [res.data.singleObject] : []);
    if (res?.data?.isDone && items.length > 0) {
      allInStockSerials.value = items.map(item => ({
        id: item.id,
        productId: item.productId,
        serialNumber: item.serialNumber,
        qrCode: item.qrCode
      }));
    } else {
      // Fallback in case endpoint is not populated yet
      const fallbackPromises = inventoryStore.products.slice(0, 10).map(async (prod) => {
        try {
          const r = await apiGet(`/api/ProductItem/product/${prod.id}/instock`);
          if (r?.data?.isDone && r.data.objects) {
            r.data.objects.forEach(item => {
              allInStockSerials.value.push({
                id: item.id,
                productId: prod.id,
                serialNumber: item.serialNumber,
                qrCode: item.qrCode
              });
            });
          }
        } catch (e) {}
      });
      await Promise.all(fallbackPromises);
    }
  } catch (err) {
    console.warn("Serials bulk load failed", err);
  }
}

const activeTab = ref("all");
const showCreateModal = ref(false);
const showDetailsModal = ref(false);
const selectedRequest = ref(null);
const rejectionReason = ref("");
const itemDecisions = ref({}); // { [itemId]: status }

const createForm = ref({
  recipientName: "",
  purpose: "",
  departmentId: null,
  items: [],
  selectedProductItemIds: [],
  autoApprove: false
});

const manualItem = ref({
  productId: null,
  quantity: 1,
  selectedSerials: []
});

// Load available serials when product selection changes inside manual creator
watch(() => manualItem.value.productId, async (newVal) => {
  manualItem.value.selectedSerials = [];
  manualItem.value.quantity = 1;
  availableSerials.value = [];
  if (!newVal) return;

  loadingSerials.value = true;
  try {
    const res = await apiGet(`/api/ProductItem/product/${newVal}/instock`);
    if (res?.data?.isDone) {
      availableSerials.value = res.data.objects || (res.data.singleObject ? [res.data.singleObject] : []) || [];
    }
  } catch (err) {
    console.error("Error loading serials", err);
  } finally {
    loadingSerials.value = false;
  }
});

// Update manual qty when checkboxes toggled
watch(() => manualItem.value.selectedSerials, (newSerials) => {
  if (newSerials.length > 0) {
    manualItem.value.quantity = newSerials.length;
  }
}, { deep: true });

function getSerialsForProduct(productId) {
  // Filter selected serials belonging to this product
  return createForm.value.selectedProductItemIds.filter(snId => {
    const sn = allInStockSerials.value.find(s => s.id === snId);
    return sn && sn.productId === productId;
  });
}

function getSerialNoById(id) {
  const sn = allInStockSerials.value.find(s => s.id === id);
  return sn ? sn.serialNumber : `#${id}`;
}

function removeSerialSelection(id) {
  createForm.value.selectedProductItemIds = createForm.value.selectedProductItemIds.filter(snId => snId !== id);
  
  // Also adjust quantity of corresponding item in createForm.items
  const serialObj = allInStockSerials.value.find(s => s.id === id);
  if (serialObj) {
    const item = createForm.value.items.find(i => i.productId === serialObj.productId);
    if (item) {
      item.quantity = Math.max(0, item.quantity - 1);
      if (item.quantity === 0) {
        createForm.value.items = createForm.value.items.filter(i => i.productId !== serialObj.productId);
      }
    }
  }
}

function openCreateModal() {
  const isFlowDisabled = localStorage.getItem("ohda_approval_flow_enabled_exit") === "false";
  createForm.value = {
    recipientName: "",
    purpose: "",
    departmentId: null,
    items: [],
    selectedProductItemIds: [],
    autoApprove: isFlowDisabled
  };
  manualItem.value = {
    productId: null,
    quantity: 1,
    selectedSerials: []
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
      const { Html5Qrcode } = await import("html5-qrcode");
      html5Qrcode.value = new Html5Qrcode("exit-qr-reader");
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

async function handleHardwareScan() {
  const code = hardwareScanText.value.trim();
  if (!code) return;

  // 1. Check if the scanned code matches an in-stock serial number
  let matchedSerial = allInStockSerials.value.find(
    s => s.serialNumber.toLowerCase() === code.toLowerCase()
  );

  // If not found in loaded allInStockSerials, query API directly
  if (!matchedSerial) {
    try {
      const res = await apiGet(`/api/ProductItem/serial/${code}`);
      if (res?.data?.isDone && res.data.singleObject) {
        const item = res.data.singleObject;
        if (item.status === 1) { // InStock
          matchedSerial = {
            id: item.id,
            productId: item.productId,
            serialNumber: item.serialNumber,
            qrCode: item.qrCode
          };
          // Cache it
          if (!allInStockSerials.value.some(s => s.id === item.id)) {
            allInStockSerials.value.push(matchedSerial);
          }
        }
      }
    } catch (e) {}
  }

  if (matchedSerial) {
    // Check if it's already selected
    if (!createForm.value.selectedProductItemIds.includes(matchedSerial.id)) {
      createForm.value.selectedProductItemIds.push(matchedSerial.id);
      
      // Also add product to form items if not already added
      const existing = createForm.value.items.find(i => i.productId === matchedSerial.productId);
      if (existing) {
        existing.quantity += 1;
      } else {
        const prod = inventoryStore.products.find(p => p.id === matchedSerial.productId);
        createForm.value.items.push({
          productId: matchedSerial.productId,
          productName: prod ? prod.name : "Unknown Product",
          quantity: 1,
          notes: "تم الإضافة بالماسح"
        });
      }
      playBeep();
    }
  } else {
    // 2. Otherwise, check if it matches a Product Barcode or SKU
    const product = inventoryStore.products.find(
      p => p.barcode?.toLowerCase() === code.toLowerCase() || p.sku?.toLowerCase() === code.toLowerCase()
    );
    if (product) {
      manualItem.value.productId = product.id;
      playBeep();
    } else {
      alert(`الرمز "${code}" غير مطابق لمنتج أو رقم تسلسلي متاح في المخزن!`);
    }
  }

  hardwareScanText.value = "";
}

const onCodeScanned = (decodedText) => {
  const now = Date.now();
  if (lastScanned.value.code === decodedText && now - lastScanned.value.time < 1200) {
    return; // Debounce rapid duplicate scans
  }
  lastScanned.value = { code: decodedText, time: now };
  playBeep();

  // 1. Check if it matches a catalog product barcode
  const product = inventoryStore.products.find(p => p.barcode === decodedText || p.sku === decodedText);
  if (product) {
    const existing = createForm.value.items.find(i => i.productId === product.id);
    if (existing) {
      // Check stock limit
      if (existing.quantity >= (product.quantity || product.amount || 0)) {
        scanFeedback.value = `عذراً: تم تجاوز الحد الأقصى للمخزون المتاح لـ ${product.name}!`;
        return;
      }
      existing.quantity += 1;
    } else {
      createForm.value.items.push({
        productId: product.id,
        productName: product.name,
        quantity: 1,
        notes: "مضاف بالمسح الضوئي للباركود"
      });
    }
    scanFeedback.value = `تمت إضافة: ${product.name} (+1)`;
    return;
  }

  // 2. Check if it matches an in-stock serial number
  const serialMatch = allInStockSerials.value.find(s => s.serialNumber === decodedText || s.qrCode === decodedText);
  if (serialMatch) {
    // Check if already selected
    if (createForm.value.selectedProductItemIds.includes(serialMatch.id)) {
      scanFeedback.value = `تنبيه: الرقم التسلسلي ${decodedText} محدد بالفعل في هذا الطلب!`;
      return;
    }

    const prod = inventoryStore.products.find(p => p.id === serialMatch.productId);
    if (prod) {
      createForm.value.selectedProductItemIds.push(serialMatch.id);
      
      const existing = createForm.value.items.find(i => i.productId === prod.id);
      if (existing) {
        existing.quantity += 1;
      } else {
        createForm.value.items.push({
          productId: prod.id,
          productName: prod.name,
          quantity: 1,
          notes: `سريال: ${decodedText}`
        });
      }
      scanFeedback.value = `سريال محدد: ${decodedText} (${prod.name})`;
    }
    return;
  }

  scanFeedback.value = `الرمز "${decodedText}" غير مطابق لمنتج أو سريال متاح!`;
};

// Add manual item
function addManualItem() {
  if (!manualItem.value.productId) {
    alert("يرجى اختيار الصنف أولاً!");
    return;
  }
  const product = inventoryStore.products.find(p => p.id === manualItem.value.productId);
  if (!product) return;

  // Stock check
  const requested = manualItem.value.quantity;
  const available = product.quantity || product.amount || 0;
  if (requested > available) {
    alert(`لا يمكن طلب كمية (${requested}) أكبر من المخزون المتوفر (${available}) لـ ${product.name}!`);
    return;
  }

  // Check duplicate and merge
  const existing = createForm.value.items.find(i => i.productId === product.id);
  if (existing) {
    const total = existing.quantity + requested;
    if (total > available) {
      alert(`الكمية الإجمالية المطلوبة (${total}) تتجاوز المتاح في المخزن (${available})!`);
      return;
    }
    existing.quantity = total;
  } else {
    createForm.value.items.push({
      productId: product.id,
      productName: product.name,
      quantity: requested,
      notes: "إدخال يدوي"
    });
  }

  // Add selected serials to the global list
  if (manualItem.value.selectedSerials.length > 0) {
    manualItem.value.selectedSerials.forEach(snId => {
      if (!createForm.value.selectedProductItemIds.includes(snId)) {
        createForm.value.selectedProductItemIds.push(snId);
      }
    });
  }

  // Reset manual form
  manualItem.value = {
    productId: null,
    quantity: 1,
    selectedSerials: []
  };
}

function removeRequestItem(index) {
  const item = createForm.value.items[index];
  if (item) {
    // Remove selected serials corresponding to this product
    const serialIdsToRemove = getSerialsForProduct(item.productId);
    createForm.value.selectedProductItemIds = createForm.value.selectedProductItemIds.filter(
      id => !serialIdsToRemove.includes(id)
    );
  }
  createForm.value.items.splice(index, 1);
}

async function handleCreateExit() {
  if (isSubmitting.value) return;
  if (createForm.value.items.length === 0) {
    alert("يرجى إضافة صنف واحد على الأقل للمتابعة.");
    return;
  }
  if (!createForm.value.recipientName || !createForm.value.departmentId || !createForm.value.purpose) {
    alert("يرجى ملء جميع الحقول الإلزامية.");
    return;
  }

  isSubmitting.value = true;
  try {
    const result = await requestsStore.createExitRequest(createForm.value, authStore.user);
    if (result.success) {
      showCreateModal.value = false;
      await stopScanner();
      await requestsStore.fetchExitRequests();
      await loadAllInStockSerials();
      if (createForm.value.autoApprove) {
        alert("تم إنشاء طلب الصرف وصرفه وتحديث الأرفف والمخزون بنجاح ومباشرة!");
      }
    } else {
      alert(result.message || "فشل إنشاء طلب الصرف");
    }
  } finally {
    isSubmitting.value = false;
  }
}

// Details & Approval decisions
async function viewDetails(request) {
  // Load full request details from API
  try {
    const res = await apiGet(`/api/ProductExitRequest/${request.id}`);
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
  
  // Set default item decisions to Approved (5)
  if (selectedRequest.value.items) {
    selectedRequest.value.items.forEach(i => {
      itemDecisions.value[i.id] = i.status === 4 ? 4 : 5; // maintain rejection if already rejected
    });
  }

  showDetailsModal.value = true;
}

const canReviewSelectedRequest = computed(() => {
  if (!selectedRequest.value) return false;
  if (selectedRequest.value.status === 1 && (canApproveAsManager.value || canApproveAsSupervisor.value || authStore.isAdmin)) return true;
  if (selectedRequest.value.status === 3 && canApproveAsSupervisor.value) return true;
  return false;
});

// Single-step direct final approval (Bypasses review stage)
async function directSingleStepApproval() {
  if (isSubmitting.value) return;
  if (!confirm("هل تريد اعتماد هذا الطلب وصرفه نهائياً ومباشرة في خطوة واحدة دون الحاجة لمراجعة إدارية؟")) return;

  const itemsPayload = Object.keys(itemDecisions.value).map(key => ({
    itemId: parseInt(key),
    status: itemDecisions.value[key] || 5
  }));

  const payload = {
    items: itemsPayload
  };

  isSubmitting.value = true;
  try {
    const result = await requestsStore.supervisorApproveExit(selectedRequest.value.id, authStore.user, payload);
    if (result.success) {
      showDetailsModal.value = false;
      await Promise.all([
        requestsStore.fetchExitRequests(),
        inventoryStore.fetchProducts(),
        inventoryStore.fetchCategories(),
        binStore.fetchBins(),
        loadAllInStockSerials()
      ]);
    } else {
      alert(result.message || "فشل الاعتماد المباشر للطلب.");
    }
  } finally {
    isSubmitting.value = false;
  }
}

function toggleItemDecision(itemId, status) {
  itemDecisions.value[itemId] = status;
}

function getItemDecision(itemId) {
  return itemDecisions.value[itemId] || 5;
}

// Submit decisions (Approve/Reject individual line items)
async function submitApprovalDecisions(isManager) {
  if (isSubmitting.value) return;
  const itemsPayload = Object.keys(itemDecisions.value).map(key => ({
    itemId: parseInt(key),
    status: itemDecisions.value[key]
  }));

  // Validate rejection reason if any item is rejected
  const anyRejected = itemsPayload.some(i => i.status === 4);
  if (anyRejected && !rejectionReason.value) {
    alert("يرجى إدخال سبب الرفض لوجود أصناف مرفوضة.");
    return;
  }

  const payload = {
    items: itemsPayload
  };

  isSubmitting.value = true;
  try {
    let result;
    if (isManager) {
      result = await requestsStore.managerApproveExit(selectedRequest.value.id, authStore.user, payload);
    } else {
      result = await requestsStore.supervisorApproveExit(selectedRequest.value.id, authStore.user, payload);
    }

    if (result.success) {
      showDetailsModal.value = false;
      await Promise.all([
        requestsStore.fetchExitRequests(),
        inventoryStore.fetchProducts(),
        inventoryStore.fetchCategories(),
        binStore.fetchBins(),
        loadAllInStockSerials()
      ]);
    } else {
      alert(result.message || "فشل تقديم قرارات الاعتماد.");
    }
  } finally {
    isSubmitting.value = false;
  }
}

async function rejectEntireRequest() {
  if (isSubmitting.value) return;
  if (!rejectionReason.value) {
    alert("يرجى إدخال سبب الرفض أولاً.");
    return;
  }
  isSubmitting.value = true;
  try {
    const result = await requestsStore.rejectExitRequest(selectedRequest.value.id, rejectionReason.value, authStore.user);
    if (result.success) {
      showDetailsModal.value = false;
      await requestsStore.fetchExitRequests();
      await inventoryStore.fetchProducts();
      await loadAllInStockSerials();
    } else {
      alert(result.message || "فشل رفض الطلب");
    }
  } finally {
    isSubmitting.value = false;
  }
}

const tabs = computed(() => [
  { id: "all", name: "جميع الطلبات", count: requestsStore.exitRequests.length },
  { id: "pending", name: "قيد الانتظار (مرحلة 1)", count: requestsStore.exitRequests.filter(r => r.status === 1).length },
  { id: "managerApproved", name: "موافقة المدير (مرحلة 2)", count: requestsStore.exitRequests.filter(r => r.status === 3).length },
  { id: "supervisorApproved", name: "مكتمل وموثق نهائياً", count: requestsStore.exitRequests.filter(r => r.status === 2).length },
  { id: "rejected", name: "مرفوض", count: requestsStore.exitRequests.filter(r => r.status === 4).length }
]);

const filteredRequests = computed(() => {
  if (activeTab.value === "pending") return requestsStore.exitRequests.filter(r => r.status === 1);
  if (activeTab.value === "managerApproved") return requestsStore.exitRequests.filter(r => r.status === 3);
  if (activeTab.value === "supervisorApproved") return requestsStore.exitRequests.filter(r => r.status === 2);
  if (activeTab.value === "rejected") return requestsStore.exitRequests.filter(r => r.status === 4);
  return requestsStore.exitRequests;
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
  return approvalConfigStore.configs.some(c => c.isActive && c.requestType === 2 && c.userGroupId === userGroupId && c.workflowRole === 2);
});

const canApproveAsSupervisor = computed(() => {
  if (authStore.isAdmin) return true;
  const userGroupId = authStore.user?.userGroupId || authStore.user?.userGroup?.id;
  if (!userGroupId) return false;
  return approvalConfigStore.configs.some(c => c.isActive && c.requestType === 2 && c.userGroupId === userGroupId && c.workflowRole === 3);
});
</script>

<style scoped>
#exit-qr-reader {
  width: 100% !important;
}
#exit-qr-reader video {
  object-fit: cover !important;
}
</style>
