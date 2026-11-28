<template>
  <div class="space-y-6">
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-brand-white dark:bg-white/5 p-6 rounded-2xl border border-brand-gray/10 shadow-sm">
      <div>
        <h1 class="text-2xl font-bold text-brand-dark dark:text-white flex items-center gap-3">
          <Layers class="w-7 h-7 text-brand-accent" />
          {{ $t('ohda.warehouseBins.title') }}
        </h1>
        <p class="text-xs text-brand-gray dark:text-slate-400 mt-1">
          إدارة المستودعات الرئيسية (مخزن قطع الغيار، مخزن الزيوت) وتوزيع الأرفف والأماكن التخزينية
        </p>
      </div>

      <div class="flex items-center gap-2">
        <Button
          @click="openAddModal"
          class="!bg-brand-accent hover:!bg-brand-accent/90 !text-brand-dark !font-bold flex items-center gap-2 !px-4 !py-2.5 !rounded-xl !shadow-md shadow-brand-accent/10 cursor-pointer text-xs"
        >
          <Plus class="w-4 h-4" />
          <span>{{ $t('ohda.warehouseBins.addBin') }}</span>
        </Button>
      </div>
    </div>

    <!-- Main Warehouses / Inventories Management Section -->
    <div class="bg-brand-white dark:bg-white/5 border border-brand-gray/15 p-5 rounded-2xl shadow-sm space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-brand-gray/10">
        <div>
          <h2 class="text-base font-bold text-brand-dark dark:text-white flex items-center gap-2">
            <Building2 class="w-5 h-5 text-brand-accent" />
            المستودعات والمخازن الرئيسية
          </h2>
          <p class="text-xs text-brand-gray dark:text-slate-400 mt-0.5">
            اضغط على أي مخزن لعرض وتخصيص الأرفف التابعة له مباشرة
          </p>
        </div>
        <div class="flex items-center gap-2">
          <Button
            v-if="!binStore.departments || binStore.departments.length === 0"
            @click="seedDefaultDepartments"
            type="button"
            class="!bg-amber-500/10 hover:!bg-amber-500/20 !text-amber-600 dark:!text-amber-400 !border !border-amber-500/30 !text-xs !font-bold !px-3 !py-2 !rounded-xl cursor-pointer flex items-center gap-1.5 transition-all"
          >
            <Sparkles class="w-3.5 h-3.5" />
            <span>تهيئة المخازن القياسية (قطع غيار + زيوت)</span>
          </Button>

          <Button
            @click="openAddDeptModal"
            type="button"
            class="!bg-brand-dark dark:!bg-white/10 hover:!bg-brand-dark/90 !text-white !font-bold flex items-center gap-2 !px-3.5 !py-2 !rounded-xl !text-xs cursor-pointer shadow-sm transition-all"
          >
            <Plus class="w-3.5 h-3.5 text-brand-accent" />
            <span>+ إضافة مستودع جديد</span>
          </Button>
        </div>
      </div>

      <!-- Department Cards Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        <!-- "All Warehouses" Filter Card -->
        <div
          @click="selectDepartment(null)"
          class="p-4 rounded-2xl border transition-all cursor-pointer relative"
          :class="selectedDepartmentId === null ? 'bg-brand-soft/80 dark:bg-white/10 border-brand-accent ring-2 ring-brand-accent/30 shadow-md' : 'bg-brand-light/40 dark:bg-white/5 border-brand-gray/15 hover:border-brand-accent/40'"
        >
          <div class="flex items-center justify-between mb-2">
            <span class="font-bold text-xs text-brand-dark dark:text-white flex items-center gap-1.5">
              <span>🏢</span>
              <span>جميع المستودعات</span>
            </span>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-brand-accent/20 text-brand-dark dark:text-white">
              {{ binStore.bins?.length || 0 }} رف
            </span>
          </div>
          <p class="text-[11px] text-brand-gray dark:text-slate-400 mb-2">عرض أرفف ومساحات كافة المخازن</p>
          <div class="flex items-center justify-between text-[11px] font-mono text-brand-gray dark:text-slate-400 pt-2 border-t border-brand-gray/10">
            <span>إجمالي الشاغر</span>
            <span class="font-bold text-emerald-600 dark:text-emerald-400">{{ binStore.totalRemainingSpace }} قطعة</span>
          </div>
        </div>

        <!-- Individual Department Cards -->
        <div
          v-for="dept in binStore.departments"
          :key="dept.id"
          @click="selectDepartment(dept.id)"
          class="p-4 rounded-2xl border transition-all cursor-pointer relative group"
          :class="selectedDepartmentId === dept.id ? 'bg-brand-soft/80 dark:bg-white/10 border-brand-accent ring-2 ring-brand-accent/30 shadow-md' : 'bg-brand-light/40 dark:bg-white/5 border-brand-gray/15 hover:border-brand-accent/40'"
        >
          <div class="flex items-start justify-between mb-1.5">
            <div class="flex items-center gap-2">
              <span class="text-lg">{{ getDeptIcon(dept.name) }}</span>
              <div>
                <span class="font-bold text-xs text-brand-dark dark:text-white block">{{ dept.name }}</span>
                <span class="text-[10px] text-brand-gray dark:text-slate-400 line-clamp-1" v-if="dept.description">{{ dept.description }}</span>
              </div>
            </div>

            <!-- Actions Menu for Department -->
            <div class="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity" @click.stop>
              <button
                type="button"
                @click.stop="openEditDeptModal(dept)"
                class="p-1 hover:bg-brand-accent/20 rounded-lg text-brand-gray hover:text-brand-dark dark:hover:text-white transition-all cursor-pointer"
                title="تعديل اسم المستودع"
              >
                <Pencil class="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                @click.stop="promptDeleteDept(dept)"
                class="p-1 hover:bg-red-500/20 rounded-lg text-brand-gray hover:text-red-500 transition-all cursor-pointer"
                title="حذف المستودع"
              >
                <Trash2 class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div class="flex items-center justify-between text-[11px] font-mono text-brand-gray dark:text-slate-400 pt-2 border-t border-brand-gray/10 mt-2">
            <span>{{ getBinsForDept(dept.id).length }} أرفف</span>
            <span class="font-bold text-amber-600 dark:text-amber-400">{{ getDeptOccupiedItems(dept.id) }} قطعة مسكنة</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Active Warehouse Filter Banner & Shelves Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-brand-white dark:bg-white/5 border border-brand-gray/15 p-4 rounded-2xl shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl bg-brand-soft dark:bg-white/10 text-brand-accent flex items-center justify-center font-bold">
          <Layers class="w-5 h-5" />
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h3 class="text-sm font-bold text-brand-dark dark:text-white">
              {{ selectedDepartment ? `أرفف ${selectedDepartment.name}` : 'جميع أرفف النظام' }}
            </h3>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-brand-accent/20 text-brand-dark dark:text-white">
              {{ filteredBins.length }} رف متاح
            </span>
          </div>
          <p class="text-[11px] text-brand-gray dark:text-slate-400">
            {{ selectedDepartment ? (selectedDepartment.description || 'أرفف تابعة لهذا المخزن') : 'عرض كافة الأرفف عبر جميع المستودعات' }}
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <Button
          @click="openAddModalForCurrentDept"
          class="!bg-brand-accent hover:!bg-brand-accent/90 !text-brand-dark !font-bold flex items-center gap-2 !px-3.5 !py-2 !rounded-xl !shadow-sm cursor-pointer text-xs"
        >
          <Plus class="w-4 h-4" />
          <span>{{ selectedDepartment ? `+ إضافة رف في ${selectedDepartment.name}` : '+ إضافة رف جديد' }}</span>
        </Button>
      </div>
    </div>

    <!-- Quick Stats Cards for Shelves -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Total Bins -->
      <div class="bg-brand-white dark:bg-white/5 border border-brand-gray/15 p-4 rounded-2xl shadow-sm flex items-center justify-between">
        <div class="space-y-1">
          <span class="text-xs font-semibold text-brand-gray dark:text-slate-400">إجمالي الأرفف المعروضة</span>
          <h3 class="text-2xl font-extrabold text-brand-dark dark:text-white font-mono">
            {{ filteredBins.length }}
          </h3>
        </div>
        <div class="w-10 h-10 rounded-xl bg-brand-soft dark:bg-white/10 text-brand-accent flex items-center justify-center">
          <Layers class="w-5 h-5" />
        </div>
      </div>

      <!-- Total Capacity -->
      <div class="bg-brand-white dark:bg-white/5 border border-brand-gray/15 p-4 rounded-2xl shadow-sm flex items-center justify-between">
        <div class="space-y-1">
          <span class="text-xs font-semibold text-brand-gray dark:text-slate-400">{{ $t('ohda.warehouseBins.totalCapacity') }}</span>
          <h3 class="text-2xl font-extrabold text-blue-600 dark:text-blue-400 font-mono">
            {{ currentCapacity }}
            <span class="text-xs font-normal text-brand-gray dark:text-slate-400">{{ $t('ohda.common.unit') }}</span>
          </h3>
        </div>
        <div class="w-10 h-10 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-500 flex items-center justify-center">
          <Boxes class="w-5 h-5" />
        </div>
      </div>

      <!-- Occupied Items -->
      <div class="bg-brand-white dark:bg-white/5 border border-brand-gray/15 p-4 rounded-2xl shadow-sm flex items-center justify-between">
        <div class="space-y-1">
          <span class="text-xs font-semibold text-brand-gray dark:text-slate-400">{{ $t('ohda.warehouseBins.totalItemsOccupied') }}</span>
          <h3 class="text-2xl font-extrabold text-amber-600 dark:text-amber-400 font-mono">
            {{ currentOccupied }}
            <span class="text-xs font-normal text-brand-gray dark:text-slate-400">{{ $t('ohda.common.piece') }}</span>
          </h3>
        </div>
        <div class="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-500 flex items-center justify-center">
          <Box class="w-5 h-5" />
        </div>
      </div>

      <!-- Remaining Space -->
      <div class="bg-brand-white dark:bg-white/5 border border-brand-gray/15 p-4 rounded-2xl shadow-sm flex items-center justify-between">
        <div class="space-y-1">
          <span class="text-xs font-semibold text-brand-gray dark:text-slate-400">{{ $t('ohda.warehouseBins.totalSpaceAvailable') }}</span>
          <h3 class="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
            {{ currentRemaining }}
            <span class="text-xs font-normal text-brand-gray dark:text-slate-400">{{ $t('ohda.common.piece') }}</span>
          </h3>
        </div>
        <div class="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
          <CheckCircle2 class="w-5 h-5" />
        </div>
      </div>
    </div>

    <!-- Search Bar & Status Legend -->
    <div class="bg-brand-white dark:bg-white/5 border border-brand-gray/15 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
      <div class="w-full md:w-96">
        <searchField v-model="searchQuery" :placeholder="$t('ohda.common.search')" />
      </div>

      <div class="text-xs text-brand-gray dark:text-slate-400 flex items-center gap-3">
        <span class="flex items-center gap-1.5">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
          {{ $t('ohda.warehouseBins.spaceStatusAvailable') }}
        </span>
        <span class="flex items-center gap-1.5">
          <span class="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
          {{ $t('ohda.warehouseBins.spaceStatusNearFull') }}
        </span>
        <span class="flex items-center gap-1.5">
          <span class="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>
          {{ $t('ohda.warehouseBins.spaceStatusFull') }}
        </span>
      </div>
    </div>

    <!-- Loading Skeleton -->
    <LoadingSkeleton v-if="binStore.loading" type="table" :count="6" />

    <!-- Bins Table -->
    <div v-else class="bg-brand-white dark:bg-white/5 border border-brand-gray/15 rounded-2xl shadow-sm overflow-hidden">
      <DataTable
        :value="filteredBins"
        paginator
        :rows="10"
        :rowsPerPageOptions="[5, 10, 20, 50]"
        responsiveLayout="scroll"
        class="text-xs w-full"
      >
        <template #empty>
          <EmptyState
            :title="selectedDepartment ? `لا توجد أرفف مسجلة في ${selectedDepartment.name}` : $t('ohda.warehouseBins.emptyBins')"
            icon="Layers"
            :actionLabel="$t('ohda.warehouseBins.addBin')"
            @action="openAddModalForCurrentDept"
          />
        </template>

        <!-- Warehouse/Department Column -->
        <Column header="المستودع / المخزن" sortable field="departmentId">
          <template #body="{ data }">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-brand-soft/80 dark:bg-white/10 text-brand-dark dark:text-white border border-brand-gray/15">
              <span>{{ getDeptIcon(getDeptName(data.departmentId)) }}</span>
              <span>{{ getDeptName(data.departmentId) }}</span>
            </span>
          </template>
        </Column>

        <!-- Bin Code -->
        <Column field="code" :header="$t('ohda.warehouseBins.code')" sortable>
          <template #body="{ data }">
            <div class="flex items-center gap-2">
              <span class="font-mono font-bold text-brand-dark dark:text-white">{{ data.code }}</span>
            </div>
          </template>
        </Column>

        <!-- Bin Name & Description -->
        <Column field="name" :header="$t('ohda.warehouseBins.name')" sortable>
          <template #body="{ data }">
            <div>
              <span class="font-bold text-brand-dark dark:text-white block">{{ data.name }}</span>
              <span class="text-[10px] text-brand-gray dark:text-slate-400 mt-0.5 block" v-if="data.description">{{ data.description }}</span>
            </div>
          </template>
        </Column>

        <!-- Aisle & Shelf -->
        <Column :header="$t('ohda.warehouseBins.aisle')">
          <template #body="{ data }">
            <span class="font-mono text-xs text-brand-gray dark:text-slate-400">
              {{ data.aisle ? `${data.aisle} / ${data.shelf || '-'}` : '-' }}
            </span>
          </template>
        </Column>

        <!-- Capacity -->
        <Column field="capacity" :header="$t('ohda.warehouseBins.maxCapacity')" sortable>
          <template #body="{ data }">
            <span class="font-mono font-bold text-brand-dark dark:text-white">
              {{ data.capacity ? `${data.capacity} ${$t('ohda.common.piece')}` : '-' }}
            </span>
          </template>
        </Column>

        <!-- Items Count -->
        <Column field="itemsCount" :header="$t('ohda.warehouseBins.currentStock')" sortable>
          <template #body="{ data }">
            <button
              type="button"
              @click="viewBinItems(data)"
              class="px-2.5 py-1 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer flex items-center gap-1.5 border"
              :class="(data.itemsCount || 0) > 0 ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/20' : 'bg-brand-light dark:bg-white/5 text-brand-gray border-brand-gray/20'"
            >
              <Box class="w-3.5 h-3.5" />
              <span>{{ data.itemsCount || 0 }} {{ $t('ohda.common.piece') }}</span>
            </button>
          </template>
        </Column>

        <!-- Remaining Capacity Progress Meter -->
        <Column :header="$t('ohda.warehouseBins.remainingSpace')">
          <template #body="{ data }">
            <div class="space-y-1.5 min-w-[130px]">
              <div class="flex items-center justify-between text-[11px] font-mono">
                <span class="font-bold" :class="getRemainingSpace(data) === 0 ? 'text-red-500 font-extrabold' : 'text-brand-dark dark:text-white'">
                  {{ getRemainingSpace(data) }} {{ $t('ohda.common.piece') }}
                </span>
                <span class="text-brand-gray dark:text-slate-400 text-[10px]">
                  {{ Math.round(getUsedPercentage(data)) }}%
                </span>
              </div>
              <div class="w-full bg-brand-light dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full transition-all"
                  :class="getProgressBarClass(data)"
                  :style="{ width: `${getUsedPercentage(data)}%` }"
                ></div>
              </div>
            </div>
          </template>
        </Column>

        <!-- Actions -->
        <Column :header="$t('ohda.common.actions')" style="width: 130px">
          <template #body="{ data }">
            <div class="flex items-center gap-1">
              <!-- Quick Assign Button -->
              <Button
                type="button"
                @click="openAssignModal(data)"
                class="bg-transparent !rounded-xl w-8 h-8 !p-1 border border-transparent hover:!border-brand-accent/30 hover:!bg-brand-accent/10 text-brand-accent transition-all cursor-pointer flex items-center justify-center shadow-none"
                :title="$t('ohda.entryRequests.assignBin')"
              >
                <PackagePlus class="w-3.5 h-3.5" />
              </Button>
              <editButton @click="openEditModal(data)" />
              <deleteButton @click="promptDelete(data)" />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Create/Edit Warehouse (Department) Modal -->
    <Dialog
      v-model:visible="showDeptModal"
      modal
      :header="isEditingDept ? 'تعديل بيانات المستودع' : 'إضافة مستودع / مخزن جديد'"
      class="max-w-md w-full !bg-brand-white dark:!bg-brand-dark !border-brand-gray/15 !text-brand-dark dark:!text-white rounded-3xl overflow-hidden shadow-2xl"
    >
      <form @submit.prevent="handleSaveDepartment" class="space-y-4 text-xs">
        <div>
          <label class="block font-semibold text-brand-dark dark:text-white mb-1.5 required">
            اسم المستودع / المخزن
          </label>
          <InputText
            v-model="deptForm.name"
            required
            placeholder="مثال: مخزن قطع الغيار، مخزن الزيوت والسوائل..."
            class="w-full !bg-brand-light dark:!bg-brand-dark/50 !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark dark:!text-white rounded-xl"
            autofocus
          />
        </div>

        <div>
          <label class="block font-semibold text-brand-dark dark:text-white mb-1.5">
            الوصف أو ملاحظات المكان
          </label>
          <Textarea
            v-model="deptForm.description"
            rows="3"
            placeholder="مثال: الدور الأرضي بجوار ورشة الميكانيكا، مخصص للزيوت والفلاتر..."
            class="w-full !bg-brand-light dark:!bg-brand-dark/50 !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark dark:!text-white rounded-xl"
          />
        </div>

        <div class="flex items-center justify-end gap-2.5 pt-4 border-t border-brand-gray/10 dark:border-white/10">
          <SecondaryButton type="button" :disabled="isSavingDept" @click="showDeptModal = false">
            {{ $t('ohda.common.cancel') }}
          </SecondaryButton>
          <Button
            type="submit"
            :disabled="isSavingDept || !deptForm.name?.trim()"
            class="!bg-brand-accent hover:!bg-brand-accent/90 !text-brand-dark !font-bold flex items-center gap-2 shadow-md shadow-brand-accent/15"
          >
            <div v-if="isSavingDept" class="animate-spin rounded-full h-3.5 w-3.5 border-2 border-brand-dark/30 border-t-brand-dark"></div>
            <span>{{ isSavingDept ? $t('ohda.common.saving') : $t('ohda.common.save') }}</span>
          </Button>
        </div>
      </form>
    </Dialog>

    <!-- Create/Edit Bin Modal -->
    <Dialog
      v-model:visible="showModal"
      modal
      :header="isEditing ? $t('ohda.warehouseBins.editBin') : $t('ohda.warehouseBins.addBin')"
      class="max-w-md w-full !bg-brand-white dark:!bg-brand-dark !border-brand-gray/15 !text-brand-dark dark:!text-white rounded-3xl overflow-hidden shadow-2xl"
    >
      <form @submit.prevent="handleSaveBin" class="space-y-4 text-xs">
        <!-- Department / Warehouse Selector -->
        <div>
          <label class="block font-semibold text-brand-dark dark:text-white mb-1.5 required">
            المستودع / المخزن التابع له
          </label>
          <Select
            v-model="form.departmentId"
            :options="departmentSelectOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="ابحث واختر المستودع..."
            filter
            class="w-full text-xs"
          />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold text-brand-dark dark:text-white mb-1.5 required">
              {{ $t('ohda.warehouseBins.code') }}
            </label>
            <InputText
              v-model="form.code"
              required
              class="w-full !bg-brand-light dark:!bg-brand-dark/50 !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark dark:!text-white rounded-xl font-mono uppercase"
            />
          </div>
          <div>
            <label class="block font-semibold text-brand-dark dark:text-white mb-1.5 required">
              {{ $t('ohda.warehouseBins.name') }}
            </label>
            <InputText
              v-model="form.name"
              required
              class="w-full !bg-brand-light dark:!bg-brand-dark/50 !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark dark:!text-white rounded-xl"
              autofocus
            />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label class="block font-semibold text-brand-dark dark:text-white mb-1.5">
              {{ $t('ohda.warehouseBins.aisle') }}
            </label>
            <InputText
              v-model="form.aisle"
              class="w-full !bg-brand-light dark:!bg-brand-dark/50 !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark dark:!text-white rounded-xl font-mono"
            />
          </div>
          <div>
            <label class="block font-semibold text-brand-dark dark:text-white mb-1.5">
              {{ $t('ohda.warehouseBins.shelfLevel') }}
            </label>
            <InputText
              v-model="form.shelf"
              class="w-full !bg-brand-light dark:!bg-brand-dark/50 !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark dark:!text-white rounded-xl font-mono"
            />
          </div>
          <div>
            <label class="block font-semibold text-brand-dark dark:text-white mb-1.5 required">
              {{ $t('ohda.warehouseBins.maxCapacity') }}
            </label>
            <InputNumber
              v-model="form.capacity"
              :min="1"
              :max="10000"
              class="w-full !bg-brand-light dark:!bg-brand-dark/50 !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark dark:!text-white rounded-xl font-mono"
            />
          </div>
        </div>

        <div>
          <label class="block font-semibold text-brand-dark dark:text-white mb-1.5">
            {{ $t('ohda.categories.description') }}
          </label>
          <Textarea
            v-model="form.description"
            rows="2"
            class="w-full !bg-brand-light dark:!bg-brand-dark/50 !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark dark:!text-white rounded-xl"
          />
        </div>

        <div class="flex items-center justify-end gap-2.5 pt-4 border-t border-brand-gray/10 dark:border-white/10">
          <SecondaryButton type="button" :disabled="isSaving" @click="showModal = false">
            {{ $t('ohda.common.cancel') }}
          </SecondaryButton>
          <Button
            type="submit"
            :disabled="isSaving"
            class="!bg-brand-accent hover:!bg-brand-accent/90 !text-brand-dark !font-bold flex items-center gap-2 shadow-md shadow-brand-accent/15"
          >
            <div v-if="isSaving" class="animate-spin rounded-full h-3.5 w-3.5 border-2 border-brand-dark/30 border-t-brand-dark"></div>
            <span>{{ isSaving ? $t('ohda.common.saving') : $t('ohda.common.save') }}</span>
          </Button>
        </div>
      </form>
    </Dialog>

    <!-- Quick Assign Product Modal -->
    <Dialog
      v-model:visible="showAssignModal"
      modal
      :header="$t('ohda.entryRequests.assignBin')"
      class="max-w-md w-full !bg-brand-white dark:!bg-brand-dark !border-brand-gray/15 !text-brand-dark dark:!text-white rounded-3xl overflow-hidden shadow-2xl"
    >
      <div v-if="targetBin" class="space-y-4 text-xs">
        <div class="p-3 bg-brand-soft dark:bg-white/10 rounded-xl border border-brand-accent/20 flex items-center justify-between">
          <div>
            <span class="font-bold text-brand-dark dark:text-white">{{ targetBin.name }}</span>
            <span class="text-[10px] text-brand-accent font-mono block">{{ targetBin.code }}</span>
          </div>
          <span class="text-xs font-mono font-bold text-emerald-600">
            {{ getRemainingSpace(targetBin) }} {{ $t('ohda.common.piece') }} شاغر
          </span>
        </div>

        <div>
          <label class="block font-semibold text-brand-dark dark:text-white mb-1.5 required">
            {{ $t('ohda.products.title') }}
          </label>
          <Select
            v-model="assignForm.productId"
            :options="inventoryStore.products"
            optionLabel="name"
            optionValue="id"
            filter
            class="w-full !bg-brand-light dark:!bg-brand-dark/50 !border-brand-gray/25 rounded-xl"
          />
        </div>

        <div>
          <label class="block font-semibold text-brand-dark dark:text-white mb-1.5 required">
            {{ $t('ohda.products.qty') }}
          </label>
          <InputNumber
            v-model="assignForm.quantity"
            :min="1"
            :max="getRemainingSpace(targetBin) || 1"
            class="w-full !bg-brand-light dark:!bg-brand-dark/50 !border-brand-gray/25 rounded-xl font-mono"
          />
        </div>

        <div class="flex items-center justify-end gap-2.5 pt-4 border-t border-brand-gray/10 dark:border-white/10">
          <SecondaryButton type="button" :disabled="isAssigning" @click="showAssignModal = false">
            {{ $t('ohda.common.cancel') }}
          </SecondaryButton>
          <Button
            type="button"
            :disabled="isAssigning || !assignForm.productId"
            @click="handleAssignProduct"
            class="!bg-brand-accent hover:!bg-brand-accent/90 !text-brand-dark !font-bold flex items-center gap-2 shadow-md shadow-brand-accent/15"
          >
            <div v-if="isAssigning" class="animate-spin rounded-full h-3.5 w-3.5 border-2 border-brand-dark/30 border-t-brand-dark"></div>
            <span>{{ isAssigning ? $t('ohda.common.saving') : $t('ohda.common.confirm') }}</span>
          </Button>
        </div>
      </div>
    </Dialog>

    <!-- View Bin Items Modal -->
    <Dialog
      v-model:visible="showItemsModal"
      modal
      :header="`${$t('ohda.warehouseBins.currentStock')} - ${selectedBin?.name || ''}`"
      class="max-w-2xl w-full !bg-brand-white dark:!bg-brand-dark !border-brand-gray/15 !text-brand-dark dark:!text-white rounded-3xl overflow-hidden shadow-2xl"
    >
      <div v-if="selectedBin" class="space-y-4 text-xs">
        <div class="p-3 bg-brand-light dark:bg-white/5 rounded-xl border border-brand-gray/15 flex items-center justify-between">
          <div class="space-y-0.5">
            <span class="font-bold text-brand-dark dark:text-white">{{ selectedBin.name }} ({{ selectedBin.code }})</span>
            <span class="text-[11px] text-brand-gray block">{{ selectedBin.aisle ? `ممر ${selectedBin.aisle} / رف ${selectedBin.shelf}` : '' }}</span>
          </div>
          <span class="font-mono font-bold text-brand-accent">{{ binStore.binItems?.length || 0 }} قطعة مسكنة</span>
        </div>

        <div class="max-h-80 overflow-y-auto space-y-2">
          <div
            v-for="item in binStore.binItems"
            :key="item.id"
            class="p-3 bg-brand-white dark:bg-white/5 border border-brand-gray/10 rounded-xl flex items-center justify-between"
          >
            <div class="space-y-1">
              <span class="font-bold text-brand-dark dark:text-white">{{ item.productName }}</span>
              <span class="font-mono text-xs text-brand-accent block">SN: {{ item.serialNumber || 'N/A' }}</span>
            </div>
            <Button
              type="button"
              @click="promptUnassignItem(item)"
              class="!bg-red-500/10 hover:!bg-red-500/20 !text-red-600 !border !border-red-500/20 !px-3 !py-1 !text-[11px] !rounded-lg"
            >
              إلغاء التسكين
            </Button>
          </div>
          <div v-if="!binStore.binItems || binStore.binItems.length === 0" class="text-center py-6 text-brand-gray">
            لا توجد أجهزة أو أصناف مسكنة في هذا الرف حالياً.
          </div>
        </div>

        <div class="flex justify-end pt-3 border-t border-brand-gray/10">
          <SecondaryButton @click="showItemsModal = false">{{ $t('ohda.common.close') }}</SecondaryButton>
        </div>
      </div>
    </Dialog>

    <!-- Delete Bin Confirmation Dialog -->
    <DeleteDialog
      v-model="showDeleteDialog"
      :itemType="$t('ohda.warehouseBins.title')"
      :itemName="selectedBinForDelete?.code || selectedBinForDelete?.name || ''"
      :canDelete="!selectedBinForDelete?.itemCount && !selectedBinForDelete?.currentOccupancy"
      :warningMessage="(selectedBinForDelete?.itemCount > 0 || selectedBinForDelete?.currentOccupancy > 0) ? 'لا يمكن حذف هذا الرف لوجود أجهزة ومخزون مسندة له حالياً. يرجى إخلاء الرف ونقل الأصناف أولاً.' : ''"
      :confirm="handleDeleteBin"
    />

    <!-- Delete Department Confirmation Dialog -->
    <DeleteDialog
      v-model="showDeleteDeptDialog"
      itemType="المستودع / المخزن"
      :itemName="selectedDeptForDelete?.name || ''"
      :canDelete="getBinsForDept(selectedDeptForDelete?.id).length === 0"
      :warningMessage="getBinsForDept(selectedDeptForDelete?.id).length > 0 ? `لا يمكن حذف هذا المستودع لأنه يحتوي على ${getBinsForDept(selectedDeptForDelete?.id).length} أرفف تابعة له. يرجى نقل أو حذف الأرفف أولاً.` : ''"
      :confirm="handleDeleteDept"
    />

    <!-- Unassign Item Confirmation Dialog -->
    <ConfirmDialog
      v-model="showUnassignDialog"
      :title="$t('ohda.common.confirm')"
      message="هل أنت متأكد من إلغاء تسكين هذا الجهاز من الرف؟"
      :itemName="selectedItemForUnassign?.serialNumber || selectedItemForUnassign?.productName || ''"
      :confirm="handleUnassignItem"
      severity="warning"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useOhdaWarehouseBinStore } from "../stores/useOhdaWarehouseBinStore";
import { useOhdaInventoryStore } from "../stores/useOhdaInventoryStore";
import { useToastStore } from "@/stores/toastStore";
import { useI18n } from "vue-i18n";
import DeleteDialog from "@/components/DeleteDialog.vue";
import ConfirmDialog from "@/components/ConfirmDialog.vue";
import EmptyState from "@/components/EmptyState.vue";
import LoadingSkeleton from "@/components/LoadingSkeleton.vue";
import {
  Layers,
  Boxes,
  Box,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  PackagePlus,
  Building2,
  Sparkles
} from "lucide-vue-next";

const { t } = useI18n();
const binStore = useOhdaWarehouseBinStore();
const inventoryStore = useOhdaInventoryStore();
const toastStore = useToastStore();

const searchQuery = ref("");
const selectedDepartmentId = ref(null);

const showModal = ref(false);
const showDeptModal = ref(false);
const showItemsModal = ref(false);
const showAssignModal = ref(false);

const isEditing = ref(false);
const isEditingDept = ref(false);
const isSaving = ref(false);
const isSavingDept = ref(false);
const isAssigning = ref(false);

const editingId = ref(null);
const editingDeptId = ref(null);
const selectedBin = ref(null);
const targetBin = ref(null);

const showDeleteDialog = ref(false);
const selectedBinForDelete = ref(null);

const showDeleteDeptDialog = ref(false);
const selectedDeptForDelete = ref(null);

const showUnassignDialog = ref(false);
const selectedItemForUnassign = ref(null);

const form = ref({
  code: "",
  name: "",
  aisle: "",
  shelf: "",
  capacity: 50,
  departmentId: null,
  description: "",
  isActive: true
});

const deptForm = ref({
  name: "",
  description: ""
});

const assignForm = ref({
  productId: null,
  quantity: 1
});

onMounted(async () => {
  await Promise.all([
    binStore.fetchBins(),
    binStore.fetchDepartments(),
    inventoryStore.fetchProducts()
  ]);
});

function getDeptIcon(name) {
  if (!name) return "📦";
  const lower = name.toLowerCase();
  if (lower.includes("زيت") || lower.includes("زيوت") || lower.includes("سوائل") || lower.includes("oil")) return "🛢️";
  if (lower.includes("قطع") || lower.includes("غيار") || lower.includes("spare") || lower.includes("parts")) return "⚙️";
  if (lower.includes("فلتر") || lower.includes("فلاتر")) return "🧯";
  if (lower.includes("إطار") || lower.includes("كاوتش") || lower.includes("tire")) return "🛞";
  return "📦";
}

function getDeptName(deptId) {
  if (!deptId) return "مستودع عام";
  const dept = binStore.departments?.find(d => d.id === deptId);
  return dept?.name || "مستودع عام";
}

const departmentSelectOptions = computed(() => {
  const list = (binStore.departments || []).map(d => ({
    value: d.id,
    label: `${getDeptIcon(d.name)} ${d.name}`
  }));
  list.unshift({
    value: null,
    label: "🏢 بدون تحديد (مستودع عام)"
  });
  return list;
});

function getBinsForDept(deptId) {
  if (!deptId) return [];
  return (binStore.bins || []).filter(b => b.departmentId === deptId);
}

function getDeptOccupiedItems(deptId) {
  const bins = getBinsForDept(deptId);
  return bins.reduce((acc, b) => acc + (b.itemsCount || 0), 0);
}

const selectedDepartment = computed(() => {
  if (!selectedDepartmentId.value) return null;
  return binStore.departments?.find(d => d.id === selectedDepartmentId.value) || null;
});

function selectDepartment(deptId) {
  selectedDepartmentId.value = deptId;
}

const filteredBins = computed(() => {
  let list = binStore.bins || [];
  if (selectedDepartmentId.value) {
    list = list.filter(b => b.departmentId === selectedDepartmentId.value);
  }
  if (!searchQuery.value?.trim()) return list;
  const q = searchQuery.value.toLowerCase().trim();
  return list.filter(
    (b) =>
      b.code?.toLowerCase().includes(q) ||
      b.name?.toLowerCase().includes(q) ||
      b.aisle?.toLowerCase().includes(q) ||
      b.shelf?.toLowerCase().includes(q) ||
      b.description?.toLowerCase().includes(q) ||
      getDeptName(b.departmentId).toLowerCase().includes(q)
  );
});

const currentCapacity = computed(() => {
  return filteredBins.value.reduce((acc, b) => acc + (b.capacity || 0), 0);
});

const currentOccupied = computed(() => {
  return filteredBins.value.reduce((acc, b) => acc + (b.itemsCount || 0), 0);
});

const currentRemaining = computed(() => {
  return filteredBins.value.reduce((acc, b) => acc + getRemainingSpace(b), 0);
});

function getRemainingSpace(bin) {
  if (!bin) return 0;
  if (bin.remainingCapacity != null) return bin.remainingCapacity;
  const cap = bin.capacity || 0;
  const items = bin.itemsCount || 0;
  return Math.max(0, cap - items);
}

function getUsedPercentage(bin) {
  if (!bin || !bin.capacity) return 0;
  const items = bin.itemsCount || 0;
  return Math.min(100, (items / bin.capacity) * 100);
}

function getProgressBarClass(bin) {
  const rem = getRemainingSpace(bin);
  if (rem <= 0) return "bg-red-500";
  const cap = bin.capacity || 1;
  const ratio = rem / cap;
  if (ratio <= 0.25) return "bg-amber-500";
  return "bg-emerald-500";
}

function openAddDeptModal() {
  isEditingDept.value = false;
  editingDeptId.value = null;
  deptForm.value = {
    name: "",
    description: ""
  };
  showDeptModal.value = true;
}

function openEditDeptModal(dept) {
  isEditingDept.value = true;
  editingDeptId.value = dept.id;
  deptForm.value = {
    name: dept.name || "",
    description: dept.description || ""
  };
  showDeptModal.value = true;
}

async function handleSaveDepartment() {
  if (!deptForm.value.name?.trim()) return;
  isSavingDept.value = true;
  try {
    if (isEditingDept.value) {
      const res = await binStore.updateDepartment(editingDeptId.value, deptForm.value);
      if (res.success) {
        toastStore.addSuccessToast(res.message);
        showDeptModal.value = false;
      } else {
        toastStore.addErrorToast(res.message);
      }
    } else {
      const res = await binStore.createDepartment(deptForm.value);
      if (res.success) {
        toastStore.addSuccessToast(res.message);
        showDeptModal.value = false;
      } else {
        toastStore.addErrorToast(res.message);
      }
    }
  } catch (err) {
    console.error("Save department error:", err);
    toastStore.addErrorToast(err.message || "حدث خطأ أثناء حفظ المستودع");
  } finally {
    isSavingDept.value = false;
  }
}

function promptDeleteDept(dept) {
  selectedDeptForDelete.value = dept;
  showDeleteDeptDialog.value = true;
}

async function handleDeleteDept() {
  if (!selectedDeptForDelete.value) return;
  try {
    const res = await binStore.deleteDepartment(selectedDeptForDelete.value.id);
    if (res.success) {
      toastStore.addSuccessToast(res.message);
      if (selectedDepartmentId.value === selectedDeptForDelete.value.id) {
        selectedDepartmentId.value = null;
      }
    } else {
      toastStore.addErrorToast(res.message);
    }
  } catch (err) {
    console.error("Delete department error:", err);
    toastStore.addErrorToast(err.message || "فشل حذف المستودع");
  } finally {
    selectedDeptForDelete.value = null;
  }
}

async function seedDefaultDepartments() {
  try {
    await binStore.createDepartment({
      name: "مخزن قطع الغيار",
      description: "المستودع الرئيسي لقطع الغيار والمكونات الميكانيكية والكهربائية"
    });
    await binStore.createDepartment({
      name: "مخزن الزيوت والسوائل",
      description: "المستودع المخصص لزيوت المحركات وسوائل التبريد والفلاتر"
    });
    toastStore.addSuccessToast("تمت تهيئة المخازن القياسية بنجاح");
  } catch (err) {
    toastStore.addErrorToast("حدث خطأ أثناء التهيئة");
  }
}

function openAddModal() {
  isEditing.value = false;
  editingId.value = null;
  form.value = {
    code: `SH-${Math.floor(10 + Math.random() * 90)}-01`,
    name: "",
    aisle: "A",
    shelf: "01",
    capacity: 40,
    departmentId: selectedDepartmentId.value || (binStore.departments?.[0]?.id ?? null),
    description: "",
    isActive: true
  };
  showModal.value = true;
}

function openAddModalForCurrentDept() {
  isEditing.value = false;
  editingId.value = null;
  const dept = selectedDepartment.value;
  const prefix = dept?.name?.includes("زيت") ? "OIL" : "PRD";
  form.value = {
    code: `${prefix}-${Math.floor(10 + Math.random() * 90)}-01`,
    name: dept ? `رف جديد في ${dept.name}` : "",
    aisle: "A",
    shelf: "01",
    capacity: 50,
    departmentId: selectedDepartmentId.value || (binStore.departments?.[0]?.id ?? null),
    description: "",
    isActive: true
  };
  showModal.value = true;
}

function openEditModal(bin) {
  isEditing.value = true;
  editingId.value = bin.id;
  form.value = {
    code: bin.code,
    name: bin.name,
    aisle: bin.aisle || "",
    shelf: bin.shelf || "",
    capacity: bin.capacity || 50,
    departmentId: bin.departmentId || null,
    description: bin.description || "",
    isActive: bin.isActive ?? true
  };
  showModal.value = true;
}

async function handleSaveBin() {
  if (!form.value.code?.trim() || !form.value.name?.trim()) return;
  isSaving.value = true;
  try {
    if (isEditing.value) {
      await binStore.updateBin(editingId.value, form.value);
    } else {
      await binStore.createBin(form.value);
    }
    toastStore.addSuccessToast(t("ohda.common.operationSuccess"));
    showModal.value = false;
  } catch (err) {
    console.error("Save bin error:", err);
  } finally {
    isSaving.value = false;
  }
}

async function viewBinItems(bin) {
  selectedBin.value = bin;
  showItemsModal.value = true;
  await binStore.fetchBinItems(bin.id);
}

function openAssignModal(bin) {
  targetBin.value = bin;
  const rem = getRemainingSpace(bin);
  assignForm.value = {
    productId: inventoryStore.products[0]?.id || null,
    quantity: rem > 0 ? 1 : 0
  };
  showAssignModal.value = true;
}

async function handleAssignProduct() {
  if (!targetBin.value || !assignForm.value.productId) return;
  isAssigning.value = true;
  try {
    const res = await binStore.assignProductToBin(
      targetBin.value.id,
      assignForm.value.productId,
      assignForm.value.quantity
    );
    if (res.success) {
      toastStore.addSuccessToast(t("ohda.common.operationSuccess"));
      showAssignModal.value = false;
    }
  } catch (err) {
    console.error("Assign product error:", err);
  } finally {
    isAssigning.value = false;
  }
}

function promptDelete(bin) {
  selectedBinForDelete.value = bin;
  showDeleteDialog.value = true;
}

async function handleDeleteBin() {
  if (!selectedBinForDelete.value) return;
  try {
    const res = await binStore.deleteBin(selectedBinForDelete.value.id);
    if (res && res.success === false) {
      toastStore.addErrorToast(res.message || "تعذر حذف الرف لوجود ارتباطات");
      return res;
    }
    toastStore.addSuccessToast(t("ohda.common.operationSuccess"));
  } catch (err) {
    console.error("Delete bin error:", err);
    toastStore.addErrorToast(err?.response?.data?.returnMessage || err?.message || "تعذر حذف الرف");
    throw err;
  } finally {
    selectedBinForDelete.value = null;
  }
}

function promptUnassignItem(item) {
  selectedItemForUnassign.value = item;
  showUnassignDialog.value = true;
}

async function handleUnassignItem() {
  if (!selectedBin.value || !selectedItemForUnassign.value) return;
  try {
    await binStore.unassignItem(selectedBin.value.id, selectedItemForUnassign.value.id);
    toastStore.addSuccessToast(t("ohda.common.operationSuccess"));
    await binStore.fetchBinItems(selectedBin.value.id);
  } catch (err) {
    console.error("Unassign error:", err);
  } finally {
    selectedItemForUnassign.value = null;
  }
}
</script>
