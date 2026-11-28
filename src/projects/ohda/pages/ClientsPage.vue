<template>
  <div class="space-y-6">
    <!-- Header Card -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-brand-white dark:bg-brand-dark p-6 rounded-3xl border border-brand-gray/15 shadow-xs">
      <div class="flex items-center gap-3.5">
        <div class="w-12 h-12 rounded-2xl bg-brand-soft dark:bg-brand-accent/15 text-brand-accent flex items-center justify-center border border-brand-accent/20 shrink-0">
          <Users class="w-6 h-6" />
        </div>
        <div>
          <h1 class="text-xl font-bold text-brand-dark dark:text-white flex items-center gap-2">
            <span>العملاء والمركبات (CRM)</span>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-mono bg-brand-accent/20 text-brand-dark dark:text-white font-bold">
              {{ clientStore.totalClients }} عميل
            </span>
          </h1>
          <p class="text-xs text-brand-gray dark:text-brand-gray/80 mt-0.5">
            إدارة ملفات العملاء، أسطول المركبات، متابعة الأرصدة والمديونيات، وتاريخ الزيارات والصيانة
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2.5 flex-wrap">
        <!-- Excel Export Button -->
        <button
          type="button"
          @click="exportClientsToExcel"
          class="px-3.5 py-2.5 rounded-2xl border border-brand-gray/25 hover:border-emerald-500 hover:text-emerald-600 text-brand-dark dark:text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
          title="تصدير كافة العملاء والمركبات إلى ملف Excel"
        >
          <FileSpreadsheet class="w-4 h-4 text-emerald-600" />
          <span>تصدير Excel</span>
        </button>

        <!-- Excel Import Button -->
        <button
          type="button"
          @click="showImportModal = true"
          class="px-3.5 py-2.5 rounded-2xl border border-brand-gray/25 hover:border-brand-accent text-brand-dark dark:text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
          title="استيراد بيانات العملاء والمركبات من ملف Excel أو CSV"
        >
          <Upload class="w-4 h-4 text-brand-accent" />
          <span>استيراد Excel</span>
        </button>

        <button
          type="button"
          @click="openCreateModal"
          class="px-5 py-2.5 bg-brand-accent hover:bg-brand-accent/90 text-brand-dark font-bold rounded-2xl text-xs flex items-center gap-2 shadow-sm transition-transform active:scale-95 cursor-pointer"
        >
          <UserPlus class="w-4 h-4" />
          <span>إضافة عميل ومركبة جديدة</span>
        </button>
      </div>
    </div>

    <!-- Quick KPI Summary Strip -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
      <div class="bg-brand-white dark:bg-brand-dark p-4 rounded-2xl border border-brand-gray/15 shadow-xs">
        <div class="flex items-center justify-between">
          <span class="text-xs text-brand-gray font-medium">إجمالي العملاء</span>
          <span class="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Users class="w-4 h-4" />
          </span>
        </div>
        <div class="text-xl font-extrabold font-mono text-brand-dark dark:text-white mt-1">
          {{ clientStore.totalClients }}
        </div>
        <div class="text-[10px] text-brand-gray mt-1">
          {{ clientStore.individualClientsCount }} أفراد &bull; {{ clientStore.companyClientsCount }} شركات وأساطيل
        </div>
      </div>

      <div class="bg-brand-white dark:bg-brand-dark p-4 rounded-2xl border border-brand-gray/15 shadow-xs">
        <div class="flex items-center justify-between">
          <span class="text-xs text-brand-gray font-medium">المركبات المسجلة</span>
          <span class="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <Car class="w-4 h-4" />
          </span>
        </div>
        <div class="text-xl font-extrabold font-mono text-purple-600 dark:text-purple-400 mt-1">
          {{ clientStore.totalVehicles }}
        </div>
        <div class="text-[10px] text-brand-gray mt-1">
          مركبة مسجلة بالورشة ومربوطة بأصحابها
        </div>
      </div>

      <div class="bg-brand-white dark:bg-brand-dark p-4 rounded-2xl border border-brand-gray/15 shadow-xs">
        <div class="flex items-center justify-between">
          <span class="text-xs text-rose-600 dark:text-rose-400 font-medium">مديونيات مستحقة (لنا)</span>
          <span class="p-2 rounded-xl bg-rose-500/10 text-rose-600">
            <Banknote class="w-4 h-4" />
          </span>
        </div>
        <div class="text-xl font-extrabold font-mono text-rose-600 dark:text-rose-400 mt-1">
          {{ formatCurrency(clientStore.totalReceivables) }}
        </div>
        <div class="text-[10px] text-rose-600/80 mt-1">
          على عدد {{ clientStore.owingClientsCount }} عميل لم يتم السداد
        </div>
      </div>

      <div class="bg-brand-white dark:bg-brand-dark p-4 rounded-2xl border border-brand-gray/15 shadow-xs">
        <div class="flex items-center justify-between">
          <span class="text-xs text-brand-gray font-medium">إجمالي مبيعات العملاء</span>
          <span class="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
            <Wrench class="w-4 h-4" />
          </span>
        </div>
        <div class="text-xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
          {{ formatCurrency(clientStore.totalSpentAll) }}
        </div>
        <div class="text-[10px] text-brand-gray mt-1">
          إجمالي المبالغ المسددة من أوامر الشغل
        </div>
      </div>
    </div>

    <!-- Clients Table with Search and Filters Toolbar -->
    <OhdaDataTable
      :columns="tableColumns"
      :items="filteredClients"
      :loading="clientStore.loading"
      :rowsPerPage="10"
      emptyTitle="لا يوجد عملاء مطابقين للبحث"
      emptyMessage="جرّب تعديل معايير البحث أو الفلتر، أو أضف عميلاً جديداً."
      :emptyIcon="Users"
    >
      <template #toolbar>
        <div class="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 w-full">
          <!-- Search input across Name, Phone, Plate -->
          <div class="relative w-full lg:w-96">
            <Search class="w-4 h-4 text-brand-gray absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              v-model="searchQuery"
              @input="handleSearchInput"
              type="text"
              placeholder="بحث بالاسم، رقم الهاتف، أو رقم لوحة السيارة..."
              class="w-full bg-brand-white dark:bg-brand-dark border border-brand-gray/25 rounded-xl pr-9 pl-3 py-2 text-xs text-brand-dark dark:text-white placeholder:text-brand-gray/60 focus:border-brand-accent transition-all"
            />
          </div>

          <!-- Filters Strip -->
          <div class="flex items-center gap-2 flex-wrap text-xs">
            <!-- Type Filter -->
            <select
              v-model="typeFilter"
              class="px-3 py-1.5 rounded-xl border border-brand-gray/25 bg-brand-white dark:bg-brand-dark text-xs font-medium text-brand-dark dark:text-white focus:border-brand-accent cursor-pointer"
            >
              <option :value="null">كل الأنواع</option>
              <option :value="1">أفراد (ملاكي)</option>
              <option :value="2">شركات وأساطيل</option>
            </select>

            <!-- Tag Filter -->
            <select
              v-model="tagFilter"
              class="px-3 py-1.5 rounded-xl border border-brand-gray/25 bg-brand-white dark:bg-brand-dark text-xs font-medium text-brand-dark dark:text-white focus:border-brand-accent cursor-pointer"
            >
              <option :value="null">كل التصنيفات (الوسوم)</option>
              <option v-for="tag in customerTags" :key="tag.id" :value="tag.id">
                {{ tag.labelAr }}
              </option>
            </select>

            <!-- Balance Filter Toggle -->
            <button
              type="button"
              @click="hasBalanceFilter = !hasBalanceFilter"
              class="px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              :class="hasBalanceFilter ? 'bg-rose-500/15 border-rose-500/30 text-rose-700 dark:text-rose-300 font-bold' : 'border-brand-gray/25 text-brand-gray hover:text-brand-dark'"
            >
              <Banknote class="w-3.5 h-3.5" />
              <span>عليهم مديونية فقط</span>
            </button>
          </div>
        </div>
      </template>

      <!-- Name & Type & Tags Column -->
      <template #name="{ row, data }">
        <div class="space-y-1">
          <div class="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              @click="openCustomer360Modal(row || data)"
              class="font-bold text-brand-dark dark:text-white hover:text-brand-accent transition-colors text-right cursor-pointer"
            >
              {{ (row || data)?.name }}
            </button>
            <span
              class="px-2 py-0.5 rounded-md text-[10px] font-bold"
              :class="(row || data)?.type === 2 ? 'bg-blue-500/15 text-blue-700 dark:text-blue-300' : 'bg-black/5 dark:bg-white/10 text-brand-gray'"
            >
              {{ (row || data)?.typeName }}
            </span>
          </div>

          <!-- Tags Chips -->
          <div v-if="(row || data)?.tags && (row || data)?.tags.length" class="flex items-center gap-1 flex-wrap">
            <span
              v-for="t in (row || data)?.tags"
              :key="t.id"
              class="px-1.5 py-0.2 rounded text-[9px] font-semibold flex items-center gap-1 border border-black/10"
              :style="{ backgroundColor: (t.colorCode || '#8b5cf6') + '22', color: t.colorCode || '#8b5cf6' }"
            >
              <span class="w-1.5 h-1.5 rounded-full" :style="{ backgroundColor: t.colorCode || '#8b5cf6' }"></span>
              {{ t.labelAr }}
            </span>
          </div>
        </div>
      </template>

      <!-- Phones Column -->
      <template #phone="{ row, data }">
        <div>
          <div class="font-mono text-xs font-bold text-brand-dark dark:text-white flex items-center gap-1">
            <Phone class="w-3 h-3 text-brand-accent shrink-0" />
            <span dir="ltr">{{ (row || data)?.phone }}</span>
          </div>
          <div v-if="(row || data)?.secondPhone" class="font-mono text-[10px] text-brand-gray mt-0.5" dir="ltr">
            {{ (row || data)?.secondPhone }}
          </div>
        </div>
      </template>

      <!-- Vehicles Column -->
      <template #vehicles="{ row, data }">
        <div>
          <div v-if="(row || data)?.vehicles && (row || data)?.vehicles.length" class="flex items-center gap-1.5 flex-wrap">
            <span
              v-for="v in (row || data)?.vehicles"
              :key="v.id"
              class="px-2 py-0.5 rounded-lg bg-brand-light/60 dark:bg-white/5 border border-brand-gray/20 font-mono text-[11px] font-bold text-brand-dark dark:text-white flex items-center gap-1"
            >
              <Car class="w-3 h-3 text-brand-gray shrink-0" />
              <span>{{ v.plateNumber }}</span>
              <span v-if="v.model" class="text-[9px] text-brand-gray font-sans">({{ v.brandName || v.brand || '' }} {{ v.model }})</span>
            </span>
          </div>
          <div v-else-if="(row || data)?.carPlate" class="font-mono text-xs text-brand-gray">
            {{ (row || data)?.carPlate }} {{ (row || data)?.carModel ? `(${(row || data)?.carModel})` : '' }}
          </div>
          <div v-else class="text-[11px] text-brand-gray/60">
            لا توجد مركبات
          </div>
        </div>
      </template>

      <!-- Balance Column -->
      <template #currentBalance="{ row, data }">
        <div>
          <span
            class="font-mono font-bold px-2.5 py-1 rounded-xl text-xs inline-block"
            :class="getBalanceBadgeClass((row || data)?.currentBalance || 0)"
          >
            {{ formatCurrency(Math.abs((row || data)?.currentBalance || 0)) }}
          </span>
          <div
            class="text-[10px] font-semibold mt-0.5"
            :class="((row || data)?.currentBalance || 0) > 0 ? 'text-red-600 dark:text-red-400 font-bold' : ((row || data)?.currentBalance || 0) < 0 ? 'text-emerald-600' : 'text-brand-gray'"
          >
            {{ getClientBalanceLabel((row || data)?.currentBalance || 0) }}
          </div>
        </div>
      </template>

      <!-- Stats: Total Spent & Visits -->
      <template #stats="{ row, data }">
        <div class="text-xs">
          <div class="font-mono font-bold text-brand-dark dark:text-white">
            {{ formatCurrency((row || data)?.totalSpent || 0) }}
          </div>
          <div class="text-[10px] text-brand-gray mt-0.5">
            {{ (row || data)?.visitsCount || 0 }} زيارات &bull; {{ (row || data)?.lastVisitDate ? formatDate((row || data)?.lastVisitDate) : 'لم يسجل' }}
          </div>
        </div>
      </template>

      <!-- Actions Column -->
      <template #actions="{ row, data }">
        <div class="flex items-center justify-center gap-1.5">
          <!-- 360 CRM Hub Action -->
          <button
            type="button"
            @click="openCustomer360Modal(row || data)"
            class="px-2.5 py-1.5 bg-brand-soft hover:bg-brand-accent/20 text-brand-dark dark:text-white rounded-xl text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1 border border-brand-accent/20"
            title="ملف العميل الكامل ومركباته"
          >
            <Users class="w-3.5 h-3.5 text-brand-accent" />
            <span>الملف</span>
          </button>

          <!-- Record Payment Action (Only if client has unpaid balance) -->
          <button
            v-if="((row || data)?.currentBalance || 0) > 0"
            type="button"
            @click="openPaymentModal(row || data)"
            class="px-2 py-1.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-700 hover:text-white rounded-xl text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
            title="تحصيل مديونية مستحقة"
          >
            <Banknote class="w-3.5 h-3.5" />
            <span>تحصيل</span>
          </button>

          <!-- Edit Action -->
          <button
            type="button"
            @click="openEditModal(row || data)"
            class="p-1.5 rounded-lg text-brand-gray hover:text-brand-dark dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
            title="تعديل بيانات العميل"
          >
            <Edit2 class="w-4 h-4" />
          </button>

          <!-- Delete Action -->
          <button
            type="button"
            @click="confirmDelete(row || data)"
            class="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
            title="حذف العميل"
          >
            <Trash2 class="w-4 h-4" />
          </button>
        </div>
      </template>
    </OhdaDataTable>

    <!-- ========================================== -->
    <!-- 1. Customer 360 CRM Hub Modal              -->
    <!-- ========================================== -->
    <OhdaModal
      :visible="showCustomer360"
      :close-on-backdrop="false"
      @close="showCustomer360 = false"
      :title="`ملف العميل: ${activeClient?.name || ''}`"
      :description="`${activeClient?.typeName || 'عميل'} &bull; ${activeClient?.phone || ''}`"
      :icon="Users"
      max-width="max-w-4xl"
    >
      <div v-if="activeClient" class="space-y-5">
        <!-- Top Summary Strip & Quick Actions -->
        <div class="p-4 rounded-2xl bg-brand-light/50 dark:bg-white/5 border border-brand-gray/15 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="w-11 h-11 rounded-2xl bg-brand-accent/20 text-brand-dark dark:text-white font-bold flex items-center justify-center text-base">
              {{ (activeClient?.name || 'ع').charAt(0) }}
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="font-bold text-sm text-brand-dark dark:text-white">{{ activeClient?.name || '' }}</span>
                <span
                  class="px-2 py-0.5 rounded text-[10px] font-bold"
                  :class="activeClient.type === 2 ? 'bg-blue-500/15 text-blue-700 dark:text-blue-300' : 'bg-black/5 dark:bg-white/10 text-brand-gray'"
                >
                  {{ activeClient.typeName }}
                </span>
              </div>
              <div class="text-xs text-brand-gray mt-0.5 flex items-center gap-3 font-mono">
                <span>{{ activeClient.phone }}</span>
                <span v-if="activeClient.secondPhone">بديل: {{ activeClient.secondPhone }}</span>
              </div>
            </div>
          </div>

          <!-- Balance & Action Badges -->
          <div class="flex items-center gap-2 flex-wrap">
            <div class="px-3 py-1.5 rounded-xl border border-brand-gray/20 text-right bg-brand-white dark:bg-brand-dark">
              <div class="text-[9px] text-brand-gray">الرصيد القائم</div>
              <div
                class="font-mono font-bold text-xs"
                :class="activeClient.currentBalance > 0 ? 'text-rose-600' : 'text-emerald-600'"
              >
                <span v-if="activeClient.currentBalance > 0">{{ formatCurrency(activeClient.currentBalance) }} (مستحق سداده)</span>
                <span v-else-if="activeClient.currentBalance < 0">{{ formatCurrency(Math.abs(activeClient.currentBalance)) }} (رصيد دائن للعميل)</span>
                <span v-else class="text-emerald-600">0.00 ج.م (الحساب خالص ✓)</span>
              </div>
            </div>

            <div class="px-3 py-1.5 rounded-xl border border-brand-gray/20 text-right bg-brand-white dark:bg-brand-dark">
              <div class="text-[9px] text-brand-gray">إجمالي المنصرف</div>
              <div class="font-mono font-bold text-xs text-emerald-600">
                {{ formatCurrency(activeClient.totalSpent || 0) }}
              </div>
            </div>

            <button
              type="button"
              @click="openNewBookingForClient(activeClient)"
              class="px-3 py-2 bg-brand-accent hover:bg-brand-accent/90 text-brand-dark font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <CalendarPlus class="w-3.5 h-3.5" />
              <span>حجز موعد صيانة</span>
            </button>

            <!-- ONLY show 'تحصيل دفعة' if the client has an unpaid debt -->
            <button
              v-if="activeClient.currentBalance > 0"
              type="button"
              @click="openPaymentModal(activeClient)"
              class="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Banknote class="w-3.5 h-3.5" />
              <span>تحصيل دفعة</span>
            </button>
            <div
              v-else
              class="px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold text-xs flex items-center gap-1.5"
            >
              <CheckCircle class="w-4 h-4 text-emerald-500" />
              <span>الحساب مسدد بالكامل</span>
            </div>
          </div>
        </div>

        <!-- CRM Hub Tabs Header -->
        <div class="flex items-center gap-1 border-b border-brand-gray/15 text-xs font-bold overflow-x-auto">
          <button
            type="button"
            @click="crmTab = 'vehicles'"
            class="px-4 py-2.5 border-b-2 flex items-center gap-2 transition-colors cursor-pointer"
            :class="crmTab === 'vehicles' ? 'border-brand-accent text-brand-dark dark:text-white font-extrabold' : 'border-transparent text-brand-gray hover:text-brand-dark'"
          >
            <Car class="w-4 h-4 text-purple-600" />
            <span>المركبات والسيارات ({{ activeClient.vehicles?.length || 0 }})</span>
          </button>

          <button
            type="button"
            @click="crmTab = 'statement'"
            class="px-4 py-2.5 border-b-2 flex items-center gap-2 transition-colors cursor-pointer"
            :class="crmTab === 'statement' ? 'border-brand-accent text-brand-dark dark:text-white font-extrabold' : 'border-transparent text-brand-gray hover:text-brand-dark'"
          >
            <FileText class="w-4 h-4 text-blue-600" />
            <span>كشف الحساب والمديونية</span>
          </button>

          <button
            type="button"
            @click="crmTab = 'history'"
            class="px-4 py-2.5 border-b-2 flex items-center gap-2 transition-colors cursor-pointer"
            :class="crmTab === 'history' ? 'border-brand-accent text-brand-dark dark:text-white font-extrabold' : 'border-transparent text-brand-gray hover:text-brand-dark'"
          >
            <Wrench class="w-4 h-4 text-emerald-600" />
            <span>سجل الفواتير وأوامر الشغل</span>
          </button>

          <button
            type="button"
            @click="crmTab = 'details'"
            class="px-4 py-2.5 border-b-2 flex items-center gap-2 transition-colors cursor-pointer"
            :class="crmTab === 'details' ? 'border-brand-accent text-brand-dark dark:text-white font-extrabold' : 'border-transparent text-brand-gray hover:text-brand-dark'"
          >
            <Info class="w-4 h-4 text-amber-600" />
            <span>البيانات والتواصل والوسوم</span>
          </button>
        </div>

        <!-- ========================================== -->
        <!-- Tab 1: Vehicles List                       -->
        <!-- ========================================== -->
        <div v-if="crmTab === 'vehicles'" class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-xs font-bold text-brand-dark dark:text-white flex items-center gap-2">
              <Car class="w-4 h-4 text-purple-600" />
              <span>مركبات العميل المسجلة</span>
            </h3>

            <button
              type="button"
              @click="openAddVehicleModal(activeClient)"
              class="px-3 py-1.5 bg-brand-accent hover:bg-brand-accent/90 text-brand-dark font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus class="w-3.5 h-3.5" />
              <span>إضافة سيارة جديدة</span>
            </button>
          </div>

          <div v-if="!activeClient.vehicles || !activeClient.vehicles.length" class="p-8 text-center bg-black/5 dark:bg-white/5 rounded-2xl text-xs text-brand-gray">
            لا توجد مركبات مسجلة لهذا العميل بعد. انقر على "إضافة سيارة جديدة" لإدراج مركبته.
          </div>

          <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div
              v-for="v in activeClient.vehicles"
              :key="v.id"
              class="p-4 rounded-2xl border border-brand-gray/15 bg-brand-white dark:bg-brand-dark space-y-2 shadow-xs hover:border-brand-accent transition-all"
            >
              <div class="flex items-start justify-between">
                <div>
                  <div class="font-mono text-base font-extrabold text-brand-dark dark:text-white flex items-center gap-2">
                    <span class="px-2.5 py-1 rounded-lg bg-black/5 dark:bg-white/10 border border-brand-gray/20">
                      {{ v.plateNumber }}
                    </span>
                    <span v-if="v.colorCode" class="w-3.5 h-3.5 rounded-full border border-black/20" :style="{ backgroundColor: v.colorCode }" :title="v.colorName || v.color"></span>
                  </div>
                  <div class="text-xs font-bold text-brand-dark dark:text-white mt-1">
                    {{ v.brandName || v.brand || '' }} {{ v.model || '' }} {{ v.year ? `(${v.year})` : '' }}
                  </div>
                </div>

                <div class="flex items-center gap-1">
                  <button
                    type="button"
                    @click="openEditVehicleModal(v)"
                    class="p-1.5 rounded-lg text-brand-gray hover:text-brand-dark hover:bg-black/5 cursor-pointer"
                    title="تعديل بيانات المركبة"
                  >
                    <Edit2 class="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    @click="confirmDeleteVehicle(v)"
                    class="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                    title="حذف المركبة"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <!-- Vehicle Details Pill -->
              <div class="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-brand-gray/10 text-brand-gray">
                <div>
                  الوقود: <span class="font-bold text-brand-dark dark:text-white">{{ v.fuelTypeName || v.fuelType || 'بنزين' }}</span>
                </div>
                <div>
                  العداد: <span class="font-bold font-mono text-brand-dark dark:text-white">{{ v.currentMileage ? `${v.currentMileage.toLocaleString()} كم` : 'غير مسجل' }}</span>
                </div>
                <div v-if="v.vin" class="col-span-2 font-mono text-[10px]">
                  الشاسيه (VIN): {{ v.vin }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ========================================== -->
        <!-- Tab 2: Statement & Balance                 -->
        <!-- ========================================== -->
        <div v-if="crmTab === 'statement'" class="space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="text-xs font-bold text-brand-dark dark:text-white flex items-center gap-2">
              <FileText class="w-4 h-4 text-blue-600" />
              <span>كشف حساب الحركات والمديونيات</span>
            </h3>

            <div class="text-xs">
              الرصيد الإجمالي:
              <span
                class="font-mono font-bold px-2 py-0.5 rounded-lg"
                :class="getBalanceBadgeClass(activeClient.currentBalance)"
              >
                {{ formatCurrency(activeClient.currentBalance) }}
              </span>
            </div>
          </div>

          <div v-if="loadingStatement" class="p-8 text-center text-xs text-brand-gray">
            <RefreshCw class="w-5 h-5 animate-spin mx-auto mb-2 text-brand-accent" />
            جاري تحميل كشف الحساب...
          </div>

          <div v-else-if="!statementItems || !statementItems.length" class="p-8 text-center bg-black/5 dark:bg-white/5 rounded-2xl text-xs text-brand-gray">
            لا توجد حركات مالية مسجلة لهذا العميل بعد.
          </div>

          <div v-else class="overflow-x-auto rounded-2xl border border-brand-gray/15">
            <table class="w-full text-xs text-right border-collapse">
              <thead>
                <tr class="bg-brand-light/70 dark:bg-white/5 border-b border-brand-gray/15 text-brand-gray font-bold">
                  <th class="py-2.5 px-3">التاريخ</th>
                  <th class="py-2.5 px-3">نوع الحركة</th>
                  <th class="py-2.5 px-3">البيان / المرجع</th>
                  <th class="py-2.5 px-3 text-left">مدين (لنا)</th>
                  <th class="py-2.5 px-3 text-left">دائن (سداد)</th>
                  <th class="py-2.5 px-3 text-left">الرصيد بعد الحركة</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-brand-gray/10 text-brand-dark dark:text-white">
                <tr v-for="(s, idx) in statementItems" :key="idx" class="hover:bg-black/5 dark:hover:bg-white/5">
                  <td class="py-2.5 px-3 font-mono text-[11px] text-slate-500">{{ formatDate(s.date) }}</td>
                  <td class="py-2.5 px-3 font-bold">{{ s.type }}</td>
                  <td class="py-2.5 px-3">
                    <span class="font-mono text-xs">{{ s.reference }}</span>
                    <span v-if="s.notes" class="text-[10px] text-brand-gray block">{{ s.notes }}</span>
                  </td>
                  <td class="py-2.5 px-3 font-mono font-bold text-left text-rose-600">
                    {{ s.debit > 0 ? formatCurrency(s.debit) : '—' }}
                  </td>
                  <td class="py-2.5 px-3 font-mono font-bold text-left text-emerald-600">
                    {{ s.credit > 0 ? formatCurrency(s.credit) : '—' }}
                  </td>
                  <td class="py-2.5 px-3 font-mono font-bold text-left" :class="s.balanceAfter > 0 ? 'text-rose-600' : 'text-emerald-600'">
                    {{ formatCurrency(s.balanceAfter) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- ========================================== -->
        <!-- Tab 3: Service History & Job Cards         -->
        <!-- ========================================== -->
        <div v-if="crmTab === 'history'" class="space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="text-xs font-bold text-brand-dark dark:text-white flex items-center gap-2">
              <Wrench class="w-4 h-4 text-emerald-600" />
              <span>فواتير وأوامر الشغل السابقة</span>
            </h3>
            <span class="text-xs text-brand-gray font-mono">{{ clientJobCards.length }} أمر شغل</span>
          </div>

          <div v-if="!clientJobCards.length" class="p-8 text-center bg-black/5 dark:bg-white/5 rounded-2xl text-xs text-brand-gray">
            لا توجد أوامر شغل منشأة لهذا العميل حتى الآن.
          </div>

          <div v-else class="space-y-2.5">
            <div
              v-for="job in clientJobCards"
              :key="job.id"
              class="p-3.5 rounded-2xl border border-brand-gray/15 bg-brand-white dark:bg-brand-dark flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div>
                <div class="flex items-center gap-2">
                  <span class="font-mono font-bold text-brand-dark dark:text-white text-sm">#{{ job.jobNumber }}</span>
                  <span
                    class="px-2 py-0.5 rounded-full text-[10px] font-bold"
                    :class="job.status === 3 ? 'bg-emerald-500/15 text-emerald-700' : job.status === 2 ? 'bg-blue-500/15 text-blue-700' : 'bg-amber-500/15 text-amber-700'"
                  >
                    {{ job.statusText }}
                  </span>
                  <span v-if="job.carPlate" class="px-2 py-0.5 rounded bg-black/5 font-mono text-[11px]">
                    {{ job.carPlate }}
                  </span>
                </div>
                <div class="text-[11px] text-brand-gray mt-1">
                  تاريخ الصيانة: {{ formatDate(job.insertDate) }} &bull; العداد: {{ job.odometer ? `${job.odometer.toLocaleString()} كم` : '—' }}
                </div>
              </div>

              <div class="text-left font-mono">
                <div class="font-extrabold text-sm text-brand-dark dark:text-white">
                  {{ formatCurrency(job.totalAmount) }}
                </div>
                <div class="text-[10px] text-brand-gray">
                  مسدد: {{ formatCurrency(job.paidAmount) }} &bull; متبقي: {{ formatCurrency(job.remainingBalance) }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ========================================== -->
        <!-- Tab 4: Details & Preferences & Tags        -->
        <!-- ========================================== -->
        <div v-if="crmTab === 'details'" class="space-y-4 text-xs">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl border border-brand-gray/15 bg-brand-white dark:bg-brand-dark">
            <div>
              <span class="text-brand-gray block text-[11px]">نوع العميل</span>
              <span class="font-bold text-brand-dark dark:text-white">{{ activeClient.typeName }}</span>
            </div>

            <div>
              <span class="text-brand-gray block text-[11px]">مصدر التعرف على المركز</span>
              <span class="font-bold text-brand-dark dark:text-white">{{ activeClient.sourceName || 'غير محدد' }}</span>
            </div>

            <div>
              <span class="text-brand-gray block text-[11px]">طريقة التواصل المفضلة</span>
              <span class="font-bold text-brand-dark dark:text-white">
                {{ activeClient.preferredContactMethod === 'whatsapp' ? 'واتساب' : activeClient.preferredContactMethod === 'sms' ? 'رسائل قصيرة' : 'مكالمة هاتفية' }}
              </span>
            </div>

            <div>
              <span class="text-brand-gray block text-[11px]">استقبال رسائل وتذكيرات الصيانة</span>
              <span class="font-bold" :class="activeClient.acceptsMessages ? 'text-emerald-600' : 'text-rose-600'">
                {{ activeClient.acceptsMessages ? 'موافق على استقبال التذكيرات' : 'غير موافق' }}
              </span>
            </div>

            <div>
              <span class="text-brand-gray block text-[11px]">الرقم القومي / السجل التجاري</span>
              <span class="font-mono font-bold text-brand-dark dark:text-white">{{ activeClient.nationalId || '—' }}</span>
            </div>

            <div>
              <span class="text-brand-gray block text-[11px]">الحد الائتماني الأقصى</span>
              <span class="font-mono font-bold text-brand-dark dark:text-white">{{ activeClient.creditLimit ? formatCurrency(activeClient.creditLimit) : 'غير مقيد' }}</span>
            </div>

            <div class="col-span-2">
              <span class="text-brand-gray block text-[11px]">العنوان / الملاحظات الخاصة</span>
              <span class="font-medium text-brand-dark dark:text-white">{{ activeClient.address || activeClient.notes || 'لا توجد ملاحظات مسجلة' }}</span>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <button
          type="button"
          @click="showCustomer360 = false"
          class="px-5 py-2 rounded-xl border border-brand-gray/25 font-bold text-xs cursor-pointer hover:bg-black/5"
        >
          إغلاق
        </button>
      </template>
    </OhdaModal>

    <!-- ========================================== -->
    <!-- 2. Create / Edit Client Modal              -->
    <!-- ========================================== -->
    <OhdaModal
      :visible="showClientModal"
      :close-on-backdrop="false"
      @close="showClientModal = false"
      :title="isEditing ? 'تعديل بيانات العميل' : 'إضافة عميل ومركبة جديدة'"
      :description="isEditing ? 'تعديل بيانات العميل ومعلومات التواصل والوسوم' : 'تسجيل عميل جديد وربط مركبته الأولى تلقائياً'"
      :icon="Users"
      max-width="max-w-2xl"
    >
      <form id="clientForm" @submit.prevent="submitClientForm" class="space-y-4 text-xs">
        <!-- 2-Column Form Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <div>
            <label class="block font-semibold text-brand-dark dark:text-white mb-1">
              اسم العميل / الشركة <span class="text-red-500">*</span>
            </label>
            <input
              v-model="clientForm.name"
              type="text"
              required
              placeholder="مثال: م. محمد الشافعي / شركة النور..."
              class="w-full px-3 py-2 rounded-xl border border-brand-gray/25 bg-brand-light/50 dark:bg-white/5 text-brand-dark dark:text-white text-xs focus:border-brand-accent transition-all"
            />
          </div>

          <div>
            <label class="block font-semibold text-brand-dark dark:text-white mb-1">
              رقم الهاتف المحمول <span class="text-red-500">*</span>
            </label>
            <input
              v-model="clientForm.phone"
              @keypress="allowOnlyNumbers"
              @input="clientForm.phone = filterPhone(clientForm.phone)"
              maxlength="15"
              type="tel"
              required
              placeholder="01xxxxxxxxx"
              dir="ltr"
              class="w-full px-3 py-2 rounded-xl border border-brand-gray/25 bg-brand-light/50 dark:bg-white/5 text-brand-dark dark:text-white font-mono text-xs focus:border-brand-accent transition-all text-left"
            />
            <p v-if="clientForm.phone && !isValidPhone(clientForm.phone)" class="text-[10px] text-amber-500 mt-1">
              رقم الهاتف يجب أن يتكون من 7 إلى 15 رقماً.
            </p>
          </div>

          <div>
            <label class="block font-semibold text-brand-dark dark:text-white mb-1">
              هاتف بديل (اختياري)
            </label>
            <input
              v-model="clientForm.secondPhone"
              @keypress="allowOnlyNumbers"
              @input="clientForm.secondPhone = filterPhone(clientForm.secondPhone)"
              maxlength="15"
              type="tel"
              placeholder="هاتف أرضي أو رقم آخر..."
              dir="ltr"
              class="w-full px-3 py-2 rounded-xl border border-brand-gray/25 bg-brand-light/50 dark:bg-white/5 text-brand-dark dark:text-white font-mono text-xs focus:border-brand-accent transition-all text-left"
            />
            <p v-if="clientForm.secondPhone && !isValidPhone(clientForm.secondPhone)" class="text-[10px] text-amber-500 mt-1">
              رقم الهاتف يجب أن يتكون من 7 إلى 15 رقماً.
            </p>
          </div>

          <div>
            <label class="block font-semibold text-brand-dark dark:text-white mb-1">
              الرقم القومي (اختياري)
            </label>
            <input
              v-model="clientForm.nationalId"
              @keypress="allowOnlyNumbers"
              @input="clientForm.nationalId = filterNationalId(clientForm.nationalId)"
              maxlength="14"
              placeholder="14 رقماً"
              dir="ltr"
              class="w-full px-3 py-2 rounded-xl border border-brand-gray/25 bg-brand-light/50 dark:bg-white/5 text-brand-dark dark:text-white font-mono text-xs focus:border-brand-accent transition-all text-left"
            />
            <div class="flex items-center justify-between mt-1 text-[10px]">
              <span :class="clientForm.nationalId && clientForm.nationalId.length === 14 ? 'text-emerald-500 font-bold' : 'text-slate-400'">
                {{ clientForm.nationalId ? clientForm.nationalId.length : 0 }} / 14 رقماً
              </span>
              <span v-if="clientForm.nationalId && clientForm.nationalId.length !== 14" class="text-amber-500">
                الرقم القومي يجب أن يتكون من 14 رقماً
              </span>
            </div>
          </div>

          <div>
            <label class="block font-semibold text-brand-dark dark:text-white mb-1">
              نوع العميل <span class="text-red-500">*</span>
            </label>
            <select
              v-model="clientForm.type"
              class="w-full px-3 py-2 rounded-xl border border-brand-gray/25 bg-brand-light/50 dark:bg-white/5 text-brand-dark dark:text-white text-xs focus:border-brand-accent transition-all"
            >
              <option :value="1">فرد (سيارة خاصة ملاكي)</option>
              <option :value="2">شركة / أسطول سيارات</option>
            </select>
          </div>

          <div>
            <label class="block font-semibold text-brand-dark dark:text-white mb-1">
              مصدر العميل (كيف تعرف علينا؟)
            </label>
            <select
              v-model="clientForm.sourceLookupId"
              class="w-full px-3 py-2 rounded-xl border border-brand-gray/25 bg-brand-light/50 dark:bg-white/5 text-brand-dark dark:text-white text-xs focus:border-brand-accent transition-all"
            >
              <option :value="null">غير محدد</option>
              <option v-for="src in customerSources" :key="src.id" :value="src.id">
                {{ src.labelAr }}
              </option>
            </select>
          </div>

          <div>
            <label class="block font-semibold text-brand-dark dark:text-white mb-1">
              طريقة التواصل المفضلة
            </label>
            <select
              v-model="clientForm.preferredContactMethod"
              class="w-full px-3 py-2 rounded-xl border border-brand-gray/25 bg-brand-light/50 dark:bg-white/5 text-brand-dark dark:text-white text-xs focus:border-brand-accent transition-all"
            >
              <option value="phone">مكالمة هاتفية</option>
              <option value="whatsapp">واتساب (WhatsApp)</option>
              <option value="sms">رسائل قصيرة (SMS)</option>
            </select>
          </div>

          <div v-if="!isEditing">
            <label class="block font-semibold text-brand-dark dark:text-white mb-1">
              رصيد افتتاحي مديونية (ج.م)
            </label>
            <input
              v-model.number="clientForm.initialBalance"
              type="number"
              step="0.01"
              placeholder="0.00"
              class="w-full px-3 py-2 rounded-xl border border-brand-gray/25 bg-brand-light/50 dark:bg-white/5 text-brand-dark dark:text-white font-mono text-xs focus:border-brand-accent transition-all"
            />
          </div>

          <div>
            <label class="block font-semibold text-brand-dark dark:text-white mb-1">
              الحد الائتماني الأقصى (ج.م)
            </label>
            <input
              v-model.number="clientForm.creditLimit"
              type="number"
              step="0.01"
              placeholder="اتركه فارغاً إن لم يكن مقيداً"
              class="w-full px-3 py-2 rounded-xl border border-brand-gray/25 bg-brand-light/50 dark:bg-white/5 text-brand-dark dark:text-white font-mono text-xs focus:border-brand-accent transition-all"
            />
          </div>
        </div>

        <!-- Tags Selection -->
        <div v-if="customerTags.length" class="space-y-1.5 pt-2 border-t border-brand-gray/10">
          <label class="block font-semibold text-brand-dark dark:text-white">
            تصنيفات ووسوم العميل:
          </label>
          <div class="flex items-center gap-2 flex-wrap">
            <button
              v-for="tag in customerTags"
              :key="tag.id"
              type="button"
              @click="toggleTagSelection(tag.id)"
              class="px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer flex items-center gap-1.5"
              :class="clientForm.tagIds.includes(tag.id)
                ? 'bg-brand-accent/20 border-brand-accent text-brand-dark dark:text-white font-bold shadow-xs'
                : 'border-brand-gray/20 text-brand-gray hover:text-brand-dark'"
            >
              <span class="w-2 h-2 rounded-full" :style="{ backgroundColor: tag.colorCode || '#8b5cf6' }"></span>
              <span>{{ tag.labelAr }}</span>
            </button>
          </div>
        </div>

        <!-- Initial Vehicle Box (Only when creating a new client) -->
        <div v-if="!isEditing" class="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-brand-gray/15 space-y-3">
          <div class="flex items-center justify-between">
            <h4 class="font-bold text-xs text-brand-dark dark:text-white flex items-center gap-2">
              <Car class="w-4 h-4 text-purple-600" />
              <span>بيانات المركبة الأولى للعميل (اختياري)</span>
            </h4>
            <span class="text-[10px] text-brand-gray">يمكنك إضافة سيارات إضافية لاحقاً</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
            <div>
              <label class="block font-medium text-[11px] text-brand-gray mb-1">رقم اللوحة</label>
              <input
                v-model="initialVehicle.plateNumber"
                type="text"
                placeholder="س ق ر 1234"
                class="w-full px-2.5 py-1.5 rounded-xl border border-brand-gray/25 bg-brand-white dark:bg-brand-dark font-mono text-xs"
              />
            </div>

            <div>
              <label class="block font-medium text-[11px] text-brand-gray mb-1">الماركة</label>
              <select
                v-model="initialVehicle.brandLookupId"
                class="w-full px-2.5 py-1.5 rounded-xl border border-brand-gray/25 bg-brand-white dark:bg-brand-dark text-xs"
              >
                <option :value="null">اختر الماركة...</option>
                <option v-for="b in vehicleBrands" :key="b.id" :value="b.id">{{ b.labelAr }}</option>
              </select>
            </div>

            <div>
              <label class="block font-medium text-[11px] text-brand-gray mb-1">نوع السيارة</label>
              <select
                v-model="initialVehicle.carType"
                class="w-full px-2.5 py-1.5 rounded-xl border border-brand-gray/25 bg-brand-white dark:bg-brand-dark text-xs"
              >
                <option value="">اختر النوع...</option>
                <option v-for="t in vehicleTypes" :key="t" :value="t">{{ t }}</option>
              </select>
            </div>

            <div>
              <label class="block font-medium text-[11px] text-brand-gray mb-1">الموديل والطراز</label>
              <input
                v-model="initialVehicle.model"
                type="text"
                placeholder="كورولا 2021"
                class="w-full px-2.5 py-1.5 rounded-xl border border-brand-gray/25 bg-brand-white dark:bg-brand-dark text-xs"
              />
            </div>
          </div>
        </div>

        <!-- Address & Notes -->
        <div>
          <label class="block font-semibold text-brand-dark dark:text-white mb-1">العنوان / ملاحظات خاصة</label>
          <input
            v-model="clientForm.address"
            type="text"
            placeholder="عنوان العميل أو أي ملاحظات هامة..."
            class="w-full px-3 py-2 rounded-xl border border-brand-gray/25 bg-brand-light/50 dark:bg-white/5 text-brand-dark dark:text-white text-xs focus:border-brand-accent transition-all"
          />
        </div>
      </form>

      <template #footer>
        <button
          type="button"
          @click="showClientModal = false"
          class="px-4 py-2 border border-brand-gray/20 rounded-xl text-xs font-semibold hover:bg-black/5 cursor-pointer"
        >
          إلغاء
        </button>
        <button
          type="submit"
          form="clientForm"
          :disabled="submitting"
          class="px-5 py-2 bg-brand-accent hover:bg-brand-accent/90 text-brand-dark font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
        >
          <RefreshCw v-if="submitting" class="w-4 h-4 animate-spin" />
          <span>{{ isEditing ? 'تحديث البيانات' : 'حفظ العميل' }}</span>
        </button>
      </template>
    </OhdaModal>

    <!-- ========================================== -->
    <!-- 3. Add / Edit Vehicle Modal                -->
    <!-- ========================================== -->
    <OhdaModal
      :visible="showVehicleModal"
      :close-on-backdrop="false"
      @close="showVehicleModal = false"
      :title="editingVehicleId ? 'تعديل بيانات المركبة' : 'إضافة مركبة جديدة للعميل'"
      :description="`العميل: ${activeClient?.name || ''}`"
      :icon="Car"
      max-width="max-w-md"
    >
      <form id="vehicleForm" @submit.prevent="submitVehicleForm" class="space-y-3.5 text-xs">
        <div>
          <label class="block font-semibold text-brand-dark dark:text-white mb-1">
            رقم اللوحة <span class="text-red-500">*</span>
          </label>
          <input
            v-model="vehicleForm.plateNumber"
            type="text"
            required
            placeholder="مثال: س ق ر 1234 أو أ ب ج 567"
            class="w-full px-3 py-2 rounded-xl border border-brand-gray/25 bg-brand-light/50 dark:bg-white/5 font-mono font-bold text-sm focus:border-brand-accent transition-all"
          />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label class="block font-semibold text-brand-dark dark:text-white mb-1">ماركة السيارة</label>
            <select
              v-model="vehicleForm.brandLookupId"
              class="w-full px-3 py-2 rounded-xl border border-brand-gray/25 bg-brand-light/50 dark:bg-white/5 text-xs focus:border-brand-accent transition-all cursor-pointer"
            >
              <option :value="null">اختر الماركة...</option>
              <option v-for="b in vehicleBrands" :key="b.id" :value="b.id">{{ b.labelAr }}</option>
            </select>
          </div>

          <div>
            <label class="block font-semibold text-brand-dark dark:text-white mb-1">نوع السيارة / الهيكل</label>
            <select
              v-model="vehicleForm.carType"
              class="w-full px-3 py-2 rounded-xl border border-brand-gray/25 bg-brand-light/50 dark:bg-white/5 text-xs focus:border-brand-accent transition-all cursor-pointer"
            >
              <option value="">اختر النوع / الهيكل...</option>
              <option v-for="t in vehicleTypes" :key="t" :value="t">{{ t }}</option>
            </select>
          </div>

          <div>
            <label class="block font-semibold text-brand-dark dark:text-white mb-1">الموديل والطراز</label>
            <input
              v-model="vehicleForm.model"
              type="text"
              placeholder="كورولا، إلنترا، سيراتو..."
              class="w-full px-3 py-2 rounded-xl border border-brand-gray/25 bg-brand-light/50 dark:bg-white/5 text-xs focus:border-brand-accent transition-all"
            />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold text-brand-dark dark:text-white mb-1">سنة الصنع</label>
            <input
              v-model.number="vehicleForm.year"
              type="number"
              min="1970"
              max="2035"
              placeholder="2022"
              class="w-full px-3 py-2 rounded-xl border border-brand-gray/25 bg-brand-light/50 dark:bg-white/5 font-mono text-xs focus:border-brand-accent transition-all"
            />
          </div>

          <div>
            <label class="block font-semibold text-brand-dark dark:text-white mb-1">اللون</label>
            <select
              v-model="vehicleForm.colorLookupId"
              class="w-full px-3 py-2 rounded-xl border border-brand-gray/25 bg-brand-light/50 dark:bg-white/5 text-xs focus:border-brand-accent transition-all"
            >
              <option :value="null">اختر اللون...</option>
              <option v-for="c in vehicleColors" :key="c.id" :value="c.id">{{ c.labelAr }}</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold text-brand-dark dark:text-white mb-1">قراءة العداد الحالية (كم)</label>
            <input
              v-model.number="vehicleForm.currentMileage"
              type="number"
              min="0"
              placeholder="54000"
              class="w-full px-3 py-2 rounded-xl border border-brand-gray/25 bg-brand-light/50 dark:bg-white/5 font-mono text-xs focus:border-brand-accent transition-all"
            />
          </div>

          <div>
            <label class="block font-semibold text-brand-dark dark:text-white mb-1">نوع الوقود</label>
            <select
              v-model="vehicleForm.fuelTypeLookupId"
              class="w-full px-3 py-2 rounded-xl border border-brand-gray/25 bg-brand-light/50 dark:bg-white/5 text-xs focus:border-brand-accent transition-all"
            >
              <option :value="null">بنزين 92</option>
              <option v-for="f in fuelTypes" :key="f.id" :value="f.id">{{ f.labelAr }}</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block font-semibold text-brand-dark dark:text-white mb-1">رقم الشاسيه (VIN) - اختياري</label>
          <input
            v-model="vehicleForm.vin"
            type="text"
            placeholder="17 حرف ورقم..."
            dir="ltr"
            class="w-full px-3 py-2 rounded-xl border border-brand-gray/25 bg-brand-light/50 dark:bg-white/5 font-mono text-xs text-left"
          />
        </div>
      </form>

      <template #footer>
        <button
          type="button"
          @click="showVehicleModal = false"
          class="px-4 py-2 border border-brand-gray/20 rounded-xl text-xs font-semibold hover:bg-black/5 cursor-pointer"
        >
          إلغاء
        </button>
        <button
          type="submit"
          form="vehicleForm"
          :disabled="submitting"
          class="px-5 py-2 bg-brand-accent hover:bg-brand-accent/90 text-brand-dark font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
        >
          <span>{{ editingVehicleId ? 'تحديث المركبة' : 'حفظ المركبة' }}</span>
        </button>
      </template>
    </OhdaModal>

    <!-- ========================================== -->
    <!-- 4. Record Payment Modal                    -->
    <!-- ========================================== -->
    <OhdaModal
      :visible="showPaymentModal"
      :close-on-backdrop="false"
      @close="showPaymentModal = false"
      title="سداد دفعة / تحصيل من العميل"
      :description="`تسجيل سداد نقدي أو بنكي لصالح العميل: ${payingClient?.name || ''}`"
      :icon="Banknote"
      max-width="max-w-md"
    >
      <form id="paymentForm" @submit.prevent="submitPaymentForm" class="space-y-4 text-xs">
        <div class="p-3.5 bg-brand-light/70 dark:bg-white/5 rounded-2xl border border-brand-gray/15 flex items-center justify-between">
          <div>
            <div class="text-[10px] text-brand-gray">رصيد المديونية الحالي</div>
            <div
              class="font-mono font-bold text-sm"
              :class="payingClient?.currentBalance > 0 ? 'text-rose-600' : 'text-emerald-600'"
            >
              {{ formatCurrency(payingClient?.currentBalance || 0) }}
            </div>
          </div>
          <span
            class="text-[10px] font-bold px-2 py-0.5 rounded-md"
            :class="payingClient?.currentBalance > 0 ? 'bg-rose-500/10 text-rose-600' : 'bg-emerald-500/10 text-emerald-600'"
          >
            {{ getClientBalanceLabel(payingClient?.currentBalance || 0) }}
          </span>
        </div>

        <div>
          <label class="block font-semibold text-brand-dark dark:text-white mb-1.5">
            المبلغ المحصل (ج.م) <span class="text-red-500">*</span>
          </label>
          <input
            v-model.number="paymentForm.amount"
            type="number"
            step="0.01"
            min="0.01"
            required
            placeholder="0.00"
            class="w-full px-3.5 py-2.5 rounded-xl border border-brand-gray/25 bg-brand-light/50 dark:bg-white/5 text-brand-dark dark:text-white font-mono text-base font-bold focus:border-brand-accent transition-all"
          />
        </div>

        <MultiPaymentMethodSelector
          v-model="paymentForm.splits"
          :total-amount="Number(paymentForm.amount) || 0"
          @update:valid="isClientPaymentValid = $event"
          label="طرق التحصيل والسداد (تحديد متعدد وتوزيع المبالغ)"
        />

        <div>
          <label class="block font-semibold text-brand-dark dark:text-white mb-1.5">رقم الإيصال / المرجع (اختياري)</label>
          <input
            v-model="paymentForm.reference"
            type="text"
            placeholder="رقم سند القبض أو مرجع التحويل..."
            class="w-full px-3 py-2 rounded-xl border border-brand-gray/25 bg-brand-light/50 dark:bg-white/5 text-xs text-brand-dark dark:text-white"
          />
        </div>
      </form>

      <template #footer>
        <button
          type="button"
          @click="showPaymentModal = false"
          class="px-4 py-2 border border-brand-gray/20 rounded-xl text-xs font-semibold hover:bg-black/5 cursor-pointer"
        >
          إلغاء
        </button>
        <button
          type="submit"
          form="paymentForm"
          :disabled="submitting"
          class="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
        >
          <Banknote class="w-4 h-4" />
          <span>تأكيد التحصيل</span>
        </button>
      </template>
    </OhdaModal>

    <!-- Excel Import Modal for Clients -->
    <ExcelImportModal
      v-model:visible="showImportModal"
      entity-type="clients"
      entity-label="العملاء السابقين والمركبات والأرصدة"
      @imported="clientStore.fetchClients()"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "primevue/usetoast";
import { useOhdaClientStore } from "../stores/useOhdaClientStore";
import { useOhdaLookupStore } from "../stores/useOhdaLookupStore";
import { useOhdaFinanceStore } from "../stores/useOhdaFinanceStore";
import { useOhdaJobCardStore } from "../stores/useOhdaJobCardStore";
import { useOhdaConfirmStore } from "../stores/useOhdaConfirmStore";
import OhdaModal from "../components/OhdaModal.vue";
import MultiPaymentMethodSelector from "../components/MultiPaymentMethodSelector.vue";
import OhdaDataTable from "../components/OhdaDataTable.vue";
import ExcelImportModal from "../components/ExcelImportModal.vue";
import { exportToExcelCsv } from "../utils/excelHelper";
import { filterPhone, filterNationalId, isValidPhone, isValidNationalIdNumber, allowOnlyNumbers } from "@/utilities/validations";
import {
  Users,
  UserPlus,
  Search,
  Phone,
  Car,
  FileText,
  Banknote,
  Edit2,
  Trash2,
  Plus,
  CalendarPlus,
  Wrench,
  Info,
  RefreshCw,
  FileSpreadsheet,
  Upload,
  CheckCircle
} from "lucide-vue-next";

const clientStore = useOhdaClientStore();
const lookupStore = useOhdaLookupStore();
const financeStore = useOhdaFinanceStore();
const jobCardStore = useOhdaJobCardStore();
const confirmStore = useOhdaConfirmStore();
const router = useRouter();
const toast = useToast();

const showImportModal = ref(false);

const vehicleTypes = [
  "سيدان (Sedan)",
  "دفع رباعي (SUV / 4x4)",
  "هاتشباك (Hatchback)",
  "بيك آب / نصف نقل (Pickup)",
  "ميني فان / عائلية (Minivan)",
  "شاحنة / نقل خفيف (Truck)",
  "ميكروباص / باص (Van / Bus)",
  "كوبيه / رياضية (Coupe)"
];

const clientTemplateColumns = [
  { key: "name", label: "اسم العميل *" },
  { key: "phone", label: "رقم الهاتف *" },
  { key: "secondPhone", label: "رقم هاتف ثانٍ" },
  { key: "type", label: "نوع العميل (1=فردي / 2=شركة)" },
  { key: "carPlate", label: "رقم اللوحة" },
  { key: "carBrand", label: "ماركة السيارة" },
  { key: "carType", label: "نوع الهيكل" },
  { key: "carModel", label: "موديل وطراز السيارة" },
  { key: "notes", label: "ملاحظات" }
];

const clientSampleRows = [
  { name: "أحمد محمد محمود", phone: "01012345678", secondPhone: "", type: "1", carPlate: "س ص ع 1234", carBrand: "تويوتا", carType: "سيدان", carModel: "كورولا 2021", notes: "عميل دائم" },
  { name: "شركة النور للخدمات", phone: "01198765432", secondPhone: "01233445566", type: "2", carPlate: "د ر ق 5678", carBrand: "هيونداي", carType: "SUV", carModel: "توسان 2023", notes: "أسطول سيارات" }
];

const searchQuery = ref("");
const typeFilter = ref(null);
const tagFilter = ref(null);
const hasBalanceFilter = ref(false);

const showClientModal = ref(false);
const isEditing = ref(false);
const editingClientId = ref(null);

const showCustomer360 = ref(false);
const activeClient = ref(null);
const crmTab = ref("vehicles");
const loadingStatement = ref(false);
const statementItems = ref([]);

const showVehicleModal = ref(false);
const editingVehicleId = ref(null);

const showPaymentModal = ref(false);
const payingClient = ref(null);

const submitting = ref(false);

const clientForm = ref({
  name: "",
  phone: "",
  secondPhone: "",
  email: "",
  nationalId: "",
  type: 1,
  creditLimit: null,
  sourceLookupId: null,
  preferredContactMethod: "phone",
  acceptsMessages: true,
  initialBalance: 0,
  address: "",
  notes: "",
  tagIds: []
});

const initialVehicle = ref({
  plateNumber: "",
  brandLookupId: null,
  carType: "",
  model: ""
});

const vehicleForm = ref({
  plateNumber: "",
  brandLookupId: null,
  carType: "",
  model: "",
  year: null,
  colorLookupId: null,
  vin: "",
  currentMileage: null,
  fuelTypeLookupId: null,
  notes: ""
});

const isClientPaymentValid = ref(true);
const paymentForm = ref({
  clientId: null,
  amount: 0,
  paymentMethod: 1,
  splits: [],
  financialAccountId: null,
  reference: "",
  notes: ""
});

const customerTags = computed(() => lookupStore.getValuesByCode("customer_tag"));
const customerSources = computed(() => lookupStore.getValuesByCode("customer_source"));
const vehicleBrands = computed(() => lookupStore.getValuesByCode("vehicle_brand"));
const vehicleColors = computed(() => lookupStore.getValuesByCode("vehicle_color"));
const fuelTypes = computed(() => lookupStore.getValuesByCode("fuel_type"));
const financeAccounts = computed(() => financeStore.accounts);

const tableColumns = [
  { field: "name", header: "العميل والتصنيف", sortable: true, width: "24%" },
  { field: "phone", header: "الهاتف والتواصل", sortable: true, width: "18%" },
  { field: "vehicles", header: "المركبات والسيارات", width: "22%" },
  { field: "currentBalance", header: "الرصيد القائم", sortable: true, width: "16%" },
  { field: "stats", header: "المبيعات والزيارات", sortable: true, width: "10%" },
  { field: "actions", header: "الإجراءات", width: "10%", align: "center" }
];

const filteredClients = computed(() => {
  let list = clientStore.clients || [];
  if (typeFilter.value) {
    list = list.filter((c) => c && c.type === typeFilter.value);
  }
  if (tagFilter.value) {
    list = list.filter((c) => c && c.tags?.some((t) => t.tagLookupValueId === tagFilter.value));
  }
  if (hasBalanceFilter.value) {
    list = list.filter((c) => c && c.currentBalance > 0);
  }
  return list;
});

const clientJobCards = computed(() => {
  if (!activeClient.value?.id) return [];
  return (jobCardStore.jobs || []).filter((j) => j && j.clientId === activeClient.value.id);
});

function handleSearchInput() {
  clientStore.fetchClients({
    search: searchQuery.value,
    type: typeFilter.value,
    tagId: tagFilter.value,
    hasBalance: hasBalanceFilter.value
  });
}

function openCreateModal() {
  isEditing.value = false;
  editingClientId.value = null;
  clientForm.value = {
    name: "",
    phone: "",
    secondPhone: "",
    email: "",
    nationalId: "",
    type: 1,
    creditLimit: null,
    sourceLookupId: null,
    preferredContactMethod: "phone",
    acceptsMessages: true,
    initialBalance: 0,
    address: "",
    notes: "",
    tagIds: []
  };
  initialVehicle.value = {
    plateNumber: "",
    brandLookupId: null,
    model: ""
  };
  showClientModal.value = true;
}

function openEditModal(row) {
  isEditing.value = true;
  editingClientId.value = row.id;
  clientForm.value = {
    name: row.name,
    phone: row.phone,
    secondPhone: row.secondPhone || "",
    email: row.email || "",
    nationalId: row.nationalId || "",
    type: row.type || 1,
    creditLimit: row.creditLimit || null,
    sourceLookupId: row.sourceLookupId || null,
    preferredContactMethod: row.preferredContactMethod || "phone",
    acceptsMessages: row.acceptsMessages ?? true,
    initialBalance: 0,
    address: row.address || "",
    notes: row.notes || "",
    tagIds: (row.tags || []).map((t) => t.tagLookupValueId)
  };
  showClientModal.value = true;
}

function toggleTagSelection(tagId) {
  const idx = clientForm.value.tagIds.indexOf(tagId);
  if (idx > -1) {
    clientForm.value.tagIds.splice(idx, 1);
  } else {
    clientForm.value.tagIds.push(tagId);
  }
}

async function submitClientForm() {
  if (!isValidPhone(clientForm.value.phone)) {
    toast.add({
      severity: "warn",
      summary: "رقم الهاتف غير صالح",
      detail: "يجب أن يتكون رقم الهاتف من 7 إلى 15 رقماً وبدون حروف أو رموز.",
      life: 4000
    });
    return;
  }
  if (clientForm.value.secondPhone && !isValidPhone(clientForm.value.secondPhone)) {
    toast.add({
      severity: "warn",
      summary: "الهاتف البديل غير صالح",
      detail: "يجب أن يتكون رقم الهاتف البديل من 7 إلى 15 رقماً وبدون حروف أو رموز.",
      life: 4000
    });
    return;
  }
  if (clientForm.value.nationalId && !isValidNationalIdNumber(clientForm.value.nationalId)) {
    toast.add({
      severity: "warn",
      summary: "الرقم القومي غير صالح",
      detail: "يجب أن يتكون الرقم القومي من 14 رقماً بالضبط وبدون حروف أو رموز.",
      life: 4000
    });
    return;
  }

  submitting.value = true;
  try {
    const payload = {
      name: clientForm.value.name,
      phone: clientForm.value.phone,
      secondPhone: clientForm.value.secondPhone,
      email: clientForm.value.email,
      nationalId: clientForm.value.nationalId,
      type: clientForm.value.type,
      creditLimit: clientForm.value.creditLimit,
      sourceLookupId: clientForm.value.sourceLookupId,
      preferredContactMethod: clientForm.value.preferredContactMethod,
      acceptsMessages: clientForm.value.acceptsMessages,
      address: clientForm.value.address,
      notes: clientForm.value.notes,
      tagIds: clientForm.value.tagIds
    };

    if (!isEditing.value) {
      payload.initialBalance = Number(clientForm.value.initialBalance) || 0;
      if (initialVehicle.value.plateNumber) {
        payload.initialVehicle = {
          plateNumber: initialVehicle.value.plateNumber,
          brandLookupId: initialVehicle.value.brandLookupId,
          model: initialVehicle.value.model
        };
      }
    }

    let res;
    if (isEditing.value) {
      res = await clientStore.updateClient(editingClientId.value, payload);
    } else {
      res = await clientStore.createClient(payload);
    }

    if (res.success) {
      toast.add({
        severity: "success",
        summary: "تم بنجاح",
        detail: res.message,
        life: 3000
      });
      showClientModal.value = false;
    } else {
      toast.add({
        severity: "error",
        summary: "خطأ",
        detail: res.message,
        life: 4000
      });
    }
  } finally {
    submitting.value = false;
  }
}

async function openCustomer360Modal(client) {
  activeClient.value = client;
  crmTab.value = "vehicles";
  showCustomer360.value = true;

  // Load fresh details, vehicles, and statement
  loadingStatement.value = true;
  try {
    const [fullClient, stItems] = await Promise.all([
      clientStore.fetchClientById(client.id),
      clientStore.fetchStatement(client.id)
    ]);
    if (fullClient) activeClient.value = fullClient;
    statementItems.value = stItems || [];
  } finally {
    loadingStatement.value = false;
  }
}

function openAddVehicleModal(client) {
  editingVehicleId.value = null;
  vehicleForm.value = {
    plateNumber: "",
    brandLookupId: null,
    model: "",
    year: null,
    colorLookupId: null,
    vin: "",
    currentMileage: null,
    fuelTypeLookupId: null,
    notes: ""
  };
  showVehicleModal.value = true;
}

function openEditVehicleModal(v) {
  editingVehicleId.value = v.id;
  vehicleForm.value = {
    plateNumber: v.plateNumber,
    brandLookupId: v.brandLookupId || null,
    model: v.model || "",
    year: v.year || null,
    colorLookupId: v.colorLookupId || null,
    vin: v.vin || "",
    currentMileage: v.currentMileage || null,
    fuelTypeLookupId: v.fuelTypeLookupId || null,
    notes: v.notes || ""
  };
  showVehicleModal.value = true;
}

async function submitVehicleForm() {
  submitting.value = true;
  try {
    let res;
    if (editingVehicleId.value) {
      res = await clientStore.updateVehicle(editingVehicleId.value, vehicleForm.value);
    } else {
      res = await clientStore.addVehicle(activeClient.value.id, vehicleForm.value);
    }

    if (res.success) {
      toast.add({
        severity: "success",
        summary: "تم بنجاح",
        detail: res.message,
        life: 3000
      });
      showVehicleModal.value = false;
      const refreshed = await clientStore.fetchClientById(activeClient.value.id);
      if (refreshed) activeClient.value = refreshed;
    } else {
      toast.add({
        severity: "error",
        summary: "خطأ",
        detail: res.message,
        life: 4000
      });
    }
  } finally {
    submitting.value = false;
  }
}

async function confirmDeleteVehicle(v) {
  const ok = await confirmStore.showConfirm({
    title: "حذف المركبة",
    message: `هل أنت متأكد من رغبتك في حذف المركبة ذات اللوحة (${v.plateNumber})؟`,
    confirmText: "نعم، حذف",
    isDestructive: true
  });
  if (ok) {
    const res = await clientStore.deleteVehicle(v.id);
    if (res.success) {
      toast.add({ severity: "success", summary: "تم الحذف", detail: res.message, life: 3000 });
      const refreshed = await clientStore.fetchClientById(activeClient.value.id);
      if (refreshed) activeClient.value = refreshed;
    }
  }
}

function openPaymentModal(client) {
  payingClient.value = client;
  const initAmt = client.currentBalance > 0 ? client.currentBalance : 0;
  paymentForm.value = {
    clientId: client.id,
    amount: initAmt,
    paymentMethod: 1,
    splits: [{ method: 1, amount: initAmt }],
    financialAccountId: financeAccounts.value[0]?.id || null,
    reference: "",
    notes: ""
  };
  showPaymentModal.value = true;
}

async function submitPaymentForm() {
  if (!isClientPaymentValid.value) {
    toast.add({
      severity: "warn",
      summary: "تنبيه",
      detail: "توزيع مبالغ طرق الدفع غير مطابق لإجمالي المبلغ المحصل.",
      life: 3500
    });
    return;
  }
  submitting.value = true;
  try {
    const payload = {
      ...paymentForm.value,
      paymentMethod: paymentForm.value.splits?.[0]?.method || paymentForm.value.paymentMethod || 1
    };
    const res = await clientStore.recordPayment(payload);
    if (res.success) {
      toast.add({
        severity: "success",
        summary: "تم التحصيل",
        detail: res.message,
        life: 3000
      });
      showPaymentModal.value = false;
      if (activeClient.value?.id === payingClient.value?.id) {
        const refreshed = await clientStore.fetchClientById(activeClient.value.id);
        if (refreshed) activeClient.value = refreshed;
        statementItems.value = await clientStore.fetchStatement(activeClient.value.id);
      }
    } else {
      toast.add({
        severity: "error",
        summary: "خطأ",
        detail: res.message,
        life: 4000
      });
    }
  } finally {
    submitting.value = false;
  }
}

function openNewBookingForClient(client) {
  showCustomer360.value = false;
  router.push({
    path: "/ohda/bookings-calendar",
    query: {
      newBooking: "1",
      clientId: client.id,
      clientName: client.name,
      clientPhone: client.phone
    }
  });
}

async function confirmDelete(row) {
  const ok = await confirmStore.showConfirm({
    title: "حذف العميل",
    message: `هل أنت متأكد من رغبتك في حذف بيانات العميل "${row.name}"؟`,
    confirmText: "نعم، حذف",
    isDestructive: true
  });
  if (ok) {
    const res = await clientStore.deleteClient(row.id);
    if (res.success) {
      toast.add({ severity: "success", summary: "تم الحذف", detail: res.message, life: 3000 });
    } else {
      toast.add({ severity: "error", summary: "خطأ", detail: res.message, life: 4000 });
    }
  }
}

function formatCurrency(val) {
  const num = Number(val) || 0;
  const formatted = Math.abs(num).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (num < 0) {
    return `-${formatted} ج.م`;
  }
  return `${formatted} ج.م`;
}

// Excel Import & Export Handlers
function exportClientsToExcel() {
  const exportCols = [
    { key: "name", label: "اسم العميل" },
    { key: "phone", label: "رقم الهاتف" },
    { key: "secondPhone", label: "هاتف إضافي" },
    { key: "type", label: "نوع العميل", formatter: (val) => (val === 2 ? "شركة / أسطول" : "أفراد") },
    { key: "currentBalance", label: "الرصيد الحالي (ج.م)", formatter: (val) => Number(val || 0).toFixed(2) },
    { key: "carPlate", label: "رقم اللوحة" },
    { key: "carModel", label: "موديل وطراز المركبة" },
    { key: "vehiclesCount", label: "عدد المركبات", formatter: (val, item) => item?.vehicles?.length || (val || 0) },
    { key: "address", label: "العنوان" },
    { key: "notes", label: "ملاحظات" },
    { key: "insertDate", label: "تاريخ التسجيل", formatter: (val) => formatDate(val) }
  ];

  exportToExcelCsv(
    `Ohda_قائمة_العملاء_${new Date().toISOString().slice(0, 10)}`,
    exportCols,
    clientStore.clients || []
  );
  toast.add({ severity: "success", summary: "تم التصدير", detail: "تم تصدير ملف Excel بنجاح", life: 3000 });
}

async function handleClientsImport(rows) {
  let createdCount = 0;
  let skippedCount = 0;

  for (const row of rows) {
    const name = row["اسم العميل *"] || row["اسم العميل"] || row["name"] || row["Name"] || row["الاسم"];
    const phone = row["رقم الهاتف *"] || row["رقم الهاتف"] || row["phone"] || row["Phone"] || row["الهاتف"];
    if (!name || !phone) {
      skippedCount++;
      continue;
    }

    const secondPhone = row["رقم هاتف ثانٍ"] || row["هاتف ثانٍ"] || row["secondPhone"] || "";
    const typeStr = String(row["نوع العميل (1=فردي / 2=شركة)"] || row["نوع العميل"] || row["type"] || "1");
    const type = typeStr.includes("2") || typeStr.includes("شركة") ? 2 : 1;
    const plate = row["رقم اللوحة"] || row["plateNumber"] || row["اللوحة"] || "";
    const brand = row["ماركة السيارة"] || row["الماركة"] || row["carBrand"] || "";
    const carType = row["نوع الهيكل"] || row["نوع السيارة"] || row["carType"] || "";
    const model = row["موديل وطراز السيارة"] || row["الموديل"] || row["carModel"] || "";
    const notes = row["ملاحظات"] || row["ملاحظات العميل"] || row["notes"] || "";

    const combinedModel = [carType, brand, model].filter(Boolean).join(" ");

    const payload = {
      name: name.trim(),
      phone: phone.trim(),
      secondPhone: secondPhone ? secondPhone.trim() : null,
      type,
      notes: notes || null
    };

    if (plate) {
      payload.initialVehicle = {
        plateNumber: plate.trim().toUpperCase(),
        model: combinedModel || null
      };
    }

    try {
      await clientStore.createClient(payload);
      createdCount++;
    } catch {
      skippedCount++;
    }
  }

  await clientStore.fetchClients();
  return {
    success: createdCount > 0,
    message: `تم استيراد ${createdCount} عميل بنجاح${skippedCount > 0 ? ` (تم تخطي ${skippedCount} سطر غير مكتمل)` : ""}`
  };
}

function onClientsImportSuccess() {
  toast.add({
    severity: "success",
    summary: "اكتمل الاستيراد",
    detail: "تم تحديث قاعدة بيانات العملاء بنجاح",
    life: 3000
  });
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("ar-EG", { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return "—";
  }
}

function getBalanceBadgeClass(bal) {
  if (bal > 0) return "bg-rose-500/15 text-rose-700 dark:text-rose-300";
  if (bal < 0) return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300";
  return "bg-black/5 dark:bg-white/10 text-brand-gray";
}

function getClientBalanceLabel(bal) {
  const num = Number(bal) || 0;
  if (num > 0) return "مديونية مستحقة";
  if (num < 0) return "رصيد دائن للعميل";
  return "الحساب خالص";
}

onMounted(async () => {
  await Promise.allSettled([
    clientStore.fetchClients(),
    lookupStore.fetchAllActive(),
    financeStore.fetchAccounts(),
    jobCardStore.fetchJobs()
  ]);
});
</script>
