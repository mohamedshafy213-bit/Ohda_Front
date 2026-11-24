<template>
  <div class="space-y-6">
    <!-- Header Title Bar with Navigation Tabs -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-brand-white p-6 rounded-2xl border border-brand-gray/10 shadow-sm">
      <div>
        <h1 class="text-2xl font-bold text-brand-dark flex items-center gap-3">
          <Shield class="w-7 h-7 text-brand-accent" />
          {{ $t('ohda.users.title') }}
        </h1>
        <p class="text-xs text-brand-gray mt-1">
          إدارة حسابات المستخدمين، مجموعات الصلاحيات (User Groups)، وصفحات النظام Dynamically
        </p>
      </div>

      <!-- Action Button based on active tab -->
      <div class="flex items-center gap-3">
        <button
          v-if="activeTab === 'users'"
          type="button"
          @click="openRegisterModal"
          :disabled="branchStore.myQuota?.isUserQuotaExceeded && !authStore.isSuperAdmin"
          class="bg-brand-accent hover:bg-brand-accent/90 text-brand-dark font-bold rounded-xl px-4 py-2 text-xs flex items-center gap-2 shadow-md shadow-brand-accent/10 transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          :title="branchStore.myQuota?.isUserQuotaExceeded && !authStore.isSuperAdmin ? $t('ohda.quotas.usersLimitReached') : $t('ohda.users.registerUser')"
        >
          <UserPlus class="w-4 h-4" />
          {{ $t('ohda.users.registerUser') }}
        </button>

        <button
          v-if="activeTab === 'groups'"
          type="button"
          @click="openCreateGroupModal"
          class="bg-brand-accent hover:bg-brand-accent/90 text-brand-dark font-bold rounded-xl px-4 py-2 text-xs flex items-center gap-2 shadow-md shadow-brand-accent/10 cursor-pointer"
        >
          <Plus class="w-4 h-4" />
          إنشاء مجموعة جديدة
        </button>

        <button
          v-if="activeTab === 'pages'"
          type="button"
          @click="openCreatePageModal"
          class="bg-brand-accent hover:bg-brand-accent/90 text-brand-dark font-bold rounded-xl px-4 py-2 text-xs flex items-center gap-2 shadow-md shadow-brand-accent/10 cursor-pointer"
        >
          <Plus class="w-4 h-4" />
          إضافة صفحة نظام جديدة
        </button>

      </div>
    </div>

    <!-- Branch Users Quota Consumption Banner -->
    <div
      v-if="branchStore.myQuota"
      class="p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all"
      :class="branchStore.myQuota.isUserQuotaExceeded
        ? 'bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-300'
        : (branchStore.myQuota.remainingUsers <= 2)
          ? 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300'
          : 'bg-brand-soft border-brand-accent/20 text-brand-dark'"
    >
      <div class="flex items-center gap-3">
        <div
          class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
          :class="branchStore.myQuota.isUserQuotaExceeded ? 'bg-red-500/20 border-red-500/30 text-red-500' : 'bg-brand-accent/20 border-brand-accent/30 text-brand-accent'"
        >
          <Users class="w-5 h-5" />
        </div>
        <div>
          <div class="text-xs font-bold flex items-center gap-2">
            <span>سعة مستخدمي الفرع ({{ branchStore.myQuota.branchName || 'الفرع الحالي' }}):</span>
            <span class="font-mono font-bold">{{ branchStore.myQuota.currentUserCount }} / {{ branchStore.myQuota.maxUsers }} مستخدم</span>
            <span class="text-[10px] font-semibold">({{ branchStore.myQuota.remainingUsers }} متبقي)</span>
          </div>
          <p class="text-[11px] opacity-80 mt-0.5">
            {{ branchStore.myQuota.isUserQuotaExceeded
              ? $t('ohda.quotas.usersLimitReached')
              : 'الحد الأقصى لعدد مستخدمي الفرع محدد ومضبوط حصرياً من قِبل مدير المنصة العام (SuperAdmin).' }}
          </p>
        </div>
      </div>

      <!-- Quota Progress Bar -->
      <div class="w-full sm:w-48 space-y-1">
        <div class="flex items-center justify-between text-[10px] font-bold">
          <span>الاستهلاك</span>
          <span>{{ Math.round((branchStore.myQuota.currentUserCount / (branchStore.myQuota.maxUsers || 1)) * 100) }}%</span>
        </div>
        <div class="w-full bg-black/10 dark:bg-white/10 h-2 rounded-full overflow-hidden">
          <div
            class="h-full rounded-full transition-all"
            :class="branchStore.myQuota.isUserQuotaExceeded ? 'bg-red-500' : (branchStore.myQuota.remainingUsers <= 2 ? 'bg-amber-500' : 'bg-brand-accent')"
            :style="{ width: Math.min(100, Math.round((branchStore.myQuota.currentUserCount / (branchStore.myQuota.maxUsers || 1)) * 100)) + '%' }"
          ></div>
        </div>
      </div>
    </div>

    <!-- Navigation Tabs Switcher -->
    <div class="flex items-center gap-2 border-b border-brand-gray/10 pb-3">
      <button
        @click="activeTab = 'users'"
        class="px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border"
        :class="activeTab === 'users' ? 'bg-brand-soft text-brand-accent border-brand-accent/30 shadow-sm' : 'text-brand-gray border-transparent hover:text-brand-dark hover:bg-brand-light'"
      >
        <Users class="w-4 h-4 text-brand-accent" />
        المستخدمين ({{ userStore.users.length }})
      </button>

      <button
        @click="activeTab = 'groups'"
        class="px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border"
        :class="activeTab === 'groups' ? 'bg-brand-soft text-brand-accent border-brand-accent/30 shadow-sm' : 'text-brand-gray border-transparent hover:text-brand-dark hover:bg-brand-light'"
      >
        <ShieldCheck class="w-4 h-4 text-brand-accent" />
        مجموعات الصلاحيات ({{ filteredGroups.length }})
      </button>

      <button
        v-if="authStore.isSuperAdmin"
        @click="activeTab = 'pages'"
        class="px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border"
        :class="activeTab === 'pages' ? 'bg-brand-soft text-brand-accent border-brand-accent/30 shadow-sm' : 'text-brand-gray border-transparent hover:text-brand-dark hover:bg-brand-light'"
      >
        <FileText class="w-4 h-4 text-brand-accent" />
        صفحات النظام ({{ groupStore.pages.length }})
      </button>

    </div>

    <!-- TAB 1: USERS DATATABLE & MODALS -->
    <div v-if="activeTab === 'users'" class="space-y-4">
      <!-- 1. SuperAdmin Landing: Branch Cards Grid View (when no branch is selected) -->
      <div v-if="authStore.isSuperAdmin && !selectedBranchForUsers" class="space-y-4">
        <!-- Branch Grid Header & Search -->
        <div class="bg-brand-white border border-brand-gray/10 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-brand-soft border border-brand-accent/20 flex items-center justify-center text-brand-accent">
              <Building2 class="w-5 h-5" />
            </div>
            <div>
              <h2 class="text-sm font-bold text-brand-dark">فروع المنصة — اختر الفرع لعرض وإدارة مستخدميه</h2>
              <p class="text-xs text-brand-gray">انقر على بطاقة أي فرع للنزول إلى قائمة المستخدمين الخاصة به وإدارتها</p>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <div class="relative w-full sm:w-64">
              <InputText
                v-model="branchCardSearch"
                placeholder="بحث باسم الفرع أو الرمز..."
                class="w-full !bg-brand-light !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark text-xs !rounded-xl pr-8 pl-3 py-2"
              />
              <Search class="w-4 h-4 text-brand-gray absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <button
              type="button"
              @click="drillDownToBranch(0)"
              class="bg-brand-light hover:bg-brand-soft border border-brand-gray/20 text-brand-dark rounded-xl px-3 py-2 text-xs font-bold cursor-pointer"
            >
              عرض كافة المستخدمين
            </button>
          </div>
        </div>

        <!-- Branch Cards Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="branch in filteredBranchCards"
            :key="branch.id"
            @click="drillDownToBranch(branch)"
            class="bg-brand-white border rounded-2xl p-5 shadow-sm space-y-4 hover:shadow-md transition-all cursor-pointer border-brand-gray/15 hover:border-brand-accent/40 group"
          >
            <!-- Header -->
            <div class="flex items-start justify-between">
              <div class="flex items-center gap-3">
                <div class="w-11 h-11 rounded-xl bg-brand-soft group-hover:bg-brand-accent/20 border border-brand-accent/20 flex items-center justify-center text-brand-accent transition-colors">
                  <Building2 class="w-5 h-5" />
                </div>
                <div>
                  <h3 class="font-bold text-brand-dark text-sm flex items-center gap-2 group-hover:text-brand-accent transition-colors">
                    {{ branch.name }}
                  </h3>
                  <div class="flex items-center gap-2 mt-0.5">
                    <span class="text-[10px] font-mono font-bold text-brand-accent px-1.5 py-0.5 bg-brand-accent/10 rounded">
                      {{ branch.code }}
                    </span>
                    <span class="text-[10px] text-brand-gray">
                      {{ branch.industryTemplate || 'عام' }}
                    </span>
                  </div>
                </div>
              </div>

              <span
                class="px-2 py-0.5 rounded-full text-[10px] font-bold"
                :class="branch.isActive ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'"
              >
                {{ branch.isActive ? 'نشط' : 'معلق' }}
              </span>
            </div>

            <!-- User Quota Utilization Progress Bar -->
            <div class="space-y-1.5 pt-2 border-t border-brand-gray/10">
              <div class="flex items-center justify-between text-xs">
                <span class="text-brand-gray flex items-center gap-1.5 font-medium">
                  <Users class="w-3.5 h-3.5 text-blue-500" />
                  مستخدمي الفرع:
                </span>
                <div class="flex items-center gap-1 font-mono">
                  <span class="font-bold text-brand-dark">{{ branch.currentUserCount || 0 }}</span>
                  <span class="text-brand-gray">/ {{ branch.maxUsers }}</span>
                  <span
                    class="text-[10px] font-bold ms-1"
                    :class="getPercentageColor((branch.currentUserCount || 0) / (branch.maxUsers || 1))"
                  >
                    ({{ Math.round(((branch.currentUserCount || 0) / (branch.maxUsers || 1)) * 100) }}%)
                  </span>
                </div>
              </div>
              <div class="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full transition-all"
                  :class="getProgressBarColor((branch.currentUserCount || 0) / (branch.maxUsers || 1))"
                  :style="{ width: Math.min(100, Math.round(((branch.currentUserCount || 0) / (branch.maxUsers || 1)) * 100)) + '%' }"
                ></div>
              </div>
            </div>

            <!-- Footer Details & Action -->
            <div class="pt-3 border-t border-brand-gray/10 flex items-center justify-between text-xs">
              <div class="text-[11px] text-brand-gray truncate">
                المسؤول: <span class="font-semibold text-brand-dark">{{ branch.contactName || '—' }}</span>
              </div>
              <span class="text-brand-accent group-hover:underline font-bold text-xs flex items-center gap-1">
                إدارة المستخدمين &larr;
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. Drilled-down Scoped User Table View -->
      <div v-else class="space-y-4">
        <!-- Drilled-in Breadcrumb Bar (SuperAdmin) -->
        <div v-if="authStore.isSuperAdmin" class="bg-brand-white border border-brand-gray/10 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div class="flex items-center gap-2 text-xs">
            <button
              @click="backToBranchGrid"
              class="text-brand-gray hover:text-brand-accent font-semibold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Building2 class="w-4 h-4" />
              <span>إدارة المستخدمين (كافة الفروع)</span>
            </button>
            <span class="text-brand-gray/40">&larr;</span>
            <span class="font-bold text-brand-dark flex items-center gap-1">
              <span class="font-mono text-brand-accent px-1.5 py-0.5 bg-brand-accent/10 rounded text-[10px]">
                {{ selectedBranchForUsers?.code || 'ALL' }}
              </span>
              <span>{{ selectedBranchForUsers?.name || 'كافة الفروع' }}</span>
            </span>
          </div>

          <button
            type="button"
            @click="backToBranchGrid"
            class="bg-brand-light hover:bg-brand-soft border border-brand-gray/20 text-brand-dark rounded-xl px-3 py-1.5 text-xs flex items-center gap-1.5 font-bold cursor-pointer"
          >
            <ArrowRight class="w-3.5 h-3.5 rtl:rotate-0" />
            <span>العودة لشبكة الفروع</span>
          </button>
        </div>

        <!-- Users Filter & Search Toolbar -->
        <div class="bg-brand-white border border-brand-gray/10 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <!-- Branch Selector (SuperAdmin) or Branch Scope (Branch Admin) -->
          <div class="flex flex-wrap items-center gap-3">
            <div v-if="authStore.isSuperAdmin" class="flex items-center gap-2">
              <Building2 class="w-4 h-4 text-brand-accent shrink-0" />
              <span class="text-xs font-bold text-brand-dark shrink-0">{{ $t('ohda.users.filterByBranch') }}:</span>
              <select
                v-model="selectedBranchFilter"
                @change="handleBranchFilterChange"
                class="w-56 md:w-64 px-3 py-2 bg-brand-light border border-brand-gray/25 focus:border-brand-accent text-brand-dark text-xs rounded-xl outline-none cursor-pointer"
              >
                <option v-for="opt in branchFilterOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </div>

            <!-- Non-SuperAdmin Branch Badge Scope -->
            <div v-else class="flex items-center gap-2 px-3 py-1.5 bg-brand-soft text-brand-dark rounded-xl border border-brand-accent/25 text-xs font-semibold">
              <Building2 class="w-4 h-4 text-brand-accent shrink-0" />
              <span>{{ $t('ohda.users.branchScope') }}:</span>
              <span class="font-bold text-brand-accent font-mono">{{ authStore.user?.branchName || branchStore.myQuota?.branchName || 'فرعك الحالي' }}</span>
              <span class="text-[10px] text-brand-gray mr-1">(عرض وإنشاء لمستخدمي هذا الفرع فقط)</span>
            </div>

            <!-- Fast Count indicator -->
            <span class="text-[11px] font-bold text-brand-gray bg-brand-light px-2.5 py-1 rounded-lg border border-brand-gray/15">
              {{ filteredUsers.length }} مستخدم
            </span>
          </div>

          <!-- Search Input -->
          <div class="relative w-full md:w-64">
            <InputText
              v-model="searchQuery"
              placeholder="بحث بالاسم، الرقم، أو البريد..."
              class="w-full !bg-brand-light !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark text-xs !rounded-xl pr-8 pl-3 py-2"
            />
            <Search class="w-4 h-4 text-brand-gray absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <!-- Users Table -->
        <div class="bg-brand-white border border-brand-gray/10 rounded-2xl overflow-hidden shadow-sm">
          <DataTable :value="filteredUsers" paginator :rows="10" :rowsPerPageOptions="[5, 10, 20, 50]" class="w-full text-xs">
            <Column field="id" header="المعرف">
              <template #body="{ data }">
                <span class="font-mono font-bold text-brand-accent">#{{ data.id || data.militaryNumber }}</span>
              </template>
            </Column>

            <Column header="مجموعة الصلاحيات" field="userGroupName">
              <template #body="{ data }">
                <span v-if="data.userGroupName || getUserGroupName(data.userGroupId)" class="px-2 py-0.5 rounded text-[11px] font-bold bg-brand-soft text-brand-accent border border-brand-accent/20">
                  {{ data.userGroupName || getUserGroupName(data.userGroupId) }}
                </span>
                <span v-else class="text-brand-gray text-[10px]">-</span>
              </template>
            </Column>

            <Column field="phoneNumber" header="الهاتف">
              <template #body="{ data }">
                <span class="font-mono text-brand-dark">{{ data.phoneNumber || '-' }}</span>
              </template>
            </Column>

            <Column field="personName" :header="$t('ohda.users.personName')">
              <template #body="{ data }">
                <span class="font-semibold text-brand-dark">{{ data.personName || data.username }}</span>
              </template>
            </Column>

            <Column field="username" :header="$t('ohda.users.username')">
              <template #body="{ data }">
                <span class="font-mono text-brand-dark">{{ data.username }}</span>
              </template>
            </Column>

            <Column header="الفرع" field="branchName">
              <template #body="{ data }">
                <div class="flex items-center gap-1.5">
                  <Building2 class="w-3.5 h-3.5 text-brand-accent shrink-0" />
                  <span
                    class="px-2.5 py-0.5 rounded-lg text-[10px] font-bold border inline-block"
                    :class="getBranchBadgeClass(data.branchId)"
                  >
                    {{ data.branchName || getBranchName(data.branchId) }}
                  </span>
                </div>
              </template>
            </Column>

            <Column field="email" :header="$t('ohda.users.email')">
              <template #body="{ data }">
                <span class="font-mono text-brand-gray">{{ data.email }}</span>
              </template>
            </Column>

            <Column field="role" :header="$t('ohda.users.role')">
              <template #body="{ data }">
                <span
                  class="px-3 py-1 rounded-full text-[10px] font-bold border inline-block"
                  :class="getRoleBadgeClass(data.role)"
                >
                  {{ getRoleName(data.role) }}
                </span>
              </template>
            </Column>

            <Column header="مجموعة الصلاحيات (User Group)">
              <template #body="{ data }">
                <span class="px-2.5 py-1 bg-brand-soft text-brand-accent border border-brand-accent/20 rounded-lg text-[11px] font-bold font-mono">
                  {{ data.userGroupName || getUserGroupName(data.userGroupId) }}
                </span>
              </template>
            </Column>

            <Column :header="$t('ohda.common.actions')">
              <template #body="{ data }">
                <div class="flex items-center justify-center gap-2">
                  <editButton @click="openEditModal(data)" />
                  <deleteButton v-if="data.role !== 0" @click="promptDeleteUser(data)" />
                </div>
              </template>
            </Column>
          </DataTable>
        </div>
      </div>
    </div>

    <!-- TAB 2: USER GROUPS DATATABLE & MODALS -->
    <div v-if="activeTab === 'groups'" class="space-y-4">
      <!-- SuperAdmin Branch Filter Toolbar for Groups -->
      <div v-if="authStore.isSuperAdmin" class="bg-brand-white border border-brand-gray/10 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex items-center gap-2">
          <Building2 class="w-4 h-4 text-brand-accent shrink-0" />
          <span class="text-xs font-bold text-brand-dark shrink-0">{{ $t('ohda.users.filterByBranch') }}:</span>
          <select
            v-model="selectedBranchFilter"
            @change="handleBranchFilterChange"
            class="w-56 md:w-64 px-3 py-2 bg-brand-light border border-brand-gray/25 focus:border-brand-accent text-brand-dark text-xs rounded-xl outline-none cursor-pointer"
          >
            <option v-for="opt in branchFilterOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </div>

        <span class="text-[11px] font-bold text-brand-gray bg-brand-light px-2.5 py-1 rounded-lg border border-brand-gray/15">
          {{ filteredGroups.length }} مجموعات صلاحيات
        </span>
      </div>

      <div class="bg-brand-white border border-brand-gray/10 rounded-2xl overflow-hidden shadow-sm">
        <DataTable :value="filteredGroups" paginator :rows="10" :rowsPerPageOptions="[5, 10, 20, 50]" class="w-full text-xs">
          <Column field="id" header="#">
            <template #body="{ data }">
              <span class="font-mono text-brand-gray">{{ data.id }}</span>
            </template>
          </Column>

          <Column field="name" header="اسم المجموعة">
            <template #body="{ data }">
              <span class="font-bold text-brand-dark text-sm">{{ data.name }}</span>
            </template>
          </Column>

          <Column v-if="authStore.isSuperAdmin" header="الفرع">
            <template #body="{ data }">
              <span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-brand-soft text-brand-dark border border-brand-accent/20">
                {{ data.branchName || getBranchName(data.branchId) }}
              </span>
            </template>
          </Column>

          <Column field="description" header="الوصف">
            <template #body="{ data }">
              <span class="text-brand-gray">{{ data.description || 'لا يوجد وصف' }}</span>
            </template>
          </Column>

          <Column header="صلاحيات الصفحات">
            <template #body="{ data }">
              <button
                type="button"
                @click="openGroupPermissionsModal(data)"
                class="px-3 py-1 bg-brand-soft hover:bg-brand-accent/20 text-brand-accent border border-brand-accent/20 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Lock class="w-3.5 h-3.5" />
                إدارة صلاحيات الصفحات للمجموعة
              </button>
            </template>
          </Column>

          <Column :header="$t('ohda.common.actions')">
            <template #body="{ data }">
              <div class="flex items-center justify-center gap-2">
                <editButton @click="openEditGroupModal(data)" />
                <deleteButton @click="promptDeleteGroup(data)" />
              </div>
            </template>
          </Column>
        </DataTable>
      </div>
    </div>

    <!-- TAB 3: SYSTEM PAGES DATATABLE & MODALS -->
    <div v-if="activeTab === 'pages' && authStore.isSuperAdmin" class="bg-brand-white border border-brand-gray/10 rounded-2xl overflow-hidden shadow-sm">
      <DataTable :value="groupStore.pages" paginator :rows="10" :rowsPerPageOptions="[5, 10, 20, 50]" class="w-full text-xs">
        <Column field="id" header="#">
          <template #body="{ data }">
            <span class="font-mono text-brand-gray">{{ data.id }}</span>
          </template>
        </Column>

        <Column field="title" header="عنوان الصفحة">
          <template #body="{ data }">
            <span class="font-bold text-brand-dark">{{ getPageTitle(data) }}</span>
          </template>
        </Column>

        <Column field="path" header="المسار (Path)">
          <template #body="{ data }">
            <span class="font-mono text-brand-accent font-semibold">{{ data.path }}</span>
          </template>
        </Column>

        <Column field="icon" header="الأيقونة">
          <template #body="{ data }">
            <span class="font-mono text-brand-gray">{{ data.icon }}</span>
          </template>
        </Column>

        <Column field="sortOrder" header="الترتيب">
          <template #body="{ data }">
            <span class="font-mono text-brand-gray">{{ data.sortOrder }}</span>
          </template>
        </Column>

        <Column :header="$t('ohda.common.actions')">
          <template #body="{ data }">
            <div class="flex items-center justify-center gap-2">
              <editButton @click="openEditPageModal(data)" />
              <deleteButton @click="deletePage(data.id)" />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Register User Dialog -->
    <Dialog v-model:visible="showRegisterModal" modal :header="$t('ohda.users.registerUser')" class="!bg-brand-white !border-brand-gray/15 max-w-md w-full !text-brand-dark">
      <form @submit.prevent="handleRegisterUser" class="space-y-4 text-xs">
        <!-- 1. User Group (FIRST FIELD) -->
        <div>
          <label class="block font-semibold text-brand-dark mb-1">مجموعة الصلاحيات (User Group) *</label>
          <select
            v-model="registerForm.userGroupId"
            required
            class="w-full px-3 py-2 bg-brand-light border border-brand-gray/25 focus:border-brand-accent text-brand-dark text-xs rounded-xl outline-none cursor-pointer"
          >
            <option :value="null" disabled>اختر مجموعة الصلاحيات...</option>
            <option v-for="opt in groupOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </div>

        <div>
          <label class="block font-semibold text-brand-dark mb-1">رقم الهاتف</label>
          <InputText
            v-model="registerForm.phoneNumber"
            @keypress="allowOnlyNumbers"
            @input="registerForm.phoneNumber = filterPhone(registerForm.phoneNumber)"
            maxlength="15"
            class="w-full !bg-brand-light !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark font-mono"
            placeholder="01xxxxxxxxx"
          />
          <p v-if="registerForm.phoneNumber && !isValidPhone(registerForm.phoneNumber)" class="text-[10px] text-amber-500 mt-1">
            رقم الهاتف يجب أن يتكون من 7 إلى 15 رقماً.
          </p>
        </div>

        <div>
          <label class="block font-semibold text-brand-dark mb-1">{{ $t('ohda.users.personName') }} *</label>
          <InputText v-model="registerForm.personName" required class="w-full !bg-brand-light !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark" placeholder="الاسم الثلاثي..." />
        </div>

        <div>
          <label class="block font-semibold text-brand-dark mb-1">{{ $t('ohda.users.username') }} *</label>
          <InputText v-model="registerForm.username" required class="w-full !bg-brand-light !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark font-mono" placeholder="اسم المستخدم للدخول..." />
        </div>

        <!-- Branch Selection (for SuperAdmin) or Branch Lock (for Branch Admin) -->
        <div v-if="authStore.isSuperAdmin">
          <label class="block font-semibold text-brand-dark mb-1">{{ $t('ohda.users.assignedBranch') }} *</label>
          <select
            v-model="registerForm.branchId"
            required
            class="w-full px-3 py-2 bg-brand-light border border-brand-gray/25 focus:border-brand-accent text-brand-dark text-xs rounded-xl outline-none cursor-pointer"
          >
            <option :value="null" disabled>اختر الفرع...</option>
            <option v-for="opt in branchOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </div>
        <div v-else>
          <label class="block font-semibold text-brand-dark mb-1">{{ $t('ohda.users.branch') }}</label>
          <div class="flex items-center gap-2 p-2.5 rounded-xl bg-brand-light border border-brand-gray/20 text-brand-dark">
            <Building2 class="w-4 h-4 text-brand-accent shrink-0" />
            <span class="font-bold">{{ authStore.user?.branchName || branchStore.myQuota?.branchName || 'فرعك الحالي' }}</span>
            <span class="text-[10px] text-brand-gray mr-auto">(محدد تلقائياً ومقيد بفرعك)</span>
          </div>
        </div>

        <div>
          <label class="block font-semibold text-brand-dark mb-1">كلمة المرور *</label>
          <InputText v-model="registerForm.password" type="password" required class="w-full !bg-brand-light !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark font-mono" />
        </div>

        <div class="flex items-center justify-end gap-3 pt-3 border-t border-brand-gray/10">
          <button type="button" @click="showRegisterModal = false" class="px-4 py-2 rounded-xl bg-brand-light border border-brand-gray/25 text-brand-gray hover:text-brand-dark text-xs font-semibold cursor-pointer">
            {{ $t('ohda.common.cancel') }}
          </button>
          <button type="submit" class="px-4 py-2 rounded-xl bg-brand-accent hover:bg-brand-accent/90 text-brand-dark font-bold text-xs cursor-pointer shadow-sm">
            {{ $t('ohda.users.registerUser') }}
          </button>
        </div>
      </form>
    </Dialog>

    <!-- Edit User Dialog -->
    <Dialog v-model:visible="showEditModal" modal header="تعديل بيانات المستخدم ومجموعة الصلاحيات" class="!bg-brand-white !border-brand-gray/15 max-w-md w-full !text-brand-dark">
      <form @submit.prevent="handleUpdateUser" class="space-y-4 text-xs">
        <div>
          <label class="block font-semibold text-brand-dark mb-1">معرف المستخدم</label>
          <InputText :value="editingUserId" disabled class="w-full !bg-brand-light/50 !border-brand-gray/25 !text-brand-gray font-mono font-bold" />
        </div>

        <!-- 1. User Group (FIRST EDITABLE FIELD) -->
        <div>
          <label class="block font-semibold text-brand-dark mb-1">مجموعة الصلاحيات (User Group) *</label>
          <select
            v-model="editForm.userGroupId"
            class="w-full px-3 py-2 bg-brand-light border border-brand-gray/25 focus:border-brand-accent text-brand-dark text-xs rounded-xl outline-none cursor-pointer"
          >
            <option :value="null">اختر مجموعة الصلاحيات...</option>
            <option v-for="opt in groupOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </div>

        <div>
          <label class="block font-semibold text-brand-dark mb-1">رقم الهاتف</label>
          <InputText
            v-model="editForm.phoneNumber"
            @keypress="allowOnlyNumbers"
            @input="editForm.phoneNumber = filterPhone(editForm.phoneNumber)"
            maxlength="15"
            class="w-full !bg-brand-light !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark font-mono"
            placeholder="01xxxxxxxxx"
          />
          <p v-if="editForm.phoneNumber && !isValidPhone(editForm.phoneNumber)" class="text-[10px] text-amber-500 mt-1">
            رقم الهاتف يجب أن يتكون من 7 إلى 15 رقماً.
          </p>
        </div>

        <div>
          <label class="block font-semibold text-brand-dark mb-1">{{ $t('ohda.users.personName') }}</label>
          <InputText v-model="editForm.personName" required class="w-full !bg-brand-light !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark" />
        </div>

        <div>
          <label class="block font-semibold text-brand-dark mb-1">{{ $t('ohda.users.username') }}</label>
          <InputText v-model="editForm.username" required class="w-full !bg-brand-light !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark font-mono" />
        </div>

        <!-- Branch Selection (for SuperAdmin) or Branch Display (for Branch Admin) -->
        <div v-if="authStore.isSuperAdmin">
          <label class="block font-semibold text-brand-dark mb-1">{{ $t('ohda.users.assignedBranch') }}</label>
          <select
            v-model="editForm.branchId"
            class="w-full px-3 py-2 bg-brand-light border border-brand-gray/25 focus:border-brand-accent text-brand-dark text-xs rounded-xl outline-none cursor-pointer"
          >
            <option :value="null">اختر الفرع...</option>
            <option v-for="opt in branchOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </div>
        <div v-else>
          <label class="block font-semibold text-brand-dark mb-1">{{ $t('ohda.users.branch') }}</label>
          <div class="flex items-center gap-2 p-2.5 rounded-xl bg-brand-light border border-brand-gray/20 text-brand-dark">
            <Building2 class="w-4 h-4 text-brand-accent shrink-0" />
            <span class="font-bold">{{ getBranchName(editForm.branchId) || authStore.user?.branchName || 'فرعك الحالي' }}</span>
          </div>
        </div>

        <div>
          <label class="block font-semibold text-brand-dark mb-1">تحديث كلمة المرور (اختياري)</label>
          <InputText v-model="editForm.password" type="password" placeholder="أدخل كلمة مرور جديدة..." class="w-full !bg-brand-light !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark font-mono" />
        </div>

        <div class="flex items-center justify-end gap-3 pt-3 border-t border-brand-gray/10">
          <button type="button" @click="showEditModal = false" class="px-4 py-2 rounded-xl bg-brand-light border border-brand-gray/25 text-brand-gray hover:text-brand-dark text-xs font-semibold cursor-pointer">
            {{ $t('ohda.common.cancel') }}
          </button>
          <button type="submit" class="px-4 py-2 rounded-xl bg-brand-accent hover:bg-brand-accent/90 text-brand-dark font-bold text-xs cursor-pointer shadow-sm">
            {{ $t('ohda.common.save') }}
          </button>
        </div>
      </form>
    </Dialog>

    <!-- User Direct Permissions Modal -->
    <Dialog v-model:visible="showUserPermissionsModal" modal :header="$t('ohda.users.permissionsModal')" class="!bg-brand-white !border-brand-gray/15 max-w-lg w-full !text-brand-dark">
      <div v-if="selectedUser" class="space-y-4 text-xs">
        <p class="text-brand-gray">
          للمستخدم: <span class="font-bold text-brand-dark">{{ selectedUser.personName }}</span> (@{{ selectedUser.username }})
        </p>

        <div class="space-y-2 max-h-96 overflow-y-auto pr-1">
          <div
            v-for="page in visibleSystemPages"
            :key="page.id"
            class="flex items-center justify-between p-3 rounded-xl border border-brand-gray/10 bg-brand-light"
          >
            <div>
              <div class="font-semibold text-brand-dark text-xs">{{ getPageTitle(page) }}</div>
              <div class="font-mono text-[10px] text-brand-gray">{{ page.path }}</div>
            </div>

            <button
              v-if="isPageAllowedForUser(selectedUser, page.id)"
              type="button"
              @click="toggleUserPageAccess(selectedUser.id || selectedUser.militaryNumber, page.id, false)"
              class="px-3 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-600 border border-red-500/30 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <X class="w-3.5 h-3.5" />
              {{ $t('ohda.users.revokePage') }}
            </button>
            <button
              v-else
              type="button"
              @click="toggleUserPageAccess(selectedUser.id || selectedUser.militaryNumber, page.id, true)"
              class="px-3 py-1 bg-brand-soft hover:bg-brand-accent/20 text-brand-accent border border-brand-accent/30 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <Check class="w-3.5 h-3.5" />
              {{ $t('ohda.users.grantPage') }}
            </button>
          </div>
        </div>

        <div class="flex justify-end pt-3 border-t border-brand-gray/10">
          <button type="button" @click="showUserPermissionsModal = false" class="px-4 py-2 rounded-xl bg-brand-light border border-brand-gray/25 text-brand-gray hover:text-brand-dark text-xs font-semibold cursor-pointer">
            {{ $t('ohda.common.close') }}
          </button>
        </div>
      </div>
    </Dialog>

    <!-- Create Group Dialog -->
    <Dialog v-model:visible="showCreateGroupModal" modal header="إنشاء مجموعة مستخدمين جديدة" class="!bg-brand-white !border-brand-gray/15 max-w-md w-full !text-brand-dark">
      <form @submit.prevent="handleCreateGroup" class="space-y-4 text-xs">
        <div>
          <label class="block font-semibold text-brand-dark mb-1">اسم المجموعة</label>
          <InputText v-model="groupForm.name" required class="w-full !bg-brand-light !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark" placeholder="مثال: Warehouse Supervisors" />
        </div>

        <div>
          <label class="block font-semibold text-brand-dark mb-1">الوصف</label>
          <textarea
            v-model="groupForm.description"
            rows="3"
            class="w-full px-3 py-2 rounded-xl bg-brand-light border border-brand-gray/25 focus:border-brand-accent text-brand-dark text-xs outline-none"
            placeholder="وصف الصلاحيات والمجموعة..."
          ></textarea>
        </div>

        <div class="flex items-center justify-end gap-3 pt-3 border-t border-brand-gray/10">
          <button type="button" @click="showCreateGroupModal = false" class="px-4 py-2 rounded-xl bg-brand-light border border-brand-gray/25 text-brand-gray hover:text-brand-dark text-xs font-semibold cursor-pointer">
            {{ $t('ohda.common.cancel') }}
          </button>
          <button type="submit" class="px-4 py-2 rounded-xl bg-brand-accent hover:bg-brand-accent/90 text-brand-dark font-bold text-xs cursor-pointer shadow-sm">
            حفظ المجموعة
          </button>
        </div>
      </form>
    </Dialog>

    <!-- Edit Group Dialog -->
    <Dialog v-model:visible="showEditGroupModal" modal header="تعديل بيانات المجموعة" class="!bg-brand-white !border-brand-gray/15 max-w-md w-full !text-brand-dark">
      <form @submit.prevent="handleUpdateGroup" class="space-y-4 text-xs">
        <div>
          <label class="block font-semibold text-brand-dark mb-1">اسم المجموعة</label>
          <InputText v-model="groupForm.name" required class="w-full !bg-brand-light !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark" />
        </div>

        <div>
          <label class="block font-semibold text-brand-dark mb-1">الوصف</label>
          <textarea
            v-model="groupForm.description"
            rows="3"
            class="w-full px-3 py-2 rounded-xl bg-brand-light border border-brand-gray/25 focus:border-brand-accent text-brand-dark text-xs outline-none"
          ></textarea>
        </div>

        <div class="flex items-center justify-end gap-3 pt-3 border-t border-brand-gray/10">
          <button type="button" @click="showEditGroupModal = false" class="px-4 py-2 rounded-xl bg-brand-light border border-brand-gray/25 text-brand-gray hover:text-brand-dark text-xs font-semibold cursor-pointer">
            {{ $t('ohda.common.cancel') }}
          </button>
          <button type="submit" class="px-4 py-2 rounded-xl bg-brand-accent hover:bg-brand-accent/90 text-brand-dark font-bold text-xs cursor-pointer shadow-sm">
            {{ $t('ohda.common.save') }}
          </button>
        </div>
      </form>
    </Dialog>

    <!-- Group Page Permissions Modal -->
    <Dialog v-model:visible="showGroupPermissionsModal" modal header="إدارة صلاحيات الصفحات للمجموعة" class="!bg-brand-white !border-brand-gray/15 max-w-lg w-full !text-brand-dark">
      <div v-if="selectedGroup" class="space-y-4 text-xs">
        <div class="flex items-center justify-between">
          <p class="text-brand-gray">
            للمجموعة: <span class="font-bold text-brand-dark">{{ selectedGroup.name }}</span>
          </p>
          <button
            type="button"
            @click="grantAllToGroup(selectedGroup.id)"
            class="px-3 py-1 bg-brand-soft hover:bg-brand-accent/20 text-brand-accent border border-brand-accent/30 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
          >
            <CheckCheck class="w-3.5 h-3.5" />
            منح جميع الصفحات
          </button>
        </div>

        <div class="space-y-2 max-h-96 overflow-y-auto pr-1">
          <div
            v-for="page in visibleSystemPages"
            :key="page.id"
            class="flex items-center justify-between p-3 rounded-xl border border-brand-gray/10 bg-brand-light"
          >
            <div>
              <div class="font-semibold text-brand-dark text-xs">{{ getPageTitle(page) }}</div>
              <div class="font-mono text-[10px] text-brand-gray">{{ page.path }}</div>
            </div>

            <button
              v-if="isPageAllowedForGroup(selectedGroup.id, page.id)"
              type="button"
              @click="toggleGroupPageAccess(selectedGroup.id, page.id, false)"
              class="px-3 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-600 border border-red-500/30 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <X class="w-3.5 h-3.5" />
              إلغاء الصلاحية
            </button>
            <button
              v-else
              type="button"
              @click="toggleGroupPageAccess(selectedGroup.id, page.id, true)"
              class="px-3 py-1 bg-brand-soft hover:bg-brand-accent/20 text-brand-accent border border-brand-accent/30 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <Check class="w-3.5 h-3.5" />
              منح الصلاحية
            </button>
          </div>
        </div>

        <div class="flex justify-end pt-3 border-t border-brand-gray/10">
          <button type="button" @click="showGroupPermissionsModal = false" class="px-4 py-2 rounded-xl bg-brand-light border border-brand-gray/25 text-brand-gray hover:text-brand-dark text-xs font-semibold cursor-pointer">
            {{ $t('ohda.common.close') }}
          </button>
        </div>
      </div>
    </Dialog>

    <!-- Create System Page Dialog -->
    <Dialog v-model:visible="showCreatePageModal" modal header="إضافة صفحة نظام جديدة" class="!bg-brand-white !border-brand-gray/15 max-w-md w-full !text-brand-dark">
      <form @submit.prevent="handleCreatePage" class="space-y-4 text-xs">
        <div>
          <label class="block font-semibold text-brand-dark mb-1">عنوان الصفحة</label>
          <InputText v-model="pageForm.title" required class="w-full !bg-brand-light !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark" placeholder="مثال: التقارير والإحصائيات" />
        </div>

        <div>
          <label class="block font-semibold text-brand-dark mb-1">المسار (Path)</label>
          <InputText v-model="pageForm.path" required class="w-full !bg-brand-light !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark font-mono" placeholder="/ohda/reports" />
        </div>

        <div>
          <label class="block font-semibold text-brand-dark mb-1">الأيقونة (Lucide Icon Name)</label>
          <InputText v-model="pageForm.icon" required class="w-full !bg-brand-light !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark font-mono" placeholder="FileText" />
        </div>

        <div>
          <label class="block font-semibold text-brand-dark mb-1">ترتيب العرض</label>
          <InputText v-model.number="pageForm.sortOrder" type="number" required class="w-full !bg-brand-light !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark font-mono" />
        </div>

        <div class="flex items-center justify-end gap-3 pt-3 border-t border-brand-gray/10">
          <button type="button" @click="showCreatePageModal = false" class="px-4 py-2 rounded-xl bg-brand-light border border-brand-gray/25 text-brand-gray hover:text-brand-dark text-xs font-semibold cursor-pointer">
            {{ $t('ohda.common.cancel') }}
          </button>
          <button type="submit" class="px-4 py-2 rounded-xl bg-brand-accent hover:bg-brand-accent/90 text-brand-dark font-bold text-xs cursor-pointer shadow-sm">
            حفظ الصفحة
          </button>
        </div>
      </form>
    </Dialog>

    <!-- Edit System Page Dialog -->
    <Dialog v-model:visible="showEditPageModal" modal header="تعديل صفحة النظام" class="!bg-brand-white !border-brand-gray/15 max-w-md w-full !text-brand-dark">
      <form @submit.prevent="handleUpdatePage" class="space-y-4 text-xs">
        <div>
          <label class="block font-semibold text-brand-dark mb-1">عنوان الصفحة</label>
          <InputText v-model="pageForm.title" required class="w-full !bg-brand-light !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark" />
        </div>

        <div>
          <label class="block font-semibold text-brand-dark mb-1">المسار (Path)</label>
          <InputText v-model="pageForm.path" required class="w-full !bg-brand-light !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark font-mono" />
        </div>

        <div>
          <label class="block font-semibold text-brand-dark mb-1">الأيقونة (Lucide Icon Name)</label>
          <InputText v-model="pageForm.icon" required class="w-full !bg-brand-light !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark font-mono" />
        </div>

        <div>
          <label class="block font-semibold text-brand-dark mb-1">ترتيب العرض</label>
          <InputText v-model.number="pageForm.sortOrder" type="number" required class="w-full !bg-brand-light !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark font-mono" />
        </div>

        <div class="flex items-center justify-end gap-3 pt-3 border-t border-brand-gray/10">
          <button type="button" @click="showEditPageModal = false" class="px-4 py-2 rounded-xl bg-brand-light border border-brand-gray/25 text-brand-gray hover:text-brand-dark text-xs font-semibold cursor-pointer">
            {{ $t('ohda.common.cancel') }}
          </button>
          <button type="submit" class="px-4 py-2 rounded-xl bg-brand-accent hover:bg-brand-accent/90 text-brand-dark font-bold text-xs cursor-pointer shadow-sm">
            {{ $t('ohda.common.save') }}
          </button>
        </div>
      </form>
    </Dialog>

    <!-- User Delete Dialog -->
    <DeleteDialog
      v-model="showDeleteUserDialog"
      itemType="مستخدم"
      :itemName="userToDelete?.personName || userToDelete?.username"
      :canDelete="userCanBeDeleted"
      :warningMessage="userDeleteWarning"
      @confirm="executeDeleteUser"
    />

    <!-- Group Delete Dialog -->
    <DeleteDialog
      v-model="showDeleteGroupDialog"
      itemType="مجموعة صلاحيات"
      :itemName="groupToDelete?.name"
      :canDelete="groupCanBeDeleted"
      :warningMessage="groupDeleteWarning"
      @confirm="executeDeleteGroup"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useToast } from "primevue/usetoast";
import { useOhdaUserPermissionStore } from "../stores/useOhdaUserPermissionStore";
import { useOhdaGroupStore } from "../stores/useOhdaGroupStore";
import { useOhdaBranchStore } from "../stores/useOhdaBranchStore";
import { useOhdaAuthStore } from "../stores/useOhdaAuthStore";
import { filterPhone, isValidPhone, allowOnlyNumbers } from "@/utilities/validations";
import {
  Shield,
  UserPlus,
  Plus,
  Users,
  ShieldCheck,
  FileText,
  Building2,
  Search,
  X,
  Check,
  CheckCheck,
  Trash2,
  Edit,
  KeyRound,
  Filter,
  ArrowRight,
  UserCheck,
  Lock
} from "lucide-vue-next";

const userStore = useOhdaUserPermissionStore();
const groupStore = useOhdaGroupStore();
const branchStore = useOhdaBranchStore();
const authStore = useOhdaAuthStore();
const toast = useToast();
const { t } = useI18n();

const activeTab = ref("users");

const legacyBlacklist = [
  "compass",
  "entry-request",
  "exit-request",
  "department",
  "product-state",
  "approval-config",
  "acceptance",
  "untracked",
  "package",
  "orders"
];

const pageTitleMap = {
  "/ohda/dashboard": "لوحة التحكم والمؤشرات",
  "/dashboard": "لوحة التحكم والمؤشرات",
  "/ohda/pos": "نقطة بيع المنتجات (POS)",
  "/pos": "نقطة بيع المنتجات (POS)",
  "/ohda/jobs": "أوامر الشغل والفواتير",
  "/jobs": "أوامر الشغل والفواتير",
  "/ohda/clients": "العملاء وسجل المركبات",
  "/clients": "العملاء وسجل المركبات",
  "/ohda/estimates": "عروض الأسعار والمقايسات",
  "/estimates": "عروض الأسعار والمقايسات",
  "/ohda/reminders": "المتابعات وتذكيرات الصيانة",
  "/reminders": "المتابعات وتذكيرات الصيانة",
  "/ohda/bookings-calendar": "تقويم الحجوزات ومناطق الصيانة",
  "/bookings-calendar": "تقويم الحجوزات ومناطق الصيانة",
  "/ohda/todays-board": "لوحة اليوم السريعة للورشة",
  "/todays-board": "لوحة اليوم السريعة للورشة",
  "/ohda/bays-settings": "إعدادات مناطق الصيانة والمواعيد",
  "/bays-settings": "إعدادات مناطق الصيانة والمواعيد",
  "/ohda/products": "المنتجات وقطع الغيار",
  "/products": "المنتجات وقطع الغيار",
  "/ohda/services": "الخدمات وباقات الصيانة",
  "/services": "الخدمات وباقات الصيانة",
  "/ohda/purchases": "فواتير المشتريات والتوريد",
  "/purchases": "فواتير المشتريات والتوريد",
  "/ohda/returns": "مرتجعات العملاء والموردين",
  "/returns": "مرتجعات العملاء والموردين",
  "/ohda/inventory": "المخزون وحركات الأصناف",
  "/inventory": "المخزون وحركات الأصناف",
  "/ohda/warehouse-bins": "أماكن وأرفف التخزين",
  "/warehouse-bins": "أماكن وأرفف التخزين",
  "/ohda/categories": "تصنيفات المخزون والخدمات",
  "/categories": "تصنيفات المخزون والخدمات",
  "/ohda/suppliers": "الموردين والشركات",
  "/suppliers": "الموردين والشركات",
  "/ohda/scan": "فحص وقراءة الباركود",
  "/scan": "فحص وقراءة الباركود",
  "/ohda/barcode-print": "طباعة الباركود والملصقات",
  "/barcode-print": "طباعة الباركود والملصقات",
  "/ohda/finance": "المالية ودرج النقدية",
  "/finance": "المالية ودرج النقدية",
  "/ohda/expenses": "المصروفات والنثريات",
  "/expenses": "المصروفات والنثريات",
  "/ohda/month-closing": "الإغلاق المالي الشهري",
  "/month-closing": "الإغلاق المالي الشهري",
  "/ohda/employees": "الموظفين والرواتب والغياب",
  "/employees": "الموظفين والرواتب والغياب",
  "/ohda/users": "المستخدمين وإدارة الصلاحيات",
  "/users": "المستخدمين وإدارة الصلاحيات",
  "/ohda/lookups": "البيانات الأساسية والتصنيفات",
  "/lookups": "البيانات الأساسية والتصنيفات",
  "/ohda/reports": "التقارير والإحصائيات الشاملة",
  "/reports": "التقارير والإحصائيات الشاملة",
  "/ohda/settings": "إعدادات المركز وهوية الفرع",
  "/settings": "إعدادات المركز وهوية الفرع",
  "/ohda/branches": "إدارة الفروع (SuperAdmin)",
  "/branches": "إدارة الفروع (SuperAdmin)",
  "/ohda/branches-dashboard": "لوحة مؤشرات الفروع (SuperAdmin)",
  "/branches-dashboard": "لوحة مؤشرات الفروع (SuperAdmin)"
};

function getPageTitle(page) {
  if (!page) return "";
  const rawPath = (page.path || "").toLowerCase().trim();
  const cleanPath = rawPath.replace(/^\/+|\/+$/g, "");

  if (pageTitleMap[rawPath]) return pageTitleMap[rawPath];
  if (pageTitleMap["/" + cleanPath]) return pageTitleMap["/" + cleanPath];
  if (pageTitleMap["/ohda/" + cleanPath]) return pageTitleMap["/ohda/" + cleanPath];

  for (const [k, v] of Object.entries(pageTitleMap)) {
    const cleanK = k.toLowerCase().replace(/^\/+|\/+$/g, "");
    if (cleanK === cleanPath || cleanPath.endsWith(cleanK) || cleanK.endsWith(cleanPath)) return v;
  }
  return page.title || page.name || page.path;
}

const visibleSystemPages = computed(() => {
  const pages = (groupStore.pages || []).filter(p => {
    if (!p || p.isDeleted) return false;
    const path = (p.path || "").toLowerCase();
    if (legacyBlacklist.some(b => path.includes(b))) return false;
    if (!authStore.isSuperAdmin && path.includes("branches")) return false;
    return true;
  });
  return pages.sort((a, b) => (a.sortOrder || 99) - (b.sortOrder || 99));
});

onMounted(async () => {
  const promises = [
    userStore.fetchUsers(),
    groupStore.fetchUserGroups(),
    groupStore.fetchPages(),
    branchStore.fetchMyQuota()
  ];
  if (authStore.isSuperAdmin) {
    promises.push(branchStore.fetchBranches());
  }
  await Promise.all(promises);
});

// --- Filter & Search State ---
const selectedBranchFilter = ref(0);
const searchQuery = ref("");
const selectedBranchForUsers = ref(null);
const branchCardSearch = ref("");

const filteredBranchCards = computed(() => {
  let list = branchStore.branches || [];
  if (branchCardSearch.value && branchCardSearch.value.trim()) {
    const q = branchCardSearch.value.trim().toLowerCase();
    list = list.filter(b =>
      (b.name && b.name.toLowerCase().includes(q)) ||
      (b.code && b.code.toLowerCase().includes(q)) ||
      (b.contactName && b.contactName.toLowerCase().includes(q))
    );
  }
  return list;
});

async function drillDownToBranch(branch) {
  if (typeof branch === "number") {
    if (branch === 0) {
      selectedBranchForUsers.value = { id: 0, name: "كافة الفروع", code: "ALL" };
      selectedBranchFilter.value = 0;
    } else {
      const found = branchStore.branches.find(b => b.id === branch);
      selectedBranchForUsers.value = found || { id: branch, name: `فرع #${branch}` };
      selectedBranchFilter.value = branch;
    }
  } else if (branch) {
    selectedBranchForUsers.value = branch;
    selectedBranchFilter.value = branch.id;
  }
  await handleBranchFilterChange();
}

function backToBranchGrid() {
  selectedBranchForUsers.value = null;
  selectedBranchFilter.value = 0;
}

function getPercentageColor(ratio) {
  if (ratio >= 1.0) return "text-red-500";
  if (ratio >= 0.8) return "text-amber-500";
  return "text-emerald-500";
}

function getProgressBarColor(ratio) {
  if (ratio >= 1.0) return "bg-red-500";
  if (ratio >= 0.8) return "bg-amber-500";
  return "bg-emerald-500";
}

const branchOptions = computed(() => {
  return branchStore.branches.map(b => ({
    value: b.id,
    label: `${b.name} (${b.code})`
  }));
});

const branchFilterOptions = computed(() => {
  return [
    { value: 0, label: t('ohda.users.allBranches') || "جميع الفروع (الكل)" },
    ...branchStore.branches.map(b => ({
      value: b.id,
      label: `${b.name} (${b.code})`
    }))
  ];
});

const filteredUsers = computed(() => {
  let list = userStore.users || [];
  if (authStore.isSuperAdmin && selectedBranchFilter.value > 0) {
    list = list.filter(u => u.branchId === selectedBranchFilter.value);
  }
  if (searchQuery.value && searchQuery.value.trim() !== "") {
    const q = searchQuery.value.trim().toLowerCase();
    list = list.filter(u =>
      (u.username && u.username.toLowerCase().includes(q)) ||
      (u.personName && u.personName.toLowerCase().includes(q)) ||
      (u.id && u.id.toString().includes(q)) ||
      (getUserGroupName(u.userGroupId) && getUserGroupName(u.userGroupId).toLowerCase().includes(q)) ||
      (u.phoneNumber && u.phoneNumber.includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.branchName && u.branchName.toLowerCase().includes(q))
    );
  }
  return list;
});

const filteredGroups = computed(() => {
  let list = groupStore.groups || [];
  if (authStore.isSuperAdmin) {
    if (selectedBranchFilter.value > 0) {
      list = list.filter(g => g.branchId === selectedBranchFilter.value);
    } else {
      list = list.filter(g => g.name.includes("مدير") || g.name.toLowerCase().includes("admin") || g.name.toLowerCase().includes("manager"));
    }
  }
  return list;
});

async function handleBranchFilterChange() {
  if (authStore.isSuperAdmin) {
    await Promise.all([
      userStore.fetchUsers(selectedBranchFilter.value),
      groupStore.fetchUserGroups(selectedBranchFilter.value)
    ]);
  }
}

function getBranchName(branchId) {
  if (!branchId) return "المنصة العامة (SuperAdmin)";
  const b = branchStore.branches.find(x => x.id === branchId);
  return b ? b.name : `فرع #${branchId}`;
}

function getBranchBadgeClass(branchId) {
  if (!branchId) return "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
  const colors = [
    "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
    "bg-sky-500/10 text-sky-700 border-sky-500/20",
    "bg-indigo-500/10 text-indigo-700 border-indigo-500/20",
    "bg-teal-500/10 text-teal-700 border-teal-500/20",
    "bg-cyan-500/10 text-cyan-700 border-cyan-500/20"
  ];
  return colors[branchId % colors.length] || "bg-brand-soft text-brand-accent border-brand-accent/20";
}

// --- Tab 1: Users Logic ---
const showRegisterModal = ref(false);
const showEditModal = ref(false);
const showUserPermissionsModal = ref(false);
const selectedUser = ref(null);
const editingUserId = ref(null);

const registerForm = ref({
  id: null,
  phoneNumber: "",
  username: "",
  personName: "",
  email: "",
  password: "User@123",
  role: 2,
  branchId: null,
  userGroupId: null
});

const editForm = ref({
  id: null,
  phoneNumber: "",
  username: "",
  personName: "",
  email: "",
  password: "",
  role: 2,
  branchId: null,
  userGroupId: null
});

const roleOptions = computed(() => [
  { value: 1, label: t('ohda.users.admin') },
  { value: 2, label: t('ohda.users.employee') },
  { value: 3, label: t('ohda.users.supervisor') },
  { value: 4, label: t('ohda.users.manager') }
]);

const groupOptions = computed(() => {
  return filteredGroups.value.map(g => ({
    value: g.id,
    label: `${g.name} (${g.branchName || getBranchName(g.branchId)})`
  }));
});

function getUserGroupName(groupId) {
  if (!groupId) return "غير محدد";
  const g = groupStore.groups.find(x => x.id === groupId);
  return g ? g.name : `مجموعة #${groupId}`;
}

function openRegisterModal() {
  const defaultBranchId = authStore.isSuperAdmin
    ? (selectedBranchFilter.value > 0 ? selectedBranchFilter.value : (branchStore.branches[0]?.id || 1))
    : (authStore.user?.branchId || branchStore.myQuota?.branchId || 1);

  registerForm.value = {
    id: null,
    phoneNumber: "",
    username: "",
    personName: "",
    email: "",
    password: "123456",
    role: 2,
    branchId: defaultBranchId,
    userGroupId: groupStore.groups[0]?.id || null
  };
  showRegisterModal.value = true;
}

async function handleRegisterUser() {
  if (registerForm.value.phoneNumber && !isValidPhone(registerForm.value.phoneNumber)) {
    toast.add({
      severity: "warn",
      summary: "رقم الهاتف غير صالح",
      detail: "يجب أن يتكون رقم الهاتف من 7 إلى 15 رقماً وبدون حروف أو رموز.",
      life: 4000
    });
    return;
  }
  const selectedGroup = groupStore.groups.find(g => g.id === registerForm.value.userGroupId);
  if (selectedGroup && (selectedGroup.name.includes("مدير") || selectedGroup.name.includes("Admin"))) {
    registerForm.value.role = 1;
  } else {
    registerForm.value.role = 2;
  }
  const { id, ...dataToSend } = registerForm.value;
  const payload = {
    ...dataToSend,
    phoneNumber: registerForm.value.phoneNumber?.trim() || null,
    email: registerForm.value.email || null
  };
  const res = await userStore.registerUser(payload);
  if (res?.success) {
    showRegisterModal.value = false;
    toast.add({
      severity: "success",
      summary: "تم بنجاح",
      detail: "تم تسجيل حساب المستخدم بنجاح بكلمة المرور الافتراضية (123456)",
      life: 4000
    });
  } else {
    toast.add({
      severity: "error",
      summary: "فشل إنشاء المستخدم",
      detail: res?.message || "حدث خطأ أثناء حفظ المستخدم، يرجى مراجعة البيانات المدخلة",
      life: 6000
    });
  }
}

function openEditModal(user) {
  const userId = user.id || user.militaryNumber;
  editingUserId.value = userId;
  editForm.value = {
    id: userId,
    phoneNumber: user.phoneNumber || "",
    username: user.username || "",
    personName: user.personName || "",
    email: user.email || "",
    password: "",
    role: user.role ?? 2,
    branchId: user.branchId || null,
    userGroupId: user.userGroupId || user.userGroup?.id || (groupStore.groups[0]?.id || null)
  };
  showEditModal.value = true;
}

async function handleUpdateUser() {
  if (editForm.value.phoneNumber && !isValidPhone(editForm.value.phoneNumber)) {
    toast.add({
      severity: "warn",
      summary: "رقم الهاتف غير صالح",
      detail: "يجب أن يتكون رقم الهاتف من 7 إلى 15 رقماً وبدون حروف أو رموز.",
      life: 4000
    });
    return;
  }
  const selectedGroup = groupStore.groups.find(g => g.id === editForm.value.userGroupId);
  if (selectedGroup && (selectedGroup.name.includes("مدير") || selectedGroup.name.includes("Admin"))) {
    editForm.value.role = 1;
  }
  const payload = {
    ...editForm.value,
    phoneNumber: editForm.value.phoneNumber?.trim() || null,
    email: editForm.value.email || null
  };
  const res = await userStore.updateUser(editingUserId.value, payload);
  if (res?.success) {
    showEditModal.value = false;
    toast.add({
      severity: "success",
      summary: "تم التحديث",
      detail: "تم تحديث بيانات المستخدم بنجاح",
      life: 4000
    });
  } else {
    toast.add({
      severity: "error",
      summary: "فشل التحديث",
      detail: res?.message || "حدث خطأ أثناء تحديث بيانات المستخدم",
      life: 6000
    });
  }
}

async function openUserPermissionsModal(user) {
  selectedUser.value = user;
  await userStore.fetchUserPermissions(user.id || user.militaryNumber);
  const refreshed = userStore.users.find(u => (u.id ?? u.militaryNumber) === (user.id || user.militaryNumber));
  if (refreshed) {
    selectedUser.value = { ...refreshed };
  }
  showUserPermissionsModal.value = true;
}

function isPageAllowedForUser(user, pageId) {
  if (!user || !user.allowedPages) return false;
  return user.allowedPages.includes(pageId);
}

async function toggleUserPageAccess(userId, pageId, grant) {
  if (grant) {
    await userStore.grantPagePermission(userId, pageId);
  } else {
    await userStore.revokePagePermission(userId, pageId);
  }
  const refreshed = userStore.users.find(u => (u.id ?? u.militaryNumber) === userId);
  if (refreshed) {
    selectedUser.value = { ...refreshed };
  }
}

// --- User Delete Dialog State ---
const showDeleteUserDialog = ref(false);
const userToDelete = ref(null);
const userCanBeDeleted = computed(() => {
  if (!userToDelete.value) return true;
  if (userToDelete.value.role === 0) return false;
  return true;
});
const userDeleteWarning = computed(() => {
  if (!userToDelete.value) return "";
  if (userToDelete.value.role === 0) return "لا يمكن حذف الحساب الرئيسي للمنصة (SuperAdmin).";
  return "";
});

function promptDeleteUser(user) {
  userToDelete.value = user;
  showDeleteUserDialog.value = true;
}

async function executeDeleteUser() {
  if (!userToDelete.value) return;
  const res = await userStore.deleteUser(userToDelete.value.id || userToDelete.value.militaryNumber);
  showDeleteUserDialog.value = false;
  if (res?.success) {
    toast.add({
      severity: "info",
      summary: "تم الحذف",
      detail: "تم حذف المستخدم بنجاح مع الاحتفاظ بسجل العمليات التاريخية",
      life: 3000
    });
  } else {
    toast.add({
      severity: "error",
      summary: "تعذر حذف المستخدم",
      detail: res?.message || "لا يمكن حذف المستخدم لوجود طلبات أو عهد نشطة مرتبطة به",
      life: 6000
    });
  }
}

function getRoleBadgeClass(role) {
  if (role === 0) return "bg-red-500/10 text-red-700 border-red-500/20";
  if (role === 1) return "bg-amber-500/10 text-amber-700 border-amber-500/20";
  if (role === 2) return "bg-blue-500/10 text-blue-700 border-blue-500/20";
  if (role === 3) return "bg-emerald-500/10 text-emerald-700 border-emerald-500/20";
  if (role === 4) return "bg-brand-soft text-brand-accent border-brand-accent/25";
  return "bg-brand-light text-brand-gray border-brand-gray/20";
}

function getRoleName(role) {
  const map = { 0: "SuperAdmin (مدير المنصة)", 1: "Admin (مسؤول الفرع)", 2: "Employee (موظف)", 3: "Supervisor (مشرف)", 4: "Manager (مدير)" };
  return map[role] || "User";
}

// --- Tab 2: User Groups Logic ---
const showCreateGroupModal = ref(false);
const showEditGroupModal = ref(false);
const showGroupPermissionsModal = ref(false);
const selectedGroup = ref(null);
const editingGroupId = ref(null);

const groupForm = ref({ name: "", description: "" });

function openCreateGroupModal() {
  groupForm.value = { name: "", description: "" };
  showCreateGroupModal.value = true;
}

async function handleCreateGroup() {
  await groupStore.createUserGroup(groupForm.value);
  showCreateGroupModal.value = false;
}

function openEditGroupModal(group) {
  editingGroupId.value = group.id;
  groupForm.value = { name: group.name || "", description: group.description || "" };
  showEditGroupModal.value = true;
}

async function handleUpdateGroup() {
  await groupStore.updateUserGroup(editingGroupId.value, groupForm.value);
  showEditGroupModal.value = false;
}

// --- Group Delete Dialog State ---
const showDeleteGroupDialog = ref(false);
const groupToDelete = ref(null);

const groupAssignedUsersCount = computed(() => {
  if (!groupToDelete.value) return 0;
  return (userStore.users || []).filter(u => (u.userGroupId === groupToDelete.value.id || u.userGroup?.id === groupToDelete.value.id) && !u.isDeleted).length;
});

const groupCanBeDeleted = computed(() => {
  return groupAssignedUsersCount.value === 0;
});

const groupDeleteWarning = computed(() => {
  if (groupAssignedUsersCount.value > 0) {
    return `لا يمكن حذف هذه المجموعة لوجود (${groupAssignedUsersCount.value}) مستخدمين مسندين إليها حالياً. يرجى نقل المستخدمين لمجموعة أخرى أولاً.`;
  }
  return "";
});

function promptDeleteGroup(group) {
  groupToDelete.value = group;
  showDeleteGroupDialog.value = true;
}

async function executeDeleteGroup() {
  if (!groupToDelete.value) return;
  const res = await groupStore.deleteUserGroup(groupToDelete.value.id);
  showDeleteGroupDialog.value = false;
  if (res?.success) {
    toast.add({
      severity: "info",
      summary: "تم الحذف",
      detail: "تم حذف مجموعة الصلاحيات بنجاح",
      life: 3000
    });
  } else {
    toast.add({
      severity: "error",
      summary: "تعذر الحذف",
      detail: res?.message || "لا يمكن حذف المجموعة لوجود ارتباطات نشطة",
      life: 6000
    });
  }
}

async function openGroupPermissionsModal(group) {
  selectedGroup.value = group;
  await groupStore.fetchGroupPermissions(group.id);
  showGroupPermissionsModal.value = true;
}

function isPageAllowedForGroup(groupId, pageId) {
  const perms = groupStore.groupPermissions[groupId];
  return perms ? perms.includes(pageId) : false;
}

async function toggleGroupPageAccess(groupId, pageId, grant) {
  if (grant) {
    await groupStore.grantGroupPermission(groupId, pageId);
  } else {
    await groupStore.revokeGroupPermission(groupId, pageId);
  }
  groupStore.groupPermissions = { ...groupStore.groupPermissions };
}

async function grantAllToGroup(groupId) {
  await groupStore.grantAllGroupPermissions(groupId);
}

// --- Tab 3: System Pages Logic ---
const showCreatePageModal = ref(false);
const showEditPageModal = ref(false);
const editingPageId = ref(null);

const pageForm = ref({
  title: "",
  path: "",
  icon: "FileText",
  sortOrder: 10
});

function openCreatePageModal() {
  pageForm.value = {
    title: "",
    path: "/ohda/",
    icon: "FileText",
    sortOrder: (groupStore.pages.length + 1) * 10
  };
  showCreatePageModal.value = true;
}

async function handleCreatePage() {
  await groupStore.createPage(pageForm.value);
  showCreatePageModal.value = false;
}

function openEditPageModal(page) {
  editingPageId.value = page.id;
  pageForm.value = {
    title: page.title || page.name || "",
    path: page.path || "",
    icon: page.icon || "FileText",
    sortOrder: page.sortOrder || 10
  };
  showEditPageModal.value = true;
}

async function handleUpdatePage() {
  await groupStore.updatePage(editingPageId.value, pageForm.value);
  showEditPageModal.value = false;
}

async function deletePage(id) {
  if (confirm("هل أنت تأكد من حذف صفحة النظام هذه؟")) {
    await groupStore.deletePage(id);
  }
}

</script>
