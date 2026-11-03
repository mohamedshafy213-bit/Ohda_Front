<template>
  <Dialog
    v-model:visible="visible"
    modal
    :header="modalTitle"
    class="!bg-brand-white !border-brand-gray/15 max-w-2xl w-full !text-brand-dark"
  >
    <div v-if="requestItem" class="space-y-5 text-xs pt-2">
      <!-- Requester & Context Header Card -->
      <div class="p-4 bg-brand-light/70 rounded-2xl border border-brand-gray/15 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <span class="text-[10px] text-brand-gray block mb-0.5">مقدم الطلب:</span>
          <span class="font-bold text-sm text-brand-dark block">
            {{ requesterName }}
          </span>
          <span v-if="requesterMilitary" class="font-mono text-[11px] text-brand-gray block">
            الرقم العسكري: {{ requesterMilitary }}
          </span>
        </div>

        <div>
          <span class="text-[10px] text-brand-gray block mb-0.5">
            {{ isExit ? 'الجهة والمستلم:' : 'المصدر / المورد:' }}
          </span>
          <span class="font-bold text-sm text-brand-dark block">
            {{ partyName }}
          </span>
          <span class="text-[11px] text-brand-gray block">
            {{ departmentOrSource }}
          </span>
        </div>

        <div class="sm:text-end">
          <span class="text-[10px] text-brand-gray block mb-1">الحالة ومرحلة المسار:</span>
          <span
            class="px-2.5 py-1 rounded-full text-[11px] font-bold border inline-flex items-center gap-1 shadow-2xs"
            :class="statusBadgeClass"
          >
            <span class="w-2 h-2 rounded-full" :class="statusDotClass"></span>
            {{ currentStatusLabel }}
          </span>
          <span class="text-[10px] text-brand-gray font-mono block mt-1">
            {{ formatDate(requestItem.insertDate) }}
          </span>
        </div>
      </div>

      <!-- Workflow Timeline Section -->
      <div class="space-y-3">
        <div class="flex items-center justify-between pb-1 border-b border-brand-gray/10">
          <h4 class="font-extrabold text-brand-dark text-sm flex items-center gap-2">
            <GitMerge class="w-4 h-4 text-brand-accent" />
            <span>مسار الاعتماد التفصيلي (من اعتمد ومن لم يعتمد بعد)</span>
          </h4>
          <span class="text-[11px] font-bold text-brand-gray">
            إجمالي المراحل: {{ computedSteps.length }} خطوات
          </span>
        </div>

        <!-- Vertical Stepper -->
        <div class="space-y-4 relative py-2 pr-5 border-r-2 border-brand-gray/20 mr-3">
          <div
            v-for="(step, idx) in computedSteps"
            :key="idx"
            class="relative flex items-start gap-3.5"
          >
            <!-- Timeline Node Icon -->
            <div
              class="absolute -right-[27px] w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-black shadow-sm transition-all"
              :class="{
                'bg-emerald-600 ring-4 ring-emerald-500/20': step.state === 'completed',
                'bg-amber-500 ring-4 ring-amber-500/20 animate-pulse': step.state === 'current',
                'bg-slate-300 dark:bg-slate-700 text-slate-500': step.state === 'pending',
                'bg-red-600 ring-4 ring-red-500/20': step.state === 'rejected'
              }"
            >
              <Check v-if="step.state === 'completed'" class="w-4 h-4" />
              <X v-else-if="step.state === 'rejected'" class="w-4 h-4" />
              <Clock v-else-if="step.state === 'current'" class="w-4 h-4" />
              <span v-else class="text-xs font-bold text-slate-400">{{ step.stepOrder }}</span>
            </div>

            <!-- Step Details Card -->
            <div
              class="flex-1 p-3.5 rounded-2xl border transition-all"
              :class="{
                'bg-emerald-500/5 border-emerald-500/30': step.state === 'completed',
                'bg-amber-500/5 border-amber-500/35 ring-1 ring-amber-500/20 shadow-xs': step.state === 'current',
                'bg-brand-light/40 border-brand-gray/15 opacity-80': step.state === 'pending',
                'bg-red-500/5 border-red-500/30': step.state === 'rejected'
              }"
            >
              <!-- Card Header -->
              <div class="flex flex-wrap items-center justify-between gap-2">
                <div class="flex items-center gap-2">
                  <span class="font-black text-sm text-brand-dark">
                    المرحلة {{ step.stepOrder }}: {{ step.stepName }}
                  </span>
                  <span
                    v-if="step.userGroupName"
                    class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-brand-soft text-brand-accent border border-brand-accent/25"
                  >
                    مجموعة: {{ step.userGroupName }}
                  </span>
                </div>

                <!-- State Badge -->
                <span
                  class="px-2.5 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1"
                  :class="{
                    'bg-emerald-500/10 text-emerald-700 border-emerald-500/30': step.state === 'completed',
                    'bg-amber-500/10 text-amber-700 border-amber-500/30': step.state === 'current',
                    'bg-slate-200 dark:bg-slate-800 text-slate-600 border-slate-300': step.state === 'pending',
                    'bg-red-500/10 text-red-600 border-red-500/30': step.state === 'rejected'
                  }"
                >
                  <Check v-if="step.state === 'completed'" class="w-3 h-3 text-emerald-600" />
                  <Clock v-else-if="step.state === 'current'" class="w-3 h-3 text-amber-600" />
                  <span>{{ step.statusLabel }}</span>
                </span>
              </div>

              <!-- 1. COMPLETED: Show who accepted with checkmark beside their name -->
              <div v-if="step.state === 'completed'" class="mt-2.5 p-2 rounded-xl bg-brand-white border border-emerald-500/20 text-xs">
                <div class="flex flex-wrap items-center justify-between gap-2">
                  <div class="flex items-center gap-1.5 font-bold text-brand-dark">
                    <span class="text-brand-gray text-[11px]">المعتمد:</span>
                    <span class="text-emerald-700 text-sm font-black">{{ step.approverPersonName }}</span>
                    <span v-if="step.approverMilitary" class="font-mono text-[11px] text-brand-gray">
                      (عسكري: {{ step.approverMilitary }})
                    </span>
                    <span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[11px] shadow-xs">
                      ✔
                    </span>
                  </div>
                  <span v-if="step.actionDate" class="font-mono text-[10px] text-brand-gray">
                    {{ formatDate(step.actionDate) }}
                  </span>
                </div>
                <p v-if="step.notes" class="text-[11px] text-brand-gray mt-1 italic">
                  "{{ step.notes }}"
                </p>
              </div>

              <!-- 2. CURRENT (PENDING): Show who SHOULD accept this step -->
              <div v-else-if="step.state === 'current'" class="mt-2.5 space-y-2">
                <div class="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25">
                  <span class="text-[11px] font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                    <Clock class="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    الطلب متوقف هنا حالياً — الأشخاص المخولون بالاعتماد في هذه الخطوة:
                  </span>

                  <!-- List of eligible users who SHOULD accept -->
                  <div v-if="step.eligibleUsers && step.eligibleUsers.length > 0" class="flex flex-wrap gap-1.5 mt-2">
                    <div
                      v-for="u in step.eligibleUsers"
                      :key="u.militaryNumber"
                      class="px-2.5 py-1 rounded-xl bg-brand-white border border-amber-500/30 text-brand-dark font-bold text-xs flex items-center gap-1.5 shadow-2xs"
                    >
                      <UserCheck class="w-3.5 h-3.5 text-amber-600" />
                      <span>{{ u.personName || u.username }}</span>
                      <span class="font-mono text-[10px] text-brand-gray font-normal">({{ u.militaryNumber }})</span>
                    </div>
                  </div>
                  <div v-else class="text-[11px] text-amber-800 mt-1 font-semibold">
                    أعضاء مجموعة ({{ step.userGroupName || 'المعتمدين' }})
                  </div>
                </div>
              </div>

              <!-- 3. PENDING (FUTURE): Step not reached yet -->
              <div v-else-if="step.state === 'pending'" class="mt-2 text-[11px] text-brand-gray flex items-center gap-1.5">
                <AlertCircle class="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>لم يتم الوصول لهذه المرحلة بعد — بانتظار استكمال الخطوات السابقة.</span>
                <span v-if="step.eligibleUsers && step.eligibleUsers.length > 0" class="text-[10px] opacity-75">
                  (المكلفون: {{ step.eligibleUsers.map(u => u.personName || u.username).join('، ') }})
                </span>
              </div>

              <!-- 4. REJECTED: Show rejection details -->
              <div v-else-if="step.state === 'rejected'" class="mt-2.5 p-2 rounded-xl bg-red-500/10 border border-red-500/25 text-xs text-red-700">
                <div class="flex items-center gap-1.5 font-bold">
                  <X class="w-4 h-4 text-red-600" />
                  <span>تم رفض الطلب بواسطة: {{ step.approverPersonName }}</span>
                  <span v-if="step.approverMilitary" class="font-mono text-[10px]">({{ step.approverMilitary }})</span>
                </div>
                <p v-if="step.notes" class="text-[11px] mt-1 font-semibold">
                  سبب الرفض: "{{ step.notes }}"
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="flex items-center justify-between pt-3 border-t border-brand-gray/10">
        <div class="text-[11px] text-brand-gray flex items-center gap-1.5">
          <ShieldCheck class="w-4 h-4 text-brand-accent" />
          <span>مسار موثق ومحمى بصلاحيات المجموعات والأرقام العسكرية</span>
        </div>
        <SecondaryButton type="button" @click="visible = false">
          إغلاق النافذة
        </SecondaryButton>
      </div>
    </div>
  </Dialog>
</template>

<script setup>
import { computed } from "vue";
import { useOhdaApprovalConfigStore } from "../stores/useOhdaApprovalConfigStore";
import {
  GitMerge,
  Check,
  X,
  Clock,
  UserCheck,
  AlertCircle,
  ShieldCheck
} from "lucide-vue-next";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  request: {
    type: Object,
    default: null
  },
  requestType: {
    type: String,
    default: "exit" // 'exit' or 'entry'
  }
});

const emit = defineEmits(["update:modelValue"]);

const approvalConfigStore = useOhdaApprovalConfigStore();

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val)
});

const requestItem = computed(() => props.request);
const isExit = computed(() => props.requestType === "exit");

const modalTitle = computed(() => {
  if (!requestItem.value) return "مسار التصديقات والاعتمادات";
  const typeLabel = isExit.value ? "طلب صرف العهدة" : "طلب توريد المخزون";
  return `مسار التصديقات والاعتمادات: ${typeLabel} #${requestItem.value.id}`;
});

const requesterName = computed(() => {
  const r = requestItem.value;
  if (!r) return "مستخدم";
  return r.requestedByPersonName || r.receivedByPersonName || r.personName || r.requestedByUsername || r.receivedByUsername || r.username || "مقدم الطلب";
});

const requesterMilitary = computed(() => {
  const r = requestItem.value;
  if (!r) return null;
  return r.requestedByUserId || r.receivedByUserId || r.militaryNumber || null;
});

const partyName = computed(() => {
  const r = requestItem.value;
  if (!r) return "-";
  return r.recipientName || r.sourceName || r.fromSource || "-";
});

const departmentOrSource = computed(() => {
  const r = requestItem.value;
  if (!r) return "";
  return r.departmentName || r.invoiceNumber || "";
});

// Dynamic steps computation based on configured workflow + approval trail
const computedSteps = computed(() => {
  if (!requestItem.value) return [];
  const req = requestItem.value;

  // 1. Parse trail records from backend
  let trailRecords = [];
  if (req.approvalTrail) {
    try {
      const parsed = typeof req.approvalTrail === "string" ? JSON.parse(req.approvalTrail) : req.approvalTrail;
      if (Array.isArray(parsed)) trailRecords = parsed;
    } catch (_) {}
  }

  // 2. Fetch configured steps for this request type
  const targetReqType = isExit.value ? 2 : 1;
  const rawConfigs = (approvalConfigStore.configs || [])
    .filter(c => c.requestType === targetReqType && c.isActive && !c.isDeleted)
    .sort((a, b) => (a.stepOrder || 1) - (b.stepOrder || 1));

  // If no configs loaded, provide fallback 2-step flow
  const configs = rawConfigs.length > 0 ? rawConfigs : [
    {
      stepOrder: 1,
      stepName: isExit.value ? "مقدم طلب الصرف" : "مقدم الطلب والتوريد",
      workflowRole: 1,
      userGroupName: "أمين عهدة",
      eligibleUsers: []
    },
    {
      stepOrder: 2,
      stepName: isExit.value ? "الاعتماد النهائي والتوثيق المستودعي" : "الاعتماد النهائي والتسكين",
      workflowRole: 3,
      userGroupName: "مدير الفرع",
      eligibleUsers: []
    }
  ];

  const isRejected = (req.status === 4);
  const isFullyApproved = (req.status === 2 || req.status === 5 || (req.status === 3 && req.isRequesterConfirmed));
  const currentStepNum = req.currentStep || (isFullyApproved ? 99 : 2);

  return configs.map((cfg, index) => {
    const stepOrder = cfg.stepOrder || (index + 1);
    const stepName = cfg.stepName || `المرحلة ${stepOrder}`;

    // Find record in trail
    const record = trailRecords.find(r => (r.StepOrder === stepOrder || r.stepOrder === stepOrder));

    let state = "pending";
    let statusLabel = "في الانتظار";

    if (record) {
      const action = (record.Action || record.action || "").toLowerCase();
      if (action === "rejected") {
        state = "rejected";
        statusLabel = "تم الرفض ✖";
      } else {
        state = "completed";
        statusLabel = stepOrder === 1 ? "تم التقديم والإنشاء ✔" : "تم الاعتماد والتصديق ✔";
      }
    } else if (isRejected && stepOrder >= currentStepNum) {
      state = "rejected";
      statusLabel = "ملغى للرفض";
    } else if (isFullyApproved) {
      state = "completed";
      statusLabel = "معتمد بالكامل ✔";
    } else if (stepOrder === currentStepNum) {
      state = "current";
      statusLabel = "بانتظار التصديق ⏳";
    } else if (stepOrder < currentStepNum) {
      state = "completed";
      statusLabel = "تم الاعتماد ✔";
    }

    const approverPersonName = record?.PersonName || record?.personName || record?.UserName || record?.userName || (stepOrder === 1 ? requesterName.value : "المعتمد");
    const approverMilitary = record?.MilitaryNumber || record?.militaryNumber || record?.UserId || record?.userId || (stepOrder === 1 ? requesterMilitary.value : null);
    const actionDate = record?.Date || record?.date || (stepOrder === 1 ? req.insertDate : null);
    const notes = record?.Notes || record?.notes || (stepOrder === 1 ? (req.purpose || req.notes) : null);

    return {
      stepOrder,
      stepName,
      userGroupName: cfg.userGroupName,
      eligibleUsers: cfg.eligibleUsers || [],
      state,
      statusLabel,
      approverPersonName,
      approverMilitary,
      actionDate,
      notes
    };
  });
});

const currentStatusLabel = computed(() => {
  if (!requestItem.value) return "";
  const r = requestItem.value;
  if (r.status === 4) return "مرفوض";
  if (r.status === 2 || r.status === 5) return "معتمد وموثق بالكامل";
  if (r.status === 3 && r.isRequesterConfirmed) return "معتمد وموثق بالكامل";
  if (r.currentStep) return `قيد المراجعة والاعتماد (مرحلة ${r.currentStep})`;
  return "قيد التدقيق والاعتماد";
});

const statusBadgeClass = computed(() => {
  if (!requestItem.value) return "";
  const r = requestItem.value;
  if (r.status === 4) return "bg-red-500/10 text-red-700 border-red-500/30";
  if (r.status === 2 || r.status === 5 || (r.status === 3 && r.isRequesterConfirmed)) return "bg-emerald-500/10 text-emerald-700 border-emerald-500/30";
  return "bg-amber-500/10 text-amber-700 border-amber-500/30";
});

const statusDotClass = computed(() => {
  if (!requestItem.value) return "";
  const r = requestItem.value;
  if (r.status === 4) return "bg-red-600";
  if (r.status === 2 || r.status === 5 || (r.status === 3 && r.isRequesterConfirmed)) return "bg-emerald-600";
  return "bg-amber-500 animate-ping";
});

function formatDate(dateStr) {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("ar-SA", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return dateStr;
  }
}
</script>
