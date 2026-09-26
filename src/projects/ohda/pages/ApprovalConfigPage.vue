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
          إدارة ومسارات الاعتماد المرنة لطلبات الإدخال والصرف، مع إمكانية إضافة وحذف الخطوات بمسميات مخصصة وإسناد المجموعات
        </p>
      </div>

      <!-- Quick Actions -->
      <div class="flex items-center gap-3">
        <Button
          @click="openAddStepModal"
          class="!bg-brand-accent hover:!bg-brand-accent/90 !text-brand-dark !font-bold !rounded-xl !px-4 !py-2.5 !text-xs flex items-center gap-2 shadow-md shadow-brand-accent/10 cursor-pointer"
        >
          <Plus class="w-4 h-4" />
          إضافة خطوة جديدة في المسار
        </Button>
      </div>
    </div>

    <!-- Master Approval Flow Settings Card (Toggle Button for Direct Execution vs Workflow) -->
    <div class="bg-brand-white p-5 rounded-2xl border border-brand-gray/10 shadow-sm space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="flex items-start sm:items-center gap-3.5">
          <div
            class="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300"
            :class="isCurrentFlowEnabled ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'"
          >
            <ShieldCheck v-if="isCurrentFlowEnabled" class="w-6 h-6" />
            <ZapOff v-else class="w-6 h-6" />
          </div>
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <h2 class="font-bold text-sm sm:text-base text-brand-dark">
                دورة الاعتماد والموافقات:
                <span :class="selectedRequestType === 1 ? 'text-blue-600' : 'text-amber-600'">
                  {{ selectedRequestType === 1 ? 'طلبات الإدخال والتوريد (Entry Flow)' : 'طلبات الصرف (Exit Flow)' }}
                </span>
              </h2>
              <span
                class="px-2.5 py-0.5 rounded-full text-[11px] font-bold border transition-colors"
                :class="isCurrentFlowEnabled
                  ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-700 border-amber-500/30'"
              >
                {{ isCurrentFlowEnabled ? 'دورة الموافقات مفعّلة' : 'صرف/توريد مباشر وفوري (بدون دورة)' }}
              </span>
            </div>
            <p class="text-xs text-brand-gray mt-1 leading-relaxed">
              <span v-if="isCurrentFlowEnabled">
                عند تفعيل الدورة، يتطلب كل طلب المرور بالمراحل والمجموعات المحددة أدناه قبل توثيقه النهائي بالمخزون.
              </span>
              <span v-else class="text-amber-700 font-semibold">
                نمط الصاحب / المشرف المباشر: أي طلب يتم إنشاؤه يتم اعتماده وتسكينه/صرفه فورياً وتحديث الأرفف والمخزن تلقائياً بدون لجان موافقة.
              </span>
            </p>
          </div>
        </div>

        <!-- Master Toggle Switch Switcher -->
        <div class="flex items-center gap-3 bg-brand-light/90 px-4 py-2.5 rounded-xl border border-brand-gray/15 shrink-0 self-start sm:self-auto shadow-sm">
          <div class="text-end">
            <span class="text-xs font-bold text-brand-dark block select-none">
              {{ isCurrentFlowEnabled ? 'دورة الاعتماد نشطة' : 'تنفيذ مباشر فوري' }}
            </span>
            <span class="text-[10px] text-brand-gray block">
              {{ isCurrentFlowEnabled ? 'مراحل مخصصة' : 'بدون لجان' }}
            </span>
          </div>
          <ToggleSwitch v-model="isCurrentFlowEnabled" />
        </div>
      </div>

      <!-- Warning Alert Banner when Flow is Disabled -->
      <div
        v-if="!isCurrentFlowEnabled"
        class="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-800"
      >
        <div class="flex items-center gap-3">
          <Info class="w-5 h-5 text-amber-600 shrink-0" />
          <div class="leading-relaxed">
            <strong class="font-bold">تنبيه وضع التنفيذ الفوري النشط:</strong>
            تم إيقاف دورة الاعتماد لهذا المسار. سيتم اعتماد أي طلب جديد وحسم/إضافة كمياته في المخزن ورفوف المستودع مباشرة بمجرد إنشائه.
          </div>
        </div>
        <button
          type="button"
          @click="isCurrentFlowEnabled = true"
          class="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] whitespace-nowrap cursor-pointer transition-colors shadow-sm self-start sm:self-auto"
        >
          إعادة تفعيل المسار
        </button>
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
          <div class="flex flex-col items-end gap-1.5 shrink-0">
            <div class="flex items-center gap-1.5">
              <span
                class="px-2 py-0.5 rounded-full text-[10px] font-bold border"
                :class="entryFlowEnabled
                  ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-700 border-amber-500/30'"
              >
                {{ entryFlowEnabled ? 'دورة نشطة' : 'فوري مباشر' }}
              </span>
              <span
                class="px-2.5 py-1 rounded-full text-[11px] font-bold border"
                :class="selectedRequestType === 1 ? 'bg-blue-600 text-white border-blue-600' : 'bg-brand-gray/10 text-brand-gray border-brand-gray/20'"
              >
                {{ entrySteps.length }} خطوات ({{ entryConfigsCount }} مجموعة)
              </span>
            </div>
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
          <div class="flex flex-col items-end gap-1.5 shrink-0">
            <div class="flex items-center gap-1.5">
              <span
                class="px-2 py-0.5 rounded-full text-[10px] font-bold border"
                :class="exitFlowEnabled
                  ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-700 border-amber-500/30'"
              >
                {{ exitFlowEnabled ? 'دورة نشطة' : 'فوري مباشر' }}
              </span>
              <span
                class="px-2.5 py-1 rounded-full text-[11px] font-bold border"
                :class="selectedRequestType === 2 ? 'bg-amber-600 text-white border-amber-600' : 'bg-brand-gray/10 text-brand-gray border-brand-gray/20'"
              >
                {{ exitSteps.length }} خطوات ({{ exitConfigsCount }} مجموعة)
              </span>
            </div>
            <span v-if="selectedRequestType === 2" class="text-[10px] font-bold text-amber-700 flex items-center gap-1">
              <CheckCircle class="w-3 h-3 text-amber-600" />
              المسار النشط حالياً
            </span>
          </div>
        </button>
      </div>
    </div>

    <!-- Interactive Visual Stepper Flow (Updates automatically with custom generic steps) -->
    <div class="bg-brand-white p-4 rounded-2xl border border-brand-gray/10 shadow-sm hidden md:block">
      <div v-if="activeSteps.length === 0" class="p-6 text-center text-brand-gray text-xs">
        <p class="font-semibold text-amber-600 mb-2">لا توجد خطوات محددة لهذا المسار حالياً.</p>
        <Button
          @click="openAddStepModal"
          class="!bg-brand-accent hover:!bg-brand-accent/90 !text-brand-dark !font-bold !rounded-xl !px-4 !py-2 !text-xs inline-flex items-center gap-2 cursor-pointer"
        >
          <Plus class="w-4 h-4" />
          إضافة أول خطوة في المسار
        </Button>
      </div>
      <div v-else class="flex items-center justify-between relative overflow-x-auto py-2">
        <div class="absolute top-1/2 start-8 end-8 h-0.5 bg-brand-gray/15 -translate-y-1/2 z-0"></div>
        <div
          v-for="(step, idx) in activeSteps"
          :key="step.id"
          @click="selectStep(step.id)"
          class="relative z-10 flex items-center gap-3 px-4 py-2 rounded-xl transition-all cursor-pointer select-none shrink-0"
          :class="selectedStepId === step.id
            ? 'bg-brand-dark text-white shadow-md scale-105 ring-2 ring-brand-accent'
            : 'bg-brand-white hover:bg-brand-light text-brand-dark border border-brand-gray/15'"
        >
          <span
            class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 transition-all"
            :class="selectedStepId === step.id ? 'bg-brand-accent text-brand-dark' : 'bg-brand-gray/15 text-brand-dark'"
          >
            {{ idx + 1 }}
          </span>
          <div>
            <div class="text-xs font-bold truncate max-w-[130px]">{{ step.name }}</div>
            <div class="text-[10px] opacity-75">{{ getGroupsForStep(step).length }} مجموعات مسندة</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Side-by-Side Tables Grid (Master - Detail with Dynamic Generic Steps) -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <!-- Right Side: Workflow Steps Table (Generic steps with Add, Edit, Delete, Reorder) -->
      <div class="lg:col-span-5 bg-brand-white rounded-2xl border border-brand-gray/10 shadow-sm overflow-hidden">
        <div class="p-4 border-b border-brand-gray/10 bg-brand-light/30 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full" :class="selectedRequestType === 1 ? 'bg-blue-600' : 'bg-amber-600'"></span>
            <h2 class="font-bold text-sm text-brand-dark">خطوات ومراحل المسار</h2>
            <span class="text-[11px] font-mono px-2 py-0.5 rounded-md bg-brand-gray/10 text-brand-gray font-bold">
              {{ activeSteps.length }}
            </span>
          </div>

          <div class="flex items-center gap-2">
            <button
              @click="openAddStepModal"
              type="button"
              class="px-2.5 py-1 rounded-lg bg-brand-accent hover:bg-brand-accent/90 text-brand-dark text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all shadow-sm"
              title="إضافة خطوة جديدة للمسار"
            >
              <Plus class="w-3.5 h-3.5" />
              <span>إضافة خطوة</span>
            </button>
            <button
              @click="resetToDefaultSteps"
              type="button"
              class="text-[10px] text-brand-gray hover:text-brand-accent underline font-semibold cursor-pointer transition-colors"
              title="استعادة الخطوات الافتراضية"
            >
              استعادة الافتراضي
            </button>
          </div>
        </div>

        <!-- Dynamic Generic Steps List -->
        <div v-if="activeSteps.length === 0" class="p-8 text-center space-y-3">
          <div class="w-12 h-12 rounded-2xl bg-brand-gray/10 text-brand-gray flex items-center justify-center mx-auto">
            <Workflow class="w-6 h-6" />
          </div>
          <div>
            <h3 class="text-sm font-bold text-brand-dark">لا توجد أي خطوات في هذا المسار</h3>
            <p class="text-xs text-brand-gray mt-1">ابدأ بإضافة أول خطوة واعطها الاسم الذي تريده ثم أسند لها مجموعة</p>
          </div>
          <Button
            @click="openAddStepModal"
            class="!bg-brand-accent hover:!bg-brand-accent/90 !text-brand-dark !font-bold !rounded-xl !px-4 !py-2 !text-xs inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus class="w-4 h-4" />
            إضافة الخطوة الأولى
          </Button>
        </div>

        <div v-else class="p-3 space-y-2.5">
          <div
            v-for="(step, index) in activeSteps"
            :key="step.id"
            draggable="true"
            @dragstart="onDragStart($event, index)"
            @dragover.prevent="onDragOver($event, index)"
            @drop="onDrop($event, index)"
            @dragenter="dragOverIndex = index"
            @dragleave="dragOverIndex = null"
            @click="selectStep(step.id)"
            class="p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between group relative select-none"
            :class="[
              selectedStepId === step.id
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
                    title="تقديم الخطوة للأعلى"
                  >
                    <ChevronUp class="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    @click.stop="moveStepDown(index)"
                    :disabled="index === activeSteps.length - 1"
                    class="p-0.5 rounded hover:bg-brand-gray/20 text-brand-dark disabled:opacity-20 disabled:cursor-not-allowed transition-all cursor-pointer"
                    title="تأخير الخطوة للأسفل"
                  >
                    <ChevronDown class="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <!-- Step Number Badge (Reflects current order) -->
              <div
                class="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm transition-colors shrink-0"
                :class="selectedStepId === step.id ? 'bg-brand-accent text-brand-dark font-black' : 'bg-brand-gray/10 text-brand-gray'"
              >
                {{ index + 1 }}
              </div>

              <div class="min-w-0">
                <div class="flex items-center gap-2">
                  <h3 class="font-bold text-xs text-brand-dark group-hover:text-brand-accent transition-colors truncate">
                    {{ step.name }}
                  </h3>
                  <span class="px-1.5 py-0.5 rounded text-[10px] font-bold border shrink-0" :class="getStepBadgeClass(step)">
                    {{ getStepRoleLabel(step) }}
                  </span>
                </div>
                <p class="text-[11px] text-brand-gray mt-0.5 truncate">{{ step.description || 'لا يوجد وصف مُدخل لهذه الخطوة' }}</p>
              </div>
            </div>

            <!-- Right Actions for the step: Edit, Delete, Groups Count -->
            <div class="flex items-center gap-2 shrink-0 ms-2">
              <span class="px-2 py-0.5 rounded-md text-[11px] font-bold bg-brand-gray/10 text-brand-dark font-mono">
                {{ getGroupsForStep(step).length }} مجموعات
              </span>

              <div class="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity" @click.stop>
                <button
                  type="button"
                  @click="openEditStepModal(step)"
                  class="p-1 rounded hover:bg-brand-gray/15 text-brand-gray hover:text-brand-accent cursor-pointer transition-colors"
                  title="تعديل اسم ووصف الخطوة"
                >
                  <Pencil class="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  @click="deleteStep(step.id)"
                  class="p-1 rounded hover:bg-red-500/15 text-brand-gray hover:text-red-600 cursor-pointer transition-colors"
                  title="حذف هذه الخطوة بالكامل من المسار"
                >
                  <Trash2 class="w-3.5 h-3.5" />
                </button>
              </div>

              <ChevronLeft
                class="w-4 h-4 transition-transform text-brand-gray"
                :class="selectedStepId === step.id ? 'text-brand-accent translate-x-1 font-bold' : 'group-hover:translate-x-0.5'"
              />
            </div>
          </div>
        </div>

        <div class="p-3 bg-brand-light/30 border-t border-brand-gray/10 text-[11px] text-brand-gray flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="font-semibold text-brand-accent">💡 حرية كاملة:</span>
            <span>يمكنك حذف أي خطوة، تسميتها بأي اسم تريده، وإسناد مجموعات لها بكل سهولة.</span>
          </div>
        </div>
      </div>

      <!-- Left Side: Assigned Groups Table for the Clicked Step -->
      <div class="lg:col-span-7 bg-brand-white rounded-2xl border border-brand-gray/10 shadow-sm overflow-hidden">
        <div class="p-4 border-b border-brand-gray/10 bg-brand-light/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div class="flex items-center gap-2">
              <span class="w-6 h-6 rounded-full bg-brand-accent/20 text-brand-accent font-black text-xs flex items-center justify-center">
                {{ currentStepIndex + 1 }}
              </span>
              <h2 class="font-bold text-sm text-brand-dark">
                المجموعات المسندة: <span class="text-brand-accent">{{ currentStep?.name || 'اختر خطوة' }}</span>
              </h2>
            </div>
            <p class="text-[11px] text-brand-gray mt-0.5">
              المجموعات التالية مخولة بالقيام بهذه الخطوة في مسار
              <span class="font-bold text-brand-dark">{{ selectedRequestType === 1 ? 'إدخال المخزون' : 'صرف العهدة' }}</span>
            </p>
          </div>

          <Button
            @click="openAssignGroupModal"
            :disabled="!currentStep"
            class="!bg-brand-accent hover:!bg-brand-accent/90 !text-brand-dark !font-bold !rounded-xl !px-3.5 !py-2 !text-xs flex items-center gap-1.5 shadow-sm shrink-0 cursor-pointer disabled:opacity-50"
          >
            <Plus class="w-3.5 h-3.5" />
            إسناد مجموعة لهذه الخطوة
          </Button>
        </div>

        <!-- Assigned Groups List -->
        <div v-if="!currentStep" class="p-12 text-center text-brand-gray text-xs">
          يرجى اختيار أو إنشاء خطوة من القائمة على اليمين لمعاينة وإسناد مجموعاتها.
        </div>
        <div v-else-if="currentStepGroups.length > 0">
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

            <!-- Group Name -->
            <Column header="مجموعة المستخدمين (User Group)">
              <template #body="{ data }">
                <div class="flex items-center gap-2.5">
                  <div class="w-8 h-8 rounded-lg bg-brand-soft flex items-center justify-center text-brand-accent">
                    <Users class="w-4 h-4" />
                  </div>
                  <div>
                    <span class="font-bold text-brand-dark block text-xs">
                      {{ data.userGroupName || getUserGroupName(data.userGroupId) }}
                    </span>
                    <span class="text-[10px] text-brand-gray">
                      {{ getGroupDescription(data.userGroupId) }}
                    </span>
                  </div>
                </div>
              </template>
            </Column>

            <!-- Status Toggle -->
            <Column header="حالة التفعيل" style="width: 110px">
              <template #body="{ data }">
                <button
                  type="button"
                  @click="toggleConfigActive(data)"
                  class="px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors cursor-pointer inline-flex items-center gap-1"
                  :class="data.isActive
                    ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/25 hover:bg-emerald-500/20'
                    : 'bg-red-500/10 text-red-600 border-red-500/25 hover:bg-red-500/20'"
                >
                  <span class="w-1.5 h-1.5 rounded-full" :class="data.isActive ? 'bg-emerald-600' : 'bg-red-600'"></span>
                  {{ data.isActive ? 'نشط' : 'معطل' }}
                </button>
              </template>
            </Column>

            <!-- Actions -->
            <Column header="الإجراءات" style="width: 100px" class="text-end">
              <template #body="{ data }">
                <div class="flex items-center justify-end gap-1.5">
                  <editButton @click="openEditApprovalConfigModal(data)" title="تعديل الإسناد" />
                  <deleteButton @click="deleteApprovalConfig(data.id)" title="إلغاء إسناد المجموعة" />
                </div>
              </template>
            </Column>
          </DataTable>
        </div>

        <!-- Empty State for Step -->
        <div v-else class="p-10 text-center space-y-3">
          <div class="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto">
            <Shield class="w-6 h-6" />
          </div>
          <div class="space-y-1">
            <h3 class="font-bold text-brand-dark text-sm">لا توجد مجموعات مسندة لهذه الخطوة حتى الآن</h3>
            <p class="text-xs text-brand-gray max-w-sm mx-auto">
              اضغط على زر "إسناد مجموعة لهذه الخطوة" لتحديد من يملك صلاحية تنفيذ هذه الخطوة في النظام
            </p>
          </div>
          <Button
            @click="openAssignGroupModal"
            class="!bg-brand-accent hover:!bg-brand-accent/90 !text-brand-dark !font-bold !rounded-xl !px-4 !py-2 !text-xs inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus class="w-4 h-4" />
            إسناد مجموعة الآن
          </Button>
        </div>
      </div>
    </div>

    <!-- Dialog 1: Add / Edit Workflow Step Modal -->
    <Dialog
      v-model:visible="showStepModal"
      modal
      :header="isEditingStep ? 'تعديل بيانات الخطوة' : 'إضافة خطوة جديدة في مسار الاعتماد'"
      class="!bg-brand-white !border-brand-gray/15 max-w-md w-full !text-brand-dark"
    >
      <form @submit.prevent="saveStep" class="space-y-4 text-xs pt-2">
        <div class="p-3 rounded-xl bg-brand-light/60 border border-brand-gray/15 flex items-center justify-between">
          <div>
            <span class="text-[10px] text-brand-gray block">نوع المسار:</span>
            <span class="font-bold text-xs" :class="selectedRequestType === 1 ? 'text-blue-700' : 'text-amber-700'">
              {{ selectedRequestType === 1 ? 'إدخال المخزون (Entry Flow)' : 'صرف العهدة (Exit Flow)' }}
            </span>
          </div>
          <div>
            <span class="text-[10px] text-brand-gray block text-end">رقم الخطوة:</span>
            <span class="font-bold text-xs text-brand-dark text-end block font-mono">
              الخطوة {{ isEditingStep ? (currentStepIndex + 1) : (activeSteps.length + 1) }}
            </span>
          </div>
        </div>

        <div>
          <label class="block font-semibold text-brand-dark mb-1">
            اسم الخطوة (أي اسم تختاره) <span class="text-red-500">*</span>
          </label>
          <InputText
            v-model="stepForm.name"
            required
            placeholder="مثال: فحص واستلام الأصناف، اعتماد أمين المستودع، موافقة المدير..."
            class="w-full !bg-brand-light !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark"
          />
        </div>

        <div>
          <label class="block font-semibold text-brand-dark mb-1">
            وصف الخطوة والهدف منها (اختياري)
          </label>
          <Textarea
            v-model="stepForm.description"
            rows="2"
            placeholder="ملاحظات حول طبيعة هذه الخطوة والشروط المطلوبة لتنفيذها..."
            class="w-full !bg-brand-light !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark"
          />
        </div>

        <div>
          <label class="block font-semibold text-brand-dark mb-1">
            نوع المرحلة والصلاحية في النظام <span class="text-red-500">*</span>
          </label>
          <Select
            v-model="stepForm.role"
            :options="roleOptions"
            optionLabel="label"
            optionValue="value"
            class="w-full !bg-brand-light !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark"
          />
          <p class="text-[10px] text-brand-gray mt-1">
            تحدد المرحلة كيفية ارتباط الخطوة بدورة حياة الطلب (تقديم، مراجعة وتدقيق، أو اعتماد وصرف نهائي).
          </p>
          <div class="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-[10px] text-blue-700 leading-relaxed mt-1.5">
            💡 <strong>مرونة كاملة:</strong> ليس إلزامياً المرور بالمراحل الثلاث! يمكن الاكتفاء بخطوة اعتماد نهائي واحدة (مرحلة 3) مع خطوة الإنشاء دون الحاجة لمرحلة المراجعة (المرحلة 2).
          </div>
        </div>

        <!-- Optional: Immediately Assign a User Group -->
        <div v-if="!isEditingStep">
          <label class="block font-semibold text-brand-dark mb-1">
            إسناد مجموعة مستخدمين أولية لهذه الخطوة (اختياري)
          </label>
          <Select
            v-model="stepForm.initialUserGroupId"
            :options="availableGroupOptionsAll"
            optionLabel="label"
            optionValue="value"
            placeholder="اختر مجموعة مستخدمين (اختياري)..."
            class="w-full !bg-brand-light !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark"
          />
        </div>

        <div class="flex items-center justify-end gap-3 pt-3 border-t border-brand-gray/10">
          <SecondaryButton type="button" @click="showStepModal = false">
            {{ $t('ohda.common.cancel') }}
          </SecondaryButton>
          <Button
            type="submit"
            :disabled="!stepForm.name.trim()"
            class="!bg-brand-accent hover:!bg-brand-accent/90 !text-brand-dark !font-bold disabled:opacity-50 cursor-pointer"
          >
            {{ isEditingStep ? 'حفظ التعديلات' : 'إضافة الخطوة' }}
          </Button>
        </div>
      </form>
    </Dialog>

    <!-- Dialog 2: Assign User Group to Current Step -->
    <Dialog
      v-model:visible="showAssignModal"
      modal
      :header="isEditing ? 'تعديل إسناد المجموعة' : `إسناد مجموعة مستخدمين — ${currentStep?.name}`"
      class="!bg-brand-white !border-brand-gray/15 max-w-md w-full !text-brand-dark"
    >
      <form @submit.prevent="saveAssignment" class="space-y-4 text-xs pt-2">
        <div class="p-3 rounded-xl bg-brand-light/60 border border-brand-gray/15 flex items-center justify-between">
          <div>
            <span class="text-[10px] text-brand-gray block">نوع المسار:</span>
            <span class="font-bold text-xs" :class="selectedRequestType === 1 ? 'text-blue-700' : 'text-amber-700'">
              {{ selectedRequestType === 1 ? 'إدخال المخزون (Entry)' : 'صرف العهدة (Exit)' }}
            </span>
          </div>
          <div>
            <span class="text-[10px] text-brand-gray block text-end">الخطوة المستهدفة:</span>
            <span class="font-bold text-xs text-brand-dark text-end block truncate max-w-[160px]">
              الخطوة {{ currentStepIndex + 1 }}: {{ currentStep?.name }}
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
import {
  Settings,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle,
  GripVertical,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  Pencil,
  Trash2,
  Users,
  Shield,
  ShieldCheck,
  ZapOff,
  Info,
  Workflow
} from "lucide-vue-next";

const groupStore = useOhdaGroupStore();
const approvalConfigStore = useOhdaApprovalConfigStore();

// Flow Enablement Master States (Entry Flow vs Exit Flow)
const STORAGE_KEY_FLOW_ENTRY = "ohda_approval_flow_enabled_entry";
const STORAGE_KEY_FLOW_EXIT = "ohda_approval_flow_enabled_exit";
const entryFlowEnabled = ref(true);
const exitFlowEnabled = ref(true);

function loadFlowSettings() {
  const savedEntry = localStorage.getItem(STORAGE_KEY_FLOW_ENTRY);
  entryFlowEnabled.value = savedEntry !== null ? savedEntry === "true" : true;

  const savedExit = localStorage.getItem(STORAGE_KEY_FLOW_EXIT);
  exitFlowEnabled.value = savedExit !== null ? savedExit === "true" : true;
}

const isCurrentFlowEnabled = computed({
  get: () => (selectedRequestType.value === 1 ? entryFlowEnabled.value : exitFlowEnabled.value),
  set: (val) => {
    if (selectedRequestType.value === 1) {
      entryFlowEnabled.value = val;
      localStorage.setItem(STORAGE_KEY_FLOW_ENTRY, String(val));
    } else {
      exitFlowEnabled.value = val;
      localStorage.setItem(STORAGE_KEY_FLOW_EXIT, String(val));
    }
  }
});

// Selected States
const selectedRequestType = ref(1); // 1 = Entry, 2 = Exit
const selectedStepId = ref(null);

// Modal states for Step CRUD
const showStepModal = ref(false);
const isEditingStep = ref(false);
const editingStepId = ref(null);
const stepForm = ref({
  name: "",
  description: "",
  role: 2,
  initialUserGroupId: null
});

// Modal states for Group Assignment
const showAssignModal = ref(false);
const isEditing = ref(false);
const editingId = ref(null);
const assignForm = ref({
  userGroupId: null,
  isActive: true
});

// Storage keys
const STORAGE_KEY_ENTRY_STEPS = "ohda_workflow_steps_entry_v2";
const STORAGE_KEY_EXIT_STEPS = "ohda_workflow_steps_exit_v2";
const STORAGE_KEY_GROUPS = "ohda_custom_group_order_v2";

// Role options for workflow mapping (generic and flexible)
const roleOptions = [
  { value: 1, label: "مرحلة 1: تقديم وإنشاء الطلب المبدئي (Requester)" },
  { value: 2, label: "مرحلة 2: مراجعة وتدقيق إداري / فني (اختيارية)" },
  { value: 3, label: "مرحلة 3: اعتماد نهائي وتوثيق مباشر وصرف/تسكين (تنفيذ التغييرات)" }
];

// Initial default steps templates if no saved steps found
const defaultEntrySteps = [
  {
    id: "step_entry_1",
    name: "مقدم الطلب والتوريد",
    role: 1,
    description: "تجهيز وإنشاء طلب إدخال وتوريد المنتجات للمستودع"
  },
  {
    id: "step_entry_2",
    name: "المراجعة والفحص الفني",
    role: 2,
    description: "مراجعة بنود وفواتير التوريد والتحقق الفني والإداري"
  },
  {
    id: "step_entry_3",
    name: "الاعتماد النهائي والتسكين",
    role: 3,
    description: "الموافقة الرسمية النهائية وإضافة الأصناف فعلياً لرصيد المخزون"
  }
];

const defaultExitSteps = [
  {
    id: "step_exit_1",
    name: "مقدم طلب الصرف",
    role: 1,
    description: "إنشاء وتقديم طلب صرف العهدة وتحديد الأصناف المطلوبة"
  },
  {
    id: "step_exit_2",
    name: "المراجعة والتدقيق الإداري",
    role: 2,
    description: "مراجعة طلب الصرف والتأكد من استحقاق القسم والأصناف"
  },
  {
    id: "step_exit_3",
    name: "الاعتماد النهائي والتوثيق المستودعي",
    role: 3,
    description: "المصادقة النهائية وتحديث حركة الصرف وإنشاء وثيقة التسليم"
  }
];

const entrySteps = ref([]);
const exitSteps = ref([]);
const customGroupOrder = ref({});

// Drag and drop tracking
const draggedIndex = ref(null);
const dragOverIndex = ref(null);

onMounted(async () => {
  loadFlowSettings();
  loadStepsFromStorage();
  await Promise.all([
    groupStore.fetchUserGroups(),
    approvalConfigStore.fetchApprovalConfigs()
  ]);

  // Ensure an active step is selected
  if (!selectedStepId.value && activeSteps.value.length > 0) {
    selectedStepId.value = activeSteps.value[0].id;
  }
});

function loadStepsFromStorage() {
  try {
    const savedEntry = localStorage.getItem(STORAGE_KEY_ENTRY_STEPS);
    if (savedEntry) {
      entrySteps.value = JSON.parse(savedEntry);
    } else {
      entrySteps.value = [...defaultEntrySteps];
    }

    const savedExit = localStorage.getItem(STORAGE_KEY_EXIT_STEPS);
    if (savedExit) {
      exitSteps.value = JSON.parse(savedExit);
    } else {
      exitSteps.value = [...defaultExitSteps];
    }

    const savedGroupOrder = localStorage.getItem(STORAGE_KEY_GROUPS);
    if (savedGroupOrder) customGroupOrder.value = JSON.parse(savedGroupOrder);
  } catch (_) {
    entrySteps.value = [...defaultEntrySteps];
    exitSteps.value = [...defaultExitSteps];
  }
}

function saveStepsToStorage() {
  try {
    if (selectedRequestType.value === 1) {
      localStorage.setItem(STORAGE_KEY_ENTRY_STEPS, JSON.stringify(entrySteps.value));
    } else {
      localStorage.setItem(STORAGE_KEY_EXIT_STEPS, JSON.stringify(exitSteps.value));
    }
  } catch (_) {}
}

const activeSteps = computed({
  get: () => (selectedRequestType.value === 1 ? entrySteps.value : exitSteps.value),
  set: (val) => {
    if (selectedRequestType.value === 1) {
      entrySteps.value = val;
    } else {
      exitSteps.value = val;
    }
    saveStepsToStorage();
  }
});

const currentStepIndex = computed(() => {
  return activeSteps.value.findIndex(s => s.id === selectedStepId.value);
});

const currentStep = computed(() => {
  if (currentStepIndex.value >= 0) {
    return activeSteps.value[currentStepIndex.value];
  }
  return activeSteps.value[0] || null;
});

function selectRequestType(type) {
  selectedRequestType.value = type;
  if (activeSteps.value.length > 0) {
    selectedStepId.value = activeSteps.value[0].id;
  } else {
    selectedStepId.value = null;
  }
}

function selectStep(stepId) {
  selectedStepId.value = stepId;
}

function getStepBadgeClass(step) {
  if (step.role === 1) return "bg-slate-500/10 text-slate-700 border-slate-500/20";
  if (step.role === 2) return "bg-teal-500/10 text-teal-700 border-teal-500/20";
  if (step.role === 3) return "bg-purple-500/10 text-purple-700 border-purple-500/20";
  return "bg-brand-gray/10 text-brand-gray border-brand-gray/20";
}

function getStepRoleLabel(step) {
  if (step.role === 1) return "مقدم الطلب";
  if (step.role === 2) return "مراجعة وتدقيق";
  if (step.role === 3) return "اعتماد نهائي";
  return "خطوة مخصصة";
}

// Step CRUD Actions
function openAddStepModal() {
  isEditingStep.value = false;
  editingStepId.value = null;
  // Intelligently default role based on current steps count
  const defaultRole = activeSteps.value.length === 0 ? 1 : activeSteps.value.length === 1 ? 2 : 3;
  stepForm.value = {
    name: "",
    description: "",
    role: defaultRole,
    initialUserGroupId: availableGroupOptionsAll.value[0]?.value || null
  };
  showStepModal.value = true;
}

function openEditStepModal(step) {
  isEditingStep.value = true;
  editingStepId.value = step.id;
  stepForm.value = {
    name: step.name,
    description: step.description || "",
    role: step.role || 2,
    initialUserGroupId: null
  };
  showStepModal.value = true;
}

async function saveStep() {
  if (!stepForm.value.name.trim()) return;

  if (isEditingStep.value && editingStepId.value) {
    const list = [...activeSteps.value];
    const idx = list.findIndex(s => s.id === editingStepId.value);
    if (idx !== -1) {
      list[idx] = {
        ...list[idx],
        name: stepForm.value.name.trim(),
        description: stepForm.value.description.trim(),
        role: stepForm.value.role
      };
      activeSteps.value = list;
    }
  } else {
    const newId = `step_${Date.now()}`;
    const newStep = {
      id: newId,
      name: stepForm.value.name.trim(),
      description: stepForm.value.description.trim(),
      role: stepForm.value.role
    };

    activeSteps.value = [...activeSteps.value, newStep];
    selectedStepId.value = newId;

    // If an initial group was selected, immediately assign it
    if (stepForm.value.initialUserGroupId) {
      await approvalConfigStore.createApprovalConfig({
        requestType: selectedRequestType.value,
        workflowRole: newStep.role,
        userGroupId: stepForm.value.initialUserGroupId,
        isActive: true
      });
    }
  }

  showStepModal.value = false;
}

function deleteStep(stepId) {
  const stepToDelete = activeSteps.value.find(s => s.id === stepId);
  const stepName = stepToDelete?.name || "هذه الخطوة";
  if (confirm(`هل أنت متأكد من حذف ${stepName} بالكامل من هذا المسار؟`)) {
    const list = activeSteps.value.filter(s => s.id !== stepId);
    activeSteps.value = list;
    if (selectedStepId.value === stepId) {
      selectedStepId.value = list[0]?.id || null;
    }
  }
}

function resetToDefaultSteps() {
  if (confirm("هل تريد استعادة الخطوات الافتراضية لهذا المسار؟")) {
    if (selectedRequestType.value === 1) {
      activeSteps.value = [...defaultEntrySteps];
    } else {
      activeSteps.value = [...defaultExitSteps];
    }
    selectedStepId.value = activeSteps.value[0]?.id || null;
  }
}

// Step Reordering (Move Up / Down & Drag-Drop)
function moveStepUp(index) {
  if (index <= 0) return;
  const list = [...activeSteps.value];
  const temp = list[index];
  list[index] = list[index - 1];
  list[index - 1] = temp;
  activeSteps.value = list;
}

function moveStepDown(index) {
  if (index >= activeSteps.value.length - 1) return;
  const list = [...activeSteps.value];
  const temp = list[index];
  list[index] = list[index + 1];
  list[index + 1] = temp;
  activeSteps.value = list;
}

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
  const arr = [...activeSteps.value];
  const item = arr.splice(draggedIndex.value, 1)[0];
  arr.splice(targetIndex, 0, item);
  activeSteps.value = arr;
  draggedIndex.value = null;
  dragOverIndex.value = null;
}

// Group Configurations filtering for current step
function getGroupsForStep(step) {
  if (!step) return [];
  return approvalConfigStore.configs.filter(c =>
    c.requestType === selectedRequestType.value &&
    c.workflowRole === step.role
  );
}

const currentStepGroups = computed(() => {
  if (!currentStep.value) return [];
  const configs = getGroupsForStep(currentStep.value);

  const groupKey = `${selectedRequestType.value}_${currentStep.value.id || currentStep.value.role}`;
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
  if (index <= 0 || !currentStep.value) return;
  const list = [...currentStepGroups.value];
  const temp = list[index];
  list[index] = list[index - 1];
  list[index - 1] = temp;

  const groupKey = `${selectedRequestType.value}_${currentStep.value.id || currentStep.value.role}`;
  customGroupOrder.value = {
    ...customGroupOrder.value,
    [groupKey]: list.map(c => c.id)
  };
  try {
    localStorage.setItem(STORAGE_KEY_GROUPS, JSON.stringify(customGroupOrder.value));
  } catch (_) {}
}

function moveGroupDown(index) {
  if (!currentStep.value || index >= currentStepGroups.value.length - 1) return;
  const list = [...currentStepGroups.value];
  const temp = list[index];
  list[index] = list[index + 1];
  list[index + 1] = temp;

  const groupKey = `${selectedRequestType.value}_${currentStep.value.id || currentStep.value.role}`;
  customGroupOrder.value = {
    ...customGroupOrder.value,
    [groupKey]: list.map(c => c.id)
  };
  try {
    localStorage.setItem(STORAGE_KEY_GROUPS, JSON.stringify(customGroupOrder.value));
  } catch (_) {}
}

// Counts for Top Buttons
const entryConfigsCount = computed(() => {
  return approvalConfigStore.configs.filter(c => c.requestType === 1).length;
});

const exitConfigsCount = computed(() => {
  return approvalConfigStore.configs.filter(c => c.requestType === 2).length;
});

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

// Available Groups for Modal Dropdown
const availableGroupOptionsAll = computed(() => {
  return groupStore.groups.map(g => ({
    value: g.id,
    label: `${g.name} — (${g.description || 'مجموعة صلاحيات'})`
  }));
});

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
  if (!currentStep.value) return;
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
  if (!assignForm.value.userGroupId || !currentStep.value) return;

  const payload = {
    requestType: selectedRequestType.value,
    workflowRole: currentStep.value.role,
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
