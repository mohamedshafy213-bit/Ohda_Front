<template>
  <div class="space-y-6 font-sans">
    <!-- Non-Printable UI (Normal View) -->
    <div class="no-print space-y-6">
      <!-- Header Title & Action Toolbar -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-surface-900 p-6 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-sm transition-colors">
        <div>
          <h1 class="text-2xl font-bold text-surface-900 dark:text-surface-100 flex items-center gap-3">
            <Compass class="w-7 h-7 text-brand-accent" />
            {{ $t('ohda.compass.title') }}
          </h1>
          <p class="text-xs text-surface-500 dark:text-surface-400 mt-1">
            {{ $t('ohda.compass.subTitle') }}
          </p>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-wrap items-center gap-2.5">
          <!-- Edit Header & Signatures Settings Button -->
          <Button
            @click="openHeaderConfigModal"
            class="!bg-surface-800 hover:!bg-surface-700 dark:!bg-surface-700 dark:hover:!bg-surface-600 !text-white !font-bold !rounded-xl !px-3.5 !py-2.5 !text-xs flex items-center gap-2 shadow-sm cursor-pointer transition-colors"
          >
            <Settings class="w-4 h-4 text-brand-accent" />
            {{ $t('ohda.compass.editHeaderSignatures') }}
          </Button>

          <!-- Print / Export PDF Button (Matching the User's Required Compass Register) -->
          <Button
            @click="openPrintPreview"
            :disabled="compassLogs.length === 0"
            class="!bg-blue-600 hover:!bg-blue-700 !text-white !font-bold !rounded-xl !px-4 !py-2.5 !text-xs flex items-center gap-2 shadow-sm cursor-pointer transition-colors"
          >
            <Printer class="w-4 h-4" />
            {{ $t('ohda.compass.exportPdf') }}
          </Button>

          <!-- Export to Excel Button -->
          <Button
            @click="exportToExcel"
            :loading="exporting"
            class="!bg-emerald-600 hover:!bg-emerald-700 !text-white !font-bold !rounded-xl !px-4 !py-2.5 !text-xs flex items-center gap-2 shadow-sm cursor-pointer transition-colors"
          >
            <FileSpreadsheet class="w-4 h-4" />
            {{ $t('ohda.compass.exportExcel') }}
          </Button>

          <Button
            @click="downloadTemplate"
            class="!bg-surface-100 dark:!bg-surface-800 hover:!bg-surface-200 dark:hover:!bg-surface-700 !text-surface-800 dark:!text-surface-200 !border !border-surface-300 dark:!border-surface-700 !rounded-xl !px-3.5 !py-2.5 !text-xs !font-semibold flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Download class="w-4 h-4 text-brand-accent" />
            {{ $t('ohda.compass.downloadTemplate') }}
          </Button>

          <Button
            @click="showUploadModal = true"
            class="!bg-brand-accent hover:!bg-brand-accent/90 !text-surface-900 !font-bold !rounded-xl !px-4 !py-2.5 !text-xs flex items-center gap-2 shadow-sm cursor-pointer transition-colors"
          >
            <Upload class="w-4 h-4" />
            {{ $t('ohda.compass.uploadDocument') }}
          </Button>
        </div>
      </div>

      <!-- Filter Panel -->
      <div class="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-sm p-5 rounded-2xl space-y-4 transition-colors">
        <div class="flex flex-col lg:flex-row items-start gap-4">
          <div class="flex-1 w-full">
            <div class="flex items-center justify-between">
              <button
                @click="filtersCollapsed = !filtersCollapsed"
                class="text-xs text-brand-accent font-bold hover:underline cursor-pointer flex items-center gap-1"
              >
                <Filter class="w-3.5 h-3.5" />
                {{ filtersCollapsed ? $t('ohda.compass.showFilters') : $t('ohda.compass.hideFilters') }}
              </button>
              <span class="text-[11px] text-surface-500 font-medium">
                {{ filteredLogs.length }} {{ $t('ohda.compass.recordsCount') }}
              </span>
            </div>

            <div v-if="!filtersCollapsed" class="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <label class="block text-[11px] mb-1 font-semibold text-surface-700 dark:text-surface-300">
                  🔍 {{ $t('ohda.compass.textSearch') }}
                </label>
                <InputText
                  v-model="filters.query"
                  :placeholder="$t('ohda.compass.searchPlaceholder')"
                  class="w-full text-xs"
                  @input="debouncedSearch"
                />
              </div>

              <div>
                <label class="block text-[11px] mb-1 font-semibold text-surface-700 dark:text-surface-300">
                  🏢 {{ $t('ohda.compass.department') }}
                </label>
                <Select
                  v-model="filters.departmentId"
                  :options="departments"
                  optionLabel="name"
                  optionValue="id"
                  class="w-full text-xs"
                  showClear
                  :placeholder="$t('ohda.common.all')"
                  @change="performSearch"
                />
              </div>

              <div>
                <label class="block text-[11px] mb-1 font-semibold text-surface-700 dark:text-surface-300">
                  🔄 {{ $t('ohda.compass.movementType') }}
                </label>
                <Select
                  v-model="filters.type"
                  :options="[
                    { label: $t('ohda.compass.allTypes'), value: null },
                    { label: $t('ohda.compass.inflow'), value: 1 },
                    { label: $t('ohda.compass.outflow'), value: 2 }
                  ]"
                  optionLabel="label"
                  optionValue="value"
                  class="w-full text-xs"
                  @change="performSearch"
                />
              </div>

              <div>
                <label class="block text-[11px] mb-1 font-semibold text-surface-700 dark:text-surface-300">
                  📦 {{ $t('ohda.compass.productState') }}
                </label>
                <Select
                  v-model="filters.stateId"
                  :options="productStates"
                  optionLabel="name"
                  optionValue="id"
                  class="w-full text-xs"
                  showClear
                  :placeholder="$t('ohda.common.all')"
                  @change="performSearch"
                />
              </div>

              <div>
                <label class="block text-[11px] mb-1 font-semibold text-surface-700 dark:text-surface-300">
                  📅 {{ $t('ohda.compass.fromDate') }}
                </label>
                <InputText
                  v-model="filters.startDate"
                  type="date"
                  class="w-full text-xs"
                  @change="performSearch"
                />
              </div>

              <div>
                <label class="block text-[11px] mb-1 font-semibold text-surface-700 dark:text-surface-300">
                  📅 {{ $t('ohda.compass.toDate') }}
                </label>
                <InputText
                  v-model="filters.endDate"
                  type="date"
                  class="w-full text-xs"
                  @change="performSearch"
                />
              </div>
            </div>
          </div>

          <div class="w-full lg:w-44 flex flex-row lg:flex-col gap-2 shrink-0 pt-2 lg:pt-6">
            <Button @click="performSearch" class="flex-1 !bg-brand-accent !text-surface-900 !font-bold !text-xs !py-2.5">
              {{ $t('ohda.common.search') }}
            </Button>
            <SecondaryButton @click="resetFilters" class="flex-1 !text-xs !py-2.5">
              {{ $t('ohda.common.reset') }}
            </SecondaryButton>
          </div>
        </div>
      </div>

      <!-- Results Table: Explicit 5-Column Core Layout matching the user's Compass register -->
      <div class="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl overflow-hidden shadow-sm transition-colors">
        <div v-if="loading" class="p-6">
          <LoadingSkeleton type="table" :rows="8" />
        </div>

        <DataTable
          v-else
          :value="filteredLogs"
          paginator
          :rows="15"
          :rowsPerPageOptions="[15, 30, 50, 100]"
          class="w-full text-xs"
        >
          <template #empty>
            <div class="p-8">
              <EmptyState
                :title="$t('ohda.compass.emptyTitle')"
                :description="$t('ohda.compass.emptyDesc')"
                :showAction="false"
              />
            </div>
          </template>

          <!-- 1. Index Number (م) -->
          <Column :header="$t('ohda.compass.indexNo')" headerClass="text-center w-14" bodyClass="text-center font-mono font-bold text-surface-600 dark:text-surface-400">
            <template #body="{ index }">
              {{ index + 1 }}
            </template>
          </Column>

          <!-- 2. Model / Product Name (الطراز) -->
          <Column field="productName" :header="$t('ohda.compass.model')">
            <template #body="{ data }">
              <div class="font-bold text-surface-900 dark:text-surface-100 text-[13px]">
                {{ data.productName }}
              </div>
              <span v-if="data.categoryName" class="text-[10px] text-surface-400">
                {{ data.categoryName }}
              </span>
            </template>
          </Column>

          <!-- 3. Serial Number (رقم المسلسل S/N) -->
          <Column field="serialNumber" :header="$t('ohda.compass.serialNumber')">
            <template #body="{ data }">
              <span class="font-mono text-brand-accent font-bold select-all text-xs bg-brand-soft dark:bg-brand-accent/10 px-2.5 py-1 rounded-md border border-brand-accent/20 tracking-wider">
                {{ data.serialNumber }}
              </span>
            </template>
          </Column>

          <!-- 4. Location / Destination Place (مكان التواجد / القسم) -->
          <Column field="departmentName" :header="$t('ohda.compass.locationPlace')">
            <template #body="{ data }">
              <div class="flex items-center gap-1.5">
                <MapPin class="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span class="font-semibold text-surface-800 dark:text-surface-200">
                  {{ data.place || data.departmentName || 'فرع النظم' }}
                </span>
              </div>
            </template>
          </Column>

          <!-- 5. Current Custody Holder / Recipient (المستلم / حامل العهدة) -->
          <Column field="recipientName" :header="$t('ohda.compass.currentHolder')">
            <template #body="{ data }">
              <span class="font-medium text-surface-700 dark:text-surface-300">
                {{ data.recipientName || data.delivererName || '-' }}
              </span>
            </template>
          </Column>

          <!-- 6. Movement Status Badge -->
          <Column :header="$t('ohda.compass.movementType')" headerClass="text-center" bodyClass="text-center">
            <template #body="{ data }">
              <span v-if="data.type === 1" class="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-500/20 text-[11px]">
                {{ $t('ohda.compass.inflow') }}
              </span>
              <span v-else class="px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-400 font-bold border border-rose-500/20 text-[11px]">
                {{ $t('ohda.compass.outflow') }}
              </span>
            </template>
          </Column>

          <!-- 7. Remarks / Notes (ملاحظات) -->
          <Column field="notes" :header="$t('ohda.compass.remarks')">
            <template #body="{ data }">
              <span class="text-surface-500 dark:text-surface-400 text-[11px] truncate max-w-xs block">
                {{ data.purpose || data.notes || data.productStateName || '-' }}
              </span>
            </template>
          </Column>

          <!-- 8. Actions / Details Eye Icon -->
          <Column :header="$t('ohda.compass.details')" headerClass="text-center" bodyClass="text-center" style="width: 70px">
            <template #body="{ data }">
              <button
                @click="openDetailsModal(data)"
                :title="$t('ohda.compass.viewDetails')"
                class="w-8 h-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-all cursor-pointer shadow-xs hover:scale-105 mx-auto"
              >
                <Eye class="w-4 h-4 text-white" />
              </button>
            </template>
          </Column>
        </DataTable>
      </div>
    </div>

    <!-- Header & Signatures Configuration Modal Dialog -->
    <Dialog
      v-model:visible="showConfigModal"
      modal
      :header="$t('ohda.compass.headerConfigTitle')"
      class="max-w-2xl w-full"
    >
      <div class="space-y-5 text-xs font-sans">
        <!-- Header Lines Section -->
        <div class="p-4 rounded-2xl bg-surface-50 dark:bg-surface-800/60 border border-surface-200 dark:border-surface-700 space-y-4">
          <h4 class="font-bold text-xs text-surface-900 dark:text-surface-100 flex items-center gap-2 border-b border-surface-200 dark:border-surface-700 pb-2">
            <FileText class="w-4 h-4 text-brand-accent" />
            <span>{{ $t('ohda.compass.headerRightGroup') }} &amp; {{ $t('ohda.compass.headerLeftGroup') }}</span>
          </h4>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Right Header -->
            <div class="space-y-2.5 p-3 bg-white dark:bg-surface-850 rounded-xl border border-surface-200 dark:border-surface-700">
              <span class="font-bold text-surface-800 dark:text-surface-200 block text-[11px] text-brand-accent">
                {{ $t('ohda.compass.headerRightGroup') }} (اليمين)
              </span>
              <div>
                <label class="block text-[10px] mb-1 font-semibold text-surface-600 dark:text-surface-400">{{ $t('ohda.compass.line1') }}</label>
                <InputText v-model="headerConfig.headerRightLine1" class="w-full text-xs" />
              </div>
              <div>
                <label class="block text-[10px] mb-1 font-semibold text-surface-600 dark:text-surface-400">{{ $t('ohda.compass.line2') }}</label>
                <InputText v-model="headerConfig.headerRightLine2" class="w-full text-xs" />
              </div>
              <div>
                <label class="block text-[10px] mb-1 font-semibold text-surface-600 dark:text-surface-400">{{ $t('ohda.compass.line3') }}</label>
                <InputText v-model="headerConfig.headerRightLine3" class="w-full text-xs" />
              </div>
            </div>

            <!-- Left Header -->
            <div class="space-y-2.5 p-3 bg-white dark:bg-surface-850 rounded-xl border border-surface-200 dark:border-surface-700">
              <span class="font-bold text-surface-800 dark:text-surface-200 block text-[11px] text-brand-accent">
                {{ $t('ohda.compass.headerLeftGroup') }} (اليسار)
              </span>
              <div>
                <label class="block text-[10px] mb-1 font-semibold text-surface-600 dark:text-surface-400">{{ $t('ohda.compass.line1') }}</label>
                <InputText v-model="headerConfig.headerLeftLine1" class="w-full text-xs" />
              </div>
              <div>
                <label class="block text-[10px] mb-1 font-semibold text-surface-600 dark:text-surface-400">{{ $t('ohda.compass.line2') }}</label>
                <InputText v-model="headerConfig.headerLeftLine2" class="w-full text-xs" />
              </div>
            </div>
          </div>

          <!-- Main Document Title -->
          <div class="pt-2 border-t border-surface-200 dark:border-surface-700">
            <label class="block text-[11px] mb-1 font-bold text-surface-800 dark:text-surface-200">
              {{ $t('ohda.compass.headerMainTitle') }}
            </label>
            <InputText v-model="headerConfig.mainTitle" class="w-full text-xs font-bold" />
          </div>
        </div>

        <!-- Signatures Section Settings -->
        <div class="p-4 rounded-2xl bg-surface-50 dark:bg-surface-800/60 border border-surface-200 dark:border-surface-700 space-y-4">
          <h4 class="font-bold text-xs text-surface-900 dark:text-surface-100 flex items-center gap-2 border-b border-surface-200 dark:border-surface-700 pb-2">
            <Users class="w-4 h-4 text-brand-accent" />
            <span>{{ $t('ohda.compass.signaturesGroup') }} (تظهر بنهاية الصفحة)</span>
          </h4>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Branch Head -->
            <div class="space-y-2.5 p-3 bg-white dark:bg-surface-850 rounded-xl border border-surface-200 dark:border-surface-700">
              <span class="font-bold text-surface-800 dark:text-surface-200 block text-[11px] text-brand-accent">
                رئيس الفرع (الجهة اليمنى)
              </span>
              <div>
                <label class="block text-[10px] mb-1 font-semibold text-surface-600 dark:text-surface-400">{{ $t('ohda.compass.branchHeadRankAndName') }}</label>
                <InputText v-model="headerConfig.branchHeadName" class="w-full text-xs font-bold" />
              </div>
              <div>
                <label class="block text-[10px] mb-1 font-semibold text-surface-600 dark:text-surface-400">{{ $t('ohda.compass.branchHeadRole') }}</label>
                <InputText v-model="headerConfig.branchHeadTitle" class="w-full text-xs" />
              </div>
            </div>

            <!-- Custody Head -->
            <div class="space-y-2.5 p-3 bg-white dark:bg-surface-850 rounded-xl border border-surface-200 dark:border-surface-700">
              <span class="font-bold text-surface-800 dark:text-surface-200 block text-[11px] text-brand-accent">
                رئيس فرع مراقبة العهدة (الجهة اليسرى)
              </span>
              <div>
                <label class="block text-[10px] mb-1 font-semibold text-surface-600 dark:text-surface-400">{{ $t('ohda.compass.custodyHeadRankAndName') }}</label>
                <InputText v-model="headerConfig.custodyHeadName" class="w-full text-xs font-bold" />
              </div>
              <div>
                <label class="block text-[10px] mb-1 font-semibold text-surface-600 dark:text-surface-400">{{ $t('ohda.compass.custodyHeadRole') }}</label>
                <InputText v-model="headerConfig.custodyHeadTitle" class="w-full text-xs" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex items-center justify-between w-full">
          <SecondaryButton @click="resetHeaderConfigToDefault" class="!text-xs">
            {{ $t('ohda.compass.resetHeaderConfig') }}
          </SecondaryButton>

          <div class="flex items-center gap-2">
            <SecondaryButton @click="showConfigModal = false" class="!text-xs">
              {{ $t('ohda.common.cancel') }}
            </SecondaryButton>
            <Button @click="saveHeaderConfig" class="!bg-brand-accent !text-surface-900 !font-bold !text-xs">
              {{ $t('ohda.compass.saveHeaderConfig') }}
            </Button>
          </div>
        </div>
      </template>
    </Dialog>

    <!-- Printable PDF Compass Report Preview Modal (Grouped by Type/Category exactly matching the Word Document) -->
    <Dialog
      v-model:visible="showPrintPreviewModal"
      modal
      :header="$t('ohda.compass.exportPdf')"
      class="max-w-5xl w-full"
    >
      <div class="space-y-4">
        <!-- Print Toolbar in Modal -->
        <div class="flex items-center justify-between p-3 bg-surface-100 dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700">
          <div class="text-xs text-surface-600 dark:text-surface-300">
            {{ $t('ohda.compass.totalDevices') }} <strong class="text-brand-accent font-mono text-sm">{{ filteredLogs.length }}</strong>
          </div>

          <div class="flex items-center gap-2">
            <Button
              @click="openHeaderConfigModal"
              class="!bg-surface-200 dark:!bg-surface-700 hover:!bg-surface-300 !text-surface-800 dark:!text-surface-100 !font-bold !rounded-xl !px-3.5 !py-2 !text-xs flex items-center gap-2 cursor-pointer"
            >
              <Settings class="w-3.5 h-3.5 text-brand-accent" />
              <span>{{ $t('ohda.compass.editHeaderSignatures') }}</span>
            </Button>

            <Button
              @click="triggerPrint"
              class="!bg-blue-600 hover:!bg-blue-700 !text-white !font-bold !rounded-xl !px-4 !py-2 !text-xs flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <Printer class="w-4 h-4" />
              <span>{{ $t('ohda.barcodePrint.print') }} (A4)</span>
            </Button>
          </div>
        </div>

        <!-- Printable Document Canvas -->
        <div id="printableCompassReport" class="bg-white text-black p-8 rounded-xl border-4 border-double border-black shadow-sm font-sans" dir="rtl">
          <!-- Official Report Military Header -->
          <div class="border-b-2 border-black pb-3 mb-5 text-center space-y-2">
            <div class="flex justify-between items-start text-[12px] font-bold text-black mb-1 leading-relaxed">
              <!-- Right Header Lines -->
              <div class="text-start whitespace-pre-line">
                <p v-if="headerConfig.headerRightLine1" class="font-bold">{{ headerConfig.headerRightLine1 }}</p>
                <p v-if="headerConfig.headerRightLine2" class="font-bold">{{ headerConfig.headerRightLine2 }}</p>
                <p v-if="headerConfig.headerRightLine3" class="font-bold">{{ headerConfig.headerRightLine3 }}</p>
              </div>

              <!-- Left Header Lines -->
              <div class="text-end whitespace-pre-line">
                <p v-if="headerConfig.headerLeftLine1" class="font-bold">{{ headerConfig.headerLeftLine1 }}</p>
                <p v-if="headerConfig.headerLeftLine2" class="font-bold">{{ headerConfig.headerLeftLine2 }}</p>
              </div>
            </div>

            <!-- Main Statement Title -->
            <div v-if="headerConfig.mainTitle" class="pt-2 text-center">
              <h2 class="text-[15px] font-black underline tracking-wide text-black uppercase">
                {{ headerConfig.mainTitle }}
              </h2>
            </div>
          </div>

          <!-- Dynamic Table Sections (Matching whatever data is loaded in the Compass table) -->
          <div
            v-for="(items, categoryName) in groupedLogs"
            :key="categoryName"
            class="mb-6 break-inside-avoid print-section"
          >
            <!-- Section Heading (Only shown if real categories exist in the data) -->
            <div
              v-if="categoryName !== 'بيان الأجهزة والعهد' && Object.keys(groupedLogs).length > 1"
              class="category-heading text-[13px] font-black text-black mb-1.5 text-start border-b border-black/30 pb-0.5"
            >
              {{ categoryName.endsWith(':') ? categoryName : categoryName + ' :' }}
            </div>

            <!-- Table matching the Word/PDF document layout with columns: م | نوع الجهاز / الطراز | رقم مسلسل | مكان التواجد | ملاحظات -->
            <table class="w-full border-collapse border border-black text-xs mb-3">
              <thead>
                <tr class="bg-gray-100 font-bold text-center border-b border-black">
                  <th class="border border-black p-1.5 w-12 text-center font-bold">{{ $t('ohda.compass.indexNo') || 'م' }}</th>
                  <th class="border border-black p-1.5 text-start w-1/3 font-bold">{{ $t('ohda.compass.model') || 'نوع الجهاز / الطراز' }}</th>
                  <th class="border border-black p-1.5 font-mono text-center w-1/4 font-bold">{{ $t('ohda.compass.serialNumber') || 'رقم مسلسل' }}</th>
                  <th class="border border-black p-1.5 text-start w-1/4 font-bold">{{ $t('ohda.compass.locationPlace') || 'مكان التواجد' }}</th>
                  <th class="border border-black p-1.5 text-start w-1/6 font-bold">{{ $t('ohda.compass.remarks') || 'ملاحظات' }}</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(item, idx) in items"
                  :key="item.id || idx"
                  class="border-b border-black text-center"
                >
                  <td class="border border-black p-1.5 font-bold font-mono text-center">{{ idx + 1 }}</td>
                  <td class="border border-black p-1.5 text-start font-bold text-[12px]">{{ item.productName || '-' }}</td>
                  <td class="border border-black p-1.5 font-mono font-bold select-all text-[11px] text-center">{{ item.serialNumber || '-' }}</td>
                  <td class="border border-black p-1.5 text-start font-semibold">{{ item.place || item.departmentName || '-' }}</td>
                  <td class="border border-black p-1.5 text-start text-[10px] text-gray-800">{{ item.notes || item.purpose || item.productStateName || '-' }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Official Signatures Block (at the end of report) -->
          <div class="mt-14 pt-4 text-xs font-bold break-inside-avoid signatures-container">
            <div class="grid grid-cols-2 gap-12 text-center">
              <!-- Branch Head (Right) -->
              <div class="space-y-1">
                <p class="mb-8 font-black text-[13px]">التوقيع ( &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; )</p>
                <p class="font-black text-[13px] text-black">{{ headerConfig.branchHeadName }}</p>
                <p class="font-bold text-[12px] text-black">{{ headerConfig.branchHeadTitle }}</p>
              </div>

              <!-- Custody Head (Left) -->
              <div class="space-y-1">
                <p class="mb-8 font-black text-[13px]">التوقيع ( &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; )</p>
                <p class="font-black text-[13px] text-black">{{ headerConfig.custodyHeadName }}</p>
                <p class="font-bold text-[12px] text-black">{{ headerConfig.custodyHeadTitle }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex items-center justify-end gap-2">
          <SecondaryButton @click="showPrintPreviewModal = false">
            {{ $t('ohda.common.close') }}
          </SecondaryButton>
        </div>
      </template>
    </Dialog>

    <!-- Movement & Approval Details Modal (When Clicking Eye Action) -->
    <Dialog
      v-model:visible="showDetailsModal"
      modal
      :header="$t('ohda.compass.modalTitle', { name: selectedItem?.productName || '' })"
      class="max-w-2xl w-full"
    >
      <div v-if="selectedItem" class="space-y-5 text-xs">
        <!-- Top Status Banner -->
        <div class="p-4 rounded-2xl bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 flex flex-wrap items-center justify-between gap-3">
          <div>
            <span class="text-[10px] text-surface-500 dark:text-surface-400 font-semibold block mb-0.5">
              {{ $t('ohda.compass.serialNumber') }}
            </span>
            <span class="font-mono text-base font-black text-brand-accent select-all">{{ selectedItem.serialNumber }}</span>
          </div>

          <div class="flex items-center gap-2">
            <span
              class="px-3 py-1 rounded-xl text-xs font-black"
              :class="selectedItem.type === 1 ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30'"
            >
              {{ selectedItem.type === 1 ? $t('ohda.compass.inflowBadge') : $t('ohda.compass.outflowBadge') }}
            </span>
          </div>
        </div>

        <!-- 2-Column Details Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <!-- Parties Card -->
          <div class="p-4 rounded-2xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-850 space-y-3 shadow-xs">
            <h4 class="font-bold text-xs text-surface-900 dark:text-surface-100 flex items-center gap-2 border-b border-surface-100 dark:border-surface-700 pb-2">
              <Users class="w-4 h-4 text-brand-accent" />
              {{ $t('ohda.compass.partiesTitle') }}
            </h4>

            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-surface-500 dark:text-surface-400">{{ $t('ohda.compass.delivererApplicant') }}</span>
                <span class="font-bold text-surface-900 dark:text-surface-100">{{ selectedItem.delivererName || '-' }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-surface-500 dark:text-surface-400">{{ $t('ohda.compass.recipientHolder') }}</span>
                <span class="font-bold text-brand-accent">{{ selectedItem.recipientName || '-' }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-surface-500 dark:text-surface-400">{{ $t('ohda.compass.recipientDept') }}</span>
                <span class="font-semibold text-surface-800 dark:text-surface-200">{{ selectedItem.departmentName || '-' }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-surface-500 dark:text-surface-400">{{ $t('ohda.compass.recipientPlace') }}</span>
                <span class="text-surface-700 dark:text-surface-300 font-bold text-brand-accent">{{ selectedItem.place || 'فرع النظم' }}</span>
              </div>
            </div>
          </div>

          <!-- Movement Info Card -->
          <div class="p-4 rounded-2xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-850 space-y-3 shadow-xs">
            <h4 class="font-bold text-xs text-surface-900 dark:text-surface-100 flex items-center gap-2 border-b border-surface-100 dark:border-surface-700 pb-2">
              <Calendar class="w-4 h-4 text-brand-accent" />
              {{ $t('ohda.compass.movementDataTitle') }}
            </h4>

            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-surface-500 dark:text-surface-400">{{ $t('ohda.compass.movementDate') }}</span>
                <span class="font-mono font-semibold text-surface-800 dark:text-surface-200">{{ formatDate(selectedItem.exitDate) }}</span>
              </div>
              <div v-if="selectedItem.requesterConfirmedDate" class="flex items-center justify-between">
                <span class="text-surface-500 dark:text-surface-400">{{ $t('ohda.compass.confirmationDate') }}</span>
                <span class="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{{ formatDate(selectedItem.requesterConfirmedDate) }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-surface-500 dark:text-surface-400">{{ $t('ohda.compass.deviceState') }}</span>
                <span class="font-bold text-surface-800 dark:text-surface-200">{{ selectedItem.productStateName || '-' }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-surface-500 dark:text-surface-400">{{ $t('ohda.compass.docNumber') }}</span>
                <span class="font-mono text-surface-800 dark:text-surface-200 px-2 py-0.5 rounded bg-surface-100 dark:bg-surface-700 border border-surface-200 dark:border-surface-600 font-bold">
                  {{ selectedItem.documentNumber || (selectedItem.type === 2 ? `DOC-OUT-${selectedItem.productExitRequestId || selectedItem.id}` : `DOC-IN-${selectedItem.productEntryRequestId || selectedItem.id}`) }}
                </span>
              </div>
              <div v-if="selectedItem.type === 1 && (selectedItem.originalExitDocumentNumber || selectedItem.productExitRequestId)" class="flex items-center justify-between">
                <span class="text-surface-500 dark:text-surface-400">{{ $t('ohda.compass.originalDocNumber') }}</span>
                <span class="font-mono text-amber-700 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-bold">
                  {{ selectedItem.originalExitDocumentNumber || `DOC-OUT-${selectedItem.productExitRequestId}` }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Approval Workflow & Approver Names -->
        <div class="p-4 rounded-2xl border border-surface-200 dark:border-surface-700 bg-surface-50/50 dark:bg-surface-800/50 space-y-3">
          <h4 class="font-bold text-xs text-surface-900 dark:text-surface-100 flex items-center gap-2 border-b border-surface-200/50 dark:border-surface-700 pb-2">
            <ShieldCheck class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            {{ $t('ohda.compass.workflowTitle') }}
          </h4>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div class="p-3 bg-white dark:bg-surface-850 rounded-xl border border-surface-200 dark:border-surface-700">
              <span class="text-[10px] text-surface-500 dark:text-surface-400 block">{{ $t('ohda.compass.firstApprover') }}</span>
              <span class="font-bold text-surface-800 dark:text-surface-200 text-xs mt-0.5 block">{{ selectedItem.supervisorName || $t('ohda.compass.autoApproved') }}</span>
            </div>

            <div class="p-3 bg-white dark:bg-surface-850 rounded-xl border border-surface-200 dark:border-surface-700">
              <span class="text-[10px] text-surface-500 dark:text-surface-400 block">{{ $t('ohda.compass.secondApprover') }}</span>
              <span class="font-bold text-surface-800 dark:text-surface-200 text-xs mt-0.5 block">{{ selectedItem.managerName || $t('ohda.compass.autoApproved') }}</span>
            </div>
          </div>

          <!-- Dynamic Approval Trail Timeline if present -->
          <div v-if="parsedApprovalTrail.length > 0" class="pt-2">
            <span class="text-[11px] font-bold text-surface-800 dark:text-surface-200 block mb-2">{{ $t('ohda.compass.timelineTitle') }}</span>
            <div class="space-y-2">
              <div
                v-for="(step, idx) in parsedApprovalTrail"
                :key="idx"
                class="flex items-start gap-3 p-2.5 bg-white dark:bg-surface-850 rounded-xl border border-surface-200 dark:border-surface-700"
              >
                <div class="w-6 h-6 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-black text-[10px] shrink-0">
                  {{ idx + 1 }}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between">
                    <span class="font-bold text-surface-800 dark:text-surface-200">{{ step.stepName || step.action }}</span>
                    <span class="text-[10px] font-mono text-surface-500 dark:text-surface-400">{{ formatDate(step.date) }}</span>
                  </div>
                  <div class="text-[11px] text-surface-500 dark:text-surface-400 mt-0.5">
                    {{ $t('ohda.compass.byUser') }} <strong class="text-surface-800 dark:text-surface-200">{{ step.userName || step.user || '-' }}</strong>
                    <span v-if="step.notes" class="ms-2 text-surface-700 dark:text-surface-300">({{ step.notes }})</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Notes / Purpose -->
        <div v-if="selectedItem.purpose || selectedItem.notes" class="p-3.5 rounded-xl bg-white dark:bg-surface-850 border border-surface-200 dark:border-surface-700">
          <span class="font-bold text-surface-800 dark:text-surface-200 block mb-1">{{ $t('ohda.compass.notesTitle') }}</span>
          <p class="text-surface-600 dark:text-surface-400 leading-relaxed text-[11px]">
            {{ selectedItem.purpose ? `[${selectedItem.purpose}] ` : '' }}{{ selectedItem.notes || '' }}
          </p>
        </div>
      </div>

      <template #footer>
        <div class="flex items-center justify-end gap-3">
          <SecondaryButton @click="showDetailsModal = false">{{ $t('ohda.common.close') }}</SecondaryButton>
        </div>
      </template>
    </Dialog>

    <!-- Upload Modal Dialog -->
    <Dialog
      v-model:visible="showUploadModal"
      modal
      :header="$t('ohda.compass.importModalTitle')"
      class="max-w-lg w-full"
    >
      <div class="space-y-4 text-xs">
        <!-- Instructions / Feature Callout Card -->
        <div class="p-4 rounded-2xl bg-brand-soft/30 dark:bg-brand-accent/5 border border-brand-accent/20 space-y-2.5">
          <div class="flex items-center gap-2 font-bold text-surface-900 dark:text-surface-100 text-xs">
            <Sparkles class="w-4 h-4 text-brand-accent" />
            <span>نظام التأسيس والربط التلقائي بالبوصلة</span>
          </div>
          <ul class="text-[11px] text-surface-600 dark:text-surface-300 space-y-1.5 list-disc list-inside">
            <li>
              <strong>دليل المفاتيح (Lookups):</strong> يحتوي ملف النموذج على شيتات فرعية توضح أرقام ومعرفات الفروع، التصنيفات، والأقسام.
            </li>
            <li>
              <strong>الإنشاء التلقائي:</strong> عند تسجيل أي صنف جديد غير مسجل، يقوم النظام بإنشائه تلقائياً في جدول المنتجات والمخزون.
            </li>
            <li>
              <strong>تحديث العهد:</strong> يتم تسجيل السيريال ومكان التواجد واسم المستلم فوراً في قاعدة البيانات.
            </li>
          </ul>

          <div class="pt-1 flex items-center justify-between border-t border-brand-accent/15">
            <span class="text-[10px] text-surface-500">ليس لديك النموذج المحدث؟</span>
            <button
              type="button"
              @click="downloadTemplate"
              class="text-[11px] font-bold text-brand-accent hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Download class="w-3.5 h-3.5" />
              تحميل نموذج الإكسيل الشامل
            </button>
          </div>
        </div>

        <div
          class="border-2 border-dashed border-surface-300 dark:border-surface-700 hover:border-brand-accent rounded-2xl p-7 text-center bg-surface-50 dark:bg-surface-800/50 transition-colors cursor-pointer"
          @dragover.prevent
          @drop.prevent="onFileDrop"
          @click="triggerFileSelect"
        >
          <FileSpreadsheet class="w-11 h-11 text-brand-accent mx-auto mb-2" />
          <p class="font-bold text-surface-800 dark:text-surface-200 mb-1">{{ $t('ohda.compass.dropZoneText') }}</p>
          <span class="text-[10px] text-surface-500 dark:text-surface-400 block mb-3">{{ $t('ohda.compass.dropZoneHint') }}</span>
          <input type="file" ref="fileInput" accept=".xlsx, .xls" class="hidden" @change="onFileSelected" />
          <button class="px-4 py-2 bg-brand-soft dark:bg-brand-accent/10 text-brand-accent border border-brand-accent/30 rounded-xl text-xs font-bold cursor-pointer hover:scale-102 transition-transform">
            {{ $t('ohda.compass.browseFiles') }}
          </button>
        </div>

        <div v-if="uploading" class="space-y-2">
          <div class="flex justify-between text-surface-500 dark:text-surface-400">
            <span>{{ $t('ohda.compass.importingProgress') }}</span>
            <span class="font-bold text-brand-accent animate-pulse">جاري المعالجة...</span>
          </div>
          <div class="w-full bg-surface-200 dark:bg-surface-700 rounded-full h-2 overflow-hidden">
            <div class="bg-brand-accent h-2 rounded-full animate-pulse" style="width: 100%"></div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex items-center justify-end gap-3">
          <SecondaryButton :disabled="uploading" @click="showUploadModal = false">{{ $t('ohda.common.cancel') }}</SecondaryButton>
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { apiGet } from "@/utilities/fetchApi";
import axios from "@/utilities/apiClient";
import { useToastStore } from "@/stores/toastStore";
import EmptyState from "@/components/EmptyState.vue";
import LoadingSkeleton from "@/components/LoadingSkeleton.vue";

const { t, locale } = useI18n();
const toastStore = useToastStore();

const departments = ref([]);
const productStates = ref([]);
const filters = ref({ query: '', departmentId: null, type: null, stateId: null, startDate: null, endDate: null });
const filtersCollapsed = ref(false);

const compassLogs = ref([]);
const loading = ref(false);
const exporting = ref(false);
const showUploadModal = ref(false);
const showPrintPreviewModal = ref(false);
const showConfigModal = ref(false);
const uploading = ref(false);
const fileInput = ref(null);

// Default Military Header & Signatures Configuration matching official Army/Tech College Register
const DEFAULT_HEADER_CONFIG = {
  headerRightLine1: "وزارة الدفــــــــــــــــــــــــاع",
  headerRightLine2: "الكلية العسكرية التكنولوجية",
  headerRightLine3: "فرع نظم المعلومـــــــــــــات",
  headerLeftLine1: "التصنيف طبقا لنوع الأجهزة",
  headerLeftLine2: "الملحق ( ب )",
  mainTitle: "أولا: بيان الأرقام المسلسلة لأجهزة الحواسب وتوزيعها طبقا للنوع",
  branchHeadName: "عقيـــــد/ محمـد فرغـل توفيـــق",
  branchHeadTitle: "رئيـس فـــرع نظـم المعلومـــــات",
  custodyHeadName: "رائـــد /عـلاء منير عبد الرازق",
  custodyHeadTitle: "رئيس فـرع مراقبة العـــــــهدة"
};

const headerConfig = ref({ ...DEFAULT_HEADER_CONFIG });

const STORAGE_KEY = "ohda_compass_header_config";

function loadSavedHeaderConfig() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      headerConfig.value = { ...DEFAULT_HEADER_CONFIG, ...parsed };
    }
  } catch (e) {
    console.warn("Failed to parse saved compass header config", e);
  }
}

function openHeaderConfigModal() {
  loadSavedHeaderConfig();
  showConfigModal.value = true;
}

function saveHeaderConfig() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(headerConfig.value));
    toastStore.addSuccessToast({ title: t('ohda.compass.configSavedSuccess') });
    showConfigModal.value = false;
  } catch (e) {
    console.error("Failed to save compass header config", e);
  }
}

function resetHeaderConfigToDefault() {
  headerConfig.value = { ...DEFAULT_HEADER_CONFIG };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_HEADER_CONFIG));
    toastStore.addSuccessToast({ title: t('ohda.compass.configResetSuccess') });
  } catch (e) {
    console.error("Failed to reset compass header config", e);
  }
}

// Details Modal State
const showDetailsModal = ref(false);
const selectedItem = ref(null);

const filteredLogs = computed(() => {
  return compassLogs.value;
});

// Group items purely dynamically from API / DB data (no hardcoded models or seed strings)
const groupedLogs = computed(() => {
  const groups = {};
  filteredLogs.value.forEach((item) => {
    // Purely dynamic: if the item has a categoryName from the database, group by it; otherwise group into a single list
    const cat = item.categoryName && item.categoryName.trim() ? item.categoryName.trim() : null;
    if (cat) {
      if (!groups[cat]) {
        groups[cat] = [];
      }
      groups[cat].push(item);
    } else {
      const defaultGroup = "بيان الأجهزة والعهد";
      if (!groups[defaultGroup]) {
        groups[defaultGroup] = [];
      }
      groups[defaultGroup].push(item);
    }
  });
  return groups;
});

const currentDateFormatted = computed(() => {
  const d = new Date();
  return d.toLocaleDateString(locale.value === 'ar' ? 'ar-EG' : 'en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
});

const parsedApprovalTrail = computed(() => {
  if (!selectedItem.value?.approvalTrail) return [];
  try {
    const parsed = typeof selectedItem.value.approvalTrail === "string"
      ? JSON.parse(selectedItem.value.approvalTrail)
      : selectedItem.value.approvalTrail;
    return Array.isArray(parsed) ? parsed : [];
  } catch (_) {
    return [];
  }
});

function openDetailsModal(item) {
  selectedItem.value = item;
  showDetailsModal.value = true;
}

function openPrintPreview() {
  loadSavedHeaderConfig();
  showPrintPreviewModal.value = true;
}

function triggerPrint() {
  const printContent = document.getElementById("printableCompassReport");
  if (!printContent) return;

  const printWindow = window.open("", "_blank");
  printWindow.document.write(`
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
      <head>
        <meta charset="utf-8" />
        <title>${headerConfig.value.mainTitle || 'سجل بوصلة العهد والأجهزة ومواقع تواجدها'}</title>
        <style>
          @page { 
            size: A4 portrait; 
            margin: 8mm 8mm 10mm 8mm; 
          }
          * {
            box-sizing: border-box;
          }
          body { 
            font-family: 'Times New Roman', 'Cairo', Tahoma, Arial, sans-serif; 
            direction: rtl; 
            margin: 0; 
            padding: 4px; 
            color: #000; 
            font-size: 11px; 
            background: #fff;
          }
          .print-outer-frame {
            border: 3px double #000;
            padding: 10px 12px;
            min-height: 98vh;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }
          .category-heading {
            font-size: 13px;
            font-weight: 900;
            margin-top: 10px;
            margin-bottom: 4px;
            text-align: right;
            border-bottom: 1px solid #000;
            padding-bottom: 2px;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 3px; 
            margin-bottom: 12px; 
            font-size: 11px; 
            page-break-inside: auto; 
          }
          tr { 
            page-break-inside: avoid; 
            page-break-after: auto; 
          }
          thead { 
            display: table-header-group; 
          }
          tfoot { 
            display: table-footer-group; 
          }
          th, td { 
            border: 1px solid #000; 
            padding: 4px 6px; 
          }
          th { 
            background-color: #f2f2f2 !important; 
            font-weight: bold; 
            font-size: 11px; 
            text-align: center;
          }
          .text-start { text-align: right; }
          .text-center { text-align: center; }
          .font-mono { font-family: 'Consolas', 'Courier New', monospace; font-weight: bold; }
          .signatures-container { 
            margin-top: 30px; 
            padding-top: 10px; 
            font-size: 12px; 
            font-weight: bold; 
            page-break-inside: avoid; 
          }
          @media print {
            body { padding: 0; }
            button { display: none; }
            .print-outer-frame { border: 3px double #000 !important; }
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        </style>
      </head>
      <body>
        <div class="print-outer-frame">
          ${printContent.innerHTML}
        </div>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 400);
}

onMounted(() => {
  loadSavedHeaderConfig();
  performSearch();
  (async () => {
    try {
      const d = await apiGet('/api/Department');
      departments.value = d?.data?.objects || d?.data?.singleObject || [];
    } catch (e) { console.warn('Departments fetch failed', e); }
  })();
  (async () => {
    try {
      const s = await apiGet('/api/ProductState');
      productStates.value = s?.data?.objects || s?.data?.singleObject || [];
    } catch (e) { console.warn('ProductStates fetch failed', e); }
  })();
});

let searchTimeout = null;
function debouncedSearch() {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    performSearch();
  }, 400);
}

function buildQueryParams() {
  const params = [];
  if (filters.value.query) params.push(`query=${encodeURIComponent(filters.value.query)}`);
  if (filters.value.departmentId) params.push(`departmentId=${filters.value.departmentId}`);
  if (filters.value.type) params.push(`type=${filters.value.type}`);
  if (filters.value.stateId) params.push(`stateId=${filters.value.stateId}`);
  if (filters.value.startDate) params.push(`startDate=${encodeURIComponent(filters.value.startDate)}`);
  if (filters.value.endDate) params.push(`endDate=${encodeURIComponent(filters.value.endDate)}`);
  return params.length ? `?${params.join('&')}` : '';
}

async function performSearch() {
  loading.value = true;
  try {
    const q = buildQueryParams();
    const res = await apiGet(`/api/Compass/search${q}`);
    const data = res?.data;
    if (data?.isDone || data?.IsDone) {
      compassLogs.value = data.singleObject || data.SingleObject || data.objects || [];
    }
  } catch (err) {
    console.error("Compass search failed", err);
  } finally {
    loading.value = false;
  }
}

function resetFilters() {
  filters.value = { query: '', departmentId: null, type: null, stateId: null, startDate: null, endDate: null };
  performSearch();
}

async function exportToExcel() {
  if (exporting.value) return;
  exporting.value = true;
  try {
    const q = buildQueryParams();
    const res = await axios.get(`/api/Compass/export${q}`, { responseType: "blob" });
    const url = URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.download = `Ohda_Compass_Report_${new Date().toISOString().slice(0, 10)}.xlsx`;
    link.click();
    URL.revokeObjectURL(url);
    toastStore.addSuccessToast({ title: t('ohda.compass.exportSuccess') });
  } catch (err) {
    toastStore.addErrorToast({ title: t('ohda.compass.exportFailed') });
  } finally {
    exporting.value = false;
  }
}

async function downloadTemplate() {
  try {
    const res = await axios.get("/api/Compass/template", { responseType: "blob" });
    const url = URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.download = "Compass_Template.xlsx";
    link.click();
    URL.revokeObjectURL(url);
    toastStore.addSuccessToast({ title: t('ohda.compass.templateSuccess') });
  } catch (err) {
    toastStore.addErrorToast({ title: t('ohda.compass.templateFailed') });
  }
}

function triggerFileSelect() {
  fileInput.value.click();
}

function onFileSelected(e) {
  const file = e.target.files[0];
  if (file) {
    uploadFile(file);
  }
}

function onFileDrop(e) {
  const file = e.dataTransfer.files[0];
  if (file) {
    uploadFile(file);
  }
}

async function uploadFile(file) {
  uploading.value = true;
  const formData = new FormData();
  formData.append("file", file);
  try {
    const res = await axios.post("/api/Compass/import", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    const data = res?.data;
    if (data?.isDone || data?.IsDone) {
      toastStore.addSuccessToast({ title: data.returnMessage || data.ReturnMessage || t('ohda.compass.importSuccess') });
      showUploadModal.value = false;
      performSearch();
    } else {
      toastStore.addErrorToast({ title: data?.returnMessage || data?.ReturnMessage || t('ohda.compass.importFailed') });
    }
  } catch (err) {
    toastStore.addErrorToast({ title: t('ohda.compass.importFailed') });
  } finally {
    uploading.value = false;
  }
}

function formatDate(dateStr) {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    return d.toLocaleString(locale.value === 'ar' ? 'ar-SA' : 'en-US', {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch (_) {
    return dateStr;
  }
}
</script>

<style scoped>
@media print {
  .no-print {
    display: none !important;
  }
}
</style>
