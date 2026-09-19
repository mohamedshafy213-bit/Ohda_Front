<template>
  <div class="space-y-6">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-brand-white p-6 rounded-2xl border border-brand-gray/10 shadow-sm">
      <div>
        <h1 class="text-2xl font-bold text-brand-dark flex items-center gap-3">
          <Settings class="w-7 h-7 text-brand-accent" />
          {{ $t('ohda.nav.approvalConfig') }}
        </h1>
        <p class="text-xs text-brand-gray mt-1">إدارة إعدادات ومستويات الاعتماد لطلبات الإدخال والصرف</p>
      </div>
      <Button @click="openCreateApprovalConfigModal" class="!bg-brand-accent hover:!bg-brand-accent/90 !text-brand-dark !font-bold !rounded-xl !px-4 !py-2.5 !text-xs flex items-center gap-2 shadow-md shadow-brand-accent/10">
        <Plus class="w-4 h-4" />
        إضافة إعداد اعتماد جديد
      </Button>
    </div>

    <!-- Approval Configs DataTable -->
    <div class="bg-brand-white border border-brand-gray/10 rounded-2xl overflow-hidden shadow-sm">
      <DataTable :value="approvalConfigStore.configs" paginator :rows="10" :rowsPerPageOptions="[5, 10, 20, 50]" class="w-full text-xs">
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
                  :class="data.isActive ? 'bg-brand-soft text-brand-accent border border-brand-accent/20 font-bold' : 'bg-red-500/10 text-red-700 border border-red-500/20 font-bold'">
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useOhdaGroupStore } from "../stores/useOhdaGroupStore";
import { useOhdaApprovalConfigStore } from "../stores/useOhdaApprovalConfigStore";

const groupStore = useOhdaGroupStore();
const approvalConfigStore = useOhdaApprovalConfigStore();

onMounted(async () => {
  await Promise.all([
    groupStore.fetchUserGroups(),
    approvalConfigStore.fetchApprovalConfigs()
  ]);
});

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
