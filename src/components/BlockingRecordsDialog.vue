<template>
  <Dialog
    v-model:visible="visible"
    modal
    :style="{ width: '35rem' }"
    :closable="false"
    class="blocking-records-dialog"
  >
    <template #header>
      <div class="flex items-center gap-3">
        <i class="pi pi-exclamation-triangle text-orange-600 text-xl"></i>
        <span class="text-lg font-bold text-white-800">{{ operationTexts.headerTitle }}</span>
      </div>
    </template>

    <div class="space-y-4 p-2">
      <!-- Warning Message -->
      <div class="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <div class="flex items-start gap-3">
          <i class="pi pi-info-circle text-orange-600 text-lg mt-0.5"></i>
          <div>
            <h4 class="font-semibold text-orange-800 mb-2">
              {{ operationTexts.mainMessage }}
            </h4>
            <p class="text-orange-700 text-sm">
              {{ operationTexts.description }}
            </p>
          </div>
        </div>
      </div>

       <!-- Employee Info -->
       <div class="bg-slate-50 rounded-lg p-4">
         <h5 class="font-semibold text-slate-800 mb-2">
           {{ blockedEmployees.length > 1 ? 'الموظفين المحظورين:' : 'معلومات الموظف:' }}
         </h5>
         <!-- Single Employee -->
         <div v-if="blockedEmployees.length === 1" class="flex items-center gap-3">
           <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
             <i class="pi pi-user text-blue-600"></i>
           </div>
           <div>
             <p v-if="blockedEmployees[0]?.EmployeeName && blockedEmployees[0]?.EmployeeName !== 'غير محدد'" class="font-medium text-slate-800">{{ blockedEmployees[0].EmployeeName }}</p>
             <p class="text-sm text-slate-600">رقم الموظف: {{ blockedEmployees[0]?.EmpSerial }}</p>
           </div>
         </div>
         
         <!-- Multiple Employees -->
         <div v-else class="space-y-2 max-h-32 overflow-y-auto">
           <div 
             v-for="employee in blockedEmployees" 
             :key="employee.EmpSerial"
             class="flex items-center gap-3 p-2 bg-white rounded border"
           >

             <div class="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
               <i class="pi pi-user text-blue-600 text-xs"></i>
             </div>

             <div>
               <p v-if="employee.EmployeeName && employee.EmployeeName !== 'غير محدد'" class="font-medium text-slate-800 text-sm">{{ employee.EmployeeName }}</p>
               <p class="text-xs text-slate-600">رقم الموظف: {{ employee.EmpSerial }}</p>
             </div>
           </div>
         </div>
       </div>
      <!-- Blocking Reasons -->
      <div class="space-y-3 pb-2">
        <h5 class="font-semibold  text-slate-800">الأسباب المانعة للحذف:</h5>
        <div class=" overflow-y-auto space-y-3">
          <!-- Single Employee Reasons -->
          <div v-if="blockedEmployees.length === 1">
            <div
              v-for="(reason, index) in blockedEmployees[0]?.Reasons || []"
              :key="index"
              class="bg-red-50 border border-red-200 rounded-lg p-3"
            >
              <div class="flex items-start gap-2">
                <i class="pi pi-times-circle text-red-600 text-sm mt-0.5"></i>
                <span class="text-red-800 text-sm">{{ reason }}</span>
              </div>
            </div>
          </div>
          
          <!-- Multiple Employees Reasons -->
          <div class="space-y-2" v-else>
            <div 
              v-for="employee in blockedEmployees" 
              :key="employee.EmpSerial"
              class="bg-red-50 border border-red-200 rounded-lg p-1 "
            >
              <div class="mb-2">
                <span class="font-medium text-red-800 text-sm">
                  <template v-if="employee.EmployeeName && employee.EmployeeName !== 'غير محدد'">
                    {{ employee.EmployeeName }} ({{ employee.EmpSerial }})
                  </template>
                  <template v-else>
                    رقم الموظف: {{ employee.EmpSerial }}
                  </template>
                </span>
              </div>
              <div class="space-y-2   ">
                <div
                  v-for="(reason, reasonIndex) in employee.Reasons"
                  :key="reasonIndex"
                  class="flex items-start gap-2  "
                >
                  <i class="pi pi-times-circle text-red-600 text-xs mt-0.5"></i>
                  <span class="text-red-700 text-xs">{{ reason }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

  
    </div>

    <!-- Dialog Footer -->
      <div class="flex justify-between w-full gap-3">
       
        <Button
          :label="operationTexts.actionButton"
          severity="danger"
          @click="handleForceDelete"
          class="flex-1"
          icon="pi pi-trash"
          :loading="isDeleting"
        />
        <Button
          label="إلغاء"
          severity="secondary"
          @click="handleCancel"
          class="flex-1"
          icon="pi pi-times"
        />
      </div>
  </Dialog>
</template>

<script setup>
import { ref, computed } from 'vue';

const visible = defineModel(false);

const props = defineProps({
  blockedEmployees: {
    type: Array,
    default: () => []
  },
  operationType: {
    type: String,
    default: 'delete', // 'delete', 'add', 'update'
    validator: (value) => ['delete', 'add', 'update'].includes(value)
  }
});

const emit = defineEmits(['forceDelete', 'cancel']);

const isDeleting = ref(false);

// Computed properties for dynamic text based on operation type
const operationTexts = computed(() => {
  switch (props.operationType) {
    case 'add':
      return {
        headerTitle: 'تحذير - سجلات مرتبطة',
        mainMessage: 'لا يمكن إضافة هذا الموظف',
        description: 'يوجد سجلات مرتبطة بهذا الموظف تمنع إضافته. يمكنك مراجعة الأسباب أدناه واختيار حذف جميع السجلات المرتبطة أو إلغاء العملية.',
        warningMessage: 'في حالة اختيار "حذف جميع السجلات"، سيتم إضافة',
        actionButton: ' حذف السجلات',
        actionVerb: 'إضافة'
      };
    case 'update':
      return {
        headerTitle: 'تحذير - سجلات مرتبطة',
        mainMessage: 'لا يمكن تعديل هذا الموظف',
        description: 'يوجد سجلات مرتبطة بهذا الموظف تمنع تعديله. يمكنك مراجعة الأسباب أدناه واختيار حذف جميع السجلات المرتبطة أو إلغاء العملية.',
        warningMessage: 'في حالة اختيار "حذف جميع السجلات"، سيتم تعديل',
        actionButton: ' حذف السجلات',
        actionVerb: 'تعديل'
      };
    default: // delete
      return {
        headerTitle: 'تحذير - سجلات مرتبطة',
        mainMessage: 'لا يمكن حذف هذا الموظف',
        description: 'يوجد سجلات مرتبطة بهذا الموظف تمنع حذفه. يمكنك مراجعة الأسباب أدناه واختيار حذف جميع السجلات المرتبطة أو إلغاء العملية.',
        warningMessage: 'في حالة اختيار "حذف جميع السجلات"، سيتم حذف',
        actionButton: 'حذف جميع السجلات',
        actionVerb: 'حذف'
      };
  }
});

const handleForceDelete = async () => {
  isDeleting.value = true;
  try {
    // For multiple employees, pass array of serials
    // For single employee, pass single serial
    const empSerials = props.blockedEmployees.length > 1 
      ? props.blockedEmployees.map(emp => emp.EmpSerial)
      : props.blockedEmployees[0]?.EmpSerial;
      
    await emit('forceDelete', empSerials);
  } finally {
    isDeleting.value = false;
  }
};

const handleCancel = () => {
  emit('cancel');
  visible.value = false;
};
</script>

<style scoped>
:deep(.blocking-records-dialog .p-dialog-header) {
  background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
  color: white;
  border-radius: 0.5rem 0.5rem 0 0;
}

:deep(.blocking-records-dialog .p-dialog-header .p-dialog-title) {
  color: white;
}

:deep(.blocking-records-dialog .p-dialog-header .p-dialog-header-icon) {
  color: white;
}

:deep(.blocking-records-dialog .p-dialog-footer) {
  padding: 1rem 1.5rem;
  background: #f8fafc;
  border-radius: 0 0 0.5rem 0.5rem;
}

/* Custom scrollbar for reasons list */
.max-h-48::-webkit-scrollbar {
  width: 6px;
}

.max-h-48::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.max-h-48::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.max-h-48::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
