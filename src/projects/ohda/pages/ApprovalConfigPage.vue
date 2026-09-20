<template>
  <div class="space-y-6">
    <!-- Header Card -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-brand-white p-6 rounded-2xl border border-brand-gray/10 shadow-sm">
      <div>
        <h1 class="text-2xl font-bold text-brand-dark flex items-center gap-3">
          <Settings class="w-7 h-7 text-brand-accent" />
          {{ $t('ohda.nav.approvalConfig') }}
        </h1>
        <p class="text-xs text-brand-gray mt-1">
          إدارة ومسارات الاعتماد لطلبات الإدخال والصرف، مع إمكانية تعديل ترتيب الخطوات وإسناد المجموعات
        </p>
      </div>

      <!-- Quick Actions -->
      <div class="flex items-center gap-3">
        <Button
          @click="openAssignGroupModal"
          class="!bg-brand-accent hover:!bg-brand-accent/90 !text-brand-dark !font-bold !rounded-xl !px-4 !py-2.5 !text-xs flex items-center gap-2 shadow-md shadow-brand-accent/10 cursor-pointer"
        >
          <Plus class="w-4 h-4" />
          إسناد مجموعة للخطوة الحالية
        </Button>
      </div>
    </div>

    <!-- Top Two Buttons: Entry vs Exit Requests -->
    <div class="bg-brand-white p-2 rounded-2xl border border-brand-gray/10 shadow-sm">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <!-- Entry Button -->
        <button
          type="button"
          @click="selectRequestType(1)"
          class="flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer text-start relative overflow-hidden group"
          :class="selectedRequestType === 1
            ? 'bg-blue-500/10 border-blue-500/40 shadow-sm ring-1 ring-blue-500/30'
            : 'bg-brand-light/50 border-brand-gray/15 hover:bg-brand-light hover:border-brand-gray/30 text-brand-dark'"
        >
          <div class="flex items-center gap-3.5">
            <div
              class="w-11 h-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105"
              :class="selectedRequestType === 1 ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'bg-brand-gray/10 text-brand-gray'"
            >
              <ArrowDownLeft class="w-5 h-5" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="font-extrabold text-sm sm:text-base text-brand-dark">طلبات إدخال المخزون</span>
                <span class="text-[11px] font-semibold text-blue-600 font-mono">(Entry Flow)</span>
              </div>
              <p class="text-[11px] text-brand-gray mt-0.5">مسار دورة الاعتماد للشحنات والتوريدات الجديدة</p>
            </div>
          </div>
          <div class="flex flex-col items-end gap-1 shrink-0">
            <span
              class="px-2.5 py-1 rounded-full text-[11px] font-bold border"
              :class="selectedRequestType === 1 ? 'bg-blue-600 text-white border-blue-600' : 'bg-brand-gray/10 text-brand-gray border-brand-gray/20'"
            >
              {{ entryConfigsCount }} مجموعة مسندة
            </span>
            <span v-if="selectedRequestType === 1" class="text-[10px] font-bold text-blue-700 flex items-center gap-1">
              <CheckCircle class="w-3 h-3 text-blue-600" />
              المسار النشط حالياً
            </span>
          </div>
        </button>

        <!-- Exit Button -->
        <button
          type="button"
          @click="selectRequestType(2)"
          class="flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer text-start relative overflow-hidden group"
          :class="selectedRequestType === 2
            ? 'bg-amber-500/10 border-amber-500/40 shadow-sm ring-1 ring-amber-500/30'
            : 'bg-brand-light/50 border-brand-gray/15 hover:bg-brand-light hover:border-brand-gray/30 text-brand-dark'"
        >
          <div class="flex items-center gap-3.5">
            <div
              class="w-11 h-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105"
              :class="selectedRequestType === 2 ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20' : 'bg-brand-gray/10 text-brand-gray'"
            >
              <ArrowUpRight class="w-5 h-5" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="font-extrabold text-sm sm:text-base text-brand-dark">طلبات صرف العهدة</span>
                <span class="text-[11px] font-semibold text-amber-600 font-mono">(Exit Flow)</span>
              </div>
              <p class="text-[11px] text-brand-gray mt-0.5">مسار دورة الاعتماد لصرف العهد والأصناف للمستفيدين</p>
            </div>
          </div>
          <div class="flex flex-col items-end gap-1 shrink-0">
            <span
              class="px-2.5 py-1 rounded-full text-[11px] font-bold border"
              :class="selectedRequestType === 2 ? 'bg-amber-600 text-white border-amber-600' : 'bg-brand-gray/10 text-brand-gray border-brand-gray/20'"
            >
              {{ exitConfigsCount }} مجموعة مسندة
            </span>
            <span v-if="selectedRequestType === 2" class="text-[10px] font-bold text-amber-700 flex items-center gap-1">
              <CheckCircle class="w-3 h-3 text-amber-600" />
              المسار النشط حالياً
            </span>
          </div>
        </button>
      </div>
    </div>

    <!-- Interactive Visual Stepper Flow (Updates automatically with reordered steps) -->
    <div class="bg-brand-white p-4 rounded-2xl border border-brand-gray/10 shadow-sm hidden md:block">
      <div class="flex items-center justify-between relative">
        <div class="absolute top-1/2 start-8 end-8 h-0.5 bg-brand-gray/15 -translate-y-1/2 z-0"></div>
        <div
          v-for="step in workflowSteps"
          :key="step.role"
          @click="selectWorkflowRole(step.role)"
          class="relative z-10 flex items-center gap-3 px-4 py-2 rounded-xl transition-all cursor-pointer select-none"
          :class="selectedWorkflowRole === step.role
            ? 'bg-brand-dark text-white shadow-md scale-105 ring-2 ring-brand-accent'
            : 'bg-brand-white hover:bg-brand-light text-brand-dark border border-brand-gray/15'"
        >
          <span
            class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 transition-all"
            :class="selectedWorkflowRole === step.role ? 'bg-brand-accent text-brand-dark' : 'bg-brand-gray/15 text-brand-dark'"
          >
            {{ step.stepNumber }}
          </span>
          <div>
            <div class="text-xs font-bold">{{ step.name }}</div>
            <div class="text-[10px] opacity-75">{{ getGroupsForStep(step.role).length }} مجموعات مسندة</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Side-by-Side Tables Grid (Master - Detail with Reordering) -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <!-- Right Side: Workflow Steps Table (Ordered Flow of the Request with Reorder Controls) -->
      <div class="lg:col-span-5 bg-brand-white rounded-2xl border border-brand-gray/10 shadow-sm overflow-hidden">
        <div class="p-4 border-b border-brand-gray/10 bg-brand-light/30 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full" :class="selectedRequestType === 1 ? 'bg-blue-600' : 'bg-amber-600'"></span>
            <h2 class="font-bold text-sm text-brand-dark">خطوات ومراحل دورة الاعتماد</h2>
          </div>
          <div class="flex items-center gap-2">
            <button
              v-if="isCustomOrder"
              @click="resetStepsOrder"
              type="button"
              class="text-[10px] text-brand-accent hover:underline font-bold cursor-pointer transition-colors"
              title="استعادة الترتيب القياسي الافتراضي"
            >
              استعادة الترتيب الافتراضي
            </button>
            <span class="text-[11px] font-semibold text-brand-gray">
              {{ selectedRequestType === 1 ? 'طلبات الإدخال' : 'طلبات الصرف' }}
            </span>
          </div>
        </div>

        <!-- Drag & Drop / Up-Down Steps List -->
        <div class="p-3 space-y-2.5">
          <div
            v-for="(step, index) in workflowSteps"
            :key="step.role"
            draggable="true"
            @dragstart="onDragStart($event, index)"
            @dragover.prevent="onDragOver($event, index)"
            @drop="onDrop($event, index)"
            @dragenter="dragOverIndex = index"
            @dragleave="dragOverIndex = null"
            @click="selectWorkflowRole(step.role)"
            class="p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between group relative select-none"
            :class="[
              selectedWorkflowRole === step.role
                ? 'bg-brand-soft/70 border-brand-accent shadow-sm ring-1 ring-brand-accent/40'
                : 'bg-brand-white border-brand-gray/15 hover:bg-brand-light/60 hover:border-brand-gray/30',
              dragOverIndex === index ? 'border-dashed border-2 border-brand-accent bg-brand-accent/10' : ''
            ]"
          >
            <div class="flex items-center gap-2.5 min-w-0">
              <!-- Reorder Up/Down Buttons + Grip Handle -->
              <div class="flex items-center gap-1 shrink-0" @click.stop>
                <div class="cursor-grab active:cursor-grabbing text-brand-gray/40 hover:text-brand-dark p-0.5" title="اسحب لتبديل الترتيب">
                  <GripVertical class="w-4 h-4" />
                </div>
                <div class="flex flex-col items-center gap-0.5 bg-brand-gray/5 p-1 rounded-md border border-brand-gray/10">
                  <button
                    type="button"
                    @click.stop="moveStepUp(index)"
                    :disabled="index === 0"
                    class="p-0.5 rounded hover:bg-brand-gray/20 text-brand-dark disabled:opacity-20 disabled:cursor-not-allowed transition-all cursor-pointer"
                    title="تقديم الخطوة للأعلى (تبديل الترتيب)"
                  >
                    <ChevronUp class="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    @click.stop="moveStepDown(index)"
                    :disabled="index === workflowSteps.length - 1"
                    class="p-0.5 rounded hover:bg-brand-gray/20 text-brand-dark disabled:opacity-20 disabled:cursor-not-allowed transition-all cursor-pointer"
                    title="تأخير الخطوة للأسفل (تبديل الترتيب)"
                  >
                    <ChevronDown class="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <!-- Step Number Badge (Reflects current order) -->
              <div
                class="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm transition-colors shrink-0"
                :class="selectedWorkflowRole === step.role ? 'bg-brand-accent text-brand-dark font-black' : 'bg-brand-gray/10 text-brand-gray'"
              >
                {{ step.stepNumber }}
              </div>

              <div class="min-w-0">
                <div class="flex items-center gap-2">
                  <h3 class="font-bold text-xs text-brand-dark group-hover:text-brand-accent transition-colors truncate">
                    {{ step.name }}
                  </h3>
                  <span class="px-1.5 py-0.5 rounded text-[10px] font-bold border shrink-0" :class="step.badgeClass">
                    {{ step.roleLabel }}
                  </span>
                </div>
                <p class="text-[11px] text-brand-gray mt-0.5 truncate">{{ step.description }}</p>
              </div>
            </div>

            <div class="flex items-center gap-2.5 shrink-0 ms-2">
              <span class="px-2 py-0.5 rounded-md text-[11px] font-bold bg-brand-gray/10 text-brand-dark font-mono">
                {{ getGroupsForStep(step.role).length }} مجموعات
              </span>
              <ChevronLeft
                class="w-4 h-4 transition-transform text-brand-gray"
                :class="selectedWorkflowRole === step.role ? 'text-brand-accent translate-x-1 font-bold' : 'group-hover:translate-x-0.5'"
              />
            </div>
          </div>
        </div>

        <div class="p-3 bg-brand-light/30 border-t border-brand-gray/10 text-[11px] text-brand-gray flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="font-semibold text-brand-accent">💡 تعديل الترتيب:</span>
            <span>استخدم أزرار الأسهم <span class="font-bold">▲ / ▼</span> أو اسحب بالماوس لتبديل الترتيب.</span>
          </div>
        </div>
      </div>

      <!-- Left Side: Assigned Groups Table for the Clicked Step with Order Adjustments -->
      <div class="lg:col-span-7 bg-brand-white rounded-2xl border border-brand-gray/10 shadow-sm overflow-hidden">
        <div class="p-4 border-b border-brand-gray/10 bg-brand-light/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div class="flex items-center gap-2">
              <span class="w-6 h-6 rounded-full bg-brand-accent/20 text-brand-accent font-black text-xs flex items-center justify-center">
                {{ currentStep?.stepNumber }}
              </span>
              <h2 class="font-bold text-sm text-brand-dark">
                المجموعات المسندة: <span class="text-brand-accent">{{ currentStep?.name }}</span>
              </h2>
            </div>
            <p class="text-[11px] text-brand-gray mt-0.5">
              المجموعات التالية مخولة بالقيام بهذه الخطوة في مسار
              <span class="font-bold text-brand-dark">{{ selectedRequestType === 1 ? 'إدخال المخزون' : 'صرف العهدة' }}</span>
            </p>
          </div>

          <Button
            @click="openAssignGroupModal"
            class="!bg-brand-accent hover:!bg-brand-accent/90 !text-brand-dark !font-bold !rounded-xl !px-3.5 !py-2 !text-xs flex items-center gap-1.5 shadow-sm shrink-0 cursor-pointer"
          >
            <Plus class="w-3.5 h-3.5" />
            إسناد مجموعة لهذه الخطوة
          </Button>
        </div>

        <!-- Assigned Groups List -->
        <div v-if="currentStepGroups.length > 0">
          <DataTable :value="currentStepGroups" class="w-full text-xs" :rows="10">
            <!-- Row Reorder Buttons for Groups -->
            <Column header="الترتيب" style="width: 75px">
              <template #body="{ index }">
                <div class="flex items-center gap-1">
                  <span class="font-mono text-brand-gray text-[11px] w-4 text-center font-bold">{{ index + 1 }}</span>
                  <div class="flex flex-col items-center">
                    <button
                      type="button"
                      @click="moveGroupUp(index)"
                      :disabled="index === 0"
                      class="p-0.5 rounded hover:bg-brand-gray/15 text-brand-dark disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer transition-colors"
                      title="رفع أولوية المجموعة"
                    >
                      <ChevronUp class="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      @click="moveGroupDown(index)"
                      :disabled="index === currentStepGroups.length - 1"
                      class="p-0.5 rounded hover:bg-brand-gray/15 text-brand-dark disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer transition-colors"
                      title="خفض أولوية المجموعة"
                    >
                      <ChevronDown class="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </template>
            </Column>

            <Column header="مجموعة المستخدمين (User Group)">
              <template #body="{ data }">
                <div class="flex items-center gap-2">
                  <div class="w-7 h-7 rounded-lg bg-brand-gray/10 flex items-center justify-center text-brand-dark shrink-0">
                    <Users class="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span class="font-bold text-brand-dark block text-xs">
                      {{ data.userGroupName || getUserGroupName(data.userGroupId) }}
                    </span>
                    <span class="text-[10px] text-brand-gray block">
                      {{ getGroupDescription(data.userGroupId) }}
                    </span>
                  </div>
                </div>
              </template>
            </Column>

            <Column header="حالة التفعيل" style="width: 120px">
              <template #body="{ data }">
                <button
                  type="button"
                  @click="toggleConfigActive(data)"
                  class="px-2.5 py-1 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 border transition-all cursor-pointer"
                  :class="data.isActive
                    ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20 hover:bg-emerald-500/20'
                    : 'bg-red-500/10 text-red-700 border-red-500/20 hover:bg-red-500/20'"
                  :title="data.isActive ? 'اضغط لتعطيل الإسناد' : 'اضغط لتفعيل الإسناد'"
                >
                  <span class="w-1.5 h-1.5 rounded-full" :class="data.isActive ? 'bg-emerald-500' : 'bg-red-500'"></span>
                  {{ data.isActive ? 'نشط' : 'معطل' }}
                </button>
              </template>
            </Column>

            <Column :header="$t('ohda.common.actions')" style="width: 90px">
              <template #body="{ data }">
                <div class="flex items-center justify-center gap-2">
                  <editButton @click="openEditApprovalConfigModal(data)" title="تعديل الإسناد" />
                  <deleteButton @click="deleteApprovalConfig(data.id)" title="إلغاء إسناد المجموعة" />
                </div>
              </template>
            </Column>
          </DataTable>
        </div>

        <!-- Empty State for Step -->
        <div v-else class="p-12 text-center flex flex-col items-center justify-center">
          <div class="w-14 h-14 rounded-2xl bg-brand-light flex items-center justify-center text-brand-gray mb-3 border border-brand-gray/10">
            <Users class="w-7 h-7" />
          </div>
          <h3 class="font-bold text-sm text-brand-dark">لا توجد مجموعات مسندة لهذه الخطوة</h3>
          <p class="text-xs text-brand-gray max-w-sm mt-1 mb-4">
            لم يتم تعيين أي مجموعة مستخدمين لتنفيذ
            <span class="font-semibold text-brand-dark">({{ currentStep?.name }})</span>
            في مسار {{ selectedRequestType === 1 ? 'إدخال المخزون' : 'صرف العهدة' }}.
          </p>
          <Button
            @click="openAssignGroupModal"
            class="!bg-brand-accent hover:!bg-brand-accent/90 !text-brand-dark !font-bold !rounded-xl !px-4 !py-2 !text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus class="w-4 h-4" />
            إسناد مجموعة الآن
          </Button>
        </div>
      </div>
    </div>

    <!-- Assign / Edit Group Modal -->
    <Dialog
      v-model:visible="showAssignModal"
      modal
      :header="isEditing ? 'تعديل إسناد المجموعة' : `إسناد مجموعة مستخدمين — ${currentStep?.name}`"
      class="!bg-brand-white !border-brand-gray/15 max-w-md w-full !text-brand-dark"
    >
      <form @submit.prevent="saveAssignment" class="space-y-4 text-xs pt-2">
        <!-- Locked Context Tags -->
        <div class="p-3 rounded-xl bg-brand-light/60 border border-brand-gray/15 flex items-center justify-between">
          <div>
            <span class="text-[10px] text-brand-gray block">نوع المسار:</span>
            <span class="font-bold text-xs" :class="selectedRequestType === 1 ? 'text-blue-700' : 'text-amber-700'">
              {{ selectedRequestType === 1 ? 'إدخال المخزون (Entry)' : 'صرف العهدة (Exit)' }}
            </span>
          </div>
          <div>
            <span class="text-[10px] text-brand-gray block text-end">الخطوة المستهدفة:</span>
            <span class="font-bold text-xs text-brand-dark text-end block">
              الخطوة {{ currentStep?.stepNumber }}: {{ currentStep?.name }}
            </span>
          </div>
        </div>

        <div>
          <label class="block font-semibold text-brand-dark mb-1">
            اختر مجموعة المستخدمين (User Group) <span class="text-red-500">*</span>
          </label>
          <Select
            v-model="assignForm.userGroupId"
            :options="availableGroupOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="اختر مجموعة من القائمة..."
            class="w-full !bg-brand-light !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark"
          />
          <p v-if="availableGroupOptions.length === 0" class="text-[11px] text-amber-600 mt-1">
            جميع المجموعات المتاحة تم إسنادها بالفعل لهذه الخطوة.
          </p>
        </div>

        <div class="flex items-center gap-2 py-2">
          <Checkbox v-model="assignForm.isActive" :binary="true" inputId="configIsActiveCheck" class="w-5 h-5" />
          <label for="configIsActiveCheck" class="font-semibold text-brand-dark select-none cursor-pointer">
            تفعيل هذه المجموعة في مسار الاعتماد
          </label>
        </div>

        <div class="flex items-center justify-end gap-3 pt-3 border-t border-brand-gray/10">
          <SecondaryButton type="button" @click="showAssignModal = false">
            {{ $t('ohda.common.cancel') }}
          </SecondaryButton>
          <Button
            type="submit"
            :disabled="!assignForm.userGroupId"
            class="!bg-brand-accent hover:!bg-brand-accent/90 !text-brand-dark !font-bold disabled:opacity-50 cursor-pointer"
          >
            {{ isEditing ? 'حفظ التعديلات' : 'إسناد المجموعة' }}
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

// Selected States
const selectedRequestType = ref(1); // 1 = Entry, 2 = Exit
const selectedWorkflowRole = ref(1); // 1 = Requester, 2 = Reviewer, 3 = Approver

// Modal states
const showAssignModal = ref(false);
const isEditing = ref(false);
const editingId = ref(null);

const assignForm = ref({
  userGroupId: null,
  isActive: true
});

// Storage keys for custom ordering
const STORAGE_KEY_ENTRY = "ohda_approval_steps_order_entry";
const STORAGE_KEY_EXIT = "ohda_approval_steps_order_exit";
const STORAGE_KEY_GROUPS = "ohda_custom_group_order";

// Base templates for the 3 steps
const baseSteps = [
  {
    role: 1,
    name: "مقدم الطلب (Requester)",
    roleLabel: "مقدم الطلب",
    badgeClass: "bg-slate-500/10 text-slate-700 border-slate-500/20",
    descriptionEntry: "تجهيز وإنشاء طلب إدخال وتوريد المنتجات للمستودع",
    descriptionExit: "إنشاء وتقديم طلب صرف العهدة وتحديد الأصناف المطلوبة"
  },
  {
    role: 2,
    name: "المراجعة والتدقيق (Reviewer)",
    roleLabel: "مراجعة ومدير",
    badgeClass: "bg-teal-500/10 text-teal-700 border-teal-500/20",
    descriptionEntry: "مراجعة بنود وفواتير التوريد والتحقق الفني والإداري",
    descriptionExit: "مراجعة طلب الصرف والتأكد من استحقاق القسم والأصناف"
  },
  {
    role: 3,
    name: "الاعتماد النهائي (Approver)",
    roleLabel: "اعتماد ومشرف",
    badgeClass: "bg-purple-500/10 text-purple-700 border-purple-500/20",
    descriptionEntry: "الموافقة الرسمية النهائية وإضافة الأصناف فعلياً لرصيد المخزون",
    descriptionExit: "المصادقة النهائية وتحديث حركة الصرف وإنشاء وثيقة التسليم"
  }
];

// Stored order of roles: e.g. [1, 2, 3] or [1, 3, 2]
const entryOrder = ref([1, 2, 3]);
const exitOrder = ref([1, 2, 3]);
const customGroupOrder = ref({});

// Drag and drop tracking
const draggedIndex = ref(null);
const dragOverIndex = ref(null);

onMounted(async () => {
  loadOrderFromStorage();
  await Promise.all([
    groupStore.fetchUserGroups(),
    approvalConfigStore.fetchApprovalConfigs()
  ]);
});

function loadOrderFromStorage() {
  try {
    const savedEntry = localStorage.getItem(STORAGE_KEY_ENTRY);
    if (savedEntry) entryOrder.value = JSON.parse(savedEntry);

    const savedExit = localStorage.getItem(STORAGE_KEY_EXIT);
    if (savedExit) exitOrder.value = JSON.parse(savedExit);

    const savedGroupOrder = localStorage.getItem(STORAGE_KEY_GROUPS);
    if (savedGroupOrder) customGroupOrder.value = JSON.parse(savedGroupOrder);
  } catch (_) {}
}

function saveStepsOrder() {
  try {
    if (selectedRequestType.value === 1) {
      localStorage.setItem(STORAGE_KEY_ENTRY, JSON.stringify(entryOrder.value));
    } else {
      localStorage.setItem(STORAGE_KEY_EXIT, JSON.stringify(exitOrder.value));
    }
  } catch (_) {}
}

const currentOrder = computed({
  get: () => (selectedRequestType.value === 1 ? entryOrder.value : exitOrder.value),
  set: (val) => {
    if (selectedRequestType.value === 1) {
      entryOrder.value = val;
    } else {
      exitOrder.value = val;
    }
    saveStepsOrder();
  }
});

const isCustomOrder = computed(() => {
  return JSON.stringify(currentOrder.value) !== JSON.stringify([1, 2, 3]);
});

function resetStepsOrder() {
  currentOrder.value = [1, 2, 3];
}

// Dynamically mapped workflow steps based on the current order
const workflowSteps = computed(() => {
  return currentOrder.value.map((roleId, idx) => {
    const base = baseSteps.find(s => s.role === roleId) || baseSteps[0];
    return {
      ...base,
      stepNumber: idx + 1,
      description: selectedRequestType.value === 1 ? base.descriptionEntry : base.descriptionExit
    };
  });
});

const currentStep = computed(() => {
  return workflowSteps.value.find(s => s.role === selectedWorkflowRole.value) || workflowSteps.value[0];
});

// Move Step Up
function moveStepUp(index) {
  if (index <= 0) return;
  const arr = [...currentOrder.value];
  const temp = arr[index];
  arr[index] = arr[index - 1];
  arr[index - 1] = temp;
  currentOrder.value = arr;
}

// Move Step Down
function moveStepDown(index) {
  if (index >= currentOrder.value.length - 1) return;
  const arr = [...currentOrder.value];
  const temp = arr[index];
  arr[index] = arr[index + 1];
  arr[index + 1] = temp;
  currentOrder.value = arr;
}

// Drag & Drop handlers for steps
function onDragStart(e, index) {
  draggedIndex.value = index;
  e.dataTransfer.effectAllowed = "move";
}

function onDragOver(e, index) {
  dragOverIndex.value = index;
}

function onDrop(e, targetIndex) {
  if (draggedIndex.value === null || draggedIndex.value === targetIndex) {
    draggedIndex.value = null;
    dragOverIndex.value = null;
    return;
  }
  const arr = [...currentOrder.value];
  const item = arr.splice(draggedIndex.value, 1)[0];
  arr.splice(targetIndex, 0, item);
  currentOrder.value = arr;
  draggedIndex.value = null;
  dragOverIndex.value = null;
}

// Filter configs for current requestType and current step (role)
const currentStepGroups = computed(() => {
  const configs = approvalConfigStore.configs.filter(c => 
    c.requestType === selectedRequestType.value && 
    c.workflowRole === selectedWorkflowRole.value
  );

  const groupKey = `${selectedRequestType.value}_${selectedWorkflowRole.value}`;
  const savedOrder = customGroupOrder.value[groupKey];
  if (Array.isArray(savedOrder) && savedOrder.length > 0) {
    return [...configs].sort((a, b) => {
      const idxA = savedOrder.indexOf(a.id);
      const idxB = savedOrder.indexOf(b.id);
      if (idxA === -1 && idxB === -1) return 0;
      if (idxA === -1) return 1;
      if (idxB === -1) return -1;
      return idxA - idxB;
    });
  }
  return configs;
});

// Group reorder functions inside the selected step
function moveGroupUp(index) {
  if (index <= 0) return;
  const list = [...currentStepGroups.value];
  const temp = list[index];
  list[index] = list[index - 1];
  list[index - 1] = temp;

  const groupKey = `${selectedRequestType.value}_${selectedWorkflowRole.value}`;
  customGroupOrder.value = {
    ...customGroupOrder.value,
    [groupKey]: list.map(c => c.id)
  };
  try {
    localStorage.setItem(STORAGE_KEY_GROUPS, JSON.stringify(customGroupOrder.value));
  } catch (_) {}
}

function moveGroupDown(index) {
  if (index >= currentStepGroups.value.length - 1) return;
  const list = [...currentStepGroups.value];
  const temp = list[index];
  list[index] = list[index + 1];
  list[index + 1] = temp;

  const groupKey = `${selectedRequestType.value}_${selectedWorkflowRole.value}`;
  customGroupOrder.value = {
    ...customGroupOrder.value,
    [groupKey]: list.map(c => c.id)
  };
  try {
    localStorage.setItem(STORAGE_KEY_GROUPS, JSON.stringify(customGroupOrder.value));
  } catch (_) {}
}

// Total counts for the 2 main top buttons
const entryConfigsCount = computed(() => {
  return approvalConfigStore.configs.filter(c => c.requestType === 1).length;
});

const exitConfigsCount = computed(() => {
  return approvalConfigStore.configs.filter(c => c.requestType === 2).length;
});

function getGroupsForStep(role) {
  return approvalConfigStore.configs.filter(c => 
    c.requestType === selectedRequestType.value && 
    c.workflowRole === role
  );
}

function selectRequestType(type) {
  selectedRequestType.value = type;
}

function selectWorkflowRole(role) {
  selectedWorkflowRole.value = role;
}

function getUserGroupName(groupId) {
  if (!groupId) return "غير محدد";
  const g = groupStore.groups.find(x => x.id === groupId);
  return g ? g.name : `مجموعة #${groupId}`;
}

function getGroupDescription(groupId) {
  if (!groupId) return "";
  const g = groupStore.groups.find(x => x.id === groupId);
  return g?.description || "مجموعة صلاحيات";
}

// Available Groups for Modal Dropdown (exclude already assigned)
const availableGroupOptions = computed(() => {
  const assignedIds = currentStepGroups.value
    .filter(c => !isEditing.value || c.id !== editingId.value)
    .map(c => c.userGroupId);

  return groupStore.groups
    .filter(g => !assignedIds.includes(g.id))
    .map(g => ({
      value: g.id,
      label: `${g.name} — (${g.description || 'مجموعة صلاحيات'})`
    }));
});

function openAssignGroupModal() {
  isEditing.value = false;
  editingId.value = null;
  assignForm.value = {
    userGroupId: availableGroupOptions.value[0]?.value || null,
    isActive: true
  };
  showAssignModal.value = true;
}

function openEditApprovalConfigModal(config) {
  isEditing.value = true;
  editingId.value = config.id;
  assignForm.value = {
    userGroupId: config.userGroupId,
    isActive: config.isActive
  };
  showAssignModal.value = true;
}

async function saveAssignment() {
  if (!assignForm.value.userGroupId) return;

  const payload = {
    requestType: selectedRequestType.value,
    workflowRole: selectedWorkflowRole.value,
    userGroupId: assignForm.value.userGroupId,
    isActive: assignForm.value.isActive
  };

  if (isEditing.value && editingId.value) {
    await approvalConfigStore.updateApprovalConfig(editingId.value, payload);
  } else {
    await approvalConfigStore.createApprovalConfig(payload);
  }

  showAssignModal.value = false;
}

async function toggleConfigActive(config) {
  await approvalConfigStore.updateApprovalConfig(config.id, {
    requestType: config.requestType,
    workflowRole: config.workflowRole,
    userGroupId: config.userGroupId,
    isActive: !config.isActive
  });
}

async function deleteApprovalConfig(id) {
  if (confirm("هل أنت متأكد من رغبتك في إلغاء إسناد هذه المجموعة من هذه الخطوة؟")) {
    await approvalConfigStore.deleteApprovalConfig(id);
  }
}
</script>
