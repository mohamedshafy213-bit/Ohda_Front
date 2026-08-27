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
          class="!bg-brand-accent hover:!bg-brand-accent/90 !text-brand-dark !font-bold !rounded-xl !px-4 !py-2 !text-xs flex items-center gap-2 shadow-md shadow-brand-accent/10"
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

        <Button
          v-if="activeTab === 'approvalConfigs'"
          @click="openCreateApprovalConfigModal"
          class="!bg-brand-accent hover:!bg-brand-accent/90 !text-brand-dark !font-bold !rounded-xl !px-4 !py-2 !text-xs flex items-center gap-2 shadow-md shadow-brand-accent/10"
        >
          <Plus class="w-4 h-4" />
          إضافة إعداد اعتماد جديد
        </Button>
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

      <button
        @click="activeTab = 'approvalConfigs'"
        class="px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border"
        :class="activeTab === 'approvalConfigs' ? 'bg-brand-soft text-brand-accent border-brand-accent/30 shadow-sm' : 'text-brand-gray border-transparent hover:text-brand-dark hover:bg-brand-light'"
      >
        <Sliders class="w-4 h-4 text-brand-accent" />
        إعدادات الاعتماد ({{ approvalConfigStore.configs.length }})
      </button>
    </div>

    <!-- TAB 1: USERS DATATABLE & MODALS -->
    <div v-if="activeTab === 'users'" class="bg-brand-white border border-brand-gray/10 rounded-2xl overflow-hidden shadow-sm">
      <DataTable :value="userStore.users" class="w-full text-xs">
        <Column field="id" header="#">
          <template #body="{ data }">
            <span class="font-mono text-brand-gray">{{ data.id }}</span>
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
              <deleteButton @click="deleteUser(data.id)" />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- TAB 2: USER GROUPS DATATABLE & MODALS -->
    <div v-if="activeTab === 'groups'" class="bg-brand-white border border-brand-gray/10 rounded-2xl overflow-hidden shadow-sm">
      <DataTable :value="groupStore.groups" class="w-full text-xs">
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
      <DataTable :value="groupStore.pages" class="w-full text-xs">
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

    <!-- TAB 4: APPROVAL CONFIGS DATATABLE -->
    <div v-if="activeTab === 'approvalConfigs'" class="bg-brand-white border border-brand-gray/10 rounded-2xl overflow-hidden shadow-sm">
      <DataTable :value="approvalConfigStore.configs" class="w-full text-xs">
        <Column field="id" header="#">
          <template #body="{ data }">
            <span class="font-mono text-brand-gray">{{ data.id }}</span>
          </template>
        </Column>

        <Column field="requestType" header="نوع الطلب">
          <template #body="{ data }">
            <span class="px-2 py-0.5 rounded border text-[11px] font-bold inline-block"
                  :class="data.requestType === 1 ? 'bg-blue-500/10 text-blue-700 border-blue-500/20' : 'bg-amber-500/10 text-amber-700 border-amber-500/20'">
              {{ data.requestType === 1 ? 'إدخال (Entry)' : 'صرف (Exit)' }}
            </span>
          </template>
        </Column>

        <Column header="المجموعة المستهدفة (User Group)">
          <template #body="{ data }">
            <span class="font-semibold text-brand-dark">
              {{ data.userGroupName || getUserGroupName(data.userGroupId) }}
            </span>
          </template>
        </Column>

        <Column field="workflowRole" header="دور الاعتماد">
          <template #body="{ data }">
            <span class="px-2 py-0.5 rounded border text-[11px] font-bold inline-block"
                  :class="data.workflowRole === 1 ? 'bg-slate-500/10 text-slate-700 border-slate-500/20' : data.workflowRole === 2 ? 'bg-teal-500/10 text-teal-700 border-teal-500/20' : 'bg-purple-500/10 text-purple-700 border-purple-500/20'">
              {{ data.workflowRole === 1 ? 'مقدم الطلب (Requester)' : data.workflowRole === 2 ? 'مراجع/مدير (Reviewer)' : 'معتمد/مشرف (Approver)' }}
            </span>
          </template>
        </Column>

        <Column header="حالة التفعيل">
          <template #body="{ data }">
            <span class="px-2.5 py-1 rounded-lg text-[11px] font-bold inline-block"
                  :class="data.isActive ? 'bg-brand-soft text-brand-accent border border-brand-accent/20' : 'bg-red-500/10 text-red-700 border border-red-500/20'">
              {{ data.isActive ? 'نشط' : 'معطل' }}
            </span>
          </template>
        </Column>

        <Column :header="$t('ohda.common.actions')">
          <template #body="{ data }">
            <div class="flex items-center justify-center gap-2">
              <editButton @click="openEditApprovalConfigModal(data)" />
              <deleteButton @click="deleteApprovalConfig(data.id)" />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Create/Edit Approval Config Dialog -->
    <Dialog v-model:visible="showApprovalConfigModal" modal :header="isEditingApprovalConfig ? 'تعديل إعداد الاعتماد' : 'إضافة إعداد اعتماد جديد'" class="!bg-brand-white !border-brand-gray/15 max-w-md w-full !text-brand-dark">
      <form @submit.prevent="saveApprovalConfig" class="space-y-4 text-xs">
        <div>
          <label class="block font-semibold text-brand-dark mb-1">نوع الطلب</label>
          <Select v-model="approvalConfigForm.requestType" :options="requestTypeOptions" optionLabel="label" optionValue="value" class="w-full !bg-brand-light !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark" />
        </div>

        <div>
          <label class="block font-semibold text-brand-dark mb-1">المجموعة المستهدفة (User Group)</label>
          <Select v-model="approvalConfigForm.userGroupId" :options="groupOptions" optionLabel="label" optionValue="value" class="w-full !bg-brand-light !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark" />
        </div>

        <div>
          <label class="block font-semibold text-brand-dark mb-1">دور الاعتماد (Workflow Role)</label>
          <Select v-model="approvalConfigForm.workflowRole" :options="workflowRoleOptions" optionLabel="label" optionValue="value" class="w-full !bg-brand-light !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark" />
        </div>

        <div class="flex items-center gap-2 py-2">
          <Checkbox v-model="approvalConfigForm.isActive" :binary="true" inputId="configIsActive" class="w-5 h-5" />
          <label for="configIsActive" class="font-semibold text-brand-dark select-none cursor-pointer">نشط ومفعل</label>
        </div>

        <div class="flex items-center justify-end gap-3 pt-3 border-t border-brand-gray/10">
          <SecondaryButton type="button" @click="showApprovalConfigModal = false">
            {{ $t('ohda.common.cancel') }}
          </SecondaryButton>
          <Button type="submit" class="!bg-brand-accent hover:!bg-brand-accent/90 !text-brand-dark !font-bold">
            {{ $t('ohda.common.save') }}
          </Button>
        </div>
      </form>
    </Dialog>

    <!-- Register User Dialog -->
    <Dialog v-model:visible="showRegisterModal" modal :header="$t('ohda.users.registerUser')" class="!bg-brand-white !border-brand-gray/15 max-w-md w-full !text-brand-dark">
      <form @submit.prevent="handleRegisterUser" class="space-y-4 text-xs">
        <div>
          <label class="block font-semibold text-brand-dark mb-1">{{ $t('ohda.users.username') }}</label>
          <InputText v-model="registerForm.username" required class="w-full !bg-brand-light !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark" />
        </div>

        <div>
          <label class="block font-semibold text-brand-dark mb-1">{{ $t('ohda.users.personName') }}</label>
          <InputText v-model="registerForm.personName" required class="w-full !bg-brand-light !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark" />
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
          <label class="block font-semibold text-brand-dark mb-1">{{ $t('ohda.users.username') }}</label>
          <InputText v-model="editForm.username" required class="w-full !bg-brand-light !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark font-mono" />
        </div>

        <div>
          <label class="block font-semibold text-brand-dark mb-1">{{ $t('ohda.users.personName') }}</label>
          <InputText v-model="editForm.personName" required class="w-full !bg-brand-light !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark" />
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
import { useOhdaApprovalConfigStore } from "../stores/useOhdaApprovalConfigStore";

const userStore = useOhdaUserPermissionStore();
const groupStore = useOhdaGroupStore();
const approvalConfigStore = useOhdaApprovalConfigStore();
const { t } = useI18n();

const activeTab = ref("users");

onMounted(async () => {
  await Promise.all([
    userStore.fetchUsers(),
    groupStore.fetchUserGroups(),
    groupStore.fetchPages(),
    approvalConfigStore.fetchApprovalConfigs()
  ]);
});

// --- Tab 1: Users Logic ---
const showRegisterModal = ref(false);
const showEditModal = ref(false);
const showUserPermissionsModal = ref(false);
const selectedUser = ref(null);
const editingUserId = ref(null);

const registerForm = ref({
  username: "",
  personName: "",
  email: "",
  password: "User@123",
  role: 2,
  userGroupId: null
});

const editForm = ref({
  username: "",
  personName: "",
  email: "",
  password: "",
  role: 2,
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
  registerForm.value = {
    username: "",
    personName: "",
    email: "",
    password: "User@123",
    role: 2,
    userGroupId: groupStore.groups[0]?.id || null
  };
  showRegisterModal.value = true;
}

async function handleRegisterUser() {
  await userStore.registerUser(registerForm.value);
  showRegisterModal.value = false;
}

function openEditModal(user) {
  editingUserId.value = user.id;
  editForm.value = {
    username: user.username || "",
    personName: user.personName || "",
    email: user.email || "",
    password: "",
    role: user.role || 2,
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
  await userStore.fetchUserPermissions(user.id);
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
  if (confirm("هل أنت تأكد من إلغاء حساب هذا المستخدم؟")) {
    await userStore.deleteUser(id);
  }
}

function getRoleBadgeClass(role) {
  if (role === 1) return "bg-purple-500/10 text-purple-700 border-purple-500/20";
  if (role === 2) return "bg-blue-500/10 text-blue-700 border-blue-500/20";
  if (role === 3) return "bg-brand-soft text-brand-accent border-brand-accent/25";
  if (role === 4) return "bg-amber-500/10 text-amber-700 border-amber-500/20";
  return "bg-brand-light text-brand-gray border-brand-gray/20";
}

function getRoleName(role) {
  const map = { 1: "Admin (مسؤول)", 2: "Employee (موظف)", 3: "Supervisor (مشرف)", 4: "Manager (مدير)" };
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

// --- Tab 4: Approval Configurations Logic ---
const showApprovalConfigModal = ref(false);
const isEditingApprovalConfig = ref(false);
const editingApprovalConfigId = ref(null);

const approvalConfigForm = ref({
  requestType: 1,
  userGroupId: null,
  workflowRole: 1,
  isActive: true
});

const requestTypeOptions = computed(() => [
  { value: 1, label: "إدخال (Entry)" },
  { value: 2, label: "صرف (Exit)" }
]);

const workflowRoleOptions = computed(() => [
  { value: 1, label: "مقدم الطلب (Requester)" },
  { value: 2, label: "مراجع/مدير (Reviewer)" },
  { value: 3, label: "معتمد/مشرف (Approver)" }
]);

function openCreateApprovalConfigModal() {
  isEditingApprovalConfig.value = false;
  editingApprovalConfigId.value = null;
  approvalConfigForm.value = {
    requestType: 1,
    userGroupId: groupStore.groups[0]?.id || null,
    workflowRole: 1,
    isActive: true
  };
  showApprovalConfigModal.value = true;
}

function openEditApprovalConfigModal(config) {
  isEditingApprovalConfig.value = true;
  editingApprovalConfigId.value = config.id;
  approvalConfigForm.value = {
    requestType: config.requestType,
    userGroupId: config.userGroupId,
    workflowRole: config.workflowRole,
    isActive: config.isActive
  };
  showApprovalConfigModal.value = true;
}

async function saveApprovalConfig() {
  if (isEditingApprovalConfig.value) {
    await approvalConfigStore.updateApprovalConfig(editingApprovalConfigId.value, approvalConfigForm.value);
  } else {
    await approvalConfigStore.createApprovalConfig(approvalConfigForm.value);
  }
  showApprovalConfigModal.value = false;
}

async function deleteApprovalConfig(id) {
  if (confirm("هل أنت متأكد من رغبتك في حذف إعداد الاعتماد هذا؟")) {
    await approvalConfigStore.deleteApprovalConfig(id);
  }
}
</script>
