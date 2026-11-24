<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-brand-white dark:bg-white/5 p-6 rounded-2xl border border-brand-gray/10 shadow-sm print:hidden">
      <div>
        <h1 class="text-2xl font-bold text-brand-dark dark:text-white flex items-center gap-3">
          <ShoppingCart class="w-7 h-7 text-brand-accent" />
          <span>نقطة بيع المنتجات وقطع الغيار (POS)</span>
        </h1>
        <p class="text-xs text-brand-gray dark:text-slate-400 mt-1">
          بيع مباشر وسريع لقطع الغيار والمستهلكات فقط (لا تشمل خدمات الورشة) مع التخصيص الفوري للدفعات (FIFO/FEFO) والطباعة الحرارية
        </p>
      </div>

      <!-- Header Shortcuts & Drawer Status -->
      <div class="flex items-center gap-3">
        <!-- Cash Drawer Status Badge -->
        <div
          v-if="financeStore.isDrawerOpen"
          class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold"
        >
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>درج النقدية مفتوح (جاهز للبيع)</span>
        </div>
        <div
          v-else
          class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold"
        >
          <AlertCircle class="w-4 h-4" />
          <span>درج النقدية مغلق - يلزم فتح الوردية</span>
        </div>

        <!-- Invoices History Switcher -->
        <button
          @click="activeView = activeView === 'pos' ? 'history' : 'pos'"
          class="px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-2"
          :class="activeView === 'history' ? 'bg-brand-accent text-brand-dark border-brand-accent' : 'bg-brand-light dark:bg-white/5 text-brand-dark dark:text-white border-brand-gray/20 hover:border-brand-accent'"
        >
          <Receipt class="w-4 h-4" />
          <span>{{ activeView === 'pos' ? 'سجل فواتير اليوم والمرتجعات' : 'العودة لشاشة البيع' }}</span>
        </button>
      </div>
    </div>

    <!-- VIEW 1: POS SCREEN -->
    <div v-if="activeView === 'pos'" class="grid grid-cols-1 lg:grid-cols-12 gap-6 print:hidden">
      <!-- LEFT: Cart & Scanner (Cols 8) -->
      <div class="lg:col-span-8 space-y-4">
        <!-- Barcode & Quick Search Bar -->
        <div class="bg-brand-white dark:bg-white/5 p-4 rounded-2xl border border-brand-gray/10 shadow-sm flex flex-col md:flex-row items-center gap-3">
          <!-- Barcode Reader Input -->
          <div class="relative flex-1 w-full">
            <Barcode class="w-5 h-5 absolute right-3 top-3 text-brand-accent" />
            <input
              ref="barcodeInputRef"
              v-model="barcodeQuery"
              @keydown.enter.prevent="handleBarcodeScan"
              type="text"
              placeholder="امسح الباركود هنا (أو اكتب واضغط Enter)..."
              class="w-full text-sm font-mono pr-11 pl-4 py-2.5 rounded-xl border border-brand-accent/40 bg-brand-accent/5 dark:bg-brand-accent/10 text-brand-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-accent transition-all placeholder:text-brand-gray/60"
            />
          </div>

          <!-- Product Name Quick Dropdown/Search -->
          <div class="relative w-full md:w-72">
            <Search class="w-4 h-4 absolute right-3 top-3 text-brand-gray" />
            <input
              v-model="productSearchText"
              type="text"
              placeholder="بحث باسم الصنف أو الكود..."
              class="w-full text-xs pr-9 pl-3 py-2.5 rounded-xl border border-brand-gray/20 bg-transparent text-brand-dark dark:text-white focus:outline-none focus:border-brand-accent transition-all"
            />
            <!-- Search Results Dropdown -->
            <div
              v-if="filteredProductSearchResults.length > 0"
              class="absolute z-30 right-0 left-0 mt-1 bg-brand-white dark:bg-slate-800 border border-brand-gray/20 rounded-xl shadow-xl max-h-60 overflow-y-auto"
            >
              <div
                v-for="p in filteredProductSearchResults"
                :key="p.id"
                @click="addProductToCart(p)"
                class="p-2.5 hover:bg-brand-accent/10 dark:hover:bg-brand-accent/20 cursor-pointer border-b border-brand-gray/10 flex items-center justify-between text-xs transition-colors"
              >
                <div>
                  <div class="font-bold text-brand-dark dark:text-white">{{ p.name }}</div>
                  <div class="font-mono text-[10px] text-brand-gray">كود: {{ p.sku }} | المتوفر: {{ p.currentQuantity }} {{ p.unit || 'قطعة' }}</div>
                </div>
                <div class="text-left font-mono font-bold text-brand-accent">
                  {{ p.unitPrice }} ج.م
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Cart Items Table -->
        <div class="bg-brand-white dark:bg-white/5 rounded-2xl border border-brand-gray/10 shadow-sm overflow-hidden">
          <div class="p-4 border-b border-brand-gray/10 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <ShoppingCart class="w-4 h-4 text-brand-accent" />
              <span class="font-bold text-sm text-brand-dark dark:text-white">سلة المبيعات ({{ cartItems.length }} صنف)</span>
            </div>
            <button
              v-if="cartItems.length > 0"
              @click="clearCart"
              class="text-xs text-red-500 hover:text-red-700 font-semibold cursor-pointer flex items-center gap-1"
            >
              <Trash2 class="w-3.5 h-3.5" />
              <span>إفراغ السلة</span>
            </button>
          </div>

          <div v-if="cartItems.length === 0" class="p-12 text-center text-brand-gray">
            <ShoppingCart class="w-12 h-12 mx-auto mb-3 opacity-30 text-brand-accent" />
            <p class="text-sm font-semibold text-brand-dark dark:text-white">السلة فارغة حالياً</p>
            <p class="text-xs text-brand-gray mt-1">ابدأ بمسح باركود الصنف أو البحث عنه لإضافته فوراً</p>
          </div>

          <div v-else class="overflow-x-auto">
            <table class="w-full text-right text-xs">
              <thead class="bg-brand-light dark:bg-white/5 text-brand-gray font-bold border-b border-brand-gray/10">
                <tr>
                  <th class="p-3">#</th>
                  <th class="p-3">الصنف وقطع الغيار</th>
                  <th class="p-3">وحدة البيع</th>
                  <th class="p-3 text-center">الكمية</th>
                  <th class="p-3">سعر الوحدة</th>
                  <th class="p-3">الخصم</th>
                  <th class="p-3">الإجمالي</th>
                  <th class="p-3 text-center">حذف</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-brand-gray/10">
                <tr v-for="(item, idx) in cartItems" :key="item.productId + '-' + (item.packageId || 0)" class="hover:bg-brand-light/50 dark:hover:bg-white/5">
                  <td class="p-3 font-mono text-brand-gray">{{ idx + 1 }}</td>
                  <td class="p-3">
                    <div class="font-bold text-brand-dark dark:text-white">{{ item.name }}</div>
                    <div class="flex items-center gap-2 mt-0.5">
                      <span class="font-mono text-[10px] text-brand-gray">كود: {{ item.sku }}</span>
                      <span v-if="item.defaultShelfLocation" class="text-[10px] bg-purple-500/10 text-purple-600 dark:text-purple-400 px-1.5 py-0.5 rounded">
                        اسحب من: رف {{ item.defaultShelfLocation }}
                      </span>
                    </div>
                  </td>

                  <!-- Unit Selector (Piece vs Pack) -->
                  <td class="p-3">
                    <select
                      v-model="item.selectedUnitKey"
                      @change="handleUnitChange(item)"
                      class="text-xs p-1.5 rounded-lg border border-brand-gray/20 bg-brand-white dark:bg-slate-800 text-brand-dark dark:text-white cursor-pointer"
                    >
                      <option value="base">
                        {{ item.baseUnitName || 'قطعة' }} (وحدة أساسية)
                      </option>
                      <option
                        v-for="pkg in item.availablePackages"
                        :key="pkg.id"
                        :value="'pkg-' + pkg.id"
                      >
                        {{ pkg.name }} ({{ pkg.multiplier }} {{ item.baseUnitName || 'قطعة' }})
                      </option>
                    </select>
                  </td>

                  <!-- Quantity Controls -->
                  <td class="p-3 text-center">
                    <div class="inline-flex items-center border border-brand-gray/20 rounded-xl bg-brand-white dark:bg-slate-800 overflow-hidden">
                      <button
                        @click="decrementQty(item)"
                        class="px-2 py-1 hover:bg-black/5 dark:hover:bg-white/10 text-brand-dark dark:text-white cursor-pointer"
                      >
                        <Minus class="w-3.5 h-3.5" />
                      </button>
                      <input
                        type="number"
                        v-model.number="item.quantity"
                        :step="item.isMeasurable ? '0.25' : '1'"
                        min="0.1"
                        @input="validateQty(item)"
                        class="w-16 text-center font-mono font-bold text-xs p-1 bg-transparent border-0 focus:outline-none"
                      />
                      <button
                        @click="incrementQty(item)"
                        class="px-2 py-1 hover:bg-black/5 dark:hover:bg-white/10 text-brand-dark dark:text-white cursor-pointer"
                      >
                        <Plus class="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>

                  <!-- Unit Price -->
                  <td class="p-3 font-mono font-bold text-brand-dark dark:text-white">
                    {{ item.unitPrice }} ج.م
                  </td>

                  <!-- Discount -->
                  <td class="p-3">
                    <input
                      type="number"
                      v-model.number="item.discount"
                      min="0"
                      class="w-16 font-mono text-xs p-1 rounded border border-brand-gray/20 bg-transparent text-center"
                    />
                  </td>

                  <!-- Total -->
                  <td class="p-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {{ (item.quantity * item.unitPrice - (item.discount || 0)).toFixed(2) }} ج.م
                  </td>

                  <!-- Delete -->
                  <td class="p-3 text-center">
                    <button
                      @click="removeItem(idx)"
                      class="p-1 rounded-lg text-red-500 hover:bg-red-500/10 cursor-pointer transition-colors"
                    >
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- RIGHT: Payment & Checkout Panel (Cols 4) -->
      <div class="lg:col-span-4 space-y-4">
        <div class="bg-brand-white dark:bg-white/5 p-5 rounded-2xl border border-brand-gray/10 shadow-sm space-y-4">
          <h2 class="font-bold text-sm text-brand-dark dark:text-white pb-3 border-b border-brand-gray/10 flex items-center gap-2">
            <Wallet class="w-4 h-4 text-brand-accent" />
            <span>بيانات الدفع والتحصيل</span>
          </h2>

          <!-- Client Selection (Optional, mandatory for credit) -->
          <div>
            <label class="block text-xs font-semibold mb-1 text-brand-dark dark:text-white">العميل (اختياري / مطلوب للآجل)</label>
            <select
              v-model="selectedClientId"
              class="w-full text-xs p-2.5 rounded-xl border border-brand-gray/20 bg-brand-white dark:bg-slate-800 text-brand-dark dark:text-white cursor-pointer"
            >
              <option :value="null">-- عميل نقدي (شراء مباشر) --</option>
              <option v-for="c in clients" :key="c.id" :value="c.id">
                {{ c.name }} ({{ c.phone || 'بدون هاتف' }})
              </option>
            </select>
          </div>

          <!-- Payment Method Radios -->
          <div>
            <label class="block text-xs font-semibold mb-2 text-brand-dark dark:text-white">طريقة الدفع *</label>
            <div class="grid grid-cols-2 gap-2 text-xs">
              <label
                class="flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all"
                :class="paymentMethod === 1 ? 'border-brand-accent bg-brand-accent/10 font-bold text-brand-dark dark:text-white' : 'border-brand-gray/20 text-slate-600 dark:text-slate-400'"
              >
                <input type="radio" v-model="paymentMethod" :value="1" class="hidden" />
                <span>كاش (نقدي)</span>
              </label>

              <label
                class="flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all"
                :class="paymentMethod === 3 ? 'border-brand-accent bg-brand-accent/10 font-bold text-brand-dark dark:text-white' : 'border-brand-gray/20 text-slate-600 dark:text-slate-400'"
              >
                <input type="radio" v-model="paymentMethod" :value="3" class="hidden" />
                <span>إنستاباي (InstaPay)</span>
              </label>

              <label
                class="flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all"
                :class="paymentMethod === 2 ? 'border-brand-accent bg-brand-accent/10 font-bold text-brand-dark dark:text-white' : 'border-brand-gray/20 text-slate-600 dark:text-slate-400'"
              >
                <input type="radio" v-model="paymentMethod" :value="2" class="hidden" />
                <span>شبكة / بنك</span>
              </label>

              <label
                class="flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all"
                :class="paymentMethod === 5 ? 'border-amber-500 bg-amber-500/10 font-bold text-amber-700 dark:text-amber-400' : 'border-brand-gray/20 text-slate-600 dark:text-slate-400'"
              >
                <input type="radio" v-model="paymentMethod" :value="5" class="hidden" />
                <span>آجل (على الحساب)</span>
              </label>
            </div>
          </div>

          <!-- Financial Account Selection for non-cash non-credit -->
          <div v-if="paymentMethod !== 1 && paymentMethod !== 5">
            <label class="block text-xs font-semibold mb-1 text-brand-dark dark:text-white">إيداع في حساب *</label>
            <select
              v-model="selectedFinancialAccountId"
              class="w-full text-xs p-2.5 rounded-xl border border-brand-gray/20 bg-brand-white dark:bg-slate-800 text-brand-dark dark:text-white cursor-pointer"
            >
              <option v-for="acc in availableAccounts" :key="acc.id" :value="acc.id">
                {{ acc.name }} (الرصيد: {{ acc.currentBalance }} ج.م)
              </option>
            </select>
          </div>

          <!-- Overall Invoice Discount -->
          <div>
            <label class="block text-xs font-semibold mb-1 text-brand-dark dark:text-white">خصم إضافي على الفاتورة (ج.م)</label>
            <input
              type="number"
              v-model.number="overallDiscount"
              min="0"
              class="w-full text-xs font-mono p-2.5 rounded-xl border border-brand-gray/20 bg-transparent text-brand-dark dark:text-white"
            />
          </div>

          <!-- Financial Summary Breakdown -->
          <div class="pt-3 border-t border-brand-gray/10 space-y-2 text-xs">
            <div class="flex justify-between text-brand-gray">
              <span>إجمالي الأصناف:</span>
              <span class="font-mono font-bold">{{ subTotal.toFixed(2) }} ج.م</span>
            </div>
            <div v-if="overallDiscount > 0" class="flex justify-between text-red-500">
              <span>إجمالي الخصم:</span>
              <span class="font-mono font-bold">- {{ overallDiscount.toFixed(2) }} ج.م</span>
            </div>
            <div class="flex justify-between text-base font-bold text-brand-dark dark:text-white pt-2 border-t border-brand-gray/10">
              <span>المبلغ المطلوب سداده:</span>
              <span class="font-mono text-emerald-600 dark:text-emerald-400 text-lg">{{ netTotal.toFixed(2) }} ج.م</span>
            </div>
          </div>

          <!-- Checkout Button -->
          <button
            @click="submitSale"
            :disabled="cartItems.length === 0 || posStore.loading"
            class="w-full py-3.5 rounded-xl bg-brand-accent hover:bg-brand-accent/90 disabled:opacity-50 text-brand-dark font-extrabold text-sm shadow-md shadow-brand-accent/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Printer class="w-4 h-4" />
            <span>إتمام البيع وطباعة الفاتورة (F2)</span>
          </button>
        </div>
      </div>
    </div>

    <!-- VIEW 2: INVOICES HISTORY & RETURNS -->
    <div v-else class="space-y-4 print:hidden">
      <div class="bg-brand-white dark:bg-white/5 p-4 rounded-2xl border border-brand-gray/10 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-3 w-full md:w-96">
          <input
            v-model="invoiceSearchQuery"
            @input="handleInvoiceSearch"
            type="text"
            placeholder="بحث برقم الفاتورة أو اسم العميل..."
            class="w-full text-xs p-2.5 rounded-xl border border-brand-gray/20 bg-transparent text-brand-dark dark:text-white"
          />
        </div>
        <div class="text-xs text-brand-gray">
          عرض آخر {{ posStore.invoices.length }} فاتورة بيع
        </div>
      </div>

      <div class="bg-brand-white dark:bg-white/5 rounded-2xl border border-brand-gray/10 shadow-sm overflow-hidden">
        <table class="w-full text-right text-xs">
          <thead class="bg-brand-light dark:bg-white/5 text-brand-gray font-bold border-b border-brand-gray/10">
            <tr>
              <th class="p-3">رقم الفاتورة</th>
              <th class="p-3">التاريخ والوقت</th>
              <th class="p-3">العميل</th>
              <th class="p-3">طريقة الدفع</th>
              <th class="p-3">الإجمالي الصافي</th>
              <th class="p-3">تكلفة البضاعة (COGS)</th>
              <th class="p-3">الكاشير</th>
              <th class="p-3 text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-brand-gray/10">
            <tr v-for="inv in posStore.invoices" :key="inv.id" class="hover:bg-brand-light/50 dark:hover:bg-white/5">
              <td class="p-3 font-mono font-bold text-brand-accent">{{ inv.invoiceNumber }}</td>
              <td class="p-3 text-brand-gray">{{ formatDate(inv.invoiceDate) }}</td>
              <td class="p-3 font-semibold text-brand-dark dark:text-white">{{ inv.clientName || 'عميل نقدي' }}</td>
              <td class="p-3">
                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-light dark:bg-white/10 text-brand-dark dark:text-white">
                  {{ inv.paymentMethodName }}
                </span>
              </td>
              <td class="p-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">{{ inv.netAmount.toFixed(2) }} ج.م</td>
              <td class="p-3 font-mono text-brand-gray">{{ inv.totalCostOfGoodsSold.toFixed(2) }} ج.م</td>
              <td class="p-3 text-brand-gray">{{ inv.createdByUserName || 'كاشير' }}</td>
              <td class="p-3 text-center flex items-center justify-center gap-2">
                <button
                  @click="openReceiptModal(inv)"
                  class="p-1.5 rounded-lg bg-brand-light hover:bg-brand-accent/20 text-brand-dark dark:text-white cursor-pointer"
                  title="طباعة إيصال حراري"
                >
                  <Printer class="w-3.5 h-3.5" />
                </button>
                <button
                  @click="openRefundModal(inv)"
                  class="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-600 cursor-pointer"
                  title="إرجاع أصناف"
                >
                  <RotateCcw class="w-3.5 h-3.5" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- THERMAL RECEIPT MODAL (80mm) -->
    <Dialog
      v-model:visible="showReceiptModal"
      modal
      header="إيصال فاتورة نقطة البيع (80mm)"
      class="!bg-brand-white !border-brand-gray/15 max-w-sm w-full !text-brand-dark"
    >
      <div v-if="receiptData" id="thermalReceipt" class="p-3 bg-white text-black font-mono text-xs space-y-3">
        <!-- Receipt Header -->
        <div class="text-center pb-2 border-b border-dashed border-gray-400">
          <h2 class="text-base font-extrabold">{{ tenantName || 'مركز خدمة السيارات' }}</h2>
          <p class="text-[10px] text-gray-600">{{ branchName || 'الفرع الرئيسي' }}</p>
          <p class="text-[11px] font-bold mt-1">فاتورة مبيعات نقدية</p>
          <p class="text-[10px] text-gray-500">{{ receiptData.invoiceNumber }}</p>
          <p class="text-[10px] text-gray-500">{{ formatDate(receiptData.invoiceDate) }}</p>
        </div>

        <!-- Client & Cashier info -->
        <div class="text-[10px] space-y-0.5 pb-2 border-b border-dashed border-gray-400">
          <div class="flex justify-between">
            <span>العميل:</span>
            <span>{{ receiptData.clientName || 'عميل نقدي' }}</span>
          </div>
          <div class="flex justify-between">
            <span>الكاشير:</span>
            <span>{{ receiptData.createdByUserName || 'كاشير' }}</span>
          </div>
          <div class="flex justify-between">
            <span>طريقة السداد:</span>
            <span>{{ receiptData.paymentMethodName }}</span>
          </div>
        </div>

        <!-- Line Items -->
        <table class="w-full text-right text-[11px]">
          <thead>
            <tr class="border-b border-gray-400">
              <th class="py-1">الصنف</th>
              <th class="py-1 text-center">الكمية</th>
              <th class="py-1 text-left">الإجمالي</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-dotted divide-gray-300">
            <tr v-for="it in receiptData.items" :key="it.id">
              <td class="py-1">
                <div class="font-bold">{{ it.productName }}</div>
                <div v-if="it.batchCode" class="text-[9px] text-gray-500">دفعة: {{ it.batchCode }} ({{ it.shelfLocation || 'رف عام' }})</div>
              </td>
              <td class="py-1 text-center font-mono">{{ it.quantity }} {{ it.unitName }}</td>
              <td class="py-1 text-left font-mono font-bold">{{ it.totalPrice.toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>

        <!-- Totals -->
        <div class="pt-2 border-t border-dashed border-gray-400 space-y-1 text-xs">
          <div class="flex justify-between">
            <span>الإجمالي:</span>
            <span class="font-mono">{{ receiptData.totalAmount.toFixed(2) }} ج.م</span>
          </div>
          <div v-if="receiptData.discountAmount > 0" class="flex justify-between text-red-600">
            <span>الخصم:</span>
            <span class="font-mono">- {{ receiptData.discountAmount.toFixed(2) }} ج.م</span>
          </div>
          <div class="flex justify-between text-sm font-extrabold border-t border-gray-400 pt-1">
            <span>الصافي المدفوع:</span>
            <span class="font-mono">{{ receiptData.netAmount.toFixed(2) }} ج.م</span>
          </div>
        </div>

        <!-- Footer -->
        <div class="text-center pt-3 border-t border-dashed border-gray-400 text-[10px] text-gray-500 space-y-1">
          <p>شكراً لتعاملكم معنا!</p>
          <p>البضاعة المباعة ترد وتستبدل خلال 14 يوماً بالفاتورة</p>
        </div>
      </div>

      <div class="flex justify-end gap-2 pt-3 border-t border-brand-gray/10 print:hidden">
        <button
          @click="showReceiptModal = false"
          class="px-3 py-1.5 rounded-xl border border-brand-gray/20 text-xs font-semibold"
        >
          إغلاق
        </button>
        <button
          @click="triggerPrint"
          class="px-4 py-1.5 rounded-xl bg-brand-accent text-brand-dark font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
        >
          <Printer class="w-4 h-4" />
          <span>طباعة فورية</span>
        </button>
      </div>
    </Dialog>

    <!-- REFUND MODAL -->
    <Dialog
      v-model:visible="showRefundModal"
      modal
      header="إرجاع أصناف من فاتورة البيع"
      class="!bg-brand-white !border-brand-gray/15 max-w-lg w-full !text-brand-dark"
    >
      <div v-if="refundInvoice" class="space-y-4 text-xs">
        <div class="p-3 bg-brand-light dark:bg-white/5 rounded-xl flex justify-between items-center">
          <div>
            <div class="font-bold text-brand-dark dark:text-white">فاتورة رقم: {{ refundInvoice.invoiceNumber }}</div>
            <div class="text-brand-gray text-[11px]">العميل: {{ refundInvoice.clientName || 'عميل نقدي' }}</div>
          </div>
          <div class="font-mono font-bold text-brand-accent">{{ refundInvoice.netAmount.toFixed(2) }} ج.م</div>
        </div>

        <div class="space-y-2">
          <label class="font-semibold block">الأصناف المراد إرجاعها والكميات:</label>
          <div v-for="it in refundItemsForm" :key="it.posInvoiceItemId" class="p-2.5 rounded-xl border border-brand-gray/15 flex items-center justify-between gap-3">
            <div>
              <div class="font-bold text-brand-dark dark:text-white">{{ it.productName }}</div>
              <div class="text-[10px] text-brand-gray">المباع: {{ it.soldQty }} | تم إرجاعه مسبقاً: {{ it.alreadyReturned }}</div>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-brand-gray text-[10px]">الكمية المرتجعة:</span>
              <input
                type="number"
                v-model.number="it.quantityToRefund"
                min="0"
                :max="it.soldQty - it.alreadyReturned"
                class="w-16 p-1 text-center font-mono font-bold rounded border border-brand-gray/20 bg-transparent"
              />
            </div>
          </div>
        </div>

        <!-- Refund Method -->
        <div>
          <label class="font-semibold block mb-1">طريقة رد المبلغ:</label>
          <div class="grid grid-cols-2 gap-2">
            <button
              type="button"
              @click="refundMethod = 1"
              class="p-2 rounded-xl border text-xs font-bold cursor-pointer"
              :class="refundMethod === 1 ? 'border-brand-accent bg-brand-accent/15 text-brand-dark dark:text-white' : 'border-brand-gray/20 text-slate-500'"
            >
              استرداد نقدي من درج الكاش
            </button>
            <button
              type="button"
              @click="refundMethod = 2"
              class="p-2 rounded-xl border text-xs font-bold cursor-pointer"
              :class="refundMethod === 2 ? 'border-brand-accent bg-brand-accent/15 text-brand-dark dark:text-white' : 'border-brand-gray/20 text-slate-500'"
            >
              خصم من رصيد العميل الآجل
            </button>
          </div>
        </div>

        <div class="flex justify-end gap-2 pt-3 border-t border-brand-gray/10">
          <button
            @click="showRefundModal = false"
            class="px-3 py-1.5 rounded-xl border border-brand-gray/20 text-xs font-semibold"
          >
            إلغاء
          </button>
          <button
            @click="executeRefund"
            class="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <RotateCcw class="w-4 h-4" />
            <span>تأكيد المرتجع واسترداد المبلغ</span>
          </button>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useOhdaPosStore } from "../stores/useOhdaPosStore";
import { useOhdaInventoryStore } from "../stores/useOhdaInventoryStore";
import { useOhdaFinanceStore } from "../stores/useOhdaFinanceStore";
import { useOhdaAuthStore } from "../stores/useOhdaAuthStore";
import apiClient from "@/utilities/apiClient";
import Dialog from "primevue/dialog";
import {
  ShoppingCart,
  Barcode,
  Search,
  Plus,
  Minus,
  Trash2,
  Printer,
  RotateCcw,
  Receipt,
  Wallet,
  AlertCircle
} from "lucide-vue-next";

const posStore = useOhdaPosStore();
const inventoryStore = useOhdaInventoryStore();
const financeStore = useOhdaFinanceStore();
const authStore = useOhdaAuthStore();

const activeView = ref("pos"); // "pos" | "history"
const barcodeInputRef = ref(null);
const barcodeQuery = ref("");
const productSearchText = ref("");
const cartItems = ref([]);

const selectedClientId = ref(null);
const paymentMethod = ref(1); // 1=Cash, 2=Card, 3=InstaPay, 5=Credit
const selectedFinancialAccountId = ref(null);
const overallDiscount = ref(0);

const clients = ref([]);
const invoiceSearchQuery = ref("");

// Modals
const showReceiptModal = ref(false);
const receiptData = ref(null);
const showRefundModal = ref(false);
const refundInvoice = ref(null);
const refundItemsForm = ref([]);
const refundMethod = ref(1);

const tenantName = computed(() => authStore.user?.tenantName || "مركز خدمة السيارات");
const branchName = computed(() => authStore.user?.branchName || "الفرع الرئيسي");

const availableAccounts = computed(() => {
  return (financeStore.accounts || []).filter(a => a.isActive);
});

// Search Filter for Product name
const filteredProductSearchResults = computed(() => {
  if (!productSearchText.value || productSearchText.value.trim().length < 2) return [];
  const q = productSearchText.value.trim().toLowerCase();
  return (inventoryStore.products || []).filter(p =>
    (p.name && p.name.toLowerCase().includes(q)) ||
    (p.sku && p.sku.toLowerCase().includes(q)) ||
    (p.barcode && p.barcode.toLowerCase().includes(q))
  ).slice(0, 10);
});

// Cart Calculations
const subTotal = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + (item.quantity * item.unitPrice - (item.discount || 0)), 0);
});

const netTotal = computed(() => {
  return Math.max(0, subTotal.value - (overallDiscount.value || 0));
});

onMounted(async () => {
  await Promise.all([
    inventoryStore.fetchProducts(),
    financeStore.fetchAccounts(),
    financeStore.fetchCurrentDrawerSession(),
    loadClients(),
    posStore.fetchInvoices()
  ]);

  if (availableAccounts.value.length > 0) {
    selectedFinancialAccountId.value = availableAccounts.value[0].id;
  }

  window.addEventListener("keydown", handleGlobalKeyDown);
  focusBarcode();
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleGlobalKeyDown);
});

function focusBarcode() {
  setTimeout(() => {
    barcodeInputRef.value?.focus();
  }, 100);
}

function handleGlobalKeyDown(e) {
  if (e.key === "F2") {
    e.preventDefault();
    submitSale();
  } else if (e.key === "F4") {
    e.preventDefault();
    focusBarcode();
  }
}

async function loadClients() {
  try {
    const res = await apiClient.get("/api/Clients");
    if (res?.data?.isDone && res?.data?.objects) {
      clients.value = res.data.objects;
    }
  } catch (err) {
    console.warn("Load clients failed:", err);
  }
}

// Barcode Scanning logic
async function handleBarcodeScan() {
  const code = (barcodeQuery.value || "").trim();
  if (!code) return;
  barcodeQuery.value = "";

  // 1. Check if matches any product directly by Barcode or SKU
  const matched = (inventoryStore.products || []).find(p =>
    (p.barcode && p.barcode.trim() === code) ||
    (p.sku && p.sku.trim() === code)
  );

  if (matched) {
    addProductToCart(matched);
    return;
  }

  // 2. Check if matches any packaging barcode
  for (const p of inventoryStore.products || []) {
    const packagesRes = await inventoryStore.fetchProductPackages(p.id);
    const packages = packagesRes.packages || [];
    const matchedPkg = packages.find(pkg => pkg.barcode && pkg.barcode.trim() === code);
    if (matchedPkg) {
      addProductToCart(p, matchedPkg);
      return;
    }
  }

  alert(`لم يتم العثور على صنف بالباركود: ${code}`);
}

async function addProductToCart(product, specificPackage = null) {
  productSearchText.value = "";

  // Load packages for this product if not already loaded
  const pkgRes = await inventoryStore.fetchProductPackages(product.id);
  const packages = pkgRes.packages || [];

  const existing = cartItems.value.find(item =>
    item.productId === product.id &&
    item.packageId === (specificPackage ? specificPackage.id : null)
  );

  if (existing) {
    existing.quantity += 1;
  } else {
    cartItems.value.push({
      productId: product.id,
      name: product.name,
      sku: product.sku,
      barcode: product.barcode,
      baseUnitName: product.unit || "قطعة",
      packageId: specificPackage ? specificPackage.id : null,
      packageMultiplier: specificPackage ? specificPackage.multiplier : 1,
      selectedUnitKey: specificPackage ? `pkg-${specificPackage.id}` : "base",
      unitPrice: specificPackage?.salePrice || product.unitPrice || 0,
      basePrice: product.unitPrice || 0,
      quantity: 1,
      discount: 0,
      isMeasurable: product.isMeasurable || false,
      defaultShelfLocation: product.defaultShelfLocation,
      availablePackages: packages
    });
  }

  focusBarcode();
}

function handleUnitChange(item) {
  if (item.selectedUnitKey === "base") {
    item.packageId = null;
    item.packageMultiplier = 1;
    item.unitPrice = item.basePrice;
  } else if (item.selectedUnitKey.startsWith("pkg-")) {
    const pkgId = Number(item.selectedUnitKey.replace("pkg-", ""));
    const pkg = (item.availablePackages || []).find(p => p.id === pkgId);
    if (pkg) {
      item.packageId = pkg.id;
      item.packageMultiplier = pkg.multiplier;
      item.unitPrice = pkg.salePrice > 0 ? pkg.salePrice : (item.basePrice * pkg.multiplier);
    }
  }
}

function incrementQty(item) {
  item.quantity = Number((item.quantity + (item.isMeasurable ? 0.5 : 1)).toFixed(2));
}

function decrementQty(item) {
  const min = item.isMeasurable ? 0.25 : 1;
  if (item.quantity > min) {
    item.quantity = Number((item.quantity - (item.isMeasurable ? 0.5 : 1)).toFixed(2));
  }
}

function validateQty(item) {
  if (!item.isMeasurable) {
    item.quantity = Math.max(1, Math.floor(item.quantity || 1));
  } else {
    item.quantity = Math.max(0.1, Number(item.quantity || 0.1));
  }
}

function removeItem(idx) {
  cartItems.value.splice(idx, 1);
}

function clearCart() {
  if (confirm("هل أنت متأكد من تفريغ سلة البيع؟")) {
    cartItems.value = [];
    overallDiscount.value = 0;
  }
}

// Checkout Submit
async function submitSale() {
  if (cartItems.value.length === 0) {
    alert("سلة المبيعات فارغة.");
    return;
  }

  if (paymentMethod.value === 5 && !selectedClientId.value) {
    alert("البيع الآجل (على الحساب) يتطلب اختيار عميل مسجل في النظام.");
    return;
  }

  const payload = {
    clientId: selectedClientId.value,
    financialAccountId: selectedFinancialAccountId.value,
    paymentMethod: paymentMethod.value,
    discountAmount: overallDiscount.value || 0,
    taxAmount: 0,
    notes: "مبيعات نقطة بيع POS",
    items: cartItems.value.map(it => ({
      productId: it.productId,
      packageId: it.packageId,
      unitName: it.selectedUnitKey === "base" ? it.baseUnitName : (it.availablePackages.find(p => p.id === it.packageId)?.name || it.baseUnitName),
      packageMultiplier: it.packageMultiplier,
      quantity: it.quantity,
      unitPrice: it.unitPrice,
      discount: it.discount || 0
    }))
  };

  const res = await posStore.createSale(payload);
  if (res.success) {
    receiptData.value = res.invoice;
    showReceiptModal.value = true;
    cartItems.value = [];
    overallDiscount.value = 0;
    await inventoryStore.fetchProducts(); // Refresh stock totals
  } else {
    alert(res.message);
  }
}

function openReceiptModal(inv) {
  receiptData.value = inv;
  showReceiptModal.value = true;
}

function triggerPrint() {
  window.print();
}

function openRefundModal(inv) {
  refundInvoice.value = inv;
  refundItemsForm.value = inv.items.map(it => ({
    posInvoiceItemId: it.id,
    productName: it.productName,
    soldQty: it.quantity,
    alreadyReturned: it.returnedQuantity || 0,
    quantityToRefund: 0
  }));
  refundMethod.value = 1;
  showRefundModal.value = true;
}

async function executeRefund() {
  const itemsToRefund = refundItemsForm.value
    .filter(it => it.quantityToRefund > 0)
    .map(it => ({
      posInvoiceItemId: it.posInvoiceItemId,
      quantityToRefund: it.quantityToRefund
    }));

  if (itemsToRefund.length === 0) {
    alert("يرجى إدخال كمية أكبر من صفر للأصناف المراد إرجاعها.");
    return;
  }

  const payload = {
    posInvoiceId: refundInvoice.value.id,
    refundMethod: refundMethod.value,
    items: itemsToRefund
  };

  const res = await posStore.refundSale(payload);
  if (res.success) {
    alert(res.message);
    showRefundModal.value = false;
    await posStore.fetchInvoices();
    await inventoryStore.fetchProducts();
  } else {
    alert(res.message);
  }
}

function handleInvoiceSearch() {
  posStore.fetchInvoices(invoiceSearchQuery.value);
}

function formatDate(d) {
  if (!d) return "-";
  return new Date(d).toLocaleString("ar-EG", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}
</script>

<style scoped>
@media print {
  body * {
    visibility: hidden;
  }
  #thermalReceipt, #thermalReceipt * {
    visibility: visible;
  }
  #thermalReceipt {
    position: absolute;
    left: 0;
    top: 0;
    width: 80mm;
    margin: 0;
    padding: 2mm;
  }
}
</style>
