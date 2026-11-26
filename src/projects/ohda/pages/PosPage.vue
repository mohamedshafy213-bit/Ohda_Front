<template>
  <div class="space-y-4">
    <!-- ==================== TOP CASHIER HEADER ==================== -->
    <div class="bg-brand-white dark:bg-brand-dark p-4 rounded-2xl border border-brand-gray/15 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3 print:hidden">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-brand-accent/15 text-brand-accent flex items-center justify-center shrink-0">
          <ShoppingCart class="w-5 h-5" />
        </div>
        <div>
          <h1 class="text-base font-extrabold text-brand-dark dark:text-white">نقطة بيع المنتجات وقطع الغيار (POS)</h1>
          <div class="flex flex-wrap items-center gap-3 text-[11px] text-brand-gray">
            <span>الكاشير: <strong class="text-brand-dark dark:text-white">{{ authStore.user?.personName || authStore.user?.username || 'كاشير' }}</strong></span>
            <span>•</span>
            <span v-if="financeStore.isDrawerOpen" class="text-emerald-600 font-bold flex items-center gap-1">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              درج النقدية مفتوح
            </span>
            <router-link v-else to="/ohda/finance" class="text-red-600 font-bold hover:underline flex items-center gap-1">
              <AlertCircle class="w-3.5 h-3.5" />
              الدرج مغلق — افتح الوردية أولاً
            </router-link>
          </div>
        </div>
      </div>

      <!-- Universal Search / Scanner Input (Always focused with F4) -->
      <div class="flex-1 max-w-xl relative">
        <Barcode class="w-5 h-5 text-brand-accent absolute start-3.5 top-1/2 -translate-y-1/2" />
        <input
          ref="searchInputRef"
          v-model="searchQuery"
          @keydown.enter.prevent="handleScanOrSearchEnter"
          type="text"
          placeholder="ابحث بالاسم، الكود، الباركود، أو امسح السيريال مباشرة [F4]..."
          class="w-full ps-11 pe-20 py-2.5 rounded-xl border-2 border-brand-accent/40 bg-brand-accent/5 text-sm font-semibold text-brand-dark dark:text-white focus:outline-none focus:border-brand-accent"
        />
        <button
          v-if="searchQuery"
          type="button"
          @click="searchQuery = ''; focusSearch()"
          class="absolute end-2 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded-lg bg-black/10 text-[10px] font-bold cursor-pointer"
        >
          مسح
        </button>
      </div>

      <!-- Header Utility Actions -->
      <div class="flex flex-wrap items-center gap-2">
        <button
          type="button"
          @click="refreshCatalog"
          :disabled="posStore.catalogLoading"
          class="p-2.5 rounded-xl border border-brand-gray/20 text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:border-brand-accent transition-colors"
          title="تحديث الأصناف والأرصدة"
        >
          <RefreshCw class="w-4 h-4 text-brand-gray hover:text-brand-dark dark:hover:text-white" :class="{ 'animate-spin': posStore.catalogLoading }" />
        </button>

        <button
          v-if="heldSales.length > 0"
          type="button"
          @click="showHeldModal = true"
          class="px-3 py-2 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-bold cursor-pointer flex items-center gap-1.5 shadow-2xs"
        >
          <PauseCircle class="w-4 h-4" />
          <span>معلق ({{ heldSales.length }})</span>
        </button>

        <button
          v-if="lastReceipt"
          type="button"
          @click="receiptData = lastReceipt; showReceiptModal = true"
          class="px-3 py-2 rounded-xl bg-black/5 dark:bg-white/10 text-xs font-bold cursor-pointer flex items-center gap-1.5 hover:bg-black/10 transition-colors"
          title="عرض وطباعة آخر إيصال صادر"
        >
          <Printer class="w-3.5 h-3.5 text-brand-accent" />
          <span>آخر إيصال</span>
        </button>

        <button
          type="button"
          @click="activeView = activeView === 'pos' ? 'history' : 'pos'"
          class="px-3.5 py-2 rounded-xl text-xs font-bold border cursor-pointer flex items-center gap-1.5 transition-all shadow-2xs"
          :class="activeView === 'history' ? 'bg-brand-accent text-brand-dark border-brand-accent' : 'border-brand-gray/20 hover:border-brand-accent'"
        >
          <Receipt class="w-4 h-4" />
          <span>{{ activeView === 'pos' ? 'فواتير اليوم' : 'شاشة البيع' }}</span>
        </button>
      </div>
    </div>

    <!-- ==================== VIEW 1: CASHIER-FIRST POS ==================== -->
    <div v-if="activeView === 'pos'" class="grid grid-cols-1 lg:grid-cols-12 gap-4 print:hidden">
      <!-- RIGHT/MAIN AREA: Category Rail + Item Grid (7 cols) -->
      <div class="lg:col-span-7 space-y-3">
        <!-- Quick Filter Tabs (All, Favorites, Recent) -->
        <div class="flex flex-wrap items-center justify-between gap-2 bg-brand-white dark:bg-brand-dark p-3 rounded-2xl border border-brand-gray/15">
          <div class="flex items-center gap-1.5">
            <button
              v-for="tab in [{ id: 'all', label: 'الكل' }, { id: 'favorites', label: '⭐ المفضلة' }, { id: 'recent', label: '🕒 الأحدث مبيعاً' }]"
              :key="tab.id"
              type="button"
              @click="quickFilterMode = tab.id"
              class="px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all"
              :class="quickFilterMode === tab.id ? 'bg-brand-accent text-brand-dark' : 'bg-black/5 dark:bg-white/5 text-brand-gray'"
            >
              {{ tab.label }}
            </button>
          </div>
          <span class="text-[11px] text-brand-gray font-mono">
            المعروض: {{ displayedCatalog.length }} من {{ posStore.catalog.length }} صنف
          </span>
        </div>

        <!-- Category Rail (Touch Tiles) -->
        <div class="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            type="button"
            @click="selectedCategoryId = null"
            class="px-4 py-2.5 rounded-2xl border shrink-0 text-xs font-bold cursor-pointer transition-all text-right"
            :class="selectedCategoryId === null ? 'bg-brand-accent text-brand-dark border-brand-accent shadow-xs' : 'bg-brand-white dark:bg-brand-dark border-brand-gray/15'"
          >
            <span class="block">كل التصنيفات</span>
            <span class="text-[10px] opacity-75 font-mono">{{ posStore.catalog.length }} صنف</span>
          </button>

          <button
            v-for="cat in categoryTiles"
            :key="cat.id"
            type="button"
            @click="selectedCategoryId = cat.id"
            class="px-4 py-2.5 rounded-2xl border shrink-0 text-xs font-bold cursor-pointer transition-all text-right"
            :class="selectedCategoryId === cat.id ? 'bg-brand-accent text-brand-dark border-brand-accent shadow-xs' : 'bg-brand-white dark:bg-brand-dark border-brand-gray/15'"
          >
            <span class="block">{{ cat.name }}</span>
            <span class="text-[10px] opacity-75 font-mono">{{ cat.count }} صنف</span>
          </button>
        </div>

        <!-- Products Grid (Touch Friendly Cards) -->
        <div class="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 max-h-[65vh] overflow-y-auto pe-1">
          <div
            v-for="p in displayedCatalog"
            :key="p.id"
            @click="onProductCardClick(p)"
            class="p-3.5 rounded-2xl border bg-brand-white dark:bg-brand-dark flex flex-col justify-between gap-2 transition-all cursor-pointer select-none relative group"
            :class="[
              p.sellableQuantity <= 0 ? 'opacity-60 border-red-500/30' : p.isUnpriced ? 'border-amber-500/50 bg-amber-500/5' : 'border-brand-gray/15 hover:border-brand-accent hover:shadow-md active:scale-[0.98]'
            ]"
          >
            <!-- Favorite Star Toggle -->
            <button
              type="button"
              @click.stop="toggleFavorite(p.id)"
              class="absolute top-2 end-2 text-xs p-1 rounded-full hover:bg-black/5 cursor-pointer"
              :title="favoriteIds.includes(p.id) ? 'إزالة من المفضلة' : 'تثبيت في المفضلة'"
            >
              <span :class="favoriteIds.includes(p.id) ? 'text-amber-500' : 'text-slate-300'">★</span>
            </button>

            <div class="space-y-1 pe-4">
              <div class="font-bold text-xs text-brand-dark dark:text-white line-clamp-2 leading-snug">{{ p.name }}</div>
              <div class="font-mono text-[10px] text-brand-gray">{{ p.sku }} {{ p.defaultShelfLocation ? `• رف ${p.defaultShelfLocation}` : '' }}</div>
            </div>

            <!-- Badges Row -->
            <div class="flex flex-wrap gap-1">
              <span
                class="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold"
                :class="p.sellableQuantity <= 0 ? 'bg-red-500/15 text-red-600' : p.sellableQuantity <= p.minQuantity ? 'bg-orange-500/15 text-orange-600' : 'bg-emerald-500/15 text-emerald-600'"
              >
                رصيد: {{ p.sellableQuantity }} {{ p.unit }}
              </span>
              <span v-if="p.trackSerialNumbers" class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-500/15 text-blue-600">
                سيريال
              </span>
              <span
                v-if="p.daysToExpiry !== null && p.daysToExpiry <= 30"
                class="px-1.5 py-0.5 rounded text-[9px] font-bold"
                :class="p.daysToExpiry <= 7 ? 'bg-red-600 text-white' : 'bg-orange-500/20 text-orange-700'"
              >
                ينتهي خلال {{ p.daysToExpiry }} يوم
              </span>
            </div>

            <!-- Price Row or Unpriced Flag -->
            <div class="pt-1 border-t border-brand-gray/10 flex items-center justify-between">
              <template v-if="p.isUnpriced">
                <span class="text-[10px] font-bold text-amber-700 bg-amber-500/20 px-2 py-0.5 rounded">⚠️ بدون سعر بيع</span>
                <button
                  v-if="canSetPrice"
                  type="button"
                  @click.stop="openQuickPriceModal(p)"
                  class="text-[10px] font-bold text-brand-accent underline cursor-pointer"
                >
                  تسعير الآن
                </button>
              </template>
              <template v-else>
                <span class="font-mono font-extrabold text-sm text-brand-accent">{{ p.unitPrice.toFixed(2) }} ج.م</span>
                <span class="text-[10px] text-brand-gray">/ {{ p.unit }}</span>
              </template>
            </div>
          </div>
        </div>
      </div>

      <!-- LEFT CART & PAYMENT PANEL (5 cols) -->
      <div class="lg:col-span-5 bg-brand-white dark:bg-brand-dark rounded-3xl border border-brand-gray/15 shadow-sm flex flex-col justify-between p-4 space-y-4">
        <!-- Customer Picker & Hold Sale -->
        <div class="flex items-center gap-2 border-b border-brand-gray/10 pb-3">
          <select
            v-model="selectedClientId"
            class="flex-1 text-xs p-2.5 rounded-xl border border-brand-gray/20 bg-brand-light/40 dark:bg-white/5 font-semibold text-brand-dark dark:text-white"
          >
            <option :value="null">عميل نقدي مباشر (بدون تسجيل)</option>
            <option v-for="c in clients" :key="c.id" :value="c.id" class="bg-white dark:bg-slate-800">
              {{ c.name }} ({{ c.phone }})
            </option>
          </select>

          <button
            v-if="cartItems.length > 0"
            type="button"
            @click="holdCurrentSale"
            class="px-3 py-2.5 rounded-xl bg-amber-500/15 text-amber-700 text-xs font-bold cursor-pointer shrink-0"
            title="تعليق الفاتورة الحالية"
          >
            تعليق
          </button>
          <button
            v-if="cartItems.length > 0"
            type="button"
            @click="clearCart"
            class="p-2.5 rounded-xl bg-red-500/10 text-red-500 cursor-pointer shrink-0"
            title="إفراغ السلة"
          >
            <Trash2 class="w-4 h-4" />
          </button>
        </div>

        <!-- Cart Lines -->
        <div v-if="cartItems.length === 0" class="py-14 text-center text-brand-gray space-y-2">
          <ShoppingCart class="w-12 h-12 mx-auto opacity-25 text-brand-accent" />
          <p class="text-xs font-bold">السلة فارغة — اضغط على أي صنف أو امسح الباركود</p>
        </div>

        <div v-else class="space-y-2.5 max-h-[38vh] overflow-y-auto pe-1">
          <div
            v-for="(item, idx) in cartItems"
            :key="idx"
            class="p-3 rounded-2xl border border-brand-gray/15 bg-brand-light/30 dark:bg-white/5 space-y-2 text-xs"
          >
            <div class="flex items-start justify-between gap-2">
              <div>
                <div class="font-bold text-brand-dark dark:text-white">{{ item.name }}</div>
                <div class="text-[10px] text-brand-gray font-mono">
                  سعر: {{ item.unitPrice.toFixed(2) }} ج.م
                  <span v-if="item.serialNumbers?.length" class="text-blue-600 ms-1">• سيريالات: {{ item.serialNumbers.join(', ') }}</span>
                </div>
              </div>
              <button type="button" @click="cartItems.splice(idx, 1)" class="text-red-500 cursor-pointer">&times;</button>
            </div>

            <div class="flex items-center justify-between gap-2">
              <!-- Unit Switch if packages exist -->
              <select
                v-if="item.packages && item.packages.length > 0"
                v-model="item.selectedUnitKey"
                @change="handleUnitChange(item)"
                class="text-[11px] px-2 py-1 rounded-lg border border-brand-gray/20 bg-white dark:bg-slate-900"
              >
                <option value="base">{{ item.baseUnit }}</option>
                <option v-for="pk in item.packages" :key="pk.id" :value="'pkg-' + pk.id">{{ pk.name }} ({{ pk.multiplier }})</option>
              </select>
              <span v-else class="text-[11px] text-brand-gray">{{ item.unitName }}</span>

              <!-- Touch Quantity Steppers -->
              <div class="flex items-center gap-1.5">
                <button
                  type="button"
                  @click="decrementCartQty(idx)"
                  class="w-7 h-7 rounded-lg bg-black/10 dark:bg-white/10 font-bold flex items-center justify-center cursor-pointer"
                >
                  -
                </button>
                <input
                  v-model.number="item.quantity"
                  type="number"
                  min="0.1"
                  step="any"
                  :readonly="item.trackSerialNumbers"
                  class="w-12 text-center font-mono font-bold bg-white dark:bg-slate-900 border border-brand-gray/20 rounded-lg py-1"
                />
                <button
                  type="button"
                  @click="incrementCartQty(item)"
                  class="w-7 h-7 rounded-lg bg-brand-accent/25 font-bold flex items-center justify-center cursor-pointer"
                >
                  +
                </button>
              </div>

              <div class="font-mono font-extrabold text-brand-dark dark:text-white min-w-16 text-end">
                {{ (item.quantity * item.unitPrice).toFixed(2) }} ج.م
              </div>
            </div>
          </div>
        </div>

        <!-- Totals & Big Payment Buttons -->
        <div class="border-t border-brand-gray/15 pt-3 space-y-3 text-xs">
          <div class="flex items-center justify-between">
            <span class="text-brand-gray">خصم إضافي (ج.م):</span>
            <input
              v-model.number="overallDiscount"
              type="number"
              min="0"
              class="w-24 px-2 py-1 rounded-lg border border-brand-gray/25 text-center font-mono font-bold bg-transparent"
            />
          </div>

          <div class="flex items-center justify-between text-base font-extrabold bg-brand-accent/10 p-3 rounded-2xl border border-brand-accent/25">
            <span>الصافي المطلوب:</span>
            <span class="font-mono text-xl text-brand-accent">{{ netTotal.toFixed(2) }} ج.م</span>
          </div>

          <!-- Big Touch Payment Buttons -->
          <div class="grid grid-cols-2 gap-2">
            <button
              type="button"
              @click="openCashPaymentModal"
              :disabled="cartItems.length === 0 || posStore.loading"
              class="py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs cursor-pointer shadow-sm disabled:opacity-40"
            >
              💵 دفع كاش [F2]
            </button>
            <button
              type="button"
              @click="submitSaleWithMethod(3)"
              :disabled="cartItems.length === 0 || posStore.loading"
              class="py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs cursor-pointer shadow-sm disabled:opacity-40"
            >
              📱 إنستاباي [F3]
            </button>
            <button
              type="button"
              @click="submitSaleWithMethod(2)"
              :disabled="cartItems.length === 0 || posStore.loading"
              class="py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer disabled:opacity-40"
            >
              💳 فيزا / بنك [F6]
            </button>
            <button
              type="button"
              @click="submitSaleWithMethod(5)"
              :disabled="cartItems.length === 0 || posStore.loading"
              class="py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs cursor-pointer disabled:opacity-40"
            >
              📒 آجل على العميل [F7]
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== VIEW 2: TODAY'S INVOICES HISTORY ==================== -->
    <div v-else class="bg-brand-white dark:bg-brand-dark rounded-2xl border border-brand-gray/15 p-5 space-y-4 print:hidden">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <h2 class="text-base font-bold">سجل فواتير نقطة البيع</h2>
        <input
          v-model="invoiceSearchQuery"
          @input="posStore.fetchInvoices(invoiceSearchQuery)"
          type="text"
          placeholder="ابحث برقم الفاتورة أو اسم العميل..."
          class="w-72 px-3 py-2 rounded-xl border border-brand-gray/25 text-xs bg-transparent"
        />
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-right text-xs">
          <thead class="bg-brand-light/60 dark:bg-white/5 text-brand-gray font-bold">
            <tr>
              <th class="p-3">رقم الفاتورة</th>
              <th class="p-3">التاريخ</th>
              <th class="p-3">العميل</th>
              <th class="p-3">السداد</th>
              <th class="p-3">الصافي</th>
              <th class="p-3 text-center">إجراءات</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-brand-gray/10">
            <tr v-for="inv in posStore.invoices" :key="inv.id" class="hover:bg-black/5 dark:hover:bg-white/5">
              <td class="p-3 font-mono font-bold text-brand-accent">{{ inv.invoiceNumber }}</td>
              <td class="p-3 font-mono">{{ formatDate(inv.invoiceDate) }}</td>
              <td class="p-3 font-bold">{{ inv.clientName || 'عميل نقدي' }}</td>
              <td class="p-3">{{ inv.paymentMethodName }}</td>
              <td class="p-3 font-mono font-bold">{{ inv.netAmount.toFixed(2) }} ج.م</td>
              <td class="p-3 text-center flex items-center justify-center gap-2">
                <button type="button" @click="receiptData = inv; showReceiptModal = true" class="px-2.5 py-1 rounded-lg bg-brand-accent/15 text-brand-dark font-bold cursor-pointer">
                  عرض / طباعة
                </button>
                <router-link :to="`/ohda/returns?token=${inv.documentToken}`" class="px-2.5 py-1 rounded-lg bg-purple-500/15 text-purple-700 font-bold">
                  مرتجع
                </router-link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ==================== MODAL: CASH PAYMENT KEYPAD & CHANGE DUE ==================== -->
    <Dialog v-model:visible="showCashModal" modal header="إتمام الدفع النقدي (كاش)" class="max-w-sm w-full">
      <div class="space-y-4 text-xs">
        <div class="p-3 rounded-xl bg-brand-light dark:bg-white/5 flex justify-between items-center font-bold">
          <span>المطلوب سداده:</span>
          <span class="font-mono text-lg text-brand-accent">{{ netTotal.toFixed(2) }} ج.م</span>
        </div>

        <div>
          <label class="block font-bold mb-1">المبلغ المدفوع من العميل:</label>
          <input
            v-model.number="cashReceived"
            type="number"
            min="0"
            step="any"
            class="w-full p-3 rounded-xl border-2 border-brand-accent text-center font-mono text-xl font-extrabold"
            autofocus
          />
          <div class="grid grid-cols-4 gap-1.5 mt-2">
            <button v-for="amt in [50, 100, 200, 500]" :key="amt" type="button" @click="cashReceived = amt" class="py-1.5 rounded-lg bg-black/5 dark:bg-white/10 font-mono font-bold cursor-pointer">
              {{ amt }}
            </button>
          </div>
        </div>

        <div class="p-3 rounded-xl flex justify-between items-center font-bold" :class="cashChangeDue >= 0 ? 'bg-emerald-500/15 text-emerald-700' : 'bg-red-500/15 text-red-600'">
          <span>الباقي للعميل:</span>
          <span class="font-mono text-lg">{{ cashChangeDue.toFixed(2) }} ج.م</span>
        </div>

        <div class="flex justify-end gap-2 pt-2">
          <button type="button" @click="showCashModal = false" class="px-4 py-2 rounded-xl border font-bold cursor-pointer">إلغاء</button>
          <button
            type="button"
            @click="confirmCashSale"
            :disabled="cashReceived < netTotal || posStore.loading"
            class="px-5 py-2 rounded-xl bg-emerald-600 text-white font-extrabold cursor-pointer disabled:opacity-40"
          >
            تأكيد وحفظ الفاتورة ✓
          </button>
        </div>
      </div>
    </Dialog>

    <!-- ==================== MODAL: SERIAL SELECTION FOR SERIALIZED PRODUCT ==================== -->
    <Dialog v-model:visible="showSerialPrompt" modal header="اختيار أو مسح الرقم التسلسلي (Serial)" class="max-w-md w-full">
      <div v-if="serialPromptProduct" class="space-y-3 text-xs">
        <p class="font-bold text-sm">{{ serialPromptProduct.name }}</p>
        <input
          v-model="serialPromptScan"
          @keydown.enter.prevent="selectSerialByScan"
          type="text"
          placeholder="امسح السيريال أو اختر من القائمة..."
          class="w-full p-2.5 rounded-xl border border-brand-accent font-mono"
          autofocus
        />
        <div class="max-h-56 overflow-y-auto space-y-1.5">
          <button
            v-for="sn in serialPromptAvailable"
            :key="sn.id"
            type="button"
            @click="addSerializedUnitToCart(serialPromptProduct, sn.serialNumber)"
            class="w-full p-2.5 rounded-xl border border-brand-gray/20 hover:border-brand-accent hover:bg-brand-accent/10 flex items-center justify-between font-mono text-xs cursor-pointer"
          >
            <span class="font-bold">{{ sn.serialNumber }}</span>
            <span class="text-[10px] text-brand-gray">دفعة: {{ sn.batchCode || 'أقدم دفعة' }}</span>
          </button>
        </div>
      </div>
    </Dialog>

    <!-- ==================== MODAL: QUICK SET PRICE ==================== -->
    <Dialog v-model:visible="showPriceModal" modal header="تسعير سريع للصنف" class="max-w-xs w-full">
      <div v-if="priceTargetProduct" class="space-y-3 text-xs">
        <p class="font-bold">{{ priceTargetProduct.name }}</p>
        <p class="text-brand-gray font-mono">التكلفة: {{ priceTargetProduct.costPrice.toFixed(2) }} ج.م</p>
        <input v-model.number="quickNewPrice" type="number" min="0.1" step="0.01" class="w-full p-2.5 rounded-xl border font-mono font-bold text-center" />
        <button type="button" @click="submitQuickPrice" class="w-full py-2.5 rounded-xl bg-brand-accent text-brand-dark font-bold cursor-pointer">
          حفظ السعر وتفعيله بالبيع
        </button>
      </div>
    </Dialog>

    <!-- ==================== MODAL: HELD SALES ==================== -->
    <Dialog v-model:visible="showHeldModal" modal header="الفواتير المعلقة" class="max-w-md w-full">
      <div class="space-y-2 text-xs">
        <div v-for="(h, idx) in heldSales" :key="idx" class="p-3 rounded-xl border flex items-center justify-between">
          <div>
            <div class="font-bold">{{ h.items.length }} أصناف — {{ h.total.toFixed(2) }} ج.م</div>
            <div class="text-[10px] text-brand-gray">{{ h.time }}</div>
          </div>
          <button type="button" @click="resumeHeldSale(idx)" class="px-3 py-1.5 rounded-lg bg-brand-accent text-brand-dark font-bold cursor-pointer">استئناف</button>
        </div>
      </div>
    </Dialog>

    <!-- ==================== MODAL: 80mm THERMAL RECEIPT WITH QR ==================== -->
    <Dialog v-model:visible="showReceiptModal" modal header="إيصال فاتورة نقطة البيع (80mm)" class="max-w-sm w-full">
      <div v-if="receiptData" id="thermalReceipt" class="p-3 bg-white text-black font-mono text-xs space-y-3">
        <div class="text-center pb-2 border-b border-dashed border-gray-400">
          <h2 class="text-base font-extrabold">{{ authStore.user?.tenantName || 'مركز خدمة السيارات' }}</h2>
          <p class="text-[11px] font-bold mt-1">{{ receiptData.invoiceNumber }}</p>
          <p class="text-[10px] text-gray-500">{{ formatDate(receiptData.invoiceDate) }}</p>
        </div>
        <div class="text-[10px] space-y-0.5 pb-2 border-b border-dashed border-gray-400">
          <div class="flex justify-between"><span>العميل:</span><span>{{ receiptData.clientName || 'عميل نقدي' }}</span></div>
          <div class="flex justify-between"><span>السداد:</span><span>{{ receiptData.paymentMethodName }}</span></div>
        </div>
        <table class="w-full text-right text-[11px]">
          <thead><tr class="border-b border-gray-400"><th class="py-1">الصنف</th><th class="py-1 text-center">الكمية</th><th class="py-1 text-left">الإجمالي</th></tr></thead>
          <tbody class="divide-y divide-dotted divide-gray-300">
            <tr v-for="it in receiptData.items" :key="it.id">
              <td class="py-1 font-bold">{{ it.productName }}</td>
              <td class="py-1 text-center">{{ it.quantity }} {{ it.unitName }}</td>
              <td class="py-1 text-left font-bold">{{ it.totalPrice.toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
        <div class="pt-2 border-t border-dashed border-gray-400 flex justify-between text-sm font-extrabold">
          <span>الصافي المدفوع:</span>
          <span>{{ receiptData.netAmount.toFixed(2) }} ج.م</span>
        </div>
        <div v-if="receiptData.documentToken" class="text-center pt-2 border-t border-dashed border-gray-400">
          <QrCodeCanvas :value="receiptData.documentToken" :size="80" />
          <p class="text-[9px] text-gray-500 mt-1">امسح الرمز لإجراء مرتجع سريع</p>
        </div>
      </div>

      <div class="flex items-center justify-between gap-2 pt-3 border-t border-brand-gray/15 print:hidden">
        <button
          type="button"
          @click="showReceiptModal = false; focusSearch()"
          class="px-3.5 py-2 rounded-xl border border-brand-gray/25 hover:bg-black/5 text-xs font-bold cursor-pointer"
        >
          إغلاق (بيع تالٍ)
        </button>
        <div class="flex items-center gap-2">
          <button
            v-if="receiptData?.id"
            type="button"
            @click="downloadServerPdf(`/api/ReportsPdf/pos/${receiptData.id}?paperSize=Thermal80mm`, `POS_${receiptData.invoiceNumber || 'receipt'}.pdf`)"
            class="px-3 py-2 rounded-xl bg-rose-600/15 text-rose-700 dark:text-rose-400 border border-rose-500/30 font-bold text-xs cursor-pointer hover:bg-rose-600/25 transition-colors flex items-center gap-1.5"
            title="تحميل نسخة PDF جاهزة للطباعة"
          >
            <Download class="w-3.5 h-3.5" />
            <span>تحميل PDF</span>
          </button>
          <button
            type="button"
            @click="printReceipt"
            class="px-4 py-2 rounded-xl bg-brand-accent text-brand-dark font-extrabold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm hover:brightness-105 transition-all"
          >
            <Printer class="w-4 h-4" />
            <span>طباعة الإيصال (80mm)</span>
          </button>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useToast } from "primevue/usetoast";
import { useOhdaPosStore } from "../stores/useOhdaPosStore";
import { useOhdaFinanceStore } from "../stores/useOhdaFinanceStore";
import { useOhdaAuthStore } from "../stores/useOhdaAuthStore";
import { normalizeArabic } from "../utils/arabicNormalizer";
import QrCodeCanvas from "../components/QrCodeCanvas.vue";
import { downloadServerPdf } from "../utils/pdfHelper";
import apiClient from "@/utilities/apiClient";
import Dialog from "primevue/dialog";
import {
  ShoppingCart, Barcode, Trash2, Printer, Receipt, AlertCircle, RefreshCw, PauseCircle, Download
} from "lucide-vue-next";

const toast = useToast();
const posStore = useOhdaPosStore();
const financeStore = useOhdaFinanceStore();
const authStore = useOhdaAuthStore();

const activeView = ref("pos");
const searchInputRef = ref(null);
const searchQuery = ref("");
const selectedCategoryId = ref(null);
const quickFilterMode = ref("all");
const favoriteIds = ref(JSON.parse(localStorage.getItem("ohda_pos_favorites") || "[]"));
const heldSales = ref(JSON.parse(localStorage.getItem("ohda_pos_held") || "[]"));

const cartItems = ref([]);
const selectedClientId = ref(null);
const overallDiscount = ref(0);
const clients = ref([]);
const invoiceSearchQuery = ref("");

// Modals
const showCashModal = ref(false);
const cashReceived = ref(0);
const showReceiptModal = ref(false);
const receiptData = ref(null);
const lastReceipt = ref(null);
const showHeldModal = ref(false);
const showPriceModal = ref(false);
const priceTargetProduct = ref(null);
const quickNewPrice = ref(0);

// Serial Prompt
const showSerialPrompt = ref(false);
const serialPromptProduct = ref(null);
const serialPromptAvailable = ref([]);
const serialPromptScan = ref("");

let refreshInterval = null;
let keyBuffer = "";
let lastKeyTime = 0;

const canSetPrice = computed(() => ["SuperAdmin", "Admin", "Manager", "Supervisor", 0, 1, 4, 3].includes(authStore.user?.role));

onMounted(async () => {
  await Promise.all([
    posStore.fetchCatalog(),
    financeStore.fetchAccounts(),
    financeStore.fetchCurrentDrawerSession(),
    loadClients(),
    posStore.fetchInvoices()
  ]);

  window.addEventListener("keydown", handleGlobalKeyDown);
  window.addEventListener("focus", refreshCatalog);
  refreshInterval = setInterval(refreshCatalog, 45000); // Keep list fresh every 45s
  focusSearch();
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleGlobalKeyDown);
  window.removeEventListener("focus", refreshCatalog);
  if (refreshInterval) clearInterval(refreshInterval);
});

async function refreshCatalog() {
  await posStore.fetchCatalog();
}

function focusSearch() {
  setTimeout(() => searchInputRef.value?.focus(), 50);
}

function playBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    osc.frequency.value = 880;
    osc.connect(ctx.destination);
    osc.start();
    setTimeout(() => osc.stop(), 80);
  } catch {}
}

function handleGlobalKeyDown(e) {
  if (e.key === "F2" && cartItems.value.length > 0) { e.preventDefault(); openCashPaymentModal(); return; }
  if (e.key === "F3" && cartItems.value.length > 0) { e.preventDefault(); submitSaleWithMethod(3); return; }
  if (e.key === "F4") { e.preventDefault(); focusSearch(); return; }
  if (e.key === "F6" && cartItems.value.length > 0) { e.preventDefault(); submitSaleWithMethod(2); return; }
  if (e.key === "F7" && cartItems.value.length > 0) { e.preventDefault(); submitSaleWithMethod(5); return; }

  // Fast keystroke burst scanner detection even when search box is not focused
  const activeTag = document.activeElement?.tagName;
  if (activeTag === "INPUT" || activeTag === "TEXTAREA" || activeTag === "SELECT") return;
  const now = Date.now();
  if (now - lastKeyTime > 80) keyBuffer = "";
  lastKeyTime = now;
  if (e.key === "Enter" && keyBuffer.length >= 3) {
    searchQuery.value = keyBuffer;
    keyBuffer = "";
    handleScanOrSearchEnter();
  } else if (e.key.length === 1) {
    keyBuffer += e.key;
  }
}

const categoryTiles = computed(() => {
  const map = new Map();
  for (const p of posStore.catalog) {
    if (!map.has(p.categoryId)) map.set(p.categoryId, { id: p.categoryId, name: p.categoryName, count: 0 });
    map.get(p.categoryId).count++;
  }
  return Array.from(map.values());
});

const displayedCatalog = computed(() => {
  let list = posStore.catalog || [];
  if (selectedCategoryId.value !== null) {
    list = list.filter(p => p.categoryId === selectedCategoryId.value);
  }
  if (quickFilterMode.value === "favorites") {
    list = list.filter(p => favoriteIds.value.includes(p.id));
  } else if (quickFilterMode.value === "recent") {
    list = list.filter(p => p.sellableQuantity > 0).slice(0, 24);
  }
  const norm = normalizeArabic(searchQuery.value);
  if (norm) {
    list = list.filter(p =>
      p.normalizedName.includes(norm) ||
      p.sku.toLowerCase().includes(norm) ||
      p.barcode.toLowerCase().includes(norm)
    );
  }
  return list.slice(0, 80); // Fast UI slice for <100ms even at 20,000 items
});

function toggleFavorite(id) {
  if (favoriteIds.value.includes(id)) favoriteIds.value = favoriteIds.value.filter(x => x !== id);
  else favoriteIds.value.push(id);
  localStorage.setItem("ohda_pos_favorites", JSON.stringify(favoriteIds.value));
}

async function handleScanOrSearchEnter() {
  const code = (searchQuery.value || "").trim();
  if (!code) return;
  const codeLower = code.toLowerCase();

  // 1. Direct barcode/SKU match
  const matchedProd = (posStore.catalog || []).find(p =>
    (p.barcode && p.barcode.toLowerCase() === codeLower) || (p.sku && p.sku.toLowerCase() === codeLower)
  );
  if (matchedProd) {
    searchQuery.value = "";
    playBeep();
    await onProductCardClick(matchedProd);
    return;
  }

  // 2. Check if code is a SerialNumber in stock
  try {
    const res = await apiClient.get(`/api/ProductItem/serial/${encodeURIComponent(code)}`);
    if (res?.data?.isDone && res.data.singleObject?.status === 1) {
      const snItem = res.data.singleObject;
      const p = posStore.catalog.find(x => x.id === snItem.productId);
      if (p) {
        searchQuery.value = "";
        playBeep();
        addSerializedUnitToCart(p, snItem.serialNumber);
        return;
      }
    }
  } catch {}

  // 3. Unknown barcode notice
  if (displayedCatalog.value.length === 1) {
    await onProductCardClick(displayedCatalog.value[0]);
    searchQuery.value = "";
  } else if (displayedCatalog.value.length === 0) {
    toast.add({ severity: "warn", summary: "غير موجود", detail: `لم يتم العثور على باركود '${code}'. المنتجات تُضاف من شاشة المشتريات فقط.`, life: 3500 });
  }
}

async function onProductCardClick(p) {
  if (p.isUnpriced) {
    toast.add({ severity: "warn", summary: "بدون سعر بيع", detail: `الصنف '${p.name}' بدون سعر بيع. يجب تسعيره أولاً.`, life: 3000 });
    return;
  }
  if (p.sellableQuantity <= 0) {
    toast.add({ severity: "error", summary: "نفد الرصيد", detail: `لا يوجد رصيد صالح للبيع من '${p.name}'.`, life: 3000 });
    return;
  }
  if (p.trackSerialNumbers) {
    serialPromptProduct.value = p;
    serialPromptScan.value = "";
    const res = await apiClient.get(`/api/ProductItem/product/${p.id}/instock`);
    serialPromptAvailable.value = res?.data?.objects || [];
    showSerialPrompt.value = true;
    return;
  }
  addStandardProductToCart(p);
}

function addStandardProductToCart(p) {
  const existing = cartItems.value.find(it => it.productId === p.id && it.selectedUnitKey === "base");
  if (existing) {
    if (existing.quantity + 1 > p.sellableQuantity) {
      toast.add({ severity: "warn", summary: "سقف المخزون", detail: `المتاح فقط ${p.sellableQuantity}`, life: 2500 });
      return;
    }
    existing.quantity += 1;
  } else {
    cartItems.value.push({
      productId: p.id,
      name: p.name,
      baseUnit: p.unit,
      unitName: p.unit,
      selectedUnitKey: "base",
      packageId: null,
      packageMultiplier: 1,
      baseUnitPrice: p.unitPrice,
      unitPrice: p.unitPrice,
      quantity: 1,
      maxQty: p.sellableQuantity,
      packages: p.packages || [],
      trackSerialNumbers: false,
      serialNumbers: []
    });
  }
}

function addSerializedUnitToCart(p, serial) {
  const existing = cartItems.value.find(it => it.productId === p.id);
  if (existing) {
    if (existing.serialNumbers.includes(serial)) {
      toast.add({ severity: "warn", summary: "مكرر", detail: "هذا السيريال مضاف بالسلة بالفعل", life: 2500 });
      return;
    }
    existing.serialNumbers.push(serial);
    existing.quantity = existing.serialNumbers.length;
  } else {
    cartItems.value.push({
      productId: p.id,
      name: p.name,
      baseUnit: p.unit,
      unitName: p.unit,
      selectedUnitKey: "base",
      packageId: null,
      packageMultiplier: 1,
      baseUnitPrice: p.unitPrice,
      unitPrice: p.unitPrice,
      quantity: 1,
      maxQty: p.sellableQuantity,
      packages: [],
      trackSerialNumbers: true,
      serialNumbers: [serial]
    });
  }
  showSerialPrompt.value = false;
}

function selectSerialByScan() {
  const sn = (serialPromptScan.value || "").trim();
  const found = serialPromptAvailable.value.find(x => x.serialNumber.toLowerCase() === sn.toLowerCase());
  if (found) addSerializedUnitToCart(serialPromptProduct.value, found.serialNumber);
  else toast.add({ severity: "error", summary: "غير متاح", detail: `السيريال '${sn}' غير متوفر في المخزن لهذا الصنف`, life: 2500 });
}

function handleUnitChange(item) {
  if (item.selectedUnitKey === "base") {
    item.packageId = null;
    item.packageMultiplier = 1;
    item.unitName = item.baseUnit;
    item.unitPrice = item.baseUnitPrice;
  } else {
    const pkgId = parseInt(item.selectedUnitKey.replace("pkg-", ""));
    const pk = item.packages.find(x => x.id === pkgId);
    if (pk) {
      item.packageId = pk.id;
      item.packageMultiplier = pk.multiplier;
      item.unitName = pk.name;
      item.unitPrice = pk.salePrice || (item.baseUnitPrice * pk.multiplier);
    }
  }
}

function decrementCartQty(idx) {
  if (cartItems.value[idx].trackSerialNumbers) {
    cartItems.value[idx].serialNumbers.pop();
    cartItems.value[idx].quantity = cartItems.value[idx].serialNumbers.length;
    if (cartItems.value[idx].quantity <= 0) cartItems.value.splice(idx, 1);
  } else {
    if (cartItems.value[idx].quantity > 1) cartItems.value[idx].quantity -= 1;
    else cartItems.value.splice(idx, 1);
  }
}

function incrementCartQty(item) {
  if (item.trackSerialNumbers) {
    onProductCardClick(posStore.catalog.find(p => p.id === item.productId));
  } else {
    item.quantity += 1;
  }
}

function clearCart() {
  cartItems.value = [];
  overallDiscount.value = 0;
  selectedClientId.value = null;
}

const subTotal = computed(() => cartItems.value.reduce((s, it) => s + (it.quantity * it.unitPrice), 0));
const netTotal = computed(() => Math.max(0, subTotal.value - (overallDiscount.value || 0)));
const cashChangeDue = computed(() => (cashReceived.value || 0) - netTotal.value);

function openCashPaymentModal() {
  cashReceived.value = netTotal.value;
  showCashModal.value = true;
}

async function confirmCashSale() {
  showCashModal.value = false;
  await submitSaleWithMethod(1);
}

async function submitSaleWithMethod(method) {
  if (method === 5 && !selectedClientId.value) {
    toast.add({ severity: "warn", summary: "مطلوب", detail: "البيع الآجل يتطلب اختيار عميل مسجل.", life: 3000 });
    return;
  }
  const payload = {
    clientId: selectedClientId.value,
    paymentMethod: method,
    discountAmount: Number(overallDiscount.value) || 0,
    items: cartItems.value.map(it => ({
      productId: it.productId,
      packageId: it.packageId,
      unitName: it.unitName,
      packageMultiplier: it.packageMultiplier,
      quantity: it.quantity,
      unitPrice: it.unitPrice,
      serialNumbers: it.serialNumbers || []
    }))
  };

  const res = await posStore.createSale(payload);
  if (res.success) {
    toast.add({ severity: "success", summary: "تمت العملية", detail: res.message, life: 3000 });
    clearCart();
    lastReceipt.value = res.invoice;
    receiptData.value = res.invoice;
    showReceiptModal.value = true;
    await posStore.fetchCatalog();
  } else {
    toast.add({ severity: "error", summary: "خطأ", detail: res.message, life: 4500 });
  }
}

function holdCurrentSale() {
  heldSales.value.push({
    items: JSON.parse(JSON.stringify(cartItems.value)),
    clientId: selectedClientId.value,
    total: netTotal.value,
    time: new Date().toLocaleTimeString("ar-EG")
  });
  localStorage.setItem("ohda_pos_held", JSON.stringify(heldSales.value));
  clearCart();
  toast.add({ severity: "info", summary: "تم التعليق", detail: "تم تعليق الفاتورة بنجاح", life: 2500 });
}

function resumeHeldSale(idx) {
  const h = heldSales.value[idx];
  cartItems.value = h.items;
  selectedClientId.value = h.clientId;
  heldSales.value.splice(idx, 1);
  localStorage.setItem("ohda_pos_held", JSON.stringify(heldSales.value));
  showHeldModal.value = false;
}

function openQuickPriceModal(p) {
  priceTargetProduct.value = p;
  quickNewPrice.value = p.costPrice > 0 ? Math.round(p.costPrice * 1.3) : 0;
  showPriceModal.value = true;
}

async function submitQuickPrice() {
  const res = await posStore.quickSetPrice(priceTargetProduct.value.id, quickNewPrice.value);
  if (res.success) {
    showPriceModal.value = false;
    toast.add({ severity: "success", summary: "تم التسعير", detail: res.message, life: 3000 });
  } else {
    toast.add({ severity: "error", summary: "خطأ", detail: res.message, life: 3000 });
  }
}

async function loadClients() {
  try {
    const res = await apiClient.get("/api/Clients");
    if (res?.data?.isDone) clients.value = res.data.objects || [];
  } catch {}
}

function printReceipt() {
  const printElem = document.getElementById("thermalReceipt");
  if (!printElem) return;

  const win = window.open("", "_blank", "width=420,height=650");
  if (!win) {
    printViaIframe(printElem);
    return;
  }

  win.document.write(`
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="utf-8">
      <title>إيصال نقطة البيع - ${receiptData.value?.invoiceNumber || 'POS'}</title>
      <style>
        @page { size: 80mm auto; margin: 3mm; }
        body {
          font-family: 'Courier New', Courier, monospace, 'Segoe UI', Tahoma, sans-serif;
          font-size: 11px;
          line-height: 1.35;
          width: 74mm;
          margin: 0 auto;
          color: #000;
          direction: rtl;
          background: #fff;
        }
        table { width: 100%; border-collapse: collapse; margin: 4px 0; }
        th, td { padding: 3px 0; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .text-left { text-align: left; }
        .border-b { border-bottom: 1px dashed #555; }
        .border-t { border-top: 1px dashed #555; }
        .font-bold { font-weight: bold; }
        .font-extrabold { font-weight: 900; }
        .space-y-3 > * + * { margin-top: 8px; }
        .space-y-0.5 > * + * { margin-top: 2px; }
        .flex { display: flex; }
        .justify-between { justify-content: space-between; }
        .text-base { font-size: 14px; }
        .text-sm { font-size: 12px; }
        .text-\\[11px\\] { font-size: 11px; }
        .text-\\[10px\\] { font-size: 10px; }
        .text-\\[9px\\] { font-size: 9px; }
        .text-gray-500 { color: #555; }
        canvas, img { display: block; margin: 6px auto; }
      </style>
    </head>
    <body>
      ${printElem.innerHTML}
    </body>
    </html>
  `);

  // Convert canvas (QR code) to image in print window
  const sourceCanvases = printElem.querySelectorAll("canvas");
  const targetCanvases = win.document.querySelectorAll("canvas");
  sourceCanvases.forEach((sc, i) => {
    if (targetCanvases[i]) {
      const img = win.document.createElement("img");
      img.src = sc.toDataURL("image/png");
      img.style.width = (sc.width || 80) + "px";
      img.style.height = (sc.height || 80) + "px";
      img.style.margin = "6px auto";
      img.style.display = "block";
      targetCanvases[i].parentNode.replaceChild(img, targetCanvases[i]);
    }
  });

  win.document.close();
  win.focus();
  setTimeout(() => {
    win.print();
    win.close();
  }, 400);
}

function printViaIframe(printElem) {
  let iframe = document.getElementById("pos-print-frame");
  if (!iframe) {
    iframe = document.createElement("iframe");
    iframe.id = "pos-print-frame";
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "none";
    document.body.appendChild(iframe);
  }
  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="utf-8">
      <title>إيصال نقطة البيع</title>
      <style>
        @page { size: 80mm auto; margin: 3mm; }
        body { font-family: 'Courier New', monospace; font-size: 11px; width: 74mm; margin: 0 auto; direction: rtl; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 2px 0; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .text-left { text-align: left; }
        .border-b { border-bottom: 1px dashed #555; }
        .border-t { border-top: 1px dashed #555; }
        .font-bold { font-weight: bold; }
        img { display: block; margin: 4px auto; }
      </style>
    </head>
    <body>
      ${printElem.innerHTML}
    </body>
    </html>
  `);
  const sourceCanvases = printElem.querySelectorAll("canvas");
  const targetCanvases = doc.querySelectorAll("canvas");
  sourceCanvases.forEach((sc, i) => {
    if (targetCanvases[i]) {
      const img = doc.createElement("img");
      img.src = sc.toDataURL("image/png");
      img.style.width = (sc.width || 80) + "px";
      img.style.height = (sc.height || 80) + "px";
      img.style.margin = "4px auto";
      img.style.display = "block";
      targetCanvases[i].parentNode.replaceChild(img, targetCanvases[i]);
    }
  });
  doc.close();
  setTimeout(() => {
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
  }, 400);
}

function formatDate(d) { return d ? new Date(d).toLocaleString("ar-EG", { dateStyle: "short", timeStyle: "short" }) : ""; }
</script>
