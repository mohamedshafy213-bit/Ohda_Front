<template>
  <Dialog
    dir="rtl"
    v-model:visible="dialogVisible"
    :modal="true"
    :style="{ width: '50vw', maxHeight: '80vh' }"
    style="max-width: 600px"
    class="custom-tree-dialog"
    header="اختيار الجهة"
  >
    <div class="tree-container">
      <TreeTable
        :value="departments"
        :scrollable="true"
        scrollHeight="45vh"
        v-model:selection-keys="keys"
        :filters="filters"
        filterMode="strict"
        selectionMode="single"
        :metaKeySelection="false"
        dataKey="key"
        class="custom-tree-table"
      >
        <template #empty>
          <div class="empty-state">
            <i class="pi pi-inbox text-4xl text-gray-400 mb-3"></i>
            <p class="text-gray-500">لا يوجد بيانات</p>
          </div>
        </template>
        <template #header>
          <div class="search-container">
            <!-- Department Type Selection -->
            <div class="dept-type-selection">
              <label class="dept-type-label">نوع الجهة</label>
              <div class="dept-type-buttons">
                <Button
                  :label="'داخلية'"
                  :class="deptType === 'inside' ? 'dept-btn-active' : 'dept-btn-inactive'"
                  @click="deptType = 'inside'; loadDepartments()"
                  size="small"
                />
                <Button
                  :label="'خارجية'"
                  :class="deptType === 'outside' ? 'dept-btn-active' : 'dept-btn-inactive'"
                  @click="deptType = 'outside'; loadDepartments()"
                  size="small"
                />
              </div>
            </div>
            
            <!-- Search Input -->
            <InputText 
              v-model="filters['global']" 
              placeholder="بحث عن الجهة..." 
              class="search-input"
            />
          </div>
        </template>
        <Column 
          field="name" 
          header="اسم الجهة" 
          :filter="true" 
          expander 
          class="tree-column"
        >
          <template #body="slotProps">
            <div class="tree-node" @dblclick="set_selected_geha(slotProps.node)">
              <i class="pi pi-building text-blue-500 mr-2"></i>
              <span class="node-text">{{ slotProps.node.data.name }}</span>
            </div>
          </template>
        </Column>
      </TreeTable>
    </div>
    
    <template #footer>
      <div class="dialog-footer">
        <Button 
          label="إغلاق" 
          icon="pi pi-times" 
          severity="secondary"
          @click="closeDialog"
          class="close-button"
        />
      
      </div>
    </template>
  </Dialog>
</template>
<script setup>
import { defineProps, defineEmits, defineModel, ref, onMounted } from 'vue'
import TreeTable from 'primevue/treetable'
import Column from 'primevue/column'

import InputText from 'primevue/inputtext'
import { useLeaveTypesStore } from '@/projects/hr_cycles/stores/leaveTypesStore'
const filters = ref({})
const dialogVisible = ref(false)
const deptType = ref('inside') // Default to inside departments
const leaveTypesStore = useLeaveTypesStore()
const departments = ref([])
const props = defineProps({
  // No props needed - departments are loaded internally
})
// props: {
//   SHOWTREETABLE: {
//     type: Boolean
//     required: true
//   }
// }
// emits: ['update:SHOWTREETABLE']

const keys = ref()
const emit = defineEmits(['sendObject'])

const closeDialog = () => {
  dialogVisible.value = false
}


const loadDepartments = async () => {
  try {
    if (deptType.value === 'inside') {
      await leaveTypesStore.fetchInsideDeptsAsTree()
    } else {
      await leaveTypesStore.fetchOutsideDeptsAsTree()
    }
    departments.value = leaveTypesStore.departments || []
  } catch (error) {
    console.error('Error loading departments:', error)
    departments.value = []
  }
}

const findNodeByKey = (nodes, targetKey) => {
  if (!nodes || !Array.isArray(nodes)) return null
  
  for (const node of nodes) {
    if (node.key === targetKey) {
      return node
    }
    if (node.children) {
      const found = findNodeByKey(node.children, targetKey)
      if (found) return found
    }
  }
  return null
}

const set_selected_geha = (event) => {
  const gehatType = {
    key: event.key,
    label: event.label,
    data: event.data
  }
  emit('sendObject', gehatType)
  dialogVisible.value = false
}

// Expose the dialogVisible ref so parent can control it
defineExpose({
  dialogVisible,
  loadDepartments
})

// Load departments when component mounts
onMounted(() => {
  loadDepartments()
})
</script>

<style scoped>
/* Dialog Styling - More Compact */
.custom-tree-dialog {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.custom-tree-dialog .p-dialog-header) {
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
  color: white;
  border-bottom: none;
  padding: 0.75rem 1rem;
}

:deep(.custom-tree-dialog .p-dialog-title) {
  font-size: 1rem;
  font-weight: 600;
  color: white;
}

:deep(.custom-tree-dialog .p-dialog-content) {
  padding: 0;
  background: white;
}

:deep(.custom-tree-dialog .p-dialog-footer) {
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  padding: 0.75rem 1rem;
}

/* Tree Container - More Compact */
.tree-container {
  padding: 0.5rem;
  height: 100%;
}

/* Tree Table Styling - More Compact */
.custom-tree-table {
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

:deep(.custom-tree-table .p-treetable-header) {
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

:deep(.custom-tree-table .p-treetable-thead > tr > th) {
  background: #f8fafc;
  color: #374151;
  font-weight: 600;
  font-size: 0.8rem;
  border: none;
  padding: 0.5rem 0.75rem;
  text-align: right;
}

:deep(.custom-tree-table .p-treetable-tbody > tr > td) {
  border: none;
  border-bottom: 1px solid #f1f5f9;
  padding: 0.5rem 0.75rem;
}

:deep(.custom-tree-table .p-treetable-tbody > tr:hover > td) {
  background-color: #f0f9ff;
}

:deep(.custom-tree-table .p-treetable-tbody > tr.p-highlight > td) {
  background-color: #dbeafe;
  color: #1e40af;
}

/* Search Container - More Compact */
.search-container {
  padding: 0.75rem;
  background: white;
  border-bottom: 1px solid #e2e8f0;
}

/* Department Type Selection - Compact and Better Styled */
.dept-type-selection {
  margin-bottom: 0.75rem;
}

.dept-type-label {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.dept-type-buttons {
  display: flex;
  gap: 0.5rem;
}

/* Custom Button Styling */
:deep(.dept-btn-active) {
  background: #3b82f6 !important;
  border-color: #3b82f6 !important;
  color: white !important;
  font-weight: 600 !important;
  font-size: 0.8rem !important;
  padding: 0.4rem 0.8rem !important;
  border-radius: 4px !important;
  transition: all 0.2s ease !important;
}

:deep(.dept-btn-active:hover) {
  background: #2563eb !important;
  border-color: #2563eb !important;
  transform: translateY(-1px) !important;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3) !important;
}

:deep(.dept-btn-inactive) {
  background: #f1f5f9 !important;
  border-color: #d1d5db !important;
  color: #6b7280 !important;
  font-weight: 500 !important;
  font-size: 0.8rem !important;
  padding: 0.4rem 0.8rem !important;
  border-radius: 4px !important;
  transition: all 0.2s ease !important;
}

:deep(.dept-btn-inactive:hover) {
  background: #e2e8f0 !important;
  border-color: #9ca3af !important;
  color: #374151 !important;
  transform: translateY(-1px) !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
}

.search-input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 0.8rem;
  transition: all 0.2s ease;
}

.search-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
  outline: none;
}

/* Tree Node Styling - More Compact */
.tree-node {
  display: flex;
  align-items: center;
  padding: 0.25rem 0;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 3px;
  margin: 0 -0.25rem;
  padding-left: 0.25rem;
  padding-right: 0.25rem;
}

.tree-node:hover {
  background-color: #f0f9ff;
}

.node-text {
  font-size: 0.8rem;
  color: #374151;
  font-weight: 500;
}

/* Empty State - More Compact */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  text-align: center;
}

.empty-state i {
  font-size: 2rem !important;
}

.empty-state p {
  font-size: 0.8rem !important;
}

/* Dialog Footer - More Compact */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.close-button {
  background: #6b7280 !important;
  border-color: #6b7280 !important;
  font-size: 0.8rem !important;
  padding: 0.4rem 0.8rem !important;
}

.close-button:hover {
  background: #4b5563 !important;
  border-color: #4b5563 !important;
}

/* Responsive Design */
@media (max-width: 768px) {
  .custom-tree-dialog {
    width: 95vw !important;
    max-width: none !important;
    max-height: 90vh !important;
  }
  
  .tree-container {
    padding: 0.25rem;
  }
  
  .search-container {
    padding: 0.5rem;
  }
  
  .dialog-footer {
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .close-button {
    width: 100%;
  }
}
</style>
