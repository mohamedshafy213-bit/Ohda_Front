<template>
  <div class="space-y-6">
    <!-- Header Card -->
    <div class="bg-brand-white p-5 rounded-2xl border border-brand-gray/10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-2xl bg-brand-soft border border-brand-accent/25 flex items-center justify-center text-brand-accent shrink-0 shadow-inner">
          <CheckCheck class="w-6 h-6" />
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-lg font-black text-brand-dark">مركز التصديقات والاعتمادات</h1>
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-brand-accent/15 text-brand-accent border border-brand-accent/30">
              بوابة المسؤول والمدير
            </span>
          </div>
          <p class="text-xs text-brand-gray mt-1">
            مراجعة وتصديق طلبات صرف العهد وتوريد الأصناف المعلقة، والاطلاع على مسار الاعتماد ومن اعتمد ومن لم يعتمد بعد.
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <Button
          @click="refreshData"
          :loading="loading"
          class="!bg-brand-light hover:!bg-brand-soft !border !border-brand-gray/20 !text-brand-dark !rounded-xl !px-3.5 !py-2 !text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm transition-all"
        >
          <RotateCw class="w-3.5 h-3.5" :class="{ 'animate-spin': loading }" />
          <span>تحديث الطلبات</span>
        </Button>
      </div>
    </div>

    <!-- KPI Summary Row -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Total Pending -->
      <div class="bg-brand-white p-4 rounded-2xl border border-brand-gray/10 shadow-sm flex items-center gap-3.5">
        <div class="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
          <Clock class="w-5 h-5" />
        </div>
        <div>
          <span class="text-[11px] font-semibold text-brand-gray block">إجمالي المعلق للاعتماد</span>
          <span class="text-xl font-black text-brand-dark font-mono">{{ totalPendingCount }}</span>
        </div>
      </div>

      <!-- Exit Pending -->
      <div class="bg-brand-white p-4 rounded-2xl border border-brand-gray/10 shadow-sm flex items-center gap-3.5">
        <div class="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shrink-0">
          <ArrowUpRight class="w-5 h-5" />
        </div>
        <div>
          <span class="text-[11px] font-semibold text-brand-gray block">طلبات صرف عهدة معلقة</span>
          <span class="text-xl font-black text-brand-dark font-mono">{{ pendingExitList.length }}</span>
        </div>
      </div>

      <!-- Entry Pending -->
      <div class="bg-brand-white p-4 rounded-2xl border border-brand-gray/10 shadow-sm flex items-center gap-3.5">
        <div class="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500 shrink-0">
          <ArrowDownLeft class="w-5 h-5" />
        </div>
        <div>
          <span class="text-[11px] font-semibold text-brand-gray block">طلبات توريد عهدة معلقة</span>
          <span class="text-xl font-black text-brand-dark font-mono">{{ pendingEntryList.length }}</span>
        </div>
      </div>

      <!-- Completed Today -->
      <div class="bg-brand-white p-4 rounded-2xl border border-brand-gray/10 shadow-sm flex items-center gap-3.5">
        <div class="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
          <CheckCircle2 class="w-5 h-5" />
        </div>
        <div>
          <span class="text-[11px] font-semibold text-brand-gray block">تم اعتماده بالكامل</span>
          <span class="text-xl font-black text-brand-dark font-mono">{{ fullyApprovedCount }}</span>
        </div>
      </div>
    </div>

    <!-- Main Acceptance Container -->
    <div class="bg-brand-white rounded-2xl border border-brand-gray/10 shadow-sm overflow-hidden">
      <!-- Tabs Switcher -->
      <div class="p-3 border-b border-brand-gray/10 flex flex-wrap items-center justify-between gap-3 bg-brand-light/30">
        <div class="flex items-center gap-2">
          <button
            @click="activeTab = 'exit'"
            class="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border"
            :class="activeTab === 'exit' ? 'bg-brand-soft text-brand-accent border-brand-accent/30 shadow-sm' : 'text-brand-gray border-transparent hover:text-brand-dark hover:bg-brand-light'"
          >
            <ArrowUpRight class="w-4 h-4 text-brand-accent" />
            <span>تصديقات صرف العهدة</span>
            <span class="px-2 py-0.5 rounded-full text-[10px] bg-brand-accent/20 text-brand-dark font-mono font-bold">
              {{ pendingExitList.length }}
            </span>
          </button>

          <button
            @click="activeTab = 'entry'"
            class="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border"
            :class="activeTab === 'entry' ? 'bg-brand-soft text-brand-accent border-brand-accent/30 shadow-sm' : 'text-brand-gray border-transparent hover:text-brand-dark hover:bg-brand-light'"
          >
            <ArrowDownLeft class="w-4 h-4 text-brand-accent" />
            <span>تصديقات توريد العهدة</span>
            <span class="px-2 py-0.5 rounded-full text-[10px] bg-brand-accent/20 text-brand-dark font-mono font-bold">
              {{ pendingEntryList.length }}
            </span>
          </button>

          <button
            @click="activeTab = 'history'"
            class="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border"
            :class="activeTab === 'history' ? 'bg-brand-soft text-brand-accent border-brand-accent/30 shadow-sm' : 'text-brand-gray border-transparent hover:text-brand-dark hover:bg-brand-light'"
          >
            <History class="w-4 h-4 text-brand-accent" />
            <span>سجل الطلبات المعتمدة</span>
          </button>
        </div>

        <!-- Search Bar -->
        <div class="relative w-full sm:w-64">
          <InputText
            v-model="searchQuery"
            placeholder="بحث برقم الطلب، الاسم، أو العسكري..."
            class="w-full !bg-brand-light !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark text-xs !rounded-xl pr-8 pl-3 py-1.5"
          />
          <Search class="w-3.5 h-3.5 text-brand-gray absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      <!-- TAB 1: PENDING EXIT REQUESTS -->
      <div v-if="activeTab === 'exit'" class="p-4">
        <DataTable
          :value="filteredPendingExitList"
          :paginator="true"
          :rows="10"
          responsiveLayout="scroll"
          class="p-datatable-sm text-xs"
          stripedRows
        >
          <template #empty>
            <div class="p-8 text-center text-brand-gray flex flex-col items-center justify-center gap-2">
              <CheckCircle2 class="w-10 h-10 text-emerald-500/50" />
              <p class="font-bold text-brand-dark">لا توجد طلبات صرف عهدة معلقة بانتظار تصديقك حالياً</p>
              <p class="text-[11px]">كافة طلبات صرف العهد تمت مراجعتها واعتمادها بنجاح أو مخصصة لمجموعات أخرى.</p>
            </div>
          </template>

          <Column field="id" header="رقم الطلب" sortable style="width: 90px">
            <template #body="{ data }">
              <span class="font-mono font-bold text-brand-accent cursor-pointer hover:underline" @click="viewDetails(data, 'exit')" title="عرض تفاصيل الطلب">#{{ data.id }}</span>
            </template>
          </Column>

          <Column header="مقدم الطلب">
            <template #body="{ data }">
              <div class="flex flex-col">
                <span class="font-semibold text-brand-dark">{{ data.requestedByPersonName || data.requestedByUsername || 'مستخدم' }}</span>
                <span v-if="data.requestedByUserId" class="font-mono text-[10px] text-brand-gray">عسكري: {{ data.requestedByUserId }}</span>
              </div>
            </template>
          </Column>

          <Column field="recipientName" header="المستلم والجهة">
            <template #body="{ data }">
              <div class="flex flex-col">
                <span class="font-semibold text-brand-dark">{{ data.recipientName }}</span>
                <span class="text-[10px] text-brand-gray">{{ data.departmentName || 'فرع محدد' }}</span>
              </div>
            </template>
          </Column>

          <Column header="الأصناف المطلوبة">
            <template #body="{ data }">
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 border border-blue-500/20">
                {{ data.items?.length || 1 }} صنف
              </span>
            </template>
          </Column>

          <Column header="المرحلة ومسار الاعتماد">
            <template #body="{ data }">
              <button
                @click="openTrailModal(data, 'exit')"
                class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 font-bold border border-amber-500/25 cursor-pointer text-[10px] transition-all"
                title="انقر لعرض مسار الاعتماد بالتفصيل ومتابعة من اعتمد ومن لم يعتمد"
              >
                <span>{{ getDynamicStepLabel(data, 'exit') }}</span>
                <Eye class="w-3.5 h-3.5 shrink-0 text-amber-600" />
              </button>
            </template>
          </Column>

          <Column header="تاريخ الطلب">
            <template #body="{ data }">
              <span class="font-mono text-[10px] text-brand-gray">{{ formatDate(data.insertDate) }}</span>
            </template>
          </Column>

          <Column header="الإجراءات" headerClass="text-center" bodyClass="text-center" style="width: 250px">
            <template #body="{ data }">
              <div class="flex items-center justify-center gap-1.5">
                <Button
                  @click="viewDetails(data, 'exit')"
                  class="!px-2.5 !py-1 !bg-brand-light hover:!bg-brand-gray/10 !text-brand-dark !border !border-brand-gray/20 !rounded-lg !text-[11px] !font-bold flex items-center gap-1 cursor-pointer"
                  title="عرض تفاصيل الطلب"
                >
                  <Eye class="w-3 h-3 text-brand-accent" />
                  <span>التفاصيل</span>
                </Button>

                <template v-if="canUserApproveStep(data, 'exit')">
                  <Button
                    @click="openApproveModal(data, 'exit')"
                    class="!bg-emerald-500 hover:!bg-emerald-600 !text-white !font-bold !rounded-xl !px-2.5 !py-1 !text-[11px] flex items-center gap-1 cursor-pointer shadow-sm"
                  >
                    <Check class="w-3.5 h-3.5" />
                    <span>تصديق</span>
                  </Button>

                  <Button
                    @click="openRejectModal(data, 'exit')"
                    class="!bg-red-500/10 hover:!bg-red-500/20 !text-red-600 !border !border-red-500/30 !font-bold !rounded-xl !px-2.5 !py-1 !text-[11px] flex items-center gap-1 cursor-pointer"
                  >
                    <X class="w-3.5 h-3.5" />
                    <span>رفض</span>
                  </Button>
                </template>
                <template v-else>
                  <span
                    class="px-2 py-1 rounded-lg text-[10px] font-semibold bg-brand-light text-brand-gray border border-brand-gray/20 flex items-center gap-1"
                    :title="`هذا الطلب بانتظار تصديق مجموعة: ${getStepAssignedGroupName(data, 'exit')}`"
                  >
                    <Lock class="w-3 h-3 text-brand-gray" />
                    <span>{{ getStepAssignedGroupName(data, 'exit') }}</span>
                  </span>
                </template>
              </div>
            </template>
          </Column>
        </DataTable>
      </div>

      <!-- TAB 2: PENDING ENTRY REQUESTS -->
      <div v-if="activeTab === 'entry'" class="p-4">
        <DataTable
          :value="filteredPendingEntryList"
          :paginator="true"
          :rows="10"
          responsiveLayout="scroll"
          class="p-datatable-sm text-xs"
          stripedRows
        >
          <template #empty>
            <div class="p-8 text-center text-brand-gray flex flex-col items-center justify-center gap-2">
              <CheckCircle2 class="w-10 h-10 text-emerald-500/50" />
              <p class="font-bold text-brand-dark">لا توجد طلبات توريد وإدخال معلقة بانتظار تصديقك حالياً</p>
              <p class="text-[11px]">كافة طلبات التوريد تمت مراجعتها وفحصها بنجاح أو مخصصة لمجموعات أخرى.</p>
            </div>
          </template>

          <Column field="id" header="رقم الطلب" sortable style="width: 90px">
            <template #body="{ data }">
              <span class="font-mono font-bold text-brand-accent cursor-pointer hover:underline" @click="viewDetails(data, 'entry')" title="عرض تفاصيل الطلب">#{{ data.id }}</span>
            </template>
          </Column>

          <Column header="مقدم الطلب / المستلم">
            <template #body="{ data }">
              <div class="flex flex-col">
                <span class="font-semibold text-brand-dark">{{ data.receivedByPersonName || data.receivedByUsername || 'مستخدم' }}</span>
                <span v-if="data.receivedByUserId" class="font-mono text-[10px] text-brand-gray">عسكري: {{ data.receivedByUserId }}</span>
              </div>
            </template>
          </Column>

          <Column field="sourceName" header="الجهة المرجعة / المورد">
            <template #body="{ data }">
              <div class="flex flex-col">
                <span class="font-semibold text-brand-dark">{{ data.sourceName || data.fromSource || 'توريد جديد' }}</span>
                <span v-if="data.invoiceNumber" class="text-[10px] text-brand-gray font-mono">سند: {{ data.invoiceNumber }}</span>
              </div>
            </template>
          </Column>

          <Column header="الأصناف الموردة">
            <template #body="{ data }">
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-600 border border-purple-500/20">
                {{ data.items?.length || 1 }} صنف
              </span>
            </template>
          </Column>

          <Column header="المرحلة ومسار الاعتماد">
            <template #body="{ data }">
              <button
                @click="openTrailModal(data, 'entry')"
                class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 font-bold border border-amber-500/25 cursor-pointer text-[10px] transition-all"
                title="انقر لعرض مسار الاعتماد بالتفصيل ومتابعة من اعتمد ومن لم يعتمد"
              >
                <span>{{ getDynamicStepLabel(data, 'entry') }}</span>
                <Eye class="w-3.5 h-3.5 shrink-0 text-amber-600" />
              </button>
            </template>
          </Column>

          <Column header="تاريخ التوريد">
            <template #body="{ data }">
              <span class="font-mono text-[10px] text-brand-gray">{{ formatDate(data.insertDate) }}</span>
            </template>
          </Column>

          <Column header="الإجراءات" headerClass="text-center" bodyClass="text-center" style="width: 250px">
            <template #body="{ data }">
              <div class="flex items-center justify-center gap-1.5">
                <Button
                  @click="viewDetails(data, 'entry')"
                  class="!px-2.5 !py-1 !bg-brand-light hover:!bg-brand-gray/10 !text-brand-dark !border !border-brand-gray/20 !rounded-lg !text-[11px] !font-bold flex items-center gap-1 cursor-pointer"
                  title="عرض تفاصيل الطلب"
                >
                  <Eye class="w-3 h-3 text-brand-accent" />
                  <span>التفاصيل</span>
                </Button>

                <template v-if="canUserApproveStep(data, 'entry')">
                  <Button
                    @click="openApproveModal(data, 'entry')"
                    class="!bg-emerald-500 hover:!bg-emerald-600 !text-white !font-bold !rounded-xl !px-2.5 !py-1 !text-[11px] flex items-center gap-1 cursor-pointer shadow-sm"
                  >
                    <Check class="w-3.5 h-3.5" />
                    <span>تصديق</span>
                  </Button>

                  <Button
                    @click="openRejectModal(data, 'entry')"
                    class="!bg-red-500/10 hover:!bg-red-500/20 !text-red-600 !border !border-red-500/30 !font-bold !rounded-xl !px-2.5 !py-1 !text-[11px] flex items-center gap-1 cursor-pointer"
                  >
                    <X class="w-3.5 h-3.5" />
                    <span>رفض</span>
                  </Button>
                </template>
                <template v-else>
                  <span
                    class="px-2 py-1 rounded-lg text-[10px] font-semibold bg-brand-light text-brand-gray border border-brand-gray/20 flex items-center gap-1"
                    :title="`هذا الطلب بانتظار تصديق مجموعة: ${getStepAssignedGroupName(data, 'entry')}`"
                  >
                    <Lock class="w-3 h-3 text-brand-gray" />
                    <span>{{ getStepAssignedGroupName(data, 'entry') }}</span>
                  </span>
                </template>
              </div>
            </template>
          </Column>
        </DataTable>
      </div>

      <!-- TAB 3: APPROVED HISTORY -->
      <div v-if="activeTab === 'history'" class="p-4">
        <DataTable
          :value="filteredHistoryList"
          :paginator="true"
          :rows="10"
          responsiveLayout="scroll"
          class="p-datatable-sm text-xs"
          stripedRows
        >
          <template #empty>
            <div class="p-8 text-center text-brand-gray flex flex-col items-center justify-center gap-2">
              <History class="w-10 h-10 text-brand-gray/40" />
              <p class="font-bold text-brand-dark">لا توجد طلبات سابقة في سجل الاعتمادات</p>
            </div>
          </template>

          <Column field="typeLabel" header="نوع الطلب">
            <template #body="{ data }">
              <span
                class="px-2.5 py-0.5 rounded-full text-[10px] font-bold border"
                :class="data.requestType === 'exit' ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' : 'bg-purple-500/10 text-purple-600 border-purple-500/20'"
              >
                {{ data.requestType === 'exit' ? 'طلب صرف عهدة' : 'طلب توريد وإدخال' }}
              </span>
            </template>
          </Column>

          <Column field="id" header="رقم الطلب" sortable style="width: 90px">
            <template #body="{ data }">
              <span class="font-mono font-bold text-brand-accent cursor-pointer hover:underline" @click="viewDetails(data, data.requestType)" title="عرض تفاصيل الطلب">#{{ data.id }}</span>
            </template>
          </Column>

          <Column header="صاحب الطلب">
            <template #body="{ data }">
              <div class="flex flex-col">
                <span class="font-semibold text-brand-dark">{{ data.personName || data.username || 'مستخدم' }}</span>
                <span v-if="data.militaryNumber" class="font-mono text-[10px] text-brand-gray">عسكري: {{ data.militaryNumber }}</span>
              </div>
            </template>
          </Column>

          <Column field="partyName" header="المستلم / الجهة">
            <template #body="{ data }">
              <span class="font-medium text-brand-dark">{{ data.partyName || '-' }}</span>
            </template>
          </Column>

          <Column header="حالة الاعتماد">
            <template #body="{ data }">
              <span
                class="px-2.5 py-0.5 rounded-full text-[10px] font-bold border"
                :class="getStatusBadgeClass(data.status, data.isRequesterConfirmed)"
              >
                {{ getStatusName(data.status, data.isRequesterConfirmed) }}
              </span>
            </template>
          </Column>

          <Column header="تاريخ التحديث">
            <template #body="{ data }">
              <span class="font-mono text-[10px] text-brand-gray">{{ formatDate(data.lastUpdate || data.insertDate) }}</span>
            </template>
          </Column>

          <Column header="الإجراءات والمسار" headerClass="text-center" bodyClass="text-center" style="width: 220px">
            <template #body="{ data }">
              <div class="flex items-center justify-center gap-1.5">
                <Button
                  @click="viewDetails(data, data.requestType)"
                  class="!px-2.5 !py-1 !bg-brand-light hover:!bg-brand-gray/10 !text-brand-dark !border !border-brand-gray/20 !rounded-lg !text-[11px] !font-bold flex items-center gap-1 cursor-pointer"
                  title="عرض تفاصيل الطلب"
                >
                  <Eye class="w-3 h-3 text-brand-accent" />
                  <span>التفاصيل</span>
                </Button>

                <Button
                  @click="openTrailModal(data, data.requestType)"
                  class="!bg-brand-soft hover:!bg-brand-accent/20 !text-brand-accent !border !border-brand-accent/30 !rounded-xl !px-3 !py-1 !text-xs font-bold flex items-center gap-1 cursor-pointer"
                  title="عرض مسار الاعتماد"
                >
                  <History class="w-3.5 h-3.5" />
                  <span>المسار</span>
                </Button>
              </div>
            </template>
          </Column>
        </DataTable>
      </div>
    </div>

    <!-- DIALOG 0: FULL DETAILS MODAL -->
    <Dialog
      v-model:visible="showDetailsDialog"
      modal
      :header="`تفاصيل ${selectedDetailType === 'exit' ? 'طلب صرف العهدة' : 'طلب توريد العهدة'} #${selectedDetailItem?.id || ''}`"
      class="!bg-brand-white !border-brand-gray/15 max-w-3xl w-full !text-brand-dark"
    >
      <div v-if="detailLoading" class="p-8 text-center text-brand-gray flex flex-col items-center justify-center gap-2">
        <RotateCw class="w-8 h-8 text-brand-accent animate-spin" />
        <span class="text-xs font-bold">جاري تحميل كامل بيانات الطلب...</span>
      </div>

      <div v-else-if="selectedDetailItem" class="space-y-5 text-xs pt-1">
        <!-- Header Info Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-brand-light p-4 rounded-xl border border-brand-gray/10">
          <div>
            <span class="text-[10px] text-brand-gray block mb-0.5">
              {{ selectedDetailType === 'exit' ? 'مقدم الطلب' : 'مقدم الطلب / الاستلام' }}
            </span>
            <span class="font-bold text-brand-dark">
              {{ selectedDetailItem.requestedByPersonName || selectedDetailItem.receivedByPersonName || selectedDetailItem.requestedByUsername || selectedDetailItem.receivedByUsername || 'مستخدم' }}
            </span>
            <span v-if="selectedDetailItem.requestedByUserId || selectedDetailItem.receivedByUserId" class="block font-mono text-[10px] text-brand-gray">
              عسكري: {{ selectedDetailItem.requestedByUserId || selectedDetailItem.receivedByUserId }}
            </span>
          </div>

          <div>
            <span class="text-[10px] text-brand-gray block mb-0.5">
              {{ selectedDetailType === 'exit' ? 'المستلم والجهة' : 'مصدر التوريد / المورد' }}
            </span>
            <span class="font-bold text-brand-dark">
              {{ selectedDetailItem.recipientName || selectedDetailItem.sourceName || selectedDetailItem.fromSource || '-' }}
            </span>
            <span v-if="selectedDetailItem.departmentName" class="block text-[10px] text-brand-gray">
              القسم: {{ selectedDetailItem.departmentName }}
            </span>
          </div>

          <div>
            <span class="text-[10px] text-brand-gray block mb-0.5">
              {{ selectedDetailType === 'exit' ? 'رقم السند' : 'رقم الفاتورة / السند' }}
            </span>
            <span class="font-bold text-brand-dark font-mono">
              {{ selectedDetailItem.invoiceNumber || selectedDetailItem.documentNumber || `#${selectedDetailItem.id}` }}
            </span>
          </div>

          <div>
            <span class="text-[10px] text-brand-gray block mb-0.5">تاريخ الطلب</span>
            <span class="font-bold text-brand-dark font-mono">
              {{ formatDate(selectedDetailItem.insertDate) }}
            </span>
          </div>

          <div>
            <span class="text-[10px] text-brand-gray block mb-0.5">مرحلة المسار الحالية</span>
            <span class="font-bold text-brand-dark">
              {{ getDynamicStepLabel(selectedDetailItem, selectedDetailType) }}
            </span>
          </div>

          <div>
            <span class="text-[10px] text-brand-gray block mb-0.5">توثيق البوصلة</span>
            <span class="font-bold" :class="selectedDetailItem.isRequesterConfirmed ? 'text-emerald-600' : 'text-amber-600'">
              {{ selectedDetailItem.isRequesterConfirmed ? 'تم التوثيق بالبوصلة' : 'بانتظار تأكيد المستلم' }}
            </span>
          </div>

          <div v-if="selectedDetailItem.notes" class="col-span-2 sm:col-span-3">
            <span class="text-[10px] text-brand-gray block mb-0.5">الملاحظات</span>
            <span class="text-brand-dark">{{ selectedDetailItem.notes }}</span>
          </div>
        </div>

        <!-- Line Items Table -->
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <span class="font-bold text-brand-dark text-xs flex items-center gap-2">
              <Package class="w-4 h-4 text-brand-accent" />
              أصناف وعناصر الطلب ({{ selectedDetailItem.items?.length || 0 }} صنف):
            </span>
            <span v-if="canUserApproveStep(selectedDetailItem, selectedDetailType)" class="text-[10px] text-brand-gray">
              يمكنك اعتماد أو رفض كل صنف على حدة قبل تأكيد القرار النهائي.
            </span>
          </div>

          <div class="border border-brand-gray/15 rounded-xl overflow-hidden shadow-2xs">
            <table class="w-full text-right border-collapse text-xs">
              <thead class="bg-brand-light text-brand-gray text-[11px] border-b border-brand-gray/15">
                <tr>
                  <th class="p-2.5">اسم الصنف</th>
                  <th class="p-2.5">SKU / الباركود</th>
                  <th class="p-2.5">حالة المنتج</th>
                  <th class="p-2.5 text-center">الكمية</th>
                  <th class="p-2.5 text-center">حالة العنصر</th>
                  <th v-if="canUserApproveStep(selectedDetailItem, selectedDetailType)" class="p-2.5 text-center">قرار الاعتماد</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-brand-gray/10 text-xs">
                <tr v-for="item in (selectedDetailItem.items || [])" :key="item.id" class="hover:bg-brand-light/30">
                  <td class="p-2.5 font-bold text-brand-dark">
                    {{ item.productName || item.product?.name || `صنف #${item.productId}` }}
                    <div v-if="item.serialNumber || (item.notes && item.notes.includes('SN-'))" class="font-mono text-[10px] text-brand-accent font-normal mt-0.5">
                      {{ item.serialNumber || item.notes }}
                    </div>
                  </td>
                  <td class="p-2.5 font-mono text-brand-gray text-[11px]">
                    {{ item.productSKU || item.productBarcode || item.product?.sku || '-' }}
                  </td>
                  <td class="p-2.5 text-[11px] text-brand-dark">
                    {{ item.productStateName || item.productState?.name || 'سليم / افتراضي' }}
                  </td>
                  <td class="p-2.5 text-center font-mono font-bold text-brand-accent">
                    {{ item.quantity || 1 }}
                  </td>
                  <td class="p-2.5 text-center">
                    <span
                      class="px-2 py-0.5 rounded text-[10px] font-bold border inline-block"
                      :class="getItemStatusBadgeClass(item.status)"
                    >
                      {{ getItemStatusLabel(item.status) }}
                    </span>
                  </td>
                  <td v-if="canUserApproveStep(selectedDetailItem, selectedDetailType)" class="p-2.5 text-center">
                    <div class="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        @click="toggleDetailItemDecision(item.id, 5)"
                        class="px-2 py-1 rounded text-[10px] font-bold cursor-pointer transition-colors"
                        :class="getDetailItemDecision(item.id) === 5 ? 'bg-emerald-500/20 text-emerald-700 border border-emerald-500/30 font-black' : 'bg-brand-light text-brand-gray border border-brand-gray/15 hover:text-brand-dark'"
                      >
                        موافق
                      </button>
                      <button
                        type="button"
                        @click="toggleDetailItemDecision(item.id, 4)"
                        class="px-2 py-1 rounded text-[10px] font-bold cursor-pointer transition-colors"
                        :class="getDetailItemDecision(item.id) === 4 ? 'bg-red-500/20 text-red-700 border border-red-500/30 font-black' : 'bg-brand-light text-brand-gray border border-brand-gray/15 hover:text-brand-dark'"
                      >
                        مرفوض
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Rejection Reason input (When user has approval authority) -->
        <div v-if="canUserApproveStep(selectedDetailItem, selectedDetailType)" class="space-y-1.5">
          <label class="block font-semibold text-brand-dark text-xs">
            سبب الرفض (إلزامي في حال رفض أي صنف أو رفض كلي للطلب):
          </label>
          <Textarea
            v-model="detailRejectionReason"
            rows="2"
            class="w-full !bg-brand-light !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark text-xs"
            placeholder="اكتب سبب الرفض هنا في حال رفض الطلب أو أحد عناصره..."
          />
        </div>

        <!-- Dialog Footer Actions -->
        <div class="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-brand-gray/10">
          <div class="flex items-center gap-2">
            <Button
              @click="openTrailFromDetails"
              class="!bg-brand-soft hover:!bg-brand-accent/20 !text-brand-accent !border !border-brand-accent/30 !rounded-xl !px-3 !py-1.5 !text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <History class="w-3.5 h-3.5" />
              <span>معاينة مسار الاعتماد</span>
            </Button>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <SecondaryButton type="button" @click="showDetailsDialog = false">
              إغلاق
            </SecondaryButton>

            <template v-if="canUserApproveStep(selectedDetailItem, selectedDetailType)">
              <Button
                @click="executeRejectionFromDetails"
                :loading="detailActionLoading"
                class="!bg-red-500/10 hover:!bg-red-500/20 !text-red-600 !border !border-red-500/30 !font-bold !rounded-xl !px-3.5 !py-1.5 !text-xs flex items-center gap-1 cursor-pointer"
              >
                <X class="w-3.5 h-3.5" />
                <span>رفض كلي للطلب</span>
              </Button>

              <Button
                @click="executeApprovalFromDetails"
                :loading="detailActionLoading"
                class="!bg-emerald-600 hover:!bg-emerald-700 !text-white !font-bold !rounded-xl !px-4 !py-1.5 !text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Check class="w-3.5 h-3.5" />
                <span>تصديق واعتماد الطلب</span>
              </Button>
            </template>
          </div>
        </div>
      </div>
    </Dialog>

    <!-- DIALOG 1: ACCEPTANCE APPROVAL MODAL -->
    <Dialog
      v-model:visible="showApproveDialog"
      modal
      :header="`تصديق واعتماد ${selectedRequestType === 'exit' ? 'طلب صرف العهدة' : 'طلب توريد العهدة'} #${activeItem?.id}`"
      class="!bg-brand-white !border-brand-gray/15 max-w-2xl w-full !text-brand-dark"
    >
      <div v-if="activeItem" class="space-y-4 text-xs pt-2">
        <div class="p-3.5 rounded-xl bg-brand-light/60 border border-brand-gray/15 grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div>
            <span class="text-[10px] text-brand-gray block">مقدم الطلب:</span>
            <span class="font-bold text-brand-dark">{{ activeItem.requestedByPersonName || activeItem.receivedByPersonName || activeItem.requestedByUsername || activeItem.receivedByUsername }}</span>
            <span class="block font-mono text-[10px] text-brand-gray">عسكري: {{ activeItem.requestedByUserId || activeItem.receivedByUserId }}</span>
          </div>

          <div>
            <span class="text-[10px] text-brand-gray block">{{ selectedRequestType === 'exit' ? 'المستلم والفرع:' : 'المورد / السند:' }}</span>
            <span class="font-bold text-brand-dark">{{ activeItem.recipientName || activeItem.sourceName || activeItem.fromSource || '-' }}</span>
            <span class="block text-[10px] text-brand-gray">{{ activeItem.departmentName || activeItem.invoiceNumber || '' }}</span>
          </div>

          <div>
            <span class="text-[10px] text-brand-gray block">تاريخ الإنشاء:</span>
            <span class="font-bold text-brand-dark font-mono">{{ formatDate(activeItem.insertDate) }}</span>
          </div>
        </div>

        <!-- Items Table Preview -->
        <div>
          <h4 class="font-bold text-brand-dark mb-2 flex items-center gap-2">
            <Package class="w-4 h-4 text-brand-accent" />
            الأصناف المشمولة في الطلب ({{ activeItem.items?.length || 1 }})
          </h4>
          <div class="border border-brand-gray/15 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
            <table class="w-full text-right border-collapse">
              <thead class="bg-brand-light text-brand-gray text-[11px] border-b border-brand-gray/15">
                <tr>
                  <th class="p-2.5">اسم الصنف / المنتج</th>
                  <th class="p-2.5 text-center">الكمية</th>
                  <th class="p-2.5">الرقم التسلسلي / الباركود</th>
                  <th class="p-2.5 text-center">قرار الاعتماد</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-brand-gray/10 text-[11px]">
                <tr v-for="item in activeItem.items" :key="item.id" class="hover:bg-brand-light/30">
                  <td class="p-2.5 font-bold text-brand-dark">{{ item.productName || item.product?.name || `صنف #${item.productId}` }}</td>
                  <td class="p-2.5 text-center font-mono font-bold">{{ item.quantity || 1 }}</td>
                  <td class="p-2.5 font-mono text-brand-gray">{{ item.serialNumber || item.barcode || '-' }}</td>
                  <td class="p-2.5 text-center">
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                      موافق ومعتمد
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-xl text-emerald-800 dark:text-emerald-300 flex items-start gap-2.5">
          <CheckCircle2 class="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <span class="font-bold block">تأكيد التصديق والاعتماد</span>
            <p class="text-[11px] opacity-90 mt-0.5">
              بالنقر على "اعتماد وتصديق الطلب"، سيتم توثيق اسمك ورقمك العسكري في سجل مسار الاعتمادات وينتقل الطلب إلى المرحلة التالية بنجاح.
            </p>
          </div>
        </div>

        <div class="flex items-center justify-end gap-3 pt-3 border-t border-brand-gray/10">
          <SecondaryButton type="button" @click="showApproveDialog = false">
            إلغاء
          </SecondaryButton>
          <Button
            @click="executeApproval"
            :loading="actionLoading"
            class="!bg-emerald-600 hover:!bg-emerald-700 !text-white !font-bold !rounded-xl !px-4 !py-2 !text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer"
          >
            <Check class="w-4 h-4" />
            <span>اعتماد وتصديق الطلب</span>
          </Button>
        </div>
      </div>
    </Dialog>

    <!-- DIALOG 2: REJECTION MODAL -->
    <Dialog
      v-model:visible="showRejectDialog"
      modal
      header="رفض طلب الصرف / التوريد"
      class="!bg-brand-white !border-brand-gray/15 max-w-md w-full !text-brand-dark"
    >
      <div v-if="activeItem" class="space-y-4 text-xs pt-2">
        <p class="text-brand-gray">
          يرجى كتابة سبب رفض الطلب <span class="font-bold text-brand-dark">#{{ activeItem.id }}</span> ليظهر لمقدم الطلب لتصحيحه:
        </p>

        <div>
          <label class="block font-semibold text-brand-dark mb-1">سبب الرفض *</label>
          <Textarea
            v-model="rejectionReason"
            rows="3"
            required
            class="w-full !bg-brand-light !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark"
            placeholder="اكتب سبب الرفض بالتفصيل..."
          />
        </div>

        <div class="flex items-center justify-end gap-3 pt-3 border-t border-brand-gray/10">
          <SecondaryButton type="button" @click="showRejectDialog = false">
            إلغاء
          </SecondaryButton>
          <Button
            @click="executeRejection"
            :loading="actionLoading"
            class="!bg-red-600 hover:!bg-red-700 !text-white !font-bold !rounded-xl !px-4 !py-2 !text-xs flex items-center gap-1.5 shadow-md shadow-red-500/20 cursor-pointer"
          >
            <X class="w-4 h-4" />
            <span>تأكيد رفض الطلب</span>
          </Button>
        </div>
      </div>
    </Dialog>

    <!-- MODAL 3: WORKFLOW TRAIL MODAL (من اعتمد ومن لم يعتمد بعد) -->
    <WorkflowTrailModal
      v-model="showTrailDialog"
      :request="trailItem"
      :request-type="selectedRequestType"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useOhdaRequestsStore } from "../stores/useOhdaRequestsStore";
import { useOhdaAuthStore } from "../stores/useOhdaAuthStore";
import { useOhdaApprovalConfigStore } from "../stores/useOhdaApprovalConfigStore";
import { apiGet } from "@/utilities/fetchApi";
import WorkflowTrailModal from "../components/WorkflowTrailModal.vue";
import { useToast } from "primevue/usetoast";
import {
  CheckCheck,
  RotateCw,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  History,
  Search,
  Check,
  X,
  Eye,
  Package,
  ShieldCheck,
  Lock
} from "lucide-vue-next";

const requestsStore = useOhdaRequestsStore();
const authStore = useOhdaAuthStore();
const approvalConfigStore = useOhdaApprovalConfigStore();
const toast = useToast();

const activeTab = ref("exit");
const searchQuery = ref("");
const loading = ref(false);
const actionLoading = ref(false);

const showApproveDialog = ref(false);
const showRejectDialog = ref(false);
const showTrailDialog = ref(false);
const showDetailsDialog = ref(false);
const detailLoading = ref(false);
const detailActionLoading = ref(false);

const activeItem = ref(null);
const trailItem = ref(null);
const selectedDetailItem = ref(null);
const selectedDetailType = ref("exit"); // 'exit' or 'entry'
const selectedRequestType = ref("exit"); // 'exit' or 'entry'
const rejectionReason = ref("");
const detailRejectionReason = ref("");
const detailItemDecisions = ref({});

onMounted(async () => {
  await refreshData();
});

async function refreshData() {
  loading.value = true;
  try {
    await Promise.all([
      requestsStore.fetchExitRequests(),
      requestsStore.fetchEntryRequests(),
      approvalConfigStore.fetchApprovalConfigs()
    ]);
  } catch (err) {
    console.warn("Failed to load requests", err);
  } finally {
    loading.value = false;
  }
}

// Filter lists by branch if user is not SuperAdmin
const branchExitRequests = computed(() => {
  const list = requestsStore.exitRequests || [];
  if (authStore.isSuperAdmin) return list;
  const userBranchId = authStore.user?.branchId;
  return userBranchId ? list.filter(r => !r.branchId || r.branchId === userBranchId) : list;
});

const branchEntryRequests = computed(() => {
  const list = requestsStore.entryRequests || [];
  if (authStore.isSuperAdmin) return list;
  const userBranchId = authStore.user?.branchId;
  return userBranchId ? list.filter(r => !r.branchId || r.branchId === userBranchId) : list;
});

// Pending lists: all requests that are not rejected (4) and not completed (5 or confirmed)
const pendingExitList = computed(() => {
  return branchExitRequests.value.filter(r =>
    r.status !== 4 &&
    r.status !== 5 &&
    !(r.status === 2 && r.isRequesterConfirmed) &&
    !(r.status === 3 && r.isRequesterConfirmed)
  );
});

const pendingEntryList = computed(() => {
  return branchEntryRequests.value.filter(r =>
    r.status !== 4 &&
    r.status !== 5 &&
    !(r.status === 2 && r.isRequesterConfirmed) &&
    !(r.status === 3 && r.isRequesterConfirmed)
  );
});

const totalPendingCount = computed(() => {
  return pendingExitList.value.length + pendingEntryList.value.length;
});

const fullyApprovedCount = computed(() => {
  const exits = branchExitRequests.value.filter(r => r.status === 5 || (r.isRequesterConfirmed && (r.status === 2 || r.status === 3))).length;
  const entries = branchEntryRequests.value.filter(r => r.status === 5 || (r.isRequesterConfirmed && (r.status === 2 || r.status === 3))).length;
  return exits + entries;
});

// Dynamic Step permission check: Can the logged in user approve this step?
function canUserApproveStep(item, reqType) {
  if (!item) return false;
  if (authStore.isSuperAdmin || authStore.isAdmin) return true;

  const typeId = reqType === "exit" ? 2 : 1;
  const currentStep = item.currentStep || 2;

  const config = (approvalConfigStore.configs || []).find(
    c => c.requestType === typeId && c.stepOrder === currentStep && c.isActive && !c.isDeleted
  );

  if (!config) return false;

  const myMilitary = authStore.user?.militaryNumber || authStore.user?.id;
  const myGroupId = authStore.user?.userGroupId;

  if (config.userGroupId && myGroupId && config.userGroupId === myGroupId) {
    return true;
  }

  if (config.eligibleUsers && config.eligibleUsers.length > 0) {
    return config.eligibleUsers.some(u => String(u.militaryNumber) === String(myMilitary));
  }

  return false;
}

function getStepAssignedGroupName(item, reqType) {
  const typeId = reqType === "exit" ? 2 : 1;
  const currentStep = item.currentStep || 2;
  const config = (approvalConfigStore.configs || []).find(
    c => c.requestType === typeId && c.stepOrder === currentStep && c.isActive && !c.isDeleted
  );
  return config?.userGroupName || config?.stepName || "المعتمدين";
}

function getDynamicStepLabel(item, reqType) {
  if (item.status === 4) return "مرفوض ✖";
  if (item.status === 5 || (item.isRequesterConfirmed && (item.status === 2 || item.status === 3))) return "معتمد بالكامل ✔";

  const typeId = reqType === "exit" ? 2 : 1;
  const currentStep = item.currentStep || 2;
  const config = (approvalConfigStore.configs || []).find(
    c => c.requestType === typeId && c.stepOrder === currentStep && c.isActive && !c.isDeleted
  );

  if (config?.stepName) {
    return `${config.stepName} (مرحلة ${currentStep})`;
  }
  return `بانتظار التصديق (مرحلة ${currentStep})`;
}

// Filtered lists with search
const filteredPendingExitList = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return pendingExitList.value;
  return pendingExitList.value.filter(r =>
    String(r.id).includes(q) ||
    r.requestedByPersonName?.toLowerCase().includes(q) ||
    r.requestedByUsername?.toLowerCase().includes(q) ||
    String(r.requestedByUserId || '').includes(q) ||
    r.recipientName?.toLowerCase().includes(q)
  );
});

const filteredPendingEntryList = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return pendingEntryList.value;
  return pendingEntryList.value.filter(r =>
    String(r.id).includes(q) ||
    r.receivedByPersonName?.toLowerCase().includes(q) ||
    r.receivedByUsername?.toLowerCase().includes(q) ||
    String(r.receivedByUserId || '').includes(q) ||
    (r.sourceName || r.fromSource)?.toLowerCase().includes(q)
  );
});

const filteredHistoryList = computed(() => {
  const combined = [
    ...branchExitRequests.value.map(r => ({
      ...r,
      requestType: "exit",
      personName: r.requestedByPersonName,
      username: r.requestedByUsername,
      militaryNumber: r.requestedByUserId,
      partyName: r.recipientName
    })),
    ...branchEntryRequests.value.map(r => ({
      ...r,
      requestType: "entry",
      personName: r.receivedByPersonName,
      username: r.receivedByUsername,
      militaryNumber: r.receivedByUserId,
      partyName: r.sourceName || r.fromSource
    }))
  ];

  const q = searchQuery.value.trim().toLowerCase();
  const sorted = combined.sort((a, b) => new Date(b.lastUpdate || b.insertDate) - new Date(a.lastUpdate || a.insertDate));
  if (!q) return sorted;
  return sorted.filter(r =>
    String(r.id).includes(q) ||
    r.personName?.toLowerCase().includes(q) ||
    r.username?.toLowerCase().includes(q) ||
    String(r.militaryNumber || '').includes(q) ||
    r.partyName?.toLowerCase().includes(q)
  );
});

function getStatusName(status, isConfirmed) {
  if (status === 5 || (isConfirmed && (status === 2 || status === 3))) return "معتمد بالكامل";
  switch (status) {
    case 1: return "معلق (مرحلة 1)";
    case 2: return "موافقة المشرف (مرحلة 2)";
    case 3: return "موافقة المدير (مرحلة 2)";
    case 4: return "مرفوض";
    case 5: return "معتمد بالكامل";
    default: return "قيد المراجعة";
  }
}

function getStatusBadgeClass(status, isConfirmed) {
  if (status === 5 || (isConfirmed && (status === 2 || status === 3))) {
    return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
  }
  switch (status) {
    case 1: return "bg-amber-500/10 text-amber-600 border-amber-500/20";
    case 2:
    case 3: return "bg-blue-500/10 text-blue-600 border-blue-500/20";
    case 4: return "bg-red-500/10 text-red-600 border-red-500/20";
    case 5: return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
    default: return "bg-slate-500/10 text-slate-600 border-slate-500/20";
  }
}

function formatDate(dateStr) {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("ar-SA", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return dateStr;
  }
}

// Action Dialog Openers
function openApproveModal(item, type) {
  activeItem.value = item;
  selectedRequestType.value = type;
  showApproveDialog.value = true;
}

function openRejectModal(item, type) {
  activeItem.value = item;
  selectedRequestType.value = type;
  rejectionReason.value = "";
  showRejectDialog.value = true;
}

function openTrailModal(item, type) {
  trailItem.value = item;
  selectedRequestType.value = type;
  showTrailDialog.value = true;
}

// Open Full Request Details
async function viewDetails(item, type) {
  selectedDetailType.value = type || "exit";
  selectedDetailItem.value = item;
  showDetailsDialog.value = true;
  detailLoading.value = true;
  detailRejectionReason.value = "";
  detailItemDecisions.value = {};

  try {
    const url = (selectedDetailType.value === "exit")
      ? `/api/ProductExitRequest/${item.id}`
      : `/api/ProductEntryRequest/${item.id}`;
    const res = await apiGet(url);
    if (res?.data?.isDone && res.data.singleObject) {
      selectedDetailItem.value = res.data.singleObject;
    } else {
      selectedDetailItem.value = item;
    }
  } catch (_) {
    selectedDetailItem.value = item;
  } finally {
    detailLoading.value = false;
  }

  if (selectedDetailItem.value?.items) {
    selectedDetailItem.value.items.forEach(i => {
      detailItemDecisions.value[i.id] = (i.status === 4 ? 4 : 5);
    });
  }
}

function toggleDetailItemDecision(itemId, status) {
  detailItemDecisions.value[itemId] = status;
}

function getDetailItemDecision(itemId) {
  return detailItemDecisions.value[itemId] || 5;
}

function getItemStatusBadgeClass(status) {
  if (status === 1) return "bg-amber-500/10 text-amber-600 border-amber-500/20";
  if (status === 5 || status === 2) return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
  if (status === 4) return "bg-red-500/10 text-red-600 border-red-500/20";
  return "bg-brand-light text-brand-gray border-brand-gray/20";
}

function getItemStatusLabel(status) {
  if (status === 1) return "قيد الانتظار";
  if (status === 5 || status === 2) return "معتمد";
  if (status === 4) return "مرفوض";
  return "قيد الإجراء";
}

function openTrailFromDetails() {
  if (!selectedDetailItem.value) return;
  trailItem.value = selectedDetailItem.value;
  selectedRequestType.value = selectedDetailType.value;
  showTrailDialog.value = true;
}

// Execute Approval from Details Modal
async function executeApprovalFromDetails() {
  if (!selectedDetailItem.value) return;
  detailActionLoading.value = true;
  try {
    const isExit = selectedDetailType.value === "exit";
    const req = selectedDetailItem.value;

    const itemsPayload = Object.keys(detailItemDecisions.value).map(k => ({
      itemId: parseInt(k),
      status: detailItemDecisions.value[k]
    }));

    const anyRejected = itemsPayload.some(i => i.status === 4);
    if (anyRejected && !detailRejectionReason.value.trim()) {
      toast.add({
        severity: "warn",
        summary: "تنبيه",
        detail: "يرجى كتابة سبب الرفض لوجود أصناف مرفوضة",
        life: 4000
      });
      detailActionLoading.value = false;
      return;
    }

    const isManagerStep = req.currentStep === 2 || req.status === 1;
    let res;
    if (isExit) {
      res = isManagerStep
        ? await requestsStore.managerApproveExit(req.id, authStore.user, { items: itemsPayload, rejectionReason: detailRejectionReason.value.trim() })
        : await requestsStore.supervisorApproveExit(req.id, authStore.user, { items: itemsPayload, rejectionReason: detailRejectionReason.value.trim() });
    } else {
      res = isManagerStep
        ? await requestsStore.managerApproveEntry(req.id, authStore.user, { items: itemsPayload, rejectionReason: detailRejectionReason.value.trim() })
        : await requestsStore.supervisorApproveEntry(req.id, authStore.user, { items: itemsPayload, rejectionReason: detailRejectionReason.value.trim() });
    }

    if (res?.success) {
      showDetailsDialog.value = false;
      toast.add({
        severity: "success",
        summary: "تم التصديق بنجاح",
        detail: `تم تصديق واعتماد الطلب #${req.id} وتوثيق اسمك ورقمك العسكري في سجل المسار`,
        life: 4000
      });
      await refreshData();
    } else {
      toast.add({
        severity: "error",
        summary: "فشل الاعتماد",
        detail: res?.message || "حدث خطأ أثناء تنفيذ الاعتماد",
        life: 5000
      });
    }
  } catch (err) {
    console.error("Approval error", err);
  } finally {
    detailActionLoading.value = false;
  }
}

// Execute Rejection from Details Modal
async function executeRejectionFromDetails() {
  if (!selectedDetailItem.value) return;
  const reason = detailRejectionReason.value.trim();
  if (!reason) {
    toast.add({
      severity: "warn",
      summary: "تنبيه",
      detail: "يرجى كتابة سبب الرفض بالتفصيل قبل تأكيد الرفض",
      life: 4000
    });
    return;
  }

  detailActionLoading.value = true;
  try {
    const isExit = selectedDetailType.value === "exit";
    const req = selectedDetailItem.value;

    let res;
    if (isExit) {
      res = await requestsStore.rejectExitRequest(req.id, reason, authStore.user);
    } else {
      res = await requestsStore.rejectEntryRequest(req.id, reason, authStore.user);
    }

    if (res?.success) {
      showDetailsDialog.value = false;
      toast.add({
        severity: "info",
        summary: "تم الرفض",
        detail: `تم رفض الطلب #${req.id} وتسجيل السبب وإشعار مقدم الطلب`,
        life: 4000
      });
      await refreshData();
    } else {
      toast.add({
        severity: "error",
        summary: "فشل الرفض",
        detail: res?.message || "حدث خطأ أثناء رفض الطلب",
        life: 5000
      });
    }
  } catch (err) {
    console.error("Rejection error", err);
  } finally {
    detailActionLoading.value = false;
  }
}

// Execute Approval from quick approve modal
async function executeApproval() {
  if (!activeItem.value) return;
  actionLoading.value = true;
  try {
    const isExit = selectedRequestType.value === "exit";
    const req = activeItem.value;
    const itemsPayload = (req.items || []).map(i => ({ itemId: i.id, status: 5 })); // 5 = Approved

    const isManagerStep = req.currentStep === 2 || req.status === 1;
    let res;
    if (isExit) {
      res = isManagerStep
        ? await requestsStore.managerApproveExit(req.id, authStore.user, { items: itemsPayload })
        : await requestsStore.supervisorApproveExit(req.id, authStore.user, { items: itemsPayload });
    } else {
      res = isManagerStep
        ? await requestsStore.managerApproveEntry(req.id, authStore.user, { items: itemsPayload })
        : await requestsStore.supervisorApproveEntry(req.id, authStore.user, { items: itemsPayload });
    }

    if (res?.success) {
      showApproveDialog.value = false;
      toast.add({
        severity: "success",
        summary: "تم التصديق بنجاح",
        detail: `تم تصديق واعتماد الطلب #${req.id} وتوثيق اسمك ورقمك العسكري في سجل المسار`,
        life: 4000
      });
      await refreshData();
    } else {
      toast.add({
        severity: "error",
        summary: "فشل الاعتماد",
        detail: res?.message || "حدث خطأ أثناء تنفيذ الاعتماد",
        life: 5000
      });
    }
  } catch (err) {
    console.error("Approval error", err);
  } finally {
    actionLoading.value = false;
  }
}

// Execute Rejection from quick reject modal
async function executeRejection() {
  if (!activeItem.value || !rejectionReason.value.trim()) {
    toast.add({ severity: "warn", summary: "تنبيه", detail: "يرجى إدخال سبب الرفض", life: 3000 });
    return;
  }
  actionLoading.value = true;
  try {
    const isExit = selectedRequestType.value === "exit";
    const req = activeItem.value;
    const reason = rejectionReason.value.trim();

    let res;
    if (isExit) {
      res = await requestsStore.rejectExitRequest(req.id, reason, authStore.user);
    } else {
      res = await requestsStore.rejectEntryRequest(req.id, reason, authStore.user);
    }

    if (res?.success) {
      showRejectDialog.value = false;
      toast.add({
        severity: "info",
        summary: "تم الرفض",
        detail: `تم رفض الطلب #${req.id} وتسجيل السبب وإشعار مقدم الطلب`,
        life: 4000
      });
      await refreshData();
    } else {
      toast.add({
        severity: "error",
        summary: "فشل الرفض",
        detail: res?.message || "حدث خطأ أثناء رفض الطلب",
        life: 5000
      });
    }
  } catch (err) {
    console.error("Rejection error", err);
  } finally {
    actionLoading.value = false;
  }
}
</script>

<style scoped>
</style>
