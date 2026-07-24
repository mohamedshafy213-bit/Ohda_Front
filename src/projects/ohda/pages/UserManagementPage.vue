<template>
  <div class="space-y-6">
    <!-- Header Title Bar with Navigation Tabs -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-800/60 p-6 rounded-2xl border border-slate-700/60 backdrop-blur">
      <div>
        <h1 class="text-2xl font-bold text-white flex items-center gap-3">
          <Shield class="w-7 h-7 text-emerald-400" />
          {{ $t('ohda.users.title') }}
        </h1>
        <p class="text-xs text-slate-400 mt-1">
          إدارة حسابات المستخدمين، مجموعات الصلاحيات (User Groups)، وصفحات النظام Dynamically
        </p>
      </div>

      <!-- Action Button based on active tab -->
      <div class="flex items-center gap-3">
        <Button
          v-if="activeTab === 'users'"
          @click="openRegisterModal"
          class="!bg-emerald-500 hover:!bg-emerald-400 !text-slate-950 !font-bold !rounded-xl !px-4 !py-2 !text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20"
        >
          <UserPlus class="w-4 h-4" />
          {{ $t('ohda.users.registerUser') }}
        </Button>

        <Button
          v-if="activeTab === 'groups'"
          @click="openCreateGroupModal"
          class="!bg-purple-500 hover:!bg-purple-400 !text-white !font-bold !rounded-xl !px-4 !py-2 !text-xs flex items-center gap-2 shadow-lg shadow-purple-500/20"
        >
          <Plus class="w-4 h-4" />
          إنشاء مجموعة جديدة
        </Button>

        <Button
          v-if="activeTab === 'pages'"
          @click="openCreatePageModal"
          class="!bg-teal-500 hover:!bg-teal-400 !text-slate-950 !font-bold !rounded-xl !px-4 !py-2 !text-xs flex items-center gap-2 shadow-lg shadow-teal-500/20"
        >
          <Plus class="w-4 h-4" />
          إضافة صفحة نظام جديدة
        </Button>
      </div>
    </div>

    <!-- Navigation Tabs Switcher -->
    <div class="flex items-center gap-2 border-b border-slate-700/80 pb-3">
      <button
        @click="activeTab = 'users'"
        class="px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
        :class="activeTab === 'users' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'text-slate-400 hover:text-white hover:bg-slate-800/40'"
      >
        <Users class="w-4 h-4 text-emerald-400" />
        المستخدمين ({{ userStore.users.length }})
      </button>

      <button
        @click="activeTab = 'groups'"
        class="px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
        :class="activeTab === 'groups' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' : 'text-slate-400 hover:text-white hover:bg-slate-800/40'"
      >
        <ShieldCheck class="w-4 h-4 text-purple-400" />
        مجموعات الصلاحيات ({{ groupStore.groups.length }})
      </button>

      <button
        @click="activeTab = 'pages'"
        class="px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
        :class="activeTab === 'pages' ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40' : 'text-slate-400 hover:text-white hover:bg-slate-800/40'"
      >
        <FileText class="w-4 h-4 text-teal-400" />
        صفحات النظام ({{ groupStore.pages.length }})
      </button>
    </div>

    <!-- TAB 1: USERS DATATABLE & MODALS -->
    <div v-if="activeTab === 'users'" class="bg-slate-800/60 border border-slate-700/60 rounded-2xl overflow-hidden backdrop-blur">
      <DataTable :value="userStore.users" class="w-full text-xs">
        <Column field="id" header="#">
          <template #body="{ data }">
            <span class="font-mono text-slate-400">{{ data.id }}</span>
          </template>
        </Column>

        <Column field="username" :header="$t('ohda.users.username')">
          <template #body="{ data }">
            <span class="font-mono font-bold text-white">{{ data.username }}</span>
          </template>
        </Column>

        <Column field="personName" :header="$t('ohda.users.personName')">
          <template #body="{ data }">
            <span class="font-semibold text-slate-200">{{ data.personName }}</span>
          </template>
        </Column>

        <Column field="email" :header="$t('ohda.users.email')">
          <template #body="{ data }">
            <span class="font-mono text-slate-400">{{ data.email }}</span>
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
            <span class="px-2.5 py-1 bg-purple-500/10 text-purple-300 border border-purple-500/30 rounded-lg text-[11px] font-bold font-mono">
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
    <div v-if="activeTab === 'groups'" class="bg-slate-800/60 border border-slate-700/60 rounded-2xl overflow-hidden backdrop-blur">
      <DataTable :value="groupStore.groups" class="w-full text-xs">
        <Column field="id" header="#">
          <template #body="{ data }">
            <span class="font-mono text-slate-400">{{ data.id }}</span>
          </template>
        </Column>

        <Column field="name" header="اسم المجموعة">
          <template #body="{ data }">
            <span class="font-bold text-white text-sm">{{ data.name }}</span>
          </template>
        </Column>

        <Column field="description" header="الوصف">
          <template #body="{ data }">
            <span class="text-slate-300">{{ data.description || 'لا يوجد وصف' }}</span>
          </template>
        </Column>

        <Column header="صلاحيات الصفحات">
          <template #body="{ data }">
            <Button
              @click="openGroupPermissionsModal(data)"
              class="!px-3 !py-1 !bg-purple-500/10 hover:!bg-purple-500/20 !text-purple-300 !border !border-purple-500/30 !rounded-lg !text-xs !font-bold flex items-center gap-1"
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
    <div v-if="activeTab === 'pages'" class="bg-slate-800/60 border border-slate-700/60 rounded-2xl overflow-hidden backdrop-blur">
      <DataTable :value="groupStore.pages" class="w-full text-xs">
        <Column field="id" header="#">
          <template #body="{ data }">
            <span class="font-mono text-slate-400">{{ data.id }}</span>
          </template>
        </Column>

        <Column field="title" header="عنوان الصفحة">
          <template #body="{ data }">
            <span class="font-bold text-white">{{ data.title || data.name }}</span>
          </template>
        </Column>

        <Column field="path" header="المسار (Path)">
          <template #body="{ data }">
            <span class="font-mono text-emerald-400 font-semibold">{{ data.path }}</span>
          </template>
        </Column>

        <Column field="icon" header="الأيقونة">
          <template #body="{ data }">
            <span class="font-mono text-amber-300">{{ data.icon }}</span>
          </template>
        </Column>

        <Column field="sortOrder" header="الترتيب">
          <template #body="{ data }">
            <span class="font-mono text-slate-400">{{ data.sortOrder }}</span>
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

    <!-- ================= DIALOGS ================= -->

    <!-- Register User Dialog -->
    <Dialog v-model:visible="showRegisterModal" modal :header="$t('ohda.users.registerUser')" class="!bg-slate-800 !border-slate-700 max-w-md w-full">
      <form @submit.prevent="handleRegisterUser" class="space-y-4 text-xs">
        <div>
          <label class="block font-semibold text-slate-300 mb-1">{{ $t('ohda.users.username') }}</label>
          <InputText v-model="registerForm.username" required class="w-full !bg-slate-900 !border-slate-700 !text-white" />
        </div>

        <div>
          <label class="block font-semibold text-slate-300 mb-1">{{ $t('ohda.users.personName') }}</label>
          <InputText v-model="registerForm.personName" required class="w-full !bg-slate-900 !border-slate-700 !text-white" />
        </div>

        <div>
          <label class="block font-semibold text-slate-300 mb-1">{{ $t('ohda.users.email') }}</label>
          <InputText v-model="registerForm.email" type="email" required class="w-full !bg-slate-900 !border-slate-700 !text-white font-mono" />
        </div>

        <div>
          <label class="block font-semibold text-slate-300 mb-1">كلمة المرور</label>
          <InputText v-model="registerForm.password" type="password" required class="w-full !bg-slate-900 !border-slate-700 !text-white font-mono" />
        </div>

        <div>
          <label class="block font-semibold text-slate-300 mb-1">{{ $t('ohda.users.role') }}</label>
          <Select v-model="registerForm.role" :options="roleOptions" optionLabel="label" optionValue="value" class="w-full !bg-slate-900 !border-slate-700 !text-white" />
        </div>

        <div>
          <label class="block font-semibold text-slate-300 mb-1">مجموعة الصلاحيات (User Group)</label>
          <Select v-model="registerForm.userGroupId" :options="groupOptions" optionLabel="label" optionValue="value" class="w-full !bg-slate-900 !border-slate-700 !text-white" />
        </div>

        <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-700/60">
          <SecondaryButton type="button" @click="showRegisterModal = false">
            {{ $t('ohda.common.cancel') }}
          </SecondaryButton>
          <Button type="submit" class="!bg-emerald-500 !text-slate-950 !font-bold">
            {{ $t('ohda.users.registerUser') }}
          </Button>
        </div>
      </form>
    </Dialog>

    <!-- Edit User Dialog -->
    <Dialog v-model:visible="showEditModal" modal header="تعديل بيانات المستخدم ومجموعة الصلاحيات" class="!bg-slate-800 !border-slate-700 max-w-md w-full">
      <form @submit.prevent="handleUpdateUser" class="space-y-4 text-xs">
        <div>
          <label class="block font-semibold text-slate-300 mb-1">{{ $t('ohda.users.username') }}</label>
          <InputText v-model="editForm.username" required class="w-full !bg-slate-900 !border-slate-700 !text-white font-mono" />
        </div>

        <div>
          <label class="block font-semibold text-slate-300 mb-1">{{ $t('ohda.users.personName') }}</label>
          <InputText v-model="editForm.personName" required class="w-full !bg-slate-900 !border-slate-700 !text-white" />
        </div>

        <div>
          <label class="block font-semibold text-slate-300 mb-1">{{ $t('ohda.users.email') }}</label>
          <InputText v-model="editForm.email" type="email" required class="w-full !bg-slate-900 !border-slate-700 !text-white font-mono" />
        </div>

        <div>
          <label class="block font-semibold text-slate-300 mb-1">تحديث كلمة المرور (اختياري)</label>
          <InputText v-model="editForm.password" type="password" placeholder="أدخل كلمة مرور جديدة..." class="w-full !bg-slate-900 !border-slate-700 !text-white font-mono" />
        </div>

        <div>
          <label class="block font-semibold text-slate-300 mb-1">{{ $t('ohda.users.role') }}</label>
          <Select v-model="editForm.role" :options="roleOptions" optionLabel="label" optionValue="value" class="w-full !bg-slate-900 !border-slate-700 !text-white" />
        </div>

        <div>
          <label class="block font-semibold text-slate-300 mb-1">مجموعة الصلاحيات (User Group)</label>
          <Select v-model="editForm.userGroupId" :options="groupOptions" optionLabel="label" optionValue="value" class="w-full !bg-slate-900 !border-slate-700 !text-white" />
        </div>

        <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-700/60">
          <SecondaryButton type="button" @click="showEditModal = false">
            {{ $t('ohda.common.cancel') }}
          </SecondaryButton>
          <Button type="submit" class="!bg-emerald-500 !text-slate-950 !font-bold">
            {{ $t('ohda.common.save') }}
          </Button>
        </div>
      </form>
    </Dialog>

    <!-- User Direct Permissions Modal -->
    <Dialog v-model:visible="showUserPermissionsModal" modal :header="$t('ohda.users.permissionsModal')" class="!bg-slate-800 !border-slate-700 max-w-lg w-full">
      <div v-if="selectedUser" class="space-y-4 text-xs">
        <p class="text-slate-400">
          للمستخدم: <span class="font-bold text-white">{{ selectedUser.personName }}</span> (@{{ selectedUser.username }})
        </p>

        <div class="space-y-2 max-h-96 overflow-y-auto pr-1">
          <div
            v-for="page in groupStore.pages"
            :key="page.id"
            class="flex items-center justify-between p-3 rounded-xl border border-slate-700/60 bg-slate-900/60"
          >
            <div>
              <div class="font-semibold text-slate-200 text-xs">{{ page.title || page.name }}</div>
              <div class="font-mono text-[10px] text-slate-400">{{ page.path }}</div>
            </div>

            <Button
              v-if="isPageAllowedForUser(selectedUser, page.id)"
              @click="toggleUserPageAccess(selectedUser.id, page.id, false)"
              class="!px-3 !py-1 !bg-red-500/20 hover:!bg-red-500/30 !text-red-300 !border !border-red-500/30 !rounded-lg !text-xs !font-bold flex items-center gap-1"
            >
              <X class="w-3.5 h-3.5" />
              {{ $t('ohda.users.revokePage') }}
            </Button>
            <Button
              v-else
              @click="toggleUserPageAccess(selectedUser.id, page.id, true)"
              class="!px-3 !py-1 !bg-emerald-500/20 hover:!bg-emerald-500/30 !text-emerald-300 !border !border-emerald-500/30 !rounded-lg !text-xs !font-bold flex items-center gap-1"
            >
              <Check class="w-3.5 h-3.5" />
              {{ $t('ohda.users.grantPage') }}
            </Button>
          </div>
        </div>

        <div class="flex justify-end pt-3 border-t border-slate-700/60">
          <SecondaryButton @click="showUserPermissionsModal = false">
            {{ $t('ohda.common.close') }}
          </SecondaryButton>
        </div>
      </div>
    </Dialog>

    <!-- Create Group Dialog -->
    <Dialog v-model:visible="showCreateGroupModal" modal header="إنشاء مجموعة مستخدمين جديدة" class="!bg-slate-800 !border-slate-700 max-w-md w-full">
      <form @submit.prevent="handleCreateGroup" class="space-y-4 text-xs">
        <div>
          <label class="block font-semibold text-slate-300 mb-1">اسم المجموعة</label>
          <InputText v-model="groupForm.name" required class="w-full !bg-slate-900 !border-slate-700 !text-white" placeholder="مثال: Warehouse Supervisors" />
        </div>

        <div>
          <label class="block font-semibold text-slate-300 mb-1">الوصف</label>
          <Textarea v-model="groupForm.description" rows="3" class="w-full !bg-slate-900 !border-slate-700 !text-white" placeholder="وصف الصلاحيات والمجموعة..." />
        </div>

        <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-700/60">
          <SecondaryButton type="button" @click="showCreateGroupModal = false">
            {{ $t('ohda.common.cancel') }}
          </SecondaryButton>
          <Button type="submit" class="!bg-purple-500 !text-white !font-bold">
            حفظ المجموعة
          </Button>
        </div>
      </form>
    </Dialog>

    <!-- Edit Group Dialog -->
    <Dialog v-model:visible="showEditGroupModal" modal header="تعديل بيانات المجموعة" class="!bg-slate-800 !border-slate-700 max-w-md w-full">
      <form @submit.prevent="handleUpdateGroup" class="space-y-4 text-xs">
        <div>
          <label class="block font-semibold text-slate-300 mb-1">اسم المجموعة</label>
          <InputText v-model="groupForm.name" required class="w-full !bg-slate-900 !border-slate-700 !text-white" />
        </div>

        <div>
          <label class="block font-semibold text-slate-300 mb-1">الوصف</label>
          <Textarea v-model="groupForm.description" rows="3" class="w-full !bg-slate-900 !border-slate-700 !text-white" />
        </div>

        <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-700/60">
          <SecondaryButton type="button" @click="showEditGroupModal = false">
            {{ $t('ohda.common.cancel') }}
          </SecondaryButton>
          <Button type="submit" class="!bg-purple-500 !text-white !font-bold">
            {{ $t('ohda.common.save') }}
          </Button>
        </div>
      </form>
    </Dialog>

    <!-- Group Page Permissions Modal -->
    <Dialog v-model:visible="showGroupPermissionsModal" modal header="إدارة صلاحيات الصفحات للمجموعة" class="!bg-slate-800 !border-slate-700 max-w-lg w-full">
      <div v-if="selectedGroup" class="space-y-4 text-xs">
        <div class="flex items-center justify-between">
          <p class="text-slate-400">
            للمجموعة: <span class="font-bold text-white">{{ selectedGroup.name }}</span>
          </p>
          <Button
            @click="grantAllToGroup(selectedGroup.id)"
            class="!px-3 !py-1 !bg-emerald-500/20 hover:!bg-emerald-500/30 !text-emerald-300 !border !border-emerald-500/30 !rounded-lg !text-xs !font-bold flex items-center gap-1"
          >
            <CheckCheck class="w-3.5 h-3.5" />
            منح جميع الصفحات
          </Button>
        </div>

        <div class="space-y-2 max-h-96 overflow-y-auto pr-1">
          <div
            v-for="page in groupStore.pages"
            :key="page.id"
            class="flex items-center justify-between p-3 rounded-xl border border-slate-700/60 bg-slate-900/60"
          >
            <div>
              <div class="font-semibold text-slate-200 text-xs">{{ page.title || page.name }}</div>
              <div class="font-mono text-[10px] text-slate-400">{{ page.path }}</div>
            </div>

            <Button
              v-if="isPageAllowedForGroup(selectedGroup.id, page.id)"
              @click="toggleGroupPageAccess(selectedGroup.id, page.id, false)"
              class="!px-3 !py-1 !bg-red-500/20 hover:!bg-red-500/30 !text-red-300 !border !border-red-500/30 !rounded-lg !text-xs !font-bold flex items-center gap-1"
            >
              <X class="w-3.5 h-3.5" />
              إلغاء الصلاحية
            </Button>
            <Button
              v-else
              @click="toggleGroupPageAccess(selectedGroup.id, page.id, true)"
              class="!px-3 !py-1 !bg-emerald-500/20 hover:!bg-emerald-500/30 !text-emerald-300 !border !border-emerald-500/30 !rounded-lg !text-xs !font-bold flex items-center gap-1"
            >
              <Check class="w-3.5 h-3.5" />
              منح الصلاحية
            </Button>
          </div>
        </div>

        <div class="flex justify-end pt-3 border-t border-slate-700/60">
          <SecondaryButton @click="showGroupPermissionsModal = false">
            {{ $t('ohda.common.close') }}
          </SecondaryButton>
        </div>
      </div>
    </Dialog>

    <!-- Create System Page Dialog -->
    <Dialog v-model:visible="showCreatePageModal" modal header="إضافة صفحة نظام جديدة" class="!bg-slate-800 !border-slate-700 max-w-md w-full">
      <form @submit.prevent="handleCreatePage" class="space-y-4 text-xs">
        <div>
          <label class="block font-semibold text-slate-300 mb-1">عنوان الصفحة</label>
          <InputText v-model="pageForm.title" required class="w-full !bg-slate-900 !border-slate-700 !text-white" placeholder="مثال: التقارير والإحصائيات" />
        </div>

        <div>
          <label class="block font-semibold text-slate-300 mb-1">المسار (Path)</label>
          <InputText v-model="pageForm.path" required class="w-full !bg-slate-900 !border-slate-700 !text-white font-mono" placeholder="/ohda/reports" />
        </div>

        <div>
          <label class="block font-semibold text-slate-300 mb-1">الأيقونة (Lucide Icon Name)</label>
          <InputText v-model="pageForm.icon" required class="w-full !bg-slate-900 !border-slate-700 !text-white font-mono" placeholder="FileText" />
        </div>

        <div>
          <label class="block font-semibold text-slate-300 mb-1">ترتيب العرض</label>
          <InputText v-model.number="pageForm.sortOrder" type="number" required class="w-full !bg-slate-900 !border-slate-700 !text-white font-mono" />
        </div>



        <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-700/60">
          <SecondaryButton type="button" @click="showCreatePageModal = false">
            {{ $t('ohda.common.cancel') }}
          </SecondaryButton>
          <Button type="submit" class="!bg-teal-500 !text-slate-950 !font-bold">
            حفظ الصفحة
          </Button>
        </div>
      </form>
    </Dialog>

    <!-- Edit System Page Dialog -->
    <Dialog v-model:visible="showEditPageModal" modal header="تعديل صفحة النظام" class="!bg-slate-800 !border-slate-700 max-w-md w-full">
      <form @submit.prevent="handleUpdatePage" class="space-y-4 text-xs">
        <div>
          <label class="block font-semibold text-slate-300 mb-1">عنوان الصفحة</label>
          <InputText v-model="pageForm.title" required class="w-full !bg-slate-900 !border-slate-700 !text-white" />
        </div>

        <div>
          <label class="block font-semibold text-slate-300 mb-1">المسار (Path)</label>
          <InputText v-model="pageForm.path" required class="w-full !bg-slate-900 !border-slate-700 !text-white font-mono" />
        </div>

        <div>
          <label class="block font-semibold text-slate-300 mb-1">الأيقونة (Lucide Icon Name)</label>
          <InputText v-model="pageForm.icon" required class="w-full !bg-slate-900 !border-slate-700 !text-white font-mono" />
        </div>

        <div>
          <label class="block font-semibold text-slate-300 mb-1">ترتيب العرض</label>
          <InputText v-model.number="pageForm.sortOrder" type="number" required class="w-full !bg-slate-900 !border-slate-700 !text-white font-mono" />
        </div>



        <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-700/60">
          <SecondaryButton type="button" @click="showEditPageModal = false">
            {{ $t('ohda.common.cancel') }}
          </SecondaryButton>
          <Button type="submit" class="!bg-teal-500 !text-slate-950 !font-bold">
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

const userStore = useOhdaUserPermissionStore();
const groupStore = useOhdaGroupStore();
const { t } = useI18n();

const activeTab = ref("users");

onMounted(async () => {
  await Promise.all([
    userStore.fetchUsers(),
    groupStore.fetchUserGroups(),
    groupStore.fetchPages()
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
  if (role === 1) return "bg-purple-500/20 text-purple-300 border-purple-500/30";
  if (role === 2) return "bg-blue-500/20 text-blue-300 border-blue-500/30";
  if (role === 3) return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
  if (role === 4) return "bg-amber-500/20 text-amber-300 border-amber-500/30";
  return "bg-slate-700 text-slate-300";
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
</script>
