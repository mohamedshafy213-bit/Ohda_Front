<template>
  <div class="space-y-6">
    <!-- SuperAdmin Authorization Guard Banner -->
    <div v-if="!authStore.isSuperAdmin" class="p-8 bg-red-500/10 border border-red-500/30 rounded-2xl text-center space-y-3">
      <AlertOctagon class="w-12 h-12 text-red-500 mx-auto" />
      <h2 class="text-lg font-bold text-red-400">هذه الصفحة مخصصة لمدير المنصة العام (SuperAdmin) فقط</h2>
      <p class="text-xs text-slate-400">ليس لديك الصلاحيات الكافية لإدارة فروع المنصة والتحكم بحصص الاستهلاك.</p>
    </div>

    <template v-else>
      <!-- Header Title Bar -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-brand-white p-6 rounded-2xl border border-brand-gray/10 shadow-sm">
        <div>
          <h1 class="text-2xl font-bold text-brand-dark flex items-center gap-3">
            <Building2 class="w-7 h-7 text-brand-accent" />
            {{ $t('ohda.branches.title') }}
          </h1>
          <p class="text-xs text-brand-gray mt-1">
            {{ $t('ohda.branches.subTitle') }}
          </p>
        </div>

        <div class="flex items-center gap-3">
          <router-link
            to="/ohda/branches-dashboard"
            class="px-4 py-2 bg-brand-soft hover:bg-brand-soft/80 text-brand-accent font-bold rounded-xl text-xs flex items-center gap-2 border border-brand-accent/20 transition-all cursor-pointer"
          >
            <Activity class="w-4 h-4" />
            {{ $t('ohda.nav.branchesDashboard') }}
          </router-link>

          <Button
            @click="openCreateModal"
            class="!bg-brand-accent hover:!bg-brand-accent/90 !text-brand-dark !font-bold !rounded-xl !px-4 !py-2 !text-xs flex items-center gap-2 shadow-md shadow-brand-accent/10"
          >
            <Plus class="w-4 h-4" />
            {{ $t('ohda.branches.createBranch') }}
          </Button>
        </div>
      </div>

      <!-- KPI Summary Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-brand-white p-5 rounded-2xl border border-brand-gray/10 shadow-sm flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center border border-blue-500/20">
            <Building2 class="w-6 h-6" />
          </div>
          <div>
            <div class="text-xs text-brand-gray font-medium">{{ $t('ohda.branches.totalBranches') }}</div>
            <div class="text-2xl font-bold text-brand-dark mt-0.5">{{ branchStore.totalBranches }}</div>
          </div>
        </div>

        <div class="bg-brand-white p-5 rounded-2xl border border-brand-gray/10 shadow-sm flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center border border-emerald-500/20">
            <CheckCircle class="w-6 h-6" />
          </div>
          <div>
            <div class="text-xs text-brand-gray font-medium">{{ $t('ohda.branches.activeBranches') }}</div>
            <div class="text-2xl font-bold text-emerald-600 mt-0.5">{{ branchStore.activeBranches.length }}</div>
          </div>
        </div>

        <div class="bg-brand-white p-5 rounded-2xl border border-brand-gray/10 shadow-sm flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center border border-amber-500/20">
            <AlertCircle class="w-6 h-6" />
          </div>
          <div>
            <div class="text-xs text-brand-gray font-medium">{{ $t('ohda.branches.suspendedBranches') }}</div>
            <div class="text-2xl font-bold text-amber-600 mt-0.5">{{ branchStore.suspendedBranches.length }}</div>
          </div>
        </div>

        <div class="bg-brand-white p-5 rounded-2xl border border-brand-gray/10 shadow-sm flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-brand-accent/15 text-brand-accent flex items-center justify-center border border-brand-accent/30">
            <Users class="w-6 h-6" />
          </div>
          <div>
            <div class="text-xs text-brand-gray font-medium">{{ $t('ohda.branches.totalTenantUsers') }}</div>
            <div class="text-2xl font-bold text-brand-dark mt-0.5">{{ branchStore.totalUsersAcrossBranches }}</div>
          </div>
        </div>
      </div>

      <!-- Search & Filters -->
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4 bg-brand-white p-4 rounded-2xl border border-brand-gray/10 shadow-sm">
        <div class="relative w-full sm:w-80">
          <Search class="w-4 h-4 text-brand-gray absolute start-3 top-1/2 -translate-y-1/2" />
          <InputText
            v-model="searchQuery"
            :placeholder="$t('ohda.common.search')"
            class="w-full !ps-9 !py-2 !text-xs !bg-brand-light !border-brand-gray/20 focus:!border-brand-accent !rounded-xl"
          />
        </div>

        <div class="flex items-center gap-2 w-full sm:w-auto">
          <button
            @click="statusFilter = 'all'"
            class="px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer border transition-all"
            :class="statusFilter === 'all' ? 'bg-brand-soft text-brand-accent border-brand-accent/30 font-bold' : 'text-brand-gray border-brand-gray/10 hover:bg-brand-light'"
          >
            الكل ({{ branchStore.branches.length }})
          </button>
          <button
            @click="statusFilter = 'active'"
            class="px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer border transition-all"
            :class="statusFilter === 'active' ? 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30 font-bold' : 'text-brand-gray border-brand-gray/10 hover:bg-brand-light'"
          >
            النشطة ({{ branchStore.activeBranches.length }})
          </button>
          <button
            @click="statusFilter = 'suspended'"
            class="px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer border transition-all"
            :class="statusFilter === 'suspended' ? 'bg-amber-500/15 text-amber-600 border-amber-500/30 font-bold' : 'text-brand-gray border-brand-gray/10 hover:bg-brand-light'"
          >
            المعلقة ({{ branchStore.suspendedBranches.length }})
          </button>
        </div>
      </div>

      <!-- Branches Table -->
      <div class="bg-brand-white border border-brand-gray/10 rounded-2xl overflow-hidden shadow-sm">
        <div v-if="branchStore.loading" class="p-8 text-center text-xs text-brand-gray">
          <div class="animate-spin w-8 h-8 border-2 border-brand-accent border-t-transparent rounded-full mx-auto mb-2"></div>
          {{ $t('ohda.common.loading') }}
        </div>

        <DataTable
          v-else
          :value="filteredBranches"
          class="w-full text-xs"
          paginator
          :rows="10"
          :rowsPerPageOptions="[5, 10, 20]"
        >
          <Column field="code" :header="$t('ohda.branches.code')">
            <template #body="{ data }">
              <span class="font-mono font-bold text-brand-accent px-2 py-1 bg-brand-accent/10 border border-brand-accent/20 rounded-md">
                {{ data.code }}
              </span>
            </template>
          </Column>

          <Column field="name" :header="$t('ohda.branches.name')">
            <template #body="{ data }">
              <div class="font-bold text-brand-dark">{{ data.name }}</div>
              <span class="text-[10px] text-brand-gray">{{ data.industryTemplate || 'General' }}</span>
            </template>
          </Column>

          <Column header="مسؤول الاتصال">
            <template #body="{ data }">
              <div class="space-y-0.5">
                <div class="font-medium text-brand-dark">{{ data.contactName || '—' }}</div>
                <div v-if="data.contactEmail" class="text-[10px] text-brand-gray flex items-center gap-1 font-mono">
                  <Mail class="w-3 h-3 text-blue-500" />
                  {{ data.contactEmail }}
                </div>
                <div v-if="data.contactPhone" class="text-[10px] text-brand-gray flex items-center gap-1 font-mono">
                  <Phone class="w-3 h-3 text-emerald-500" />
                  {{ data.contactPhone }}
                </div>
              </div>
            </template>
          </Column>

          <!-- SuperAdmin User Quota Column -->
          <Column :header="$t('ohda.branches.quotaUserProgress')">
            <template #body="{ data }">
              <div class="space-y-1 min-w-36">
                <div class="flex items-center justify-between text-[11px]">
                  <span class="font-semibold text-brand-dark">{{ data.currentUserCount || 0 }} / {{ data.maxUsers }}</span>
                  <span
                    class="text-[10px] font-bold"
                    :class="getUserQuotaColor(data.currentUserCount, data.maxUsers)"
                  >
                    {{ Math.round(((data.currentUserCount || 0) / (data.maxUsers || 1)) * 100) }}%
                  </span>
                </div>
                <div class="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    class="h-full rounded-full transition-all"
                    :class="getUserQuotaBarColor(data.currentUserCount, data.maxUsers)"
                    :style="{ width: Math.min(100, Math.round(((data.currentUserCount || 0) / (data.maxUsers || 1)) * 100)) + '%' }"
                  ></div>
                </div>
              </div>
            </template>
          </Column>

          <!-- SuperAdmin Product Quota Column -->
          <Column :header="$t('ohda.branches.quotaProductProgress')">
            <template #body="{ data }">
              <div class="space-y-1 min-w-36">
                <div class="flex items-center justify-between text-[11px]">
                  <span class="font-semibold text-brand-dark">{{ data.currentProductCount || 0 }} / {{ data.maxProducts }}</span>
                  <span
                    class="text-[10px] font-bold"
                    :class="getProductQuotaColor(data.currentProductCount, data.maxProducts)"
                  >
                    {{ Math.round(((data.currentProductCount || 0) / (data.maxProducts || 1)) * 100) }}%
                  </span>
                </div>
                <div class="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    class="h-full rounded-full transition-all"
                    :class="getProductQuotaBarColor(data.currentProductCount, data.maxProducts)"
                    :style="{ width: Math.min(100, Math.round(((data.currentProductCount || 0) / (data.maxProducts || 1)) * 100)) + '%' }"
                  ></div>
                </div>
              </div>
            </template>
          </Column>

          <Column field="isActive" :header="$t('ohda.branches.status')">
            <template #body="{ data }">
              <span
                class="px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1.5"
                :class="data.isActive ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'"
              >
                <span class="w-1.5 h-1.5 rounded-full" :class="data.isActive ? 'bg-emerald-500' : 'bg-amber-500'"></span>
                {{ data.isActive ? $t('ohda.branches.active') : $t('ohda.branches.suspended') }}
              </span>
            </template>
          </Column>

          <Column :header="$t('ohda.common.actions')">
            <template #body="{ data }">
              <div class="flex items-center gap-1">
                <!-- Edit Button -->
                <button
                  @click="openEditModal(data)"
                  class="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors cursor-pointer"
                  :title="$t('ohda.branches.editBranch')"
                >
                  <Pencil class="w-4 h-4" />
                </button>

                <!-- Toggle Status Button -->
                <button
                  @click="confirmToggleStatus(data)"
                  class="p-1.5 rounded-lg transition-colors cursor-pointer"
                  :class="data.isActive ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20' : 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'"
                  :title="data.isActive ? $t('ohda.branches.suspend') : $t('ohda.branches.activate')"
                >
                  <CircleOff v-if="data.isActive" class="w-4 h-4" />
                  <CheckCircle v-else class="w-4 h-4" />
                </button>
              </div>
            </template>
          </Column>

          <template #empty>
            <div class="p-8 text-center text-xs text-brand-gray">
              <Building2 class="w-10 h-10 text-brand-gray/40 mx-auto mb-2" />
              {{ $t('ohda.common.noData') }}
            </div>
          </template>
        </DataTable>
      </div>

      <!-- CREATE BRANCH MODAL (With Initial Branch Admin & SuperAdmin Quota Controls) -->
      <Dialog
        v-model:visible="showCreateModal"
        modal
        :header="$t('ohda.branches.createBranch')"
        class="!bg-brand-white !border-brand-gray/15 max-w-2xl w-full !text-brand-dark"
      >
        <form @submit.prevent="submitCreateBranch" class="space-y-4 text-xs">
          <!-- Section 1: Branch Details -->
          <div class="p-3 bg-brand-light rounded-xl border border-brand-gray/15 space-y-3">
            <div class="font-bold text-brand-dark flex items-center gap-2 border-b border-brand-gray/10 pb-2">
              <Building2 class="w-4 h-4 text-brand-accent" />
              بيانات الفرع الأساسية
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label class="block font-semibold text-brand-dark mb-1 required">{{ $t('ohda.branches.code') }}</label>
                <InputText
                  v-model="createForm.code"
                  placeholder="مثال: JEDDAH-02"
                  required
                  class="w-full !bg-brand-white !border-brand-gray/25 focus:!border-brand-accent uppercase font-mono"
                />
              </div>

              <div>
                <label class="block font-semibold text-brand-dark mb-1 required">{{ $t('ohda.branches.name') }}</label>
                <InputText
                  v-model="createForm.name"
                  placeholder="مثال: فرع جدة الإقليمي"
                  required
                  class="w-full !bg-brand-white !border-brand-gray/25 focus:!border-brand-accent"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label class="block font-semibold text-brand-dark mb-1">{{ $t('ohda.branches.contactName') }}</label>
                <InputText
                  v-model="createForm.contactName"
                  placeholder="اسم المسؤول"
                  class="w-full !bg-brand-white !border-brand-gray/25 focus:!border-brand-accent"
                />
              </div>

              <div>
                <label class="block font-semibold text-brand-dark mb-1">{{ $t('ohda.branches.contactEmail') }}</label>
                <InputText
                  v-model="createForm.contactEmail"
                  type="email"
                  placeholder="email@example.com"
                  class="w-full !bg-brand-white !border-brand-gray/25 focus:!border-brand-accent font-mono"
                />
              </div>

              <div>
                <label class="block font-semibold text-brand-dark mb-1">{{ $t('ohda.branches.contactPhone') }}</label>
                <InputText
                  v-model="createForm.contactPhone"
                  placeholder="05XXXXXXXX"
                  class="w-full !bg-brand-white !border-brand-gray/25 focus:!border-brand-accent font-mono"
                />
              </div>
            </div>
          </div>

          <!-- Section 2: SuperAdmin Quotas Allocation (Exclusively by SuperAdmin) -->
          <div class="p-3 bg-amber-500/5 rounded-xl border border-amber-500/20 space-y-3">
            <div class="font-bold text-amber-700 dark:text-amber-400 flex items-center justify-between border-b border-amber-500/10 pb-2">
              <span class="flex items-center gap-2">
                <ShieldCheck class="w-4 h-4 text-amber-500" />
                تخصيص الحصص والسعة (SuperAdmin Only)
              </span>
              <span class="text-[10px] text-amber-600 bg-amber-500/15 px-2 py-0.5 rounded-full font-bold">حاكم المنصة</span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label class="block font-semibold text-brand-dark mb-1 required">{{ $t('ohda.branches.maxUsers') }}</label>
                <InputNumber
                  v-model="createForm.maxUsers"
                  :min="1"
                  :max="1000"
                  class="w-full !bg-brand-white !border-brand-gray/25 focus:!border-brand-accent"
                />
                <span class="text-[10px] text-brand-gray mt-0.5 block">الحد الأقصى لحسابات الفرع</span>
              </div>

              <div>
                <label class="block font-semibold text-brand-dark mb-1 required">{{ $t('ohda.branches.maxProducts') }}</label>
                <InputNumber
                  v-model="createForm.maxProducts"
                  :min="10"
                  :max="500000"
                  class="w-full !bg-brand-white !border-brand-gray/25 focus:!border-brand-accent"
                />
                <span class="text-[10px] text-brand-gray mt-0.5 block">الحد الأقصى للأصناف المخزنة</span>
              </div>

              <div>
                <label class="block font-semibold text-brand-dark mb-1">{{ $t('ohda.branches.maxStorageMB') }}</label>
                <InputNumber
                  v-model="createForm.maxStorageMB"
                  :min="100"
                  :max="100000"
                  class="w-full !bg-brand-white !border-brand-gray/25 focus:!border-brand-accent"
                />
                <span class="text-[10px] text-brand-gray mt-0.5 block">المساحة التخزينية (ميجابايت)</span>
              </div>
            </div>
          </div>

          <!-- Section 3: Initial Branch Admin Account Creation -->
          <div class="p-3 bg-blue-500/5 rounded-xl border border-blue-500/20 space-y-3">
            <div class="font-bold text-blue-700 dark:text-blue-400 flex items-center gap-2 border-b border-blue-500/10 pb-2">
              <UserCheck class="w-4 h-4 text-blue-500" />
              {{ $t('ohda.branches.adminAccountTitle') }}
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label class="block font-semibold text-brand-dark mb-1 required">{{ $t('ohda.branches.adminUsername') }}</label>
                <InputText
                  v-model="createForm.adminUsername"
                  placeholder="مثال: admin_jeddah"
                  required
                  class="w-full !bg-brand-white !border-brand-gray/25 focus:!border-brand-accent font-mono"
                />
              </div>

              <div>
                <label class="block font-semibold text-brand-dark mb-1 required">{{ $t('ohda.branches.adminEmail') }}</label>
                <InputText
                  v-model="createForm.adminEmail"
                  type="email"
                  placeholder="admin.jeddah@ohda.sa"
                  required
                  class="w-full !bg-brand-white !border-brand-gray/25 focus:!border-brand-accent font-mono"
                />
              </div>

              <div>
                <label class="block font-semibold text-brand-dark mb-1 required">{{ $t('ohda.branches.adminPersonName') }}</label>
                <InputText
                  v-model="createForm.adminPersonName"
                  placeholder="الاسم الكامل لمدير الفرع"
                  required
                  class="w-full !bg-brand-white !border-brand-gray/25 focus:!border-brand-accent"
                />
              </div>

              <div>
                <label class="block font-semibold text-brand-dark mb-1">{{ $t('ohda.branches.adminMilitaryNumber') }}</label>
                <InputNumber
                  v-model="createForm.adminMilitaryNumber"
                  placeholder="10001"
                  class="w-full !bg-brand-white !border-brand-gray/25 focus:!border-brand-accent font-mono"
                />
              </div>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="flex items-center justify-end gap-3 pt-3 border-t border-brand-gray/10">
            <SecondaryButton type="button" @click="showCreateModal = false">
              {{ $t('ohda.common.cancel') }}
            </SecondaryButton>
            <Button
              type="submit"
              :disabled="creatingBranch"
              class="!bg-brand-accent hover:!bg-brand-accent/90 !text-brand-dark !font-bold"
            >
              <span v-if="creatingBranch" class="animate-spin mr-1">⏳</span>
              {{ $t('ohda.common.save') }}
            </Button>
          </div>
        </form>
      </Dialog>

      <!-- EDIT BRANCH MODAL (Update Quotas & Info) -->
      <Dialog
        v-model:visible="showEditModal"
        modal
        :header="$t('ohda.branches.editBranch')"
        class="!bg-brand-white !border-brand-gray/15 max-w-xl w-full !text-brand-dark"
      >
        <form @submit.prevent="submitEditBranch" class="space-y-4 text-xs">
          <div>
            <label class="block font-semibold text-brand-dark mb-1 required">{{ $t('ohda.branches.name') }}</label>
            <InputText
              v-model="editForm.name"
              required
              class="w-full !bg-brand-light !border-brand-gray/25 focus:!border-brand-accent"
            />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label class="block font-semibold text-brand-dark mb-1">{{ $t('ohda.branches.contactName') }}</label>
              <InputText
                v-model="editForm.contactName"
                class="w-full !bg-brand-light !border-brand-gray/25 focus:!border-brand-accent"
              />
            </div>
            <div>
              <label class="block font-semibold text-brand-dark mb-1">{{ $t('ohda.branches.contactEmail') }}</label>
              <InputText
                v-model="editForm.contactEmail"
                type="email"
                class="w-full !bg-brand-light !border-brand-gray/25 focus:!border-brand-accent font-mono"
              />
            </div>
            <div>
              <label class="block font-semibold text-brand-dark mb-1">{{ $t('ohda.branches.contactPhone') }}</label>
              <InputText
                v-model="editForm.contactPhone"
                class="w-full !bg-brand-light !border-brand-gray/25 focus:!border-brand-accent font-mono"
              />
            </div>
          </div>

          <!-- Quotas Adjustment (SuperAdmin Control) -->
          <div class="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 space-y-3">
            <div class="font-bold text-amber-700 dark:text-amber-400 flex items-center justify-between">
              <span>تعديل حصص السعة (SuperAdmin)</span>
              <span class="text-[10px] text-amber-600 font-normal">يمكنك زيادة أو خفض الحدود المقررة</span>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-semibold text-brand-dark mb-1 required">{{ $t('ohda.branches.maxUsers') }}</label>
                <InputNumber
                  v-model="editForm.maxUsers"
                  :min="1"
                  :max="1000"
                  class="w-full !bg-brand-white !border-brand-gray/25 focus:!border-brand-accent"
                />
              </div>

              <div>
                <label class="block font-semibold text-brand-dark mb-1 required">{{ $t('ohda.branches.maxProducts') }}</label>
                <InputNumber
                  v-model="editForm.maxProducts"
                  :min="10"
                  :max="500000"
                  class="w-full !bg-brand-white !border-brand-gray/25 focus:!border-brand-accent"
                />
              </div>
            </div>
          </div>

          <div class="flex items-center justify-between pt-2">
            <label class="font-semibold text-brand-dark">{{ $t('ohda.branches.status') }}</label>
            <div class="flex items-center gap-2">
              <ToggleSwitch v-model="editForm.isActive" />
              <span class="text-xs font-bold" :class="editForm.isActive ? 'text-emerald-600' : 'text-amber-600'">
                {{ editForm.isActive ? $t('ohda.branches.active') : $t('ohda.branches.suspended') }}
              </span>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="flex items-center justify-end gap-3 pt-3 border-t border-brand-gray/10">
            <SecondaryButton type="button" @click="showEditModal = false">
              {{ $t('ohda.common.cancel') }}
            </SecondaryButton>
            <Button
              type="submit"
              :disabled="updatingBranch"
              class="!bg-brand-accent hover:!bg-brand-accent/90 !text-brand-dark !font-bold"
            >
              {{ $t('ohda.common.save') }}
            </Button>
          </div>
        </form>
      </Dialog>

      <!-- INITIAL ADMIN CREDENTIALS NOTICE DIALOG -->
      <Dialog
        v-model:visible="showCredentialsDialog"
        modal
        header="تم إنشاء الفرع وحساب مديره بنجاح!"
        class="!bg-brand-white !border-brand-gray/15 max-w-md w-full !text-brand-dark"
      >
        <div class="space-y-4 text-xs">
          <div class="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-800 dark:text-emerald-300">
            يرجى نسخ بيانات اعتماد مدير الفرع وتزويده بها ليتمكن من تسجيل الدخول وإدارة فرعه:
          </div>

          <div class="space-y-2 bg-brand-light p-4 rounded-xl border border-brand-gray/15 font-mono">
            <div class="flex items-center justify-between">
              <span class="text-brand-gray">اسم المستخدم:</span>
              <span class="font-bold text-brand-dark select-all">{{ createdResult?.adminUsername }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-brand-gray">كلمة المرور المؤقتة:</span>
              <span class="font-bold text-emerald-600 select-all">{{ createdResult?.temporaryPassword }}</span>
            </div>
            <div v-if="createdResult?.adminMilitaryNumber" class="flex items-center justify-between">
              <span class="text-brand-gray">الرقم العسكري:</span>
              <span class="font-bold text-brand-dark select-all">{{ createdResult?.adminMilitaryNumber }}</span>
            </div>
          </div>

          <div class="flex items-center justify-end gap-3 pt-2">
            <Button
              @click="copyCredentials"
              class="!bg-brand-accent hover:!bg-brand-accent/90 !text-brand-dark !font-bold flex items-center gap-2"
            >
              <Copy class="w-4 h-4" />
              نسخ البيانات
            </Button>
            <SecondaryButton @click="showCredentialsDialog = false">
              إغلاق
            </SecondaryButton>
          </div>
        </div>
      </Dialog>
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useOhdaAuthStore } from "../stores/useOhdaAuthStore";
import { useOhdaBranchStore } from "../stores/useOhdaBranchStore";
import { useToast } from "primevue/usetoast";

const authStore = useOhdaAuthStore();
const branchStore = useOhdaBranchStore();
const toast = useToast();

const searchQuery = ref("");
const statusFilter = ref("all");

const showCreateModal = ref(false);
const creatingBranch = ref(false);
const showEditModal = ref(false);
const updatingBranch = ref(false);
const showCredentialsDialog = ref(false);
const createdResult = ref(null);
const currentEditId = ref(null);

const createForm = reactive({
  code: "",
  name: "",
  industryTemplate: "General",
  currency: "SAR",
  timezone: "Asia/Riyadh",
  contactName: "",
  contactEmail: "",
  contactPhone: "",
  maxUsers: 10,
  maxProducts: 1000,
  maxStorageMB: 1024,
  adminUsername: "",
  adminEmail: "",
  adminPersonName: "",
  adminMilitaryNumber: null
});

const editForm = reactive({
  name: "",
  contactName: "",
  contactEmail: "",
  contactPhone: "",
  maxUsers: 10,
  maxProducts: 1000,
  isActive: true
});

const filteredBranches = computed(() => {
  let list = branchStore.branches || [];

  if (statusFilter.value === "active") {
    list = list.filter(b => b.isActive);
  } else if (statusFilter.value === "suspended") {
    list = list.filter(b => !b.isActive);
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase();
    list = list.filter(b =>
      b.name?.toLowerCase().includes(q) ||
      b.code?.toLowerCase().includes(q) ||
      b.contactName?.toLowerCase().includes(q) ||
      b.contactEmail?.toLowerCase().includes(q)
    );
  }

  return list;
});

function getUserQuotaColor(current, max) {
  const ratio = (current || 0) / (max || 1);
  if (ratio >= 1.0) return "text-red-500";
  if (ratio >= 0.8) return "text-amber-500";
  return "text-emerald-500";
}

function getUserQuotaBarColor(current, max) {
  const ratio = (current || 0) / (max || 1);
  if (ratio >= 1.0) return "bg-red-500";
  if (ratio >= 0.8) return "bg-amber-500";
  return "bg-emerald-500";
}

function getProductQuotaColor(current, max) {
  const ratio = (current || 0) / (max || 1);
  if (ratio >= 1.0) return "text-red-500";
  if (ratio >= 0.8) return "text-amber-500";
  return "text-blue-500";
}

function getProductQuotaBarColor(current, max) {
  const ratio = (current || 0) / (max || 1);
  if (ratio >= 1.0) return "bg-red-500";
  if (ratio >= 0.8) return "bg-amber-500";
  return "bg-blue-500";
}

function openCreateModal() {
  Object.assign(createForm, {
    code: "",
    name: "",
    industryTemplate: "General",
    currency: "SAR",
    timezone: "Asia/Riyadh",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    maxUsers: 10,
    maxProducts: 1000,
    maxStorageMB: 1024,
    adminUsername: "",
    adminEmail: "",
    adminPersonName: "",
    adminMilitaryNumber: null
  });
  showCreateModal.value = true;
}

async function submitCreateBranch() {
  creatingBranch.value = true;
  const res = await branchStore.createBranch({ ...createForm });
  creatingBranch.value = false;

  if (res.success) {
    showCreateModal.value = false;
    createdResult.value = res.data;
    showCredentialsDialog.value = true;
    toast.add({
      severity: "success",
      summary: "تم بنجاح",
      detail: "تم إنشاء الفرع وحساب مديره بنجاح",
      life: 4000
    });
  } else {
    toast.add({
      severity: "error",
      summary: "خطأ",
      detail: res.message,
      life: 5000
    });
  }
}

function openEditModal(branch) {
  currentEditId.value = branch.id;
  Object.assign(editForm, {
    name: branch.name,
    contactName: branch.contactName || "",
    contactEmail: branch.contactEmail || "",
    contactPhone: branch.contactPhone || "",
    maxUsers: branch.maxUsers || 10,
    maxProducts: branch.maxProducts || 1000,
    isActive: branch.isActive
  });
  showEditModal.value = true;
}

async function submitEditBranch() {
  if (!currentEditId.value) return;
  updatingBranch.value = true;
  const res = await branchStore.updateBranch(currentEditId.value, { ...editForm });
  updatingBranch.value = false;

  if (res.success) {
    showEditModal.value = false;
    toast.add({
      severity: "success",
      summary: "تم التحديث",
      detail: "تم تحديث بيانات الفرع والحصص بنجاح",
      life: 4000
    });
  } else {
    toast.add({
      severity: "error",
      summary: "خطأ",
      detail: res.message,
      life: 5000
    });
  }
}

async function confirmToggleStatus(branch) {
  const action = branch.isActive ? "تعليق" : "تفعيل";
  if (!confirm(`هل أنت متأكد من ${action} فرع "${branch.name}"؟`)) return;

  const res = await branchStore.toggleStatus(branch.id);
  if (res.success) {
    toast.add({
      severity: "info",
      summary: "حالة الفرع",
      detail: res.message,
      life: 3000
    });
  } else {
    toast.add({
      severity: "error",
      summary: "خطأ",
      detail: res.message,
      life: 4000
    });
  }
}

function copyCredentials() {
  if (!createdResult.value) return;
  const text = `بيانات دخول مدير الفرع:\nاسم المستخدم: ${createdResult.value.adminUsername}\nكلمة المرور: ${createdResult.value.temporaryPassword}\nالرقم التعريفي: ${createdResult.value.adminMilitaryNumber || '-'}`;
  navigator.clipboard.writeText(text);
  toast.add({
    severity: "success",
    summary: "تم النسخ",
    detail: "تم نسخ بيانات الاعتماد إلى الحافظة",
    life: 3000
  });
}

onMounted(async () => {
  if (authStore.isSuperAdmin) {
    await branchStore.fetchBranches();
  }
});
</script>
