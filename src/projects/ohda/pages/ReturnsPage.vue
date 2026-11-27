<template>
  <div class="space-y-6">
    <!-- ==================== VIEW 1: RETURNS LIST ==================== -->
    <template v-if="viewMode === 'list'">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-brand-white dark:bg-brand-dark p-6 rounded-3xl border border-brand-gray/15 shadow-xs">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-brand-soft dark:bg-brand-accent/15 text-brand-accent flex items-center justify-center border border-brand-accent/20 shrink-0">
            <RotateCcw class="w-6 h-6" />
          </div>
          <div>
            <h1 class="text-xl font-bold text-brand-dark dark:text-white">المرتجعات وإشعارات الدائن (عملاء وموردين)</h1>
            <p class="text-xs text-brand-gray mt-0.5">
              كل مرتجع مربوط بمستند البيع أو الشراء الأصلي — يدعم قطع الغيار والخدمات والمصنعيات ومسح الـ QR والسيريال
            </p>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <button
            type="button"
            @click="openSupplierReturnPage"
            class="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <ArrowUpRight class="w-4 h-4" />
            <span>مرتجع فاتورة شراء لمورد</span>
          </button>

          <button
            type="button"
            @click="openCustomerReturnPage()"
            class="px-5 py-2.5 bg-brand-accent hover:bg-brand-accent/90 text-brand-dark font-bold rounded-2xl text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <ArrowDownLeft class="w-4 h-4" />
            <span>+ مرتجع عميل (من فاتورة أو QR)</span>
          </button>
        </div>
      </div>

      <!-- Tabs Bar -->
      <div class="flex items-center gap-2 border-b border-brand-gray/15 pb-2">
        <button
          type="button"
          @click="activeTab = 2; onTabChange()"
          class="px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2"
          :class="activeTab === 2 ? 'bg-brand-soft text-brand-accent border border-brand-accent/30' : 'text-brand-gray'"
        >
          <ArrowDownLeft class="w-4 h-4" />
          <span>مرتجعات العملاء وإشعارات الدائن</span>
        </button>

        <button
          type="button"
          @click="activeTab = 1; onTabChange()"
          class="px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2"
          :class="activeTab === 1 ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30' : 'text-brand-gray'"
        >
          <ArrowUpRight class="w-4 h-4" />
          <span>مرتجعات الموردين</span>
        </button>
      </div>

      <OhdaDataTable
        :columns="tableColumns"
        :items="returnStore.returns"
        :loading="returnStore.loading"
        :rowsPerPage="12"
        emptyTitle="لا توجد مرتجعات مسجلة"
        emptyMessage="لا توجد مرتجعات في هذا التصنيف حتى الآن."
        :emptyIcon="RotateCcw"
      >
        <template #returnNumber="{ data }">
          <span class="font-mono font-bold text-brand-accent">{{ data.returnNumber }}</span>
        </template>

        <template #partyName="{ data }">
          <div>
            <span class="font-semibold block">{{ data.returnType === 1 ? data.supplierName : data.clientName }}</span>
            <span class="font-mono text-[10px] text-brand-gray">
              {{ data.returnType === 1 ? `فاتورة شراء: ${data.originalPurchaseInvoiceNumber || '-'}` : `فاتورة أصلية: ${data.originalJobCardNumber || data.originalPosInvoiceNumber || '-'}` }}
            </span>
          </div>
        </template>

        <template #returnDate="{ data }">
          <span class="font-mono text-xs">{{ formatDate(data.returnDate) }}</span>
        </template>

        <template #totalAmount="{ data }">
          <span class="font-mono font-bold text-red-600">{{ formatCurrency(data.totalAmount) }} ج.م</span>
        </template>

        <template #refundMethod="{ data }">
          <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-brand-light dark:bg-white/10 text-brand-dark dark:text-white border border-brand-gray/20">
            {{ data.refundMethodArabic }}
          </span>
        </template>

        <template #actions="{ data }">
          <div class="flex items-center justify-center gap-1">
            <button
              type="button"
              @click="viewDetails(data)"
              class="p-1.5 rounded-lg hover:bg-brand-light dark:hover:bg-white/10 cursor-pointer"
              title="عرض وطباعة إشعار الدائن"
            >
              <Printer class="w-4 h-4 text-brand-accent" />
            </button>
          </div>
        </template>
      </OhdaDataTable>
    </template>

    <!-- ==================== VIEW 2: CUSTOMER RETURN FROM ORIGINAL INVOICE ==================== -->
    <template v-else-if="viewMode === 'customer-create'">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-brand-white dark:bg-brand-dark p-5 rounded-3xl border border-brand-gray/15 shadow-xs">
        <div class="flex items-center gap-3">
          <button type="button" @click="viewMode = 'list'" class="p-2.5 rounded-xl border border-brand-gray/20 cursor-pointer">
            <ArrowRight class="w-4 h-4" />
          </button>
          <div>
            <h1 class="text-lg font-bold text-brand-dark dark:text-white">إنشاء مرتجع عميل / إشعار دائن من فاتورة أصلية</h1>
            <p class="text-xs text-brand-gray">ابحث برمز الـ QR للفاتورة، أو سيريال القطعة، أو اسم العميل / الهاتف / اللوحة لإظهار كافة بنود الفاتورة</p>
          </div>
        </div>
      </div>

      <!-- Universal Scan & Invoice Finder -->
      <div class="bg-brand-white dark:bg-brand-dark p-5 rounded-3xl border border-brand-gray/15 shadow-xs space-y-4">
        <div class="flex flex-col sm:flex-row gap-3">
          <div class="relative flex-1">
            <QrCode class="w-5 h-5 text-brand-accent absolute start-3 top-1/2 -translate-y-1/2" />
            <input
              v-model="invoiceSearchQuery"
              @keydown.enter.prevent="searchCustomerInvoices"
              type="text"
              placeholder="امسح QR الفاتورة، أو السيريال، أو رقم الفاتورة، أو اسم/هاتف/لوحة العميل..."
              class="w-full ps-11 pe-4 py-3 rounded-2xl border border-brand-accent/40 bg-brand-accent/5 text-sm font-semibold text-brand-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-accent"
              autofocus
            />
          </div>
          <button
            type="button"
            @click="searchCustomerInvoices"
            :disabled="searchingInvoices"
            class="px-6 py-3 rounded-2xl bg-brand-accent text-brand-dark font-bold text-xs cursor-pointer shrink-0"
          >
            {{ searchingInvoices ? 'جاري البحث...' : 'بحث عن الفاتورة' }}
          </button>
        </div>

        <!-- Invoice Candidates List -->
        <div v-if="foundInvoices.length > 0 && !selectedInvoice" class="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          <div
            v-for="inv in foundInvoices"
            :key="inv.sourceType + '-' + inv.documentId"
            @click="selectOriginalInvoice(inv)"
            class="p-4 rounded-2xl border border-brand-gray/20 hover:border-brand-accent bg-brand-light/40 dark:bg-white/5 cursor-pointer transition-all flex items-center justify-between gap-3"
          >
            <div class="space-y-1 text-xs">
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 rounded text-[10px] font-bold" :class="inv.sourceType === 'JobCard' ? 'bg-blue-500/15 text-blue-700' : 'bg-emerald-500/15 text-emerald-700'">
                  {{ inv.sourceType === 'JobCard' ? 'أمر شغل' : 'فاتورة كاشير POS' }}
                </span>
                <span class="font-mono font-bold text-brand-accent">{{ inv.documentNumber }}</span>
                <span v-if="inv.isOutsideReturnWindow" class="px-2 py-0.5 rounded bg-red-500/15 text-red-600 text-[10px] font-bold">تجاوز مهلة الإرجاع</span>
              </div>
              <div class="font-bold text-brand-dark dark:text-white">
                {{ inv.clientName }} {{ inv.clientPhone ? `• ${inv.clientPhone}` : '' }} {{ inv.carPlate ? `• لوحة ${inv.carPlate}` : '' }}
              </div>
              <div class="text-[11px] text-brand-gray font-mono">التاريخ: {{ formatDate(inv.invoiceDate) }}</div>
            </div>
            <div class="text-left font-mono text-xs shrink-0">
              <div class="font-bold text-sm">{{ formatCurrency(inv.totalAmount) }} ج.م</div>
              <div v-if="inv.remainingBalance > 0" class="text-[10px] text-amber-600">متبقي: {{ formatCurrency(inv.remainingBalance) }}</div>
              <span class="text-brand-accent text-[11px] font-bold block mt-1">اختيار &larr;</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Selected Invoice Lines (Services + Products) -->
      <div v-if="selectedInvoice" class="space-y-5">
        <div class="bg-brand-white dark:bg-brand-dark p-5 rounded-3xl border border-brand-accent/30 shadow-xs space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-brand-gray/10 pb-3 text-xs">
            <div>
              <span class="text-brand-gray">الفاتورة المختارة:</span>
              <strong class="font-mono text-base text-brand-accent ms-2">{{ selectedInvoice.documentNumber }}</strong>
              <span class="ms-3 font-bold">{{ selectedInvoice.clientName }}</span>
              <span v-if="selectedInvoice.isOutsideReturnWindow" class="ms-2 px-2 py-0.5 rounded bg-red-500/15 text-red-600 font-bold">
                ⚠️ تنبيه: الفاتورة مر عليها {{ selectedInvoice.daysSinceInvoice }} يوماً (يتطلب صلاحية مدير)
              </span>
            </div>
            <button type="button" @click="selectedInvoice = null" class="px-3 py-1 rounded-lg bg-black/5 dark:bg-white/10 font-semibold cursor-pointer">
              تغيير الفاتورة
            </button>
          </div>

          <!-- All Lines Table (Services & Products) -->
          <div class="space-y-3">
            <div
              v-for="(line, idx) in returnLinesForm"
              :key="idx"
              class="p-4 rounded-2xl border transition-all text-xs space-y-3"
              :class="line.selected ? 'border-brand-accent bg-brand-accent/5' : 'border-brand-gray/15 bg-brand-light/30 dark:bg-white/5 opacity-80'"
            >
              <div class="flex flex-wrap items-center justify-between gap-3">
                <label class="flex items-center gap-2.5 cursor-pointer font-bold">
                  <input
                    type="checkbox"
                    v-model="line.selected"
                    :disabled="line.remainingReturnableAmount <= 0"
                    class="w-4 h-4 rounded text-brand-accent"
                  />
                  <span
                    class="px-2 py-0.5 rounded text-[10px] font-bold"
                    :class="line.lineType === 2 ? 'bg-purple-500/15 text-purple-700' : 'bg-blue-500/15 text-blue-700'"
                  >
                    {{ line.lineType === 2 ? 'خدمة / مصنعية' : 'صنف / قطعة غيار' }}
                  </span>
                  <span class="text-sm text-brand-dark dark:text-white">{{ line.description }}</span>
                </label>

                <div class="font-mono text-xs text-brand-gray">
                  الأصل: {{ line.lineType === 2 ? formatCurrency(line.originalTotalAmount) + ' ج.م' : `${line.originalQuantity} ${line.unit} × ${formatCurrency(line.unitPrice)}` }}
                  | المتاح للإرجاع: <strong class="text-emerald-600">{{ line.lineType === 2 ? formatCurrency(line.remainingReturnableAmount) + ' ج.م' : `${line.remainingReturnableQuantity} ${line.unit}` }}</strong>
                </div>
              </div>

              <!-- Controls when line is selected -->
              <div v-if="line.selected" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-brand-gray/10">
                <!-- Qty (for Product) or Amount (for Service / Price adjustment) -->
                <div v-if="line.lineType === 1">
                  <label class="block text-brand-gray mb-1">الكمية المرتجعة (أقصى: {{ line.remainingReturnableQuantity }})</label>
                  <input
                    v-model.number="line.returnQuantity"
                    type="number"
                    min="0.01"
                    :max="line.remainingReturnableQuantity"
                    step="any"
                    class="w-full px-3 py-2 rounded-xl border border-brand-gray/25 bg-white dark:bg-slate-900 font-mono font-bold text-center"
                  />
                </div>
                <div v-else>
                  <label class="block text-brand-gray mb-1">مبلغ الخصم / الاسترجاع من الخدمة (أقصى: {{ line.remainingReturnableAmount }})</label>
                  <input
                    v-model.number="line.returnAmount"
                    type="number"
                    min="0.01"
                    :max="line.remainingReturnableAmount"
                    step="0.01"
                    class="w-full px-3 py-2 rounded-xl border border-brand-gray/25 bg-white dark:bg-slate-900 font-mono font-bold text-center"
                  />
                </div>

                <div>
                  <label class="block text-brand-gray mb-1">سبب الإرجاع</label>
                  <select v-model="line.reason" class="w-full px-3 py-2 rounded-xl border border-brand-gray/25 bg-white dark:bg-slate-900">
                    <option value="تالف / عيب بالصنف">تالف / عيب بالصنف</option>
                    <option value="صنف غير مطابق / خطأ">صنف غير مطابق / خطأ</option>
                    <option value="عدول العميل عن الشراء">عدول العميل عن الشراء</option>
                    <option value="شكوى عميل / إعادة خدمة">شكوى عميل / إعادة خدمة</option>
                    <option value="تعديل أو تسوية سعر">تعديل أو تسوية سعر</option>
                    <option value="أخرى">أخرى</option>
                  </select>
                </div>

                <div v-if="line.lineType === 1" class="flex items-center pt-4">
                  <label class="flex items-center gap-2 cursor-pointer font-bold">
                    <input type="checkbox" v-model="line.restockToInventory" class="rounded text-brand-accent" />
                    <span>إرجاع القطعة لرصيد المخزن (سليمة)</span>
                  </label>
                </div>

                <div>
                  <label class="block text-brand-gray mb-1">قيمة المرتجع للبند</label>
                  <div class="px-3 py-2 rounded-xl bg-red-500/10 text-red-600 font-mono font-bold text-center">
                    {{ formatCurrency(getLineReturnValue(line)) }} ج.م
                  </div>
                </div>

                <!-- Serial Picker for Serialized Products -->
                <div v-if="line.lineType === 1 && line.trackSerialNumbers && line.soldSerials.length > 0" class="sm:col-span-2 lg:col-span-4 bg-blue-500/5 p-3 rounded-xl border border-blue-500/20">
                  <label class="block font-bold mb-1.5 text-blue-700 dark:text-blue-300">اختر الأرقام التسلسلية المسترجعة:</label>
                  <div class="flex flex-wrap gap-2">
                    <label
                      v-for="sn in line.soldSerials"
                      :key="sn"
                      class="px-2.5 py-1 rounded-lg border font-mono cursor-pointer text-[11px]"
                      :class="line.selectedSerials.includes(sn) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-slate-900 border-brand-gray/25'"
                    >
                      <input type="checkbox" :value="sn" v-model="line.selectedSerials" class="hidden" />
                      <span>{{ sn }}</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Refund Settlement Split Box -->
          <div class="p-5 rounded-2xl bg-brand-light/60 dark:bg-white/5 border border-brand-gray/15 space-y-4 text-xs">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
              <div class="p-3 rounded-xl bg-white dark:bg-slate-900 border border-brand-gray/10">
                <span class="text-brand-gray block text-[10px]">إجمالي قيمة المرتجع</span>
                <span class="font-bold text-base text-red-600">{{ formatCurrency(customerReturnTotal) }} ج.م</span>
              </div>
              <div class="p-3 rounded-xl bg-white dark:bg-slate-900 border border-brand-gray/10">
                <span class="text-brand-gray block text-[10px]">يُخصم أولاً من المتبقي غير المسدد بالفاتورة</span>
                <span class="font-bold text-base text-amber-600">{{ formatCurrency(unpaidAppliedPreview) }} ج.م</span>
              </div>
              <div class="p-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-500/30">
                <span class="text-brand-gray block text-[10px]">الصافي المستحق رده للعميل</span>
                <span class="font-bold text-base text-emerald-600">{{ formatCurrency(netRefundDuePreview) }} ج.م</span>
              </div>
            </div>

            <div v-if="netRefundDuePreview > 0" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block font-bold mb-1">طريقة رد الصافي للعميل</label>
                <select v-model.number="customerRefundMethod" class="w-full px-3 py-2 rounded-xl border border-brand-gray/25 bg-white dark:bg-slate-900">
                  <option :value="2">استرداد نقدي / بنكي فوري</option>
                  <option :value="1">إضافة كرصيد دائن في حساب العميل</option>
                </select>
              </div>
              <div v-if="customerRefundMethod === 2">
                <label class="block font-bold mb-1">قناة الدفع</label>
                <select v-model.number="customerPaymentChannel" class="w-full px-3 py-2 rounded-xl border border-brand-gray/25 bg-white dark:bg-slate-900">
                  <option :value="1">كاش (من درج النقدية المفتوح)</option>
                  <option :value="3">إنستاباي (InstaPay)</option>
                  <option :value="4">تحويل بنكي</option>
                </select>
              </div>
            </div>

            <div class="flex justify-end gap-3 pt-2">
              <button type="button" @click="viewMode = 'list'" class="px-4 py-2.5 rounded-xl border border-brand-gray/25 font-semibold cursor-pointer">
                إلغاء
              </button>
              <button
                type="button"
                @click="submitCustomerReturn"
                :disabled="submitting || customerReturnTotal <= 0"
                class="px-6 py-2.5 rounded-xl bg-brand-accent text-brand-dark font-extrabold shadow-sm cursor-pointer disabled:opacity-50"
              >
                {{ submitting ? 'جاري التنفيذ...' : 'اعتماد المرتجع وإصدار إشعار الدائن' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- ==================== VIEW 3: SUPPLIER RETURN FROM ORIGINAL PURCHASE ==================== -->
    <template v-else-if="viewMode === 'supplier-create'">
      <div class="flex items-center gap-3 bg-brand-white dark:bg-brand-dark p-5 rounded-3xl border border-brand-gray/15 shadow-xs">
        <button type="button" @click="viewMode = 'list'" class="p-2.5 rounded-xl border border-brand-gray/20 cursor-pointer">
          <ArrowRight class="w-4 h-4" />
        </button>
        <div>
          <h1 class="text-lg font-bold text-brand-dark dark:text-white">مرتجع مشتريات لمورد (مربوط بفاتورة الشراء ودفعاتها)</h1>
          <p class="text-xs text-brand-gray">اختر فاتورة الشراء الأصلية ليتم الخصم من دفعاتها وتحديد السيريالات بدقة</p>
        </div>
      </div>

      <div class="bg-brand-white dark:bg-brand-dark p-5 rounded-3xl border border-brand-gray/15 shadow-xs space-y-4 text-xs">
        <div class="flex gap-3">
          <input
            v-model="purchaseSearchQuery"
            @keydown.enter.prevent="searchSupplierPurchases"
            type="text"
            placeholder="ابحث برقم فاتورة الشراء أو اسم المورد..."
            class="flex-1 px-4 py-2.5 rounded-xl border border-brand-gray/25 bg-brand-light dark:bg-white/5"
          />
          <button type="button" @click="searchSupplierPurchases" class="px-5 py-2.5 rounded-xl bg-amber-500 text-white font-bold cursor-pointer">
            بحث
          </button>
        </div>

        <div v-if="!selectedPurchase && foundPurchases.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div
            v-for="p in foundPurchases"
            :key="p.purchaseId"
            @click="selectPurchaseForReturn(p)"
            class="p-4 rounded-2xl border border-brand-gray/20 hover:border-amber-500 cursor-pointer flex items-center justify-between"
          >
            <div>
              <div class="font-mono font-bold text-amber-600">{{ p.invoiceNumber }}</div>
              <div class="font-bold text-brand-dark dark:text-white">{{ p.supplierName }}</div>
              <div class="text-[11px] text-brand-gray">{{ formatDate(p.purchaseDate) }} • {{ p.items.length }} دفعات متاحة</div>
            </div>
            <span class="font-bold text-amber-600">اختيار &larr;</span>
          </div>
        </div>

        <div v-if="selectedPurchase" class="space-y-4 pt-2">
          <div class="flex items-center justify-between border-b border-brand-gray/10 pb-2">
            <div>
              <strong>فاتورة الشراء: {{ selectedPurchase.invoiceNumber }}</strong> — المورد: <strong>{{ selectedPurchase.supplierName }}</strong>
            </div>
            <button type="button" @click="selectedPurchase = null" class="px-3 py-1 rounded-lg bg-black/5 cursor-pointer">تغيير الفاتورة</button>
          </div>

          <div v-for="(line, idx) in supplierReturnLines" :key="idx" class="p-3.5 rounded-xl border border-brand-gray/15 space-y-2">
            <label class="flex items-center justify-between cursor-pointer font-bold">
              <div class="flex items-center gap-2">
                <input type="checkbox" v-model="line.selected" class="rounded text-amber-600" />
                <span>{{ line.productName }} (دفعة {{ line.batchCode }})</span>
              </div>
              <span class="font-mono text-emerald-600">متاح بالدفعة: {{ line.batchRemaining }} {{ line.unit }} | تكلفة: {{ formatCurrency(line.costPerBaseUnit) }}</span>
            </label>
            <div v-if="line.selected" class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div>
                <label class="block text-brand-gray mb-1">الكمية المرتجعة (أقصى: {{ line.batchRemaining }})</label>
                <input v-model.number="line.returnQuantity" type="number" min="0.01" :max="line.batchRemaining" step="any" class="w-full px-3 py-1.5 rounded-lg border font-mono font-bold text-center" />
              </div>
              <div>
                <label class="block text-brand-gray mb-1">سعر الإرجاع للوحدة (ج.م)</label>
                <input v-model.number="line.unitPrice" type="number" min="0" step="0.01" class="w-full px-3 py-1.5 rounded-lg border font-mono text-center" />
              </div>
              <div>
                <label class="block text-brand-gray mb-1">الإجمالي</label>
                <div class="px-3 py-1.5 rounded-lg bg-amber-500/10 font-mono font-bold text-center text-amber-700">
                  {{ formatCurrency(line.returnQuantity * line.unitPrice) }} ج.م
                </div>
              </div>
              <div v-if="line.trackSerialNumbers && line.availableSerials.length" class="sm:col-span-3">
                <span class="block font-bold mb-1">اختر السيريالات المرتجعة للمورد:</span>
                <div class="flex flex-wrap gap-1.5">
                  <label
                    v-for="sn in line.availableSerials"
                    :key="sn"
                    class="px-2 py-1 rounded border font-mono text-[11px] cursor-pointer"
                    :class="line.selectedSerials.includes(sn) ? 'bg-amber-600 text-white border-amber-600' : 'bg-white dark:bg-slate-900'"
                  >
                    <input type="checkbox" :value="sn" v-model="line.selectedSerials" class="hidden" />
                    <span>{{ sn }}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label class="block font-bold mb-1">طريقة التسوية مع المورد</label>
              <select v-model.number="supplierRefundMethod" class="w-full px-3 py-2 rounded-xl border border-brand-gray/25">
                <option :value="1">خصم من رصيد مديونية المورد</option>
                <option :value="2">استرداد نقدي من المورد للخزينة</option>
              </select>
            </div>
            <div>
              <label class="block font-bold mb-1">السبب</label>
              <input v-model="supplierReturnReason" placeholder="عيب تصنيع، زيادة عن الطلب..." class="w-full px-3 py-2 rounded-xl border border-brand-gray/25" />
            </div>
          </div>

          <div class="flex justify-end gap-3 pt-2">
            <button type="button" @click="submitSupplierReturn" :disabled="submitting" class="px-6 py-2.5 rounded-xl bg-amber-600 text-white font-bold cursor-pointer">
              {{ submitting ? 'جاري التنفيذ...' : 'اعتماد مرتجع المورد' }}
            </button>
          </div>
        </div>
      </div>
    </template>

    <!-- Credit Note Print Modal (A4 / 80mm + QR) -->
    <OhdaModal
      v-model:visible="showDetailsModal"
      :title="`إشعار دائن / مستند مرتجع #${selectedReturn?.returnNumber || ''}`"
      :description="`${selectedReturn?.returnTypeArabic} - ${formatDate(selectedReturn?.returnDate)}`"
      :icon="Printer"
      maxWidth="max-w-3xl"
    >
      <div v-if="selectedReturn" class="space-y-4">
        <div class="flex gap-2 pb-2 border-b border-brand-gray/15 print:hidden">
          <button type="button" @click="creditPrintMode = 'a4'" class="px-3 py-1 rounded-lg text-xs font-bold border cursor-pointer" :class="creditPrintMode === 'a4' ? 'bg-brand-accent text-brand-dark' : ''">
            طباعة A4
          </button>
          <button type="button" @click="creditPrintMode = 'receipt'" class="px-3 py-1 rounded-lg text-xs font-bold border cursor-pointer" :class="creditPrintMode === 'receipt' ? 'bg-brand-accent text-brand-dark' : ''">
            إيصال حراري 80mm
          </button>
        </div>

        <div id="creditNotePrintArea" class="bg-white text-black p-5 rounded-xl border border-gray-200 text-xs space-y-4" :class="creditPrintMode === 'receipt' ? 'max-w-xs mx-auto font-mono' : ''">
          <div class="flex justify-between items-start border-b pb-3">
            <div>
              <h2 class="text-base font-bold">{{ selectedReturn.returnType === 1 ? 'إشعار مرتجع مورد' : 'إشعار دائن ومرتجع مبيعات' }}</h2>
              <p class="font-mono font-bold text-sm mt-1">{{ selectedReturn.returnNumber }}</p>
              <p class="text-[11px] text-gray-500">التاريخ: {{ formatDate(selectedReturn.returnDate) }}</p>
            </div>
            <QrCodeCanvas v-if="selectedReturn.documentToken" :value="selectedReturn.documentToken" :size="68" />
          </div>

          <div class="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-lg">
            <div>
              <span class="text-gray-400 block text-[10px]">الطرف:</span>
              <strong>{{ selectedReturn.returnType === 1 ? selectedReturn.supplierName : selectedReturn.clientName }}</strong>
            </div>
            <div>
              <span class="text-gray-400 block text-[10px]">المستند الأصلي:</span>
              <strong class="font-mono">{{ selectedReturn.originalJobCardNumber || selectedReturn.originalPosInvoiceNumber || selectedReturn.originalPurchaseInvoiceNumber || '—' }}</strong>
            </div>
          </div>

          <table class="w-full text-right text-xs border-collapse">
            <thead>
              <tr class="border-b border-gray-300 text-gray-600">
                <th class="py-1.5">النوع</th>
                <th class="py-1.5">البند</th>
                <th class="py-1.5 text-center">الكمية</th>
                <th class="py-1.5 text-end">الإجمالي</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="item in selectedReturn.items" :key="item.id">
                <td class="py-1.5 text-[10px]">{{ item.lineTypeArabic }}</td>
                <td class="py-1.5 font-semibold">{{ item.description || item.productName }}</td>
                <td class="py-1.5 text-center font-mono">{{ item.quantity }} {{ item.unit }}</td>
                <td class="py-1.5 text-end font-mono font-bold">{{ formatCurrency(item.totalPrice) }} ج.م</td>
              </tr>
            </tbody>
          </table>

          <div class="border-t pt-3 space-y-1 font-mono">
            <div class="flex justify-between font-bold text-sm">
              <span>إجمالي قيمة المرتجع:</span>
              <span class="text-red-600">{{ formatCurrency(selectedReturn.totalAmount) }} ج.م</span>
            </div>
            <div v-if="selectedReturn.unpaidBalanceApplied > 0" class="flex justify-between text-amber-700">
              <span>تسوية من متبقي الفاتورة:</span>
              <span>{{ formatCurrency(selectedReturn.unpaidBalanceApplied) }} ج.م</span>
            </div>
            <div class="flex justify-between text-emerald-700 font-bold">
              <span>صافي المسترد / الرصيد الدائن:</span>
              <span>{{ formatCurrency(selectedReturn.cashOrBalanceRefunded) }} ج.م ({{ selectedReturn.refundMethodArabic }})</span>
            </div>
          </div>
        </div>
      </div>

      <template #footer="{ close }">
        <button type="button" @click="close" class="px-4 py-2 bg-brand-light dark:bg-white/10 rounded-xl text-xs font-semibold cursor-pointer">إغلاق</button>
        <button
          v-if="selectedReturn?.id"
          type="button"
          @click="downloadServerPdf(`/api/ReportsPdf/return/${selectedReturn.id}?paperSize=${creditPrintMode === 'receipt' ? 'Thermal80mm' : 'A4'}`, `Return_${selectedReturn.returnNumber || 'note'}.pdf`)"
          class="px-4 py-2 bg-rose-600/15 text-rose-700 dark:text-rose-300 border border-rose-500/30 rounded-xl text-xs font-bold cursor-pointer"
        >
          تنزيل PDF
        </button>
        <button type="button" @click="printWindow" class="px-5 py-2 bg-brand-accent text-brand-dark rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer">
          <Printer class="w-4 h-4" />
          <span>طباعة إشعار الدائن</span>
        </button>
      </template>
    </OhdaModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useToast } from "primevue/usetoast";
import { useOhdaReturnStore } from "../stores/useOhdaReturnStore";
import OhdaDataTable from "../components/OhdaDataTable.vue";
import OhdaModal from "../components/OhdaModal.vue";
import QrCodeCanvas from "../components/QrCodeCanvas.vue";
import { downloadServerPdf, printServerPdf } from "../utils/pdfHelper";
import { RotateCcw, ArrowUpRight, ArrowDownLeft, ArrowRight, QrCode, Printer } from "lucide-vue-next";

const route = useRoute();
const toast = useToast();
const returnStore = useOhdaReturnStore();

const viewMode = ref("list"); // "list" | "customer-create" | "supplier-create"
const activeTab = ref(2);
const showDetailsModal = ref(false);
const selectedReturn = ref(null);
const creditPrintMode = ref("a4");
const submitting = ref(false);

// Customer Return State
const invoiceSearchQuery = ref("");
const searchingInvoices = ref(false);
const foundInvoices = ref([]);
const selectedInvoice = ref(null);
const returnLinesForm = ref([]);
const customerRefundMethod = ref(2);
const customerPaymentChannel = ref(1);

// Supplier Return State
const purchaseSearchQuery = ref("");
const foundPurchases = ref([]);
const selectedPurchase = ref(null);
const supplierReturnLines = ref([]);
const supplierRefundMethod = ref(1);
const supplierReturnReason = ref("");

const tableColumns = [
  { field: "returnNumber", header: "رقم المرتجع", width: "160px", sortable: true },
  { field: "returnDate", header: "تاريخ المرتجع", width: "120px", sortable: true },
  { field: "partyName", header: "الطرف والمستند الأصلي", sortable: true },
  { field: "totalAmount", header: "قيمة المرتجع", width: "130px", align: "center", sortable: true },
  { field: "refundMethod", header: "طريقة الرد", width: "180px", align: "center" },
  { field: "actions", header: "طباعة", width: "80px", align: "center" }
];

onMounted(async () => {
  await returnStore.fetchReturns(activeTab.value);
  // Auto-handle deep link from Global Search QR token or Serial scan
  if (route.query.token || route.query.serial) {
    invoiceSearchQuery.value = String(route.query.token || route.query.serial);
    await openCustomerReturnPage(invoiceSearchQuery.value);
  }
});

function onTabChange() {
  returnStore.fetchReturns(activeTab.value);
}

async function openCustomerReturnPage(prefillQuery = "") {
  viewMode.value = "customer-create";
  selectedInvoice.value = null;
  invoiceSearchQuery.value = prefillQuery;
  await searchCustomerInvoices();
}

async function searchCustomerInvoices() {
  searchingInvoices.value = true;
  foundInvoices.value = await returnStore.findInvoicesForReturn(invoiceSearchQuery.value);
  searchingInvoices.value = false;
  if (foundInvoices.value.length === 1 && invoiceSearchQuery.value.trim()) {
    selectOriginalInvoice(foundInvoices.value[0]);
  }
}

function selectOriginalInvoice(inv) {
  selectedInvoice.value = inv;
  returnLinesForm.value = (inv.lines || []).map(l => ({
    ...l,
    selected: false,
    returnQuantity: l.remainingReturnableQuantity > 0 ? l.remainingReturnableQuantity : 0,
    returnAmount: l.remainingReturnableAmount > 0 ? l.remainingReturnableAmount : 0,
    restockToInventory: true,
    reason: l.lineType === 2 ? "شكوى عميل / إعادة خدمة" : "تالف / عيب بالصنف",
    selectedSerials: []
  }));
}

function getLineReturnValue(line) {
  if (!line.selected) return 0;
  if (line.lineType === 2) return Number(line.returnAmount) || 0;
  return (Number(line.returnQuantity) || 0) * (Number(line.unitPrice) || 0);
}

const customerReturnTotal = computed(() =>
  returnLinesForm.value.reduce((s, l) => s + getLineReturnValue(l), 0)
);

const unpaidAppliedPreview = computed(() => {
  if (!selectedInvoice.value) return 0;
  return Math.min(selectedInvoice.value.remainingBalance || 0, customerReturnTotal.value);
});

const netRefundDuePreview = computed(() =>
  Math.max(0, customerReturnTotal.value - unpaidAppliedPreview.value)
);

async function submitCustomerReturn() {
  const chosen = returnLinesForm.value.filter(l => l.selected);
  if (!chosen.length) {
    toast.add({ severity: "warn", summary: "تنبيه", detail: "اختر بنداً واحداً على الأقل للاسترجاع", life: 3000 });
    return;
  }

  submitting.value = true;
  const payload = {
    returnType: 2,
    clientId: selectedInvoice.value.clientId,
    originalJobCardId: selectedInvoice.value.sourceType === "JobCard" ? selectedInvoice.value.documentId : null,
    originalPosInvoiceId: selectedInvoice.value.sourceType === "PosInvoice" ? selectedInvoice.value.documentId : null,
    refundMethod: customerRefundMethod.value,
    paymentChannel: customerPaymentChannel.value,
    reason: chosen[0]?.reason || "مرتجع عميل",
    items: chosen.map(l => ({
      lineType: l.lineType,
      productId: l.productId,
      batchId: l.batchId,
      jobCardProductId: l.jobCardProductId,
      jobCardServiceId: l.jobCardServiceId,
      posInvoiceItemId: l.posInvoiceItemId,
      description: l.description,
      quantity: l.lineType === 2 ? 1 : Number(l.returnQuantity),
      unitPrice: l.lineType === 2 ? Number(l.returnAmount) : Number(l.unitPrice),
      returnAmountOverride: l.lineType === 2 ? Number(l.returnAmount) : null,
      restockToInventory: l.lineType === 1 ? l.restockToInventory : false,
      serialNumbers: l.selectedSerials || [],
      reason: l.reason
    }))
  };

  const res = await returnStore.createReturn(payload);
  submitting.value = false;
  if (res.success) {
    toast.add({ severity: "success", summary: "تم بنجاح", detail: res.message, life: 4500 });
    viewMode.value = "list";
    activeTab.value = 2;
    if (res.data) viewDetails(res.data);
  } else {
    toast.add({ severity: "error", summary: "فشل المرتجع", detail: res.message, life: 5000 });
  }
}

async function openSupplierReturnPage() {
  viewMode.value = "supplier-create";
  selectedPurchase.value = null;
  await searchSupplierPurchases();
}

async function searchSupplierPurchases() {
  foundPurchases.value = await returnStore.findPurchasesForReturn(purchaseSearchQuery.value);
}

function selectPurchaseForReturn(p) {
  selectedPurchase.value = p;
  supplierReturnLines.value = (p.items || []).map(it => ({
    ...it,
    selected: false,
    returnQuantity: 1,
    unitPrice: it.costPerBaseUnit,
    selectedSerials: []
  }));
}

async function submitSupplierReturn() {
  const chosen = supplierReturnLines.value.filter(l => l.selected && l.returnQuantity > 0);
  if (!chosen.length) {
    toast.add({ severity: "warn", summary: "تنبيه", detail: "اختر بنداً واحداً على الأقل", life: 3000 });
    return;
  }
  submitting.value = true;
  const res = await returnStore.createReturn({
    returnType: 1,
    supplierId: selectedPurchase.value.supplierId,
    originalPurchaseId: selectedPurchase.value.purchaseId,
    refundMethod: supplierRefundMethod.value,
    paymentChannel: 1,
    reason: supplierReturnReason.value || "مرتجع لمورد",
    items: chosen.map(l => ({
      lineType: 1,
      productId: l.productId,
      batchId: l.batchId,
      quantity: Number(l.returnQuantity),
      unitPrice: Number(l.unitPrice),
      serialNumbers: l.selectedSerials || []
    }))
  });
  submitting.value = false;
  if (res.success) {
    toast.add({ severity: "success", summary: "تم بنجاح", detail: res.message, life: 4000 });
    viewMode.value = "list";
    activeTab.value = 1;
  } else {
    toast.add({ severity: "error", summary: "خطأ", detail: res.message, life: 5000 });
  }
}

function viewDetails(r) {
  selectedReturn.value = r;
  showDetailsModal.value = true;
}

function printWindow() {
  if (!selectedReturn.value?.id) return;
  const paper = creditPrintMode.value === "receipt" ? "Thermal80mm" : "A4";
  printServerPdf(
    `/api/ReportsPdf/return/${selectedReturn.value.id}?paperSize=${paper}`,
    `Return_${selectedReturn.value.returnNumber || "note"}.pdf`
  );
}

function formatCurrency(val) {
  return Number(val || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(val) {
  if (!val) return "—";
  return new Date(val).toLocaleDateString("ar-EG", { year: "numeric", month: "short", day: "numeric" });
}
</script>
