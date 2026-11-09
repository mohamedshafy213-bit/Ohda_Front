<template>
  <div class="space-y-6">
    <!-- Header Title & Action Bar -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-brand-white dark:bg-white/5 p-6 rounded-2xl border border-brand-gray/10 shadow-sm">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-2xl bg-brand-accent/15 text-brand-accent flex items-center justify-center border border-brand-accent/20 shrink-0 shadow-sm">
          <PackageOpen class="w-6 h-6" />
        </div>
        <div>
          <h1 class="text-xl md:text-2xl font-bold text-brand-dark dark:text-white flex items-center gap-2">
            {{ $t('ohda.packages.title') }}
          </h1>
          <p class="text-xs text-brand-gray dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            {{ $t('ohda.packages.subTitle') }}
          </p>
        </div>
      </div>

      <Button
        @click="openAddModal"
        class="!bg-brand-accent hover:!bg-brand-accent/90 !text-brand-dark !font-bold !rounded-xl !px-5 !py-2.5 !text-xs flex items-center gap-2 shadow-md shadow-brand-accent/15 cursor-pointer shrink-0"
      >
        <Plus class="w-4 h-4" />
        {{ $t('ohda.packages.addPackage') }}
      </Button>
    </div>

    <!-- KPI / Statistics Highlights -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="bg-brand-white dark:bg-white/5 border border-brand-gray/10 rounded-2xl p-4 shadow-sm flex items-center gap-3.5">
        <div class="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
          <Boxes class="w-5 h-5" />
        </div>
        <div>
          <span class="text-[11px] text-brand-gray dark:text-slate-400 font-medium block">
            {{ $t('ohda.packages.totalPackages') }}
          </span>
          <span class="text-lg font-bold text-brand-dark dark:text-white font-mono">
            {{ packageStore.packages.length }}
          </span>
        </div>
      </div>

      <div class="bg-brand-white dark:bg-white/5 border border-brand-gray/10 rounded-2xl p-4 shadow-sm flex items-center gap-3.5">
        <div class="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
          <Check class="w-5 h-5" />
        </div>
        <div>
          <span class="text-[11px] text-brand-gray dark:text-slate-400 font-medium block">
            {{ $t('ohda.packages.active') }}
          </span>
          <span class="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono">
            {{ activeCount }}
          </span>
        </div>
      </div>

      <div class="bg-brand-white dark:bg-white/5 border border-brand-gray/10 rounded-2xl p-4 shadow-sm flex items-center gap-3.5">
        <div class="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
          <MousePointerClick class="w-5 h-5" />
        </div>
        <div>
          <span class="text-[11px] text-brand-gray dark:text-slate-400 font-medium block">
            {{ $t('ohda.packages.untrackedCount') }}
          </span>
          <span class="text-lg font-bold text-amber-600 dark:text-amber-400 font-mono">
            {{ untrackedStore.activeItems.length }}
          </span>
        </div>
      </div>
    </div>

    <!-- Search, Filter & View Mode Controls -->
    <div class="bg-brand-white dark:bg-white/5 border border-brand-gray/10 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
      <searchField
        v-model="searchQuery"
        :placeholder="$t('ohda.packages.searchPlaceholder')"
        class="max-w-md w-full"
      />

      <div class="flex items-center flex-wrap gap-2.5 justify-between md:justify-end">
        <!-- Filter status pills -->
        <div class="flex items-center gap-1 bg-brand-light dark:bg-white/5 p-1 rounded-xl border border-brand-gray/15">
          <button
            type="button"
            @click="statusFilter = 'all'"
            class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
            :class="statusFilter === 'all'
              ? 'bg-brand-white dark:bg-white/15 text-brand-dark dark:text-white shadow-xs'
              : 'text-brand-gray hover:text-brand-dark dark:hover:text-white'"
          >
            {{ $t('ohda.common.all') }} ({{ packageStore.packages.length }})
          </button>
          <button
            type="button"
            @click="statusFilter = 'active'"
            class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
            :class="statusFilter === 'active'
              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 shadow-xs'
              : 'text-brand-gray hover:text-brand-dark dark:hover:text-white'"
          >
            {{ $t('ohda.packages.active') }} ({{ activeCount }})
          </button>
          <button
            type="button"
            @click="statusFilter = 'inactive'"
            class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
            :class="statusFilter === 'inactive'
              ? 'bg-rose-500/15 text-rose-700 dark:text-rose-400 shadow-xs'
              : 'text-brand-gray hover:text-brand-dark dark:hover:text-white'"
          >
            {{ $t('ohda.packages.inactive') }} ({{ inactiveCount }})
          </button>
        </div>

        <!-- View mode switcher (Grid vs Table) -->
        <div class="flex items-center bg-brand-light dark:bg-white/5 p-1 rounded-xl border border-brand-gray/15">
          <button
            type="button"
            @click="viewMode = 'grid'"
            class="p-1.5 rounded-lg transition-all cursor-pointer"
            :class="viewMode === 'grid'
              ? 'bg-brand-white dark:bg-white/15 text-brand-accent shadow-xs'
              : 'text-brand-gray hover:text-brand-dark dark:hover:text-white'"
            :title="$t('ohda.packages.viewModeGrid')"
          >
            <LayoutGrid class="w-4 h-4" />
          </button>
          <button
            type="button"
            @click="viewMode = 'table'"
            class="p-1.5 rounded-lg transition-all cursor-pointer"
            :class="viewMode === 'table'
              ? 'bg-brand-white dark:bg-white/15 text-brand-accent shadow-xs'
              : 'text-brand-gray hover:text-brand-dark dark:hover:text-white'"
            :title="$t('ohda.packages.viewModeTable')"
          >
            <List class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Loading Skeleton -->
    <LoadingSkeleton v-if="packageStore.loading" :type="viewMode === 'grid' ? 'cards' : 'table'" :count="6" />

    <!-- Empty State -->
    <EmptyState
      v-else-if="filteredPackages.length === 0"
      :title="$t('ohda.packages.emptyTitle')"
      :description="$t('ohda.packages.emptyDesc')"
      icon="PackageOpen"
      :actionLabel="$t('ohda.packages.addPackage')"
      @action="openAddModal"
    />

    <!-- Cards View (Grid) -->
    <div v-else-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <div
        v-for="pkg in filteredPackages"
        :key="pkg.id"
        class="bg-brand-white dark:bg-white/5 border border-brand-gray/10 rounded-2xl p-5 shadow-sm space-y-4 relative group hover:border-brand-accent/40 dark:hover:border-brand-accent/40 transition-all flex flex-col justify-between"
      >
        <div class="space-y-3">
          <!-- Card Header: Title + Status + Actions -->
          <div class="flex items-start justify-between gap-2">
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-10 h-10 rounded-xl bg-brand-soft dark:bg-white/10 text-brand-accent border border-brand-accent/20 flex items-center justify-center shrink-0">
                <PackageOpen class="w-5 h-5" />
              </div>
              <div class="min-w-0">
                <h3 class="font-bold text-brand-dark dark:text-white text-sm truncate" :title="pkg.name">
                  {{ pkg.name }}
                </h3>
                <span
                  class="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold border"
                  :class="pkg.isActive
                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-600 border-rose-500/20'"
                >
                  {{ pkg.isActive ? $t('ohda.packages.active') : $t('ohda.packages.inactive') }}
                </span>
              </div>
            </div>

            <div class="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity shrink-0">
              <editButton @click="openEditModal(pkg)" />
              <deleteButton @click="promptDelete(pkg)" />
            </div>
          </div>

          <!-- Description -->
          <p class="text-xs text-brand-gray dark:text-slate-400 min-h-[32px] line-clamp-2 leading-relaxed">
            {{ pkg.description || 'لا يوجد وصف إضافي لهذه الحزمة.' }}
          </p>

          <!-- Items Pills List -->
          <div class="space-y-1.5 pt-1">
            <span class="text-[11px] font-bold text-brand-gray dark:text-slate-400 block">
              {{ $t('ohda.packages.packageItems') }} ({{ pkg.items?.length || 0 }}):
            </span>

            <div class="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1.5 bg-brand-light/40 dark:bg-white/5 rounded-xl border border-brand-gray/10">
              <span
                v-for="(item, idx) in pkg.items || []"
                :key="idx"
                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium border shadow-2xs"
                :class="item.untrackedItemId
                  ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/25'
                  : 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/25'"
              >
                <component
                  :is="item.untrackedItemId ? MousePointerClick : Folder"
                  class="w-3.5 h-3.5 shrink-0"
                  :class="item.untrackedItemId ? 'text-amber-600' : 'text-indigo-600'"
                />
                <span class="font-semibold">
                  {{ item.untrackedItemId ? item.untrackedItemName : `فئة: ${item.categoryName || item.trackedProductName || 'جهاز'}` }}
                </span>
                <span v-if="!item.untrackedItemId" class="font-mono font-bold text-[10px] bg-indigo-500/20 px-1 rounded">
                  ×{{ item.quantity }}
                </span>
              </span>

              <span v-if="!pkg.items?.length" class="text-brand-gray text-[11px] italic p-1">
                {{ $t('ohda.packages.noItemsYet') }}
              </span>
            </div>
          </div>
        </div>

        <!-- Card Footer -->
        <div class="pt-3 border-t border-brand-gray/10 dark:border-white/10 flex items-center justify-between text-xs text-brand-gray">
          <span class="flex items-center gap-1 font-mono text-[11px]">
            <Boxes class="w-3.5 h-3.5 text-brand-accent" />
            {{ pkg.items?.length || 0 }} مكونات
          </span>
          <span class="text-[10px] bg-brand-light dark:bg-white/10 px-2 py-0.5 rounded-full border border-brand-gray/15">
            قالب صرف أجهزة
          </span>
        </div>
      </div>
    </div>

    <!-- Table View -->
    <div v-else class="bg-brand-white dark:bg-white/5 border border-brand-gray/10 rounded-2xl overflow-hidden shadow-sm">
      <DataTable
        :value="filteredPackages"
        :paginator="filteredPackages.length > 10"
        :rows="10"
        :rowsPerPageOptions="[5, 10, 20, 50]"
        class="w-full text-xs"
        responsiveLayout="scroll"
      >
        <Column field="name" :header="$t('ohda.packages.packageName')" sortable>
          <template #body="{ data }">
            <div class="font-bold text-brand-dark dark:text-white flex items-center gap-3 py-1">
              <div class="w-8 h-8 rounded-xl bg-brand-soft dark:bg-white/10 text-brand-accent flex items-center justify-center shrink-0 border border-brand-accent/20">
                <PackageOpen class="w-4 h-4" />
              </div>
              <div>
                <span class="text-sm">{{ data.name }}</span>
                <p v-if="data.description" class="text-[11px] text-brand-gray font-normal mt-0.5">
                  {{ data.description }}
                </p>
              </div>
            </div>
          </template>
        </Column>

        <Column :header="$t('ohda.packages.packageItems')" style="min-width: 320px">
          <template #body="{ data }">
            <div class="flex flex-wrap gap-1.5 py-1">
              <span
                v-for="(item, idx) in data.items || []"
                :key="idx"
                class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium border"
                :class="item.untrackedItemId
                  ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/25'
                  : 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/25'"
              >
                <span>
                  {{ item.untrackedItemId ? item.untrackedItemName : `فئة: ${item.categoryName || item.trackedProductName} (×${item.quantity})` }}
                </span>
                <span class="text-[9px] opacity-75 font-mono">({{ item.untrackedItemId ? 'ملحق' : 'فئة جهاز' }})</span>
              </span>
              <span v-if="!data.items?.length" class="text-brand-gray italic text-[11px]">
                {{ $t('ohda.packages.noItemsYet') }}
              </span>
            </div>
          </template>
        </Column>

        <Column field="isActive" :header="$t('ohda.packages.status')" sortable style="width: 140px; text-align: center">
          <template #body="{ data }">
            <span
              class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border"
              :class="data.isActive
                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-600 border-rose-500/20'"
            >
              <span class="w-1.5 h-1.5 rounded-full" :class="data.isActive ? 'bg-emerald-500' : 'bg-rose-500'"></span>
              {{ data.isActive ? $t('ohda.packages.active') : $t('ohda.packages.inactive') }}
            </span>
          </template>
        </Column>

        <Column :header="$t('ohda.common.actions')" style="width: 110px; text-align: center">
          <template #body="{ data }">
            <div class="flex items-center justify-center gap-1.5">
              <editButton @click="openEditModal(data)" />
              <deleteButton @click="promptDelete(data)" />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Add / Edit Package Modal (Floating Solid Dialog) -->
    <Dialog
      v-model:visible="modalVisible"
      modal
      :header="editingPackage ? $t('ohda.packages.editPackage') : $t('ohda.packages.addPackage')"
      class="max-w-2xl w-full !bg-brand-white dark:!bg-brand-dark !border-brand-gray/15 !text-brand-dark dark:!text-white rounded-3xl overflow-hidden shadow-2xl"
      :pt="{
        mask: { class: 'bg-black/60 backdrop-blur-xs' },
        header: { class: '!bg-brand-white dark:!bg-brand-dark !border-b !border-brand-gray/10 !p-5' },
        content: { class: '!bg-brand-white dark:!bg-brand-dark !p-6' }
      }"
    >
      <form @submit.prevent="savePackage" class="space-y-5 pt-1">
        <!-- Basic Info Section -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-brand-dark dark:text-slate-200 mb-1.5">
              {{ $t('ohda.packages.packageName') }} <span class="text-rose-500">*</span>
            </label>
            <InputText
              v-model="form.name"
              :placeholder="$t('ohda.packages.packageNamePlaceholder')"
              class="w-full !rounded-xl !text-xs !py-2.5 !bg-brand-light dark:!bg-white/5 !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark dark:!text-white"
              required
              autofocus
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-brand-dark dark:text-slate-200 mb-1.5">
              {{ $t('ohda.packages.description') }}
            </label>
            <InputText
              v-model="form.description"
              :placeholder="$t('ohda.packages.descriptionPlaceholder')"
              class="w-full !rounded-xl !text-xs !py-2.5 !bg-brand-light dark:!bg-white/5 !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark dark:!text-white"
            />
          </div>
        </div>

        <div class="flex items-center gap-3 bg-brand-light dark:bg-white/5 p-3 rounded-xl border border-brand-gray/15">
          <Checkbox v-model="form.isActive" :binary="true" inputId="pkgActive" />
          <label for="pkgActive" class="text-xs font-semibold text-brand-dark dark:text-slate-200 cursor-pointer">
            {{ $t('ohda.packages.active') }} (متاحة للاختيار في طلبات صرف العهدة)
          </label>
        </div>

        <!-- Package Items Builder Section -->
        <div class="border border-brand-gray/15 rounded-2xl p-4 bg-gray-50/70 dark:bg-white/5 space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-xs font-bold text-brand-dark dark:text-white flex items-center gap-2">
              <Boxes class="w-4 h-4 text-brand-accent" />
              {{ $t('ohda.packages.packageItems') }}
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-accent/20 text-brand-dark dark:text-white">
                {{ form.items.length }} عناصر
              </span>
            </h3>

            <Button
              type="button"
              @click="addItemRow"
              class="!bg-brand-accent/20 hover:!bg-brand-accent/30 !text-brand-dark dark:!text-white !font-bold !rounded-xl !px-3.5 !py-1.5 !text-xs flex items-center gap-1.5 cursor-pointer !border-0"
            >
              <Plus class="w-3.5 h-3.5" />
              إضافة مكون للحزمة
            </Button>
          </div>

          <div v-if="!form.items.length" class="text-center py-8 text-brand-gray border border-dashed border-brand-gray/25 rounded-2xl bg-white/40 dark:bg-transparent">
            <Boxes class="w-8 h-8 mx-auto text-brand-gray/50 mb-2" />
            <p class="text-xs font-medium">{{ $t('ohda.packages.noItemsYet') }}</p>
            <p class="text-[11px] text-brand-gray/70 mt-1">
              أضف فئات الأجهزة المتتبعة (مثل فئة حواسب، فئة شاشات) والملحقات غير المتتبعة (ماوس، كيبورد)
            </p>
          </div>

          <div v-else class="space-y-3 max-h-72 overflow-y-auto pr-1">
            <div
              v-for="(row, idx) in form.items"
              :key="idx"
              class="flex flex-col sm:flex-row items-center gap-3 bg-white dark:bg-white/10 p-3.5 rounded-2xl border border-brand-gray/15 shadow-2xs"
            >
              <!-- Item Type Segmented Selector -->
              <div class="w-full sm:w-44 shrink-0">
                <label class="block text-[10px] font-bold text-brand-gray mb-1">نوع المكون</label>
                <select
                  v-model="row.type"
                  @change="onTypeChange(row)"
                  class="w-full rounded-xl border border-brand-gray/25 bg-brand-light dark:bg-slate-800 px-3 py-2 text-xs text-brand-dark dark:text-white font-medium focus:outline-none focus:ring-1 focus:ring-brand-accent cursor-pointer"
                >
                  <option value="Category">فئة جهاز متتبع (تصنيف)</option>
                  <option value="Untracked">ملحق غير متتبع (بالاسم)</option>
                </select>
              </div>

              <!-- Item Selector Dropdown (Category vs Untracked) -->
              <div class="w-full flex-1">
                <label class="block text-[10px] font-bold text-brand-gray mb-1">
                  {{ row.type === 'Category' ? 'اختر فئة الجهاز من المستودع' : 'اختر الملحق غير المتتبع' }}
                </label>
                <select
                  v-if="row.type === 'Category'"
                  v-model="row.categoryId"
                  class="w-full rounded-xl border border-brand-gray/25 bg-brand-light dark:bg-slate-800 px-3 py-2 text-xs text-brand-dark dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-accent cursor-pointer font-medium"
                  required
                >
                  <option :value="null" disabled>-- اختر فئة الأجهزة --</option>
                  <option v-for="c in categories" :key="c.id" :value="c.id">
                    فئة: {{ c.name }}
                  </option>
                </select>

                <select
                  v-else
                  v-model="row.untrackedItemId"
                  class="w-full rounded-xl border border-brand-gray/25 bg-brand-light dark:bg-slate-800 px-3 py-2 text-xs text-brand-dark dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-accent cursor-pointer font-medium"
                  required
                >
                  <option :value="null" disabled>-- اختر الملحق --</option>
                  <option v-for="u in untrackedStore.activeItems" :key="u.id" :value="u.id">
                    {{ u.name }}
                  </option>
                </select>
              </div>

              <!-- Quantity Field -->
              <div v-if="row.type === 'Category'" class="w-full sm:w-24 shrink-0">
                <label class="block text-[10px] font-bold text-brand-gray mb-1">الكمية</label>
                <input
                  type="number"
                  v-model.number="row.quantity"
                  min="1"
                  class="w-full rounded-xl border border-brand-gray/25 bg-brand-light dark:bg-slate-800 px-2.5 py-2 text-xs text-center font-bold text-brand-dark dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-accent"
                />
              </div>

              <div v-else class="w-full sm:w-24 shrink-0 text-center">
                <label class="block text-[10px] font-bold text-brand-gray mb-1">الكمية</label>
                <span class="text-xs text-brand-gray/70 font-mono py-2 block">ملحق</span>
              </div>

              <!-- Remove Button -->
              <div class="shrink-0 self-end sm:self-center pt-2 sm:pt-4">
                <button
                  type="button"
                  @click="removeItemRow(idx)"
                  class="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 flex items-center justify-center transition-all cursor-pointer"
                  title="حذف هذا المكون"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-2 pt-4 border-t border-brand-gray/10">
          <Button
            type="button"
            :label="$t('ohda.common.cancel')"
            class="!text-xs !rounded-xl !bg-gray-100 dark:!bg-white/10 !text-gray-700 dark:!text-gray-300 !border-0 cursor-pointer"
            @click="modalVisible = false"
          />
          <Button
            type="submit"
            :label="editingPackage ? $t('ohda.common.save') : $t('ohda.packages.addPackage')"
            :loading="saving"
            class="!text-xs !rounded-xl !bg-brand-accent hover:!bg-brand-accent/90 !text-brand-dark !font-bold !border-0 cursor-pointer"
          />
        </div>
      </form>
    </Dialog>

    <!-- Delete Confirmation Dialog -->
    <DeleteDialog
      v-model="showDeleteDialog"
      :item-name="deletingPackage?.name"
      :title="$t('ohda.packages.confirmDeleteTitle')"
      :subtitle="$t('ohda.packages.confirmDeleteMsg', { name: deletingPackage?.name })"
      :loading="deleting"
      @confirm="executeDelete"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useOhdaPackageStore } from '@/projects/ohda/stores/useOhdaPackageStore';
import { useOhdaUntrackedItemStore } from '@/projects/ohda/stores/useOhdaUntrackedItemStore';
import { useOhdaInventoryStore } from '@/projects/ohda/stores/useOhdaInventoryStore';
import { useToastStore } from '@/stores/toastStore';
import {
  PackageOpen,
  Plus,
  Boxes,
  Folder,
  Trash2,
  Check,
  MousePointerClick,
  LayoutGrid,
  List
} from 'lucide-vue-next';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Checkbox from 'primevue/checkbox';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import searchField from '@/components/searchField.vue';
import editButton from '@/components/editButton.vue';
import deleteButton from '@/components/deleteButton.vue';
import DeleteDialog from '@/components/DeleteDialog.vue';
import EmptyState from '@/components/EmptyState.vue';
import LoadingSkeleton from '@/components/LoadingSkeleton.vue';

const packageStore = useOhdaPackageStore();
const untrackedStore = useOhdaUntrackedItemStore();
const inventoryStore = useOhdaInventoryStore();
const toastStore = useToastStore();

const searchQuery = ref('');
const statusFilter = ref('all');
const viewMode = ref('grid'); // 'grid' | 'table'
const modalVisible = ref(false);
const editingPackage = ref(null);
const saving = ref(false);

const showDeleteDialog = ref(false);
const deletingPackage = ref(null);
const deleting = ref(false);

const form = ref({
  name: '',
  description: '',
  isActive: true,
  items: []
});

onMounted(async () => {
  await Promise.all([
    packageStore.fetchPackages(),
    untrackedStore.fetchItems(),
    inventoryStore.fetchCategories()
  ]);
});

const categories = computed(() => inventoryStore.categories || []);
const activeCount = computed(() => packageStore.packages.filter((p) => p.isActive).length);
const inactiveCount = computed(() => packageStore.packages.filter((p) => !p.isActive).length);

const filteredPackages = computed(() => {
  let list = packageStore.packages;
  if (statusFilter.value === 'active') {
    list = list.filter((p) => p.isActive);
  } else if (statusFilter.value === 'inactive') {
    list = list.filter((p) => !p.isActive);
  }

  if (!searchQuery.value.trim()) return list;
  const q = searchQuery.value.toLowerCase().trim();
  return list.filter(
    (p) => p.name?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)
  );
});

function addItemRow() {
  form.value.items.push({
    type: 'Category',
    categoryId: categories.value[0]?.id || null,
    untrackedItemId: null,
    quantity: 1
  });
}

function onTypeChange(row) {
  if (row.type === 'Category') {
    row.untrackedItemId = null;
    row.categoryId = categories.value[0]?.id || null;
    row.quantity = 1;
  } else {
    row.categoryId = null;
    row.untrackedItemId = untrackedStore.activeItems[0]?.id || null;
    row.quantity = 1;
  }
}

function removeItemRow(index) {
  form.value.items.splice(index, 1);
}

function openAddModal() {
  editingPackage.value = null;
  form.value = {
    name: '',
    description: '',
    isActive: true,
    items: []
  };
  modalVisible.value = true;
}

function openEditModal(pkg) {
  editingPackage.value = pkg;
  form.value = {
    name: pkg.name,
    description: pkg.description || '',
    isActive: pkg.isActive,
    items: (pkg.items || []).map((i) => ({
      type: i.untrackedItemId ? 'Untracked' : 'Category',
      categoryId: i.categoryId,
      untrackedItemId: i.untrackedItemId,
      quantity: i.quantity || 1
    }))
  };
  modalVisible.value = true;
}

async function savePackage() {
  if (!form.value.name.trim()) return;
  if (form.value.items.length === 0) {
    toastStore.addWarningToast('يرجى إضافة عنصر واحد على الأقل داخل الحزمة');
    return;
  }

  saving.value = true;
  try {
    const payload = {
      name: form.value.name.trim(),
      description: form.value.description?.trim() || null,
      isActive: form.value.isActive,
      items: form.value.items.map((i) => ({
        categoryId: i.type === 'Category' ? i.categoryId : null,
        trackedProductId: null,
        untrackedItemId: i.type === 'Untracked' ? i.untrackedItemId : null,
        quantity: i.type === 'Category' ? Math.max(1, i.quantity) : 1
      }))
    };

    if (editingPackage.value) {
      await packageStore.updatePackage(editingPackage.value.id, {
        id: editingPackage.value.id,
        ...payload
      });
      toastStore.addSuccessToast('تم تحديث الحزمة بنجاح');
    } else {
      await packageStore.createPackage(payload);
      toastStore.addSuccessToast('تم إنشاء الحزمة بنجاح');
    }
    modalVisible.value = false;
  } catch (err) {
    toastStore.addErrorToast('حدث خطأ أثناء حفظ الحزمة');
  } finally {
    saving.value = false;
  }
}

function promptDelete(pkg) {
  deletingPackage.value = pkg;
  showDeleteDialog.value = true;
}

async function executeDelete() {
  if (!deletingPackage.value) return;
  deleting.value = true;
  try {
    await packageStore.deletePackage(deletingPackage.value.id);
    toastStore.addSuccessToast('تم حذف الحزمة بنجاح');
    showDeleteDialog.value = false;
  } catch (err) {
    toastStore.addErrorToast('تعذر حذف الحزمة');
  } finally {
    deleting.value = false;
    deletingPackage.value = null;
  }
}
</script>
