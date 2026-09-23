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
        <Button
          v-if="activeTab === 'users'"
          @click="openRegisterModal"
          :disabled="branchStore.myQuota?.isUserQuotaExceeded && !authStore.isSuperAdmin"
          class="!bg-brand-accent hover:!bg-brand-accent/90 !text-brand-dark !font-bold !rounded-xl !px-4 !py-2 !text-xs flex items-center gap-2 shadow-md shadow-brand-accent/10 transition-opacity"
          :class="{ '!opacity-50 !cursor-not-allowed': branchStore.myQuota?.isUserQuotaExceeded && !authStore.isSuperAdmin }"
          :title="branchStore.myQuota?.isUserQuotaExceeded && !authStore.isSuperAdmin ? $t('ohda.quotas.usersLimitReached') : $t('ohda.users.registerUser')"
        >
          <UserPlus class="w-4 h-4" />
          {{ $t('ohda.users.registerUser') }}
        </Button>

        <Button
          v-if="activeTab === 'groups'"
          @click="openCreateGroupModal"
          class="!bg-brand-accent hover:!bg-brand-accent/90 !text-brand-dark !font-bold !rounded-xl !px-4 !py-2 !text-xs flex items-center gap-2 shadow-md shadow-brand-accent/10"
        >
          <Plus class="w-4 h-4" />
          إنشاء مجموعة جديدة
        </Button>

        <Button
          v-if="activeTab === 'pages'"
          @click="openCreatePageModal"
          class="!bg-brand-accent hover:!bg-brand-accent/90 !text-brand-dark !font-bold !rounded-xl !px-4 !py-2 !text-xs flex items-center gap-2 shadow-md shadow-brand-accent/10"
        >
          <Plus class="w-4 h-4" />
          إضافة صفحة نظام جديدة
        </Button>

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
        مجموعات الصلاحيات ({{ groupStore.groups.length }})
      </button>

      <button
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

            <Button
              @click="drillDownToBranch(0)"
              class="!bg-brand-light hover:!bg-brand-soft !border !border-brand-gray/20 !text-brand-dark !rounded-xl !px-3 !py-2 !text-xs font-bold cursor-pointer"
            >
              عرض كافة المستخدمين
            </Button>
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

          <Button
            @click="backToBranchGrid"
            class="!bg-brand-light hover:!bg-brand-soft !border !border-brand-gray/20 !text-brand-dark !rounded-xl !px-3 !py-1.5 !text-xs flex items-center gap-1.5 font-bold cursor-pointer"
          >
            <ArrowRight class="w-3.5 h-3.5 rtl:rotate-0" />
            <span>العودة لشبكة الفروع</span>
          </Button>
        </div>

        <!-- Users Filter & Search Toolbar -->
        <div class="bg-brand-white border border-brand-gray/10 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <!-- Branch Selector (SuperAdmin) or Branch Scope (Branch Admin) -->
          <div class="flex flex-wrap items-center gap-3">
            <div v-if="authStore.isSuperAdmin" class="flex items-center gap-2">
              <Building2 class="w-4 h-4 text-brand-accent shrink-0" />
              <span class="text-xs font-bold text-brand-dark shrink-0">{{ $t('ohda.users.filterByBranch') }}:</span>
              <Select
                v-model="selectedBranchFilter"
                :options="branchFilterOptions"
                optionLabel="label"
                optionValue="value"
                @change="handleBranchFilterChange"
                class="w-56 md:w-64 !bg-brand-light !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark text-xs !rounded-xl"
              />
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
            <Column field="militaryNumber" header="الرقم العسكري">
              <template #body="{ data }">
                <span class="font-mono font-bold text-brand-accent">{{ data.militaryNumber }}</span>
              </template>
            </Column>

            <Column field="username" :header="$t('ohda.users.username')">
              <template #body="{ data }">
                <span class="font-mono font-bold text-brand-dark">{{ data.username }}</span>
              </template>
            </Column>

            <Column field="personName" :header="$t('ohda.users.personName')">
              <template #body="{ data }">
                <span class="font-semibold text-brand-dark">{{ data.personName }}</span>
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
                  <deleteButton v-if="data.role !== 0" @click="deleteUser(data.militaryNumber)" />
                </div>
              </template>
            </Column>
          </DataTable>
        </div>
      </div>
    </div>

    <!-- TAB 2: USER GROUPS DATATABLE & MODALS -->
    <div v-if="activeTab === 'groups'" class="bg-brand-white border border-brand-gray/10 rounded-2xl overflow-hidden shadow-sm">
      <DataTable :value="groupStore.groups" paginator :rows="10" :rowsPerPageOptions="[5, 10, 20, 50]" class="w-full text-xs">
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

        <Column field="description" header="الوصف">
          <template #body="{ data }">
            <span class="text-brand-gray">{{ data.description || 'لا يوجد وصف' }}</span>
          </template>
        </Column>

        <Column header="صلاحيات الصفحات">
          <template #body="{ data }">
            <Button
              @click="openGroupPermissionsModal(data)"
              class="!px-3 !py-1 !bg-brand-soft hover:!bg-brand-accent/20 !text-brand-accent !border !border-brand-accent/20 !rounded-lg !text-xs !font-bold flex items-center gap-1"
            >
              <Lock class="w-3.5 h-3.5" />
              إدارة صلاحيات الصفحات للمجموعة
            </Button>
          </template>
        </Column>

        <Column :header="$t('ohda.common.actions')">
          <template #body="{ data }">
            <div class="flex items-center justify-center gap-2">
              <editButton @click="openEditGroupModal(data)" />
              <deleteButton @click="deleteGroup(data.id)" />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- TAB 3: SYSTEM PAGES DATATABLE & MODALS -->
    <div v-if="activeTab === 'pages'" class="bg-brand-white border border-brand-gray/10 rounded-2xl overflow-hidden shadow-sm">
      <DataTable :value="groupStore.pages" paginator :rows="10" :rowsPerPageOptions="[5, 10, 20, 50]" class="w-full text-xs">
        <Column field="id" header="#">
          <template #body="{ data }">
            <span class="font-mono text-brand-gray">{{ data.id }}</span>
          </template>
        </Column>

        <Column field="title" header="عنوان الصفحة">
          <template #body="{ data }">
            <span class="font-bold text-brand-dark">{{ data.title || data.name }}</span>
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
        <div>
          <label class="block font-semibold text-brand-dark mb-1">الرقم العسكري *</label>
          <InputText v-model.number="registerForm.militaryNumber" type="number" required class="w-full !bg-brand-light !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark font-mono" />
        </div>

        <div>
          <label class="block font-semibold text-brand-dark mb-1">{{ $t('ohda.users.username') }}</label>
          <InputText v-model="registerForm.username" required class="w-full !bg-brand-light !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark" />
        </div>

        <div>
          <label class="block font-semibold text-brand-dark mb-1">{{ $t('ohda.users.personName') }}</label>
          <InputText v-model="registerForm.personName" required class="w-full !bg-brand-light !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark" />
        </div>

        <!-- Branch Selection (for SuperAdmin) or Branch Lock (for Branch Admin) -->
        <div v-if="authStore.isSuperAdmin">
          <label class="block font-semibold text-brand-dark mb-1">{{ $t('ohda.users.assignedBranch') }} *</label>
          <Select
            v-model="registerForm.branchId"
            :options="branchOptions"
            optionLabel="label"
            optionValue="value"
            required
            class="w-full !bg-brand-light !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark"
            placeholder="اختر الفرع..."
          />
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
          <label class="block font-semibold text-brand-dark mb-1">{{ $t('ohda.users.email') }}</label>
          <InputText v-model="registerForm.email" type="email" required class="w-full !bg-brand-light !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark font-mono" />
        </div>

        <div>
          <label class="block font-semibold text-brand-dark mb-1">كلمة المرور</label>
          <InputText v-model="registerForm.password" type="password" required class="w-full !bg-brand-light !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark font-mono" />
        </div>

        <div>
          <label class="block font-semibold text-brand-dark mb-1">{{ $t('ohda.users.role') }}</label>
          <Select v-model="registerForm.role" :options="roleOptions" optionLabel="label" optionValue="value" class="w-full !bg-brand-light !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark" />
        </div>

        <div>
          <label class="block font-semibold text-brand-dark mb-1">مجموعة الصلاحيات (User Group)</label>
          <Select v-model="registerForm.userGroupId" :options="groupOptions" optionLabel="label" optionValue="value" class="w-full !bg-brand-light !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark" />
        </div>

        <div class="flex items-center justify-end gap-3 pt-3 border-t border-brand-gray/10">
          <SecondaryButton type="button" @click="showRegisterModal = false">
            {{ $t('ohda.common.cancel') }}
          </SecondaryButton>
          <Button type="submit" class="!bg-brand-accent hover:!bg-brand-accent/90 !text-brand-dark !font-bold">
            {{ $t('ohda.users.registerUser') }}
          </Button>
        </div>
      </form>
    </Dialog>

    <!-- Edit User Dialog -->
    <Dialog v-model:visible="showEditModal" modal header="تعديل بيانات المستخدم ومجموعة الصلاحيات" class="!bg-brand-white !border-brand-gray/15 max-w-md w-full !text-brand-dark">
      <form @submit.prevent="handleUpdateUser" class="space-y-4 text-xs">
        <div>
          <label class="block font-semibold text-brand-dark mb-1">الرقم العسكري (غير قابل للتعديل)</label>
          <InputText :value="editingUserId" disabled class="w-full !bg-brand-light/50 !border-brand-gray/25 !text-brand-gray font-mono font-bold" />
        </div>

        <div>
          <label class="block font-semibold text-brand-dark mb-1">{{ $t('ohda.users.username') }}</label>
          <InputText v-model="editForm.username" required class="w-full !bg-brand-light !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark font-mono" />
        </div>

        <div>
          <label class="block font-semibold text-brand-dark mb-1">{{ $t('ohda.users.personName') }}</label>
          <InputText v-model="editForm.personName" required class="w-full !bg-brand-light !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark" />
        </div>

        <!-- Branch Selection (for SuperAdmin) or Branch Display (for Branch Admin) -->
        <div v-if="authStore.isSuperAdmin">
          <label class="block font-semibold text-brand-dark mb-1">{{ $t('ohda.users.assignedBranch') }}</label>
          <Select
            v-model="editForm.branchId"
            :options="branchOptions"
            optionLabel="label"
            optionValue="value"
            class="w-full !bg-brand-light !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark"
            placeholder="اختر الفرع..."
          />
        </div>
        <div v-else>
          <label class="block font-semibold text-brand-dark mb-1">{{ $t('ohda.users.branch') }}</label>
          <div class="flex items-center gap-2 p-2.5 rounded-xl bg-brand-light border border-brand-gray/20 text-brand-dark">
            <Building2 class="w-4 h-4 text-brand-accent shrink-0" />
            <span class="font-bold">{{ getBranchName(editForm.branchId) || authStore.user?.branchName || 'فرعك الحالي' }}</span>
          </div>
        </div>

        <div>
          <label class="block font-semibold text-brand-dark mb-1">{{ $t('ohda.users.email') }}</label>
          <InputText v-model="editForm.email" type="email" required class="w-full !bg-brand-light !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark font-mono" />
        </div>

        <div>
          <label class="block font-semibold text-brand-dark mb-1">تحديث كلمة المرور (اختياري)</label>
          <InputText v-model="editForm.password" type="password" placeholder="أدخل كلمة مرور جديدة..." class="w-full !bg-brand-light !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark font-mono" />
        </div>

        <div>
          <label class="block font-semibold text-brand-dark mb-1">{{ $t('ohda.users.role') }}</label>
          <Select v-model="editForm.role" :options="roleOptions" optionLabel="label" optionValue="value" class="w-full !bg-brand-light !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark" />
        </div>

        <div>
          <label class="block font-semibold text-brand-dark mb-1">مجموعة الصلاحيات (User Group)</label>
          <Select v-model="editForm.userGroupId" :options="groupOptions" optionLabel="label" optionValue="value" class="w-full !bg-brand-light !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark" />
        </div>

        <div class="flex items-center justify-end gap-3 pt-3 border-t border-brand-gray/10">
          <SecondaryButton type="button" @click="showEditModal = false">
            {{ $t('ohda.common.cancel') }}
          </SecondaryButton>
          <Button type="submit" class="!bg-brand-accent hover:!bg-brand-accent/90 !text-brand-dark !font-bold">
            {{ $t('ohda.common.save') }}
          </Button>
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
            v-for="page in groupStore.pages"
            :key="page.id"
            class="flex items-center justify-between p-3 rounded-xl border border-brand-gray/10 bg-brand-light"
          >
            <div>
              <div class="font-semibold text-brand-dark text-xs">{{ page.title || page.name }}</div>
              <div class="font-mono text-[10px] text-brand-gray">{{ page.path }}</div>
            </div>

            <Button
              v-if="isPageAllowedForUser(selectedUser, page.id)"
              @click="toggleUserPageAccess(selectedUser.id, page.id, false)"
              class="!px-3 !py-1 !bg-red-500/10 hover:!bg-red-500/20 !text-red-600 !border !border-red-500/30 !rounded-lg !text-xs !font-bold flex items-center gap-1"
            >
              <X class="w-3.5 h-3.5" />
              {{ $t('ohda.users.revokePage') }}
            </Button>
            <Button
              v-else
              @click="toggleUserPageAccess(selectedUser.id, page.id, true)"
              class="!px-3 !py-1 !bg-brand-soft hover:!bg-brand-accent/20 !text-brand-accent !border !border-brand-accent/30 !rounded-lg !text-xs !font-bold flex items-center gap-1"
            >
              <Check class="w-3.5 h-3.5" />
              {{ $t('ohda.users.grantPage') }}
            </Button>
          </div>
        </div>

        <div class="flex justify-end pt-3 border-t border-brand-gray/10">
          <SecondaryButton @click="showUserPermissionsModal = false">
            {{ $t('ohda.common.close') }}
          </SecondaryButton>
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
          <Textarea v-model="groupForm.description" rows="3" class="w-full !bg-brand-light !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark" placeholder="وصف الصلاحيات والمجموعة..." />
        </div>

        <div class="flex items-center justify-end gap-3 pt-3 border-t border-brand-gray/10">
          <SecondaryButton type="button" @click="showCreateGroupModal = false">
            {{ $t('ohda.common.cancel') }}
          </SecondaryButton>
          <Button type="submit" class="!bg-brand-accent hover:!bg-brand-accent/90 !text-brand-dark !font-bold">
            حفظ المجموعة
          </Button>
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
          <Textarea v-model="groupForm.description" rows="3" class="w-full !bg-brand-light !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark" />
        </div>

        <div class="flex items-center justify-end gap-3 pt-3 border-t border-brand-gray/10">
          <SecondaryButton type="button" @click="showEditGroupModal = false">
            {{ $t('ohda.common.cancel') }}
          </SecondaryButton>
          <Button type="submit" class="!bg-brand-accent hover:!bg-brand-accent/90 !text-brand-dark !font-bold">
            {{ $t('ohda.common.save') }}
          </Button>
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
          <Button
            @click="grantAllToGroup(selectedGroup.id)"
            class="!px-3 !py-1 !bg-brand-soft hover:!bg-brand-accent/20 !text-brand-accent !border !border-brand-accent/30 !rounded-lg !text-xs !font-bold flex items-center gap-1"
          >
            <CheckCheck class="w-3.5 h-3.5" />
            منح جميع الصفحات
          </Button>
        </div>

        <div class="space-y-2 max-h-96 overflow-y-auto pr-1">
          <div
            v-for="page in groupStore.pages"
            :key="page.id"
            class="flex items-center justify-between p-3 rounded-xl border border-brand-gray/10 bg-brand-light"
          >
            <div>
              <div class="font-semibold text-brand-dark text-xs">{{ page.title || page.name }}</div>
              <div class="font-mono text-[10px] text-brand-gray">{{ page.path }}</div>
            </div>

            <Button
              v-if="isPageAllowedForGroup(selectedGroup.id, page.id)"
              @click="toggleGroupPageAccess(selectedGroup.id, page.id, false)"
              class="!px-3 !py-1 !bg-red-500/10 hover:!bg-red-500/20 !text-red-600 !border !border-red-500/30 !rounded-lg !text-xs !font-bold flex items-center gap-1"
            >
              <X class="w-3.5 h-3.5" />
              إلغاء الصلاحية
            </Button>
            <Button
              v-else
              @click="toggleGroupPageAccess(selectedGroup.id, page.id, true)"
              class="!px-3 !py-1 !bg-brand-soft hover:!bg-brand-accent/20 !text-brand-accent !border !border-brand-accent/30 !rounded-lg !text-xs !font-bold flex items-center gap-1"
            >
              <Check class="w-3.5 h-3.5" />
              منح الصلاحية
            </Button>
          </div>
        </div>

        <div class="flex justify-end pt-3 border-t border-brand-gray/10">
          <SecondaryButton @click="showGroupPermissionsModal = false">
            {{ $t('ohda.common.close') }}
          </SecondaryButton>
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
          <SecondaryButton type="button" @click="showCreatePageModal = false">
            {{ $t('ohda.common.cancel') }}
          </SecondaryButton>
          <Button type="submit" class="!bg-brand-accent hover:!bg-brand-accent/90 !text-brand-dark !font-bold">
            حفظ الصفحة
          </Button>
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
          <SecondaryButton type="button" @click="showEditPageModal = false">
            {{ $t('ohda.common.cancel') }}
          </SecondaryButton>
          <Button type="submit" class="!bg-brand-accent hover:!bg-brand-accent/90 !text-brand-dark !font-bold">
            {{ $t('ohda.common.save') }}
          </Button>
        </div>
      </form>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useOhdaUserPermissionStore } from "../stores/useOhdaUserPermissionStore";
import { useOhdaGroupStore } from "../stores/useOhdaGroupStore";
import { useOhdaBranchStore } from "../stores/useOhdaBranchStore";
import { useOhdaAuthStore } from "../stores/useOhdaAuthStore";

const userStore = useOhdaUserPermissionStore();
const groupStore = useOhdaGroupStore();
const branchStore = useOhdaBranchStore();
const authStore = useOhdaAuthStore();
const { t } = useI18n();

const activeTab = ref("users");

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
      (u.militaryNumber && u.militaryNumber.toString().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.branchName && u.branchName.toLowerCase().includes(q))
    );
  }
  return list;
});

async function handleBranchFilterChange() {
  if (authStore.isSuperAdmin) {
    await userStore.fetchUsers(selectedBranchFilter.value);
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
  militaryNumber: null,
  username: "",
  personName: "",
  email: "",
  password: "User@123",
  role: 2,
  branchId: null,
  userGroupId: null
});

const editForm = ref({
  militaryNumber: null,
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
  return groupStore.groups.map(g => ({
    value: g.id,
    label: `${g.name} (${g.description || 'مجموعة'})`
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
    militaryNumber: null,
    username: "",
    personName: "",
    email: "",
    password: "User@123",
    role: 2,
    branchId: defaultBranchId,
    userGroupId: groupStore.groups[0]?.id || null
  };
  showRegisterModal.value = true;
}

async function handleRegisterUser() {
  await userStore.registerUser(registerForm.value);
  showRegisterModal.value = false;
}

function openEditModal(user) {
  editingUserId.value = user.militaryNumber;
  editForm.value = {
    militaryNumber: user.militaryNumber,
    username: user.username || "",
    personName: user.personName || "",
    email: user.email || "",
    password: "",
    role: user.role ?? 2,
    branchId: user.branchId || null,
    userGroupId: user.userGroupId || user.userGroup?.id || null
  };
  showEditModal.value = true;
}

async function handleUpdateUser() {
  await userStore.updateUser(editingUserId.value, editForm.value);
  showEditModal.value = false;
}

async function openUserPermissionsModal(user) {
  selectedUser.value = user;
  await userStore.fetchUserPermissions(user.militaryNumber);
  showUserPermissionsModal.value = true;
}

function isPageAllowedForUser(user, pageId) {
  return user?.allowedPages?.includes(pageId);
}

async function toggleUserPageAccess(userId, pageId, grant) {
  if (grant) {
    await userStore.grantPagePermission(userId, pageId);
  } else {
    await userStore.revokePagePermission(userId, pageId);
  }
}

async function deleteUser(id) {
  if (confirm("هل أنت متأكد من إلغاء حساب هذا المستخدم؟")) {
    await userStore.deleteUser(id);
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

async function deleteGroup(id) {
  if (confirm("هل أنت تأكد من حذف مجموعة المستخدمين هذه؟")) {
    await groupStore.deleteUserGroup(id);
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
