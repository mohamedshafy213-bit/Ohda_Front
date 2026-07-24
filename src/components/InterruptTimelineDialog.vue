<template>
  <Dialog
    v-model:visible="displayDialog"
    header="متابعة طلب قطع الإجازة"
    :style="{ width: '60vw', maxWidth: '800px' }"
    :modal="true"
    :closable="true"
    class="interrupt-timeline-dialog"
    dir="rtl"
    @update:visible="emitClose"
  >
    <div class="p-4">
      <div v-if="timelineData.length > 0" class="space-y-4">
        <Timeline
          :value="timelineData"
          align="right"
          class="custom-timeline"
        >
          <template #opposite="slotProps">
            <div class="timeline-date">
              <div class="date-card">
                <i class="pi pi-calendar date-icon"></i>
                <span class="date-text">{{ formatDisplayDate(slotProps.item.date) }}</span>
              </div>
            </div>
          </template>

          <template #content="slotProps">
            <div class="timeline-content p-2">
              <div class="content-card">
                <div class="flex items-center gap-3 mb-2">
                  <div
                    class="status-icon-wrapper"
                    :class="slotProps.item.statusClass"
                  >
                    <i :class="slotProps.item.icon" class="status-icon"></i>
                  </div>
                  <div>
                    <h4 class="status-title">{{ slotProps.item.title }}</h4>
                  
                  </div>
                </div>
        
              </div>
            </div>
          </template>

          <template #marker="slotProps">
            <div
              class="timeline-marker"
              :style="{ backgroundColor: slotProps.item.color }"
            >
              <i :class="slotProps.item.icon" class="marker-icon"></i>
            </div>
          </template>
        </Timeline>
      </div>
      <div v-else class="text-center py-8 text-slate-500">
        <i class="pi pi-info-circle text-4xl mb-4"></i>
        <p>لا توجد بيانات متابعة متاحة</p>
      </div>
    </div>
    <template #footer>
      <Button label="إغلاق" @click="emitClose" outlined />
    </template>
  </Dialog>
</template>

<script setup>
import Timeline from "primevue/timeline";
import Dialog from "primevue/dialog";
import Button from "primevue/button";

const displayDialog = defineModel();

const props = defineProps({
  timelineData: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["close"]);

const formatDisplayDate = (date) => {
  if (!date) return "-";
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}/${month}/${day}`;
};

const emitClose = () => {
  displayDialog.value = false;
  emit("close");
};
</script>

<style scoped>
/* Timeline Dialog Styles */
.interrupt-timeline-dialog :deep(.p-dialog-header) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px 12px 0 0;
  padding: 1.5rem 2rem;
}

.interrupt-timeline-dialog :deep(.p-dialog-content) {
  padding: 0;
  background: #f8fafc;
}

.custom-timeline {
  background: transparent;
  padding: 0;
}

.custom-timeline :deep(.p-timeline-event-connector) {
  background: linear-gradient(to bottom, #e5e7eb, #d1d5db);
  width: 3px;
}

.timeline-date {
  margin-left: 2rem;
  display: flex;
  justify-content: center;
}

.date-card {
  background: white;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 0.25rem;
  border: 1px solid #e5e7eb;
}

.date-icon {
  color: #6366f1;
  font-size: 1rem;
}

.date-text {
  font-size: 0.95rem;
  font-weight: 600;
  color: #374151;
  white-space: nowrap;
}

.timeline-content {
  margin-right: 2rem;
}

.content-card {
  background: white;
  border-radius: 8px;
  padding: 0.75rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.status-icon-wrapper {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
}

.status-description {
  margin: 0.25rem 0 0 0;
  font-size: 0.875rem;
  color: #6b7280;
}

.notes-section {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid #e5e7eb;
}

.notes-text {
  margin: 0;
  font-size: 0.875rem;
  color: #4b5563;
  line-height: 1.6;
  padding: 0.5rem;
  background: #f9fafb;
  border-radius: 6px;
  border-right: 3px solid #6366f1;
}

.timeline-marker {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  color: white;
  font-size: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 2px solid white;
}

.marker-icon {
  font-weight: bold;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}
</style>

