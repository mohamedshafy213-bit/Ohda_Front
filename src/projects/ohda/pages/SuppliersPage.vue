<template>
  <div class="space-y-6">
    <!-- Header Title Bar -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-brand-white dark:bg-white/5 p-6 rounded-2xl border border-brand-gray/10 shadow-sm">
      <div>
        <h1 class="text-2xl font-bold text-brand-dark dark:text-white flex items-center gap-3">
          <Truck class="w-7 h-7 text-brand-accent" />
          {{ $t('ohda.suppliers.title') }}
        </h1>
        <p class="text-xs text-brand-gray dark:text-slate-400 mt-1">
          {{ $t('ohda.suppliers.subTitle') }}
        </p>
      </div>

      <Button
        @click="openAddModal"
        class="!bg-brand-accent hover:!bg-brand-accent/90 !text-brand-dark !font-bold !rounded-xl !px-4 !py-2.5 !text-xs flex items-center gap-2 shadow-md shadow-brand-accent/10 cursor-pointer"
      >
        <Plus class="w-4 h-4" />
        {{ $t('ohda.suppliers.addSupplier') }}
      </Button>
    </div>

    <!-- Search & Filter Bar -->
    <div class="bg-brand-white dark:bg-white/5 border border-brand-gray/10 p-4 rounded-2xl shadow-sm">
      <searchField v-model="searchQuery" :placeholder="$t('ohda.common.search')" />
    </div>

    <!-- Loading Skeleton -->
    <LoadingSkeleton v-if="inventoryStore.loading" type="cards" :count="6" />

    <!-- Empty State -->
    <EmptyState
      v-else-if="filteredSuppliers.length === 0"
      :title="$t('ohda.suppliers.emptySuppliers')"
      icon="Truck"
      :actionLabel="$t('ohda.suppliers.addSupplier')"
      @action="openAddModal"
    />

    <!-- Suppliers Grid Cards -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="sup in filteredSuppliers"
        :key="sup.id"
        class="bg-brand-white dark:bg-white/5 border border-brand-gray/10 rounded-2xl p-5 shadow-sm space-y-4 relative group hover:border-brand-accent/40 dark:hover:border-brand-accent/40 transition-all"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-10 h-10 bg-blue-500/10 dark:bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-500/20 shrink-0">
              <Truck class="w-5 h-5" />
            </div>
            <div class="min-w-0">
              <h3 class="font-bold text-brand-dark dark:text-white text-sm truncate">{{ sup.companyName }}</h3>
              <span class="text-xs text-brand-gray dark:text-slate-400 block truncate">{{ sup.contactPerson }}</span>
            </div>
          </div>

          <div class="flex items-center gap-1 opacity-85 group-hover:opacity-100 transition-opacity">
            <editButton @click="editSupplier(sup)" />
            <deleteButton @click="promptDelete(sup)" />
          </div>
        </div>

        <div class="space-y-2 text-xs text-brand-dark dark:text-slate-300 pt-2 border-t border-brand-gray/10 dark:border-white/10">
          <div v-if="sup.phone" class="flex items-center gap-2">
            <Phone class="w-3.5 h-3.5 text-brand-accent shrink-0" />
            <span class="font-mono text-xs">{{ sup.phone }}</span>
          </div>
          <div v-if="sup.email" class="flex items-center gap-2 truncate">
            <Mail class="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span class="font-mono text-xs truncate">{{ sup.email }}</span>
          </div>
          <div v-if="sup.address" class="flex items-center gap-2">
            <MapPin class="w-3.5 h-3.5 text-brand-gray shrink-0" />
            <span class="text-brand-gray dark:text-slate-400 truncate">{{ sup.address }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Volt Dialog for Supplier Modal -->
    <Dialog
      v-model:visible="showModal"
      modal
      :header="isEditing ? $t('ohda.suppliers.editSupplier') : $t('ohda.suppliers.addSupplier')"
      class="max-w-md w-full !bg-brand-white dark:!bg-brand-dark !border-brand-gray/15 !text-brand-dark dark:!text-white rounded-3xl overflow-hidden shadow-2xl"
    >
      <form @submit.prevent="saveSupplier" class="space-y-4 text-xs">
        <div>
          <label class="block font-semibold text-brand-dark dark:text-white mb-1.5 required">
            {{ $t('ohda.suppliers.companyName') }}
          </label>
          <InputText
            v-model="form.companyName"
            required
            class="w-full !bg-brand-light dark:!bg-brand-dark/50 !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark dark:!text-white rounded-xl"
            autofocus
          />
        </div>

        <div>
          <label class="block font-semibold text-brand-dark dark:text-white mb-1.5 required">
            {{ $t('ohda.suppliers.contactPerson') }}
          </label>
          <InputText
            v-model="form.contactPerson"
            required
            class="w-full !bg-brand-light dark:!bg-brand-dark/50 !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark dark:!text-white rounded-xl"
          />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold text-brand-dark dark:text-white mb-1.5 required">
              {{ $t('ohda.suppliers.phone') }}
            </label>
            <InputText
              v-model="form.phone"
              required
              class="w-full !bg-brand-light dark:!bg-brand-dark/50 !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark dark:!text-white rounded-xl font-mono"
            />
          </div>
          <div>
            <label class="block font-semibold text-brand-dark dark:text-white mb-1.5 required">
              {{ $t('ohda.suppliers.email') }}
            </label>
            <InputText
              v-model="form.email"
              type="email"
              required
              class="w-full !bg-brand-light dark:!bg-brand-dark/50 !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark dark:!text-white rounded-xl font-mono"
            />
          </div>
        </div>

        <div>
          <label class="block font-semibold text-brand-dark dark:text-white mb-1.5">
            {{ $t('ohda.suppliers.address') }}
          </label>
          <InputText
            v-model="form.address"
            class="w-full !bg-brand-light dark:!bg-brand-dark/50 !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark dark:!text-white rounded-xl"
          />
        </div>

        <div class="flex items-center justify-end gap-2.5 pt-4 border-t border-brand-gray/10 dark:border-white/10">
          <SecondaryButton type="button" :disabled="isSaving" @click="showModal = false">
            {{ $t('ohda.common.cancel') }}
          </SecondaryButton>
          <Button
            type="submit"
            :disabled="isSaving"
            class="!bg-brand-accent hover:!bg-brand-accent/90 !text-brand-dark !font-bold flex items-center gap-2 shadow-md shadow-brand-accent/15"
          >
            <div v-if="isSaving" class="animate-spin rounded-full h-3.5 w-3.5 border-2 border-brand-dark/30 border-t-brand-dark"></div>
            <span>{{ isSaving ? $t('ohda.common.saving') : $t('ohda.common.save') }}</span>
          </Button>
        </div>
      </form>
    </Dialog>

    <!-- Delete Confirmation Dialog -->
    <DeleteDialog
      v-model="showDeleteDialog"
      :itemType="$t('ohda.suppliers.title')"
      :itemName="selectedSupplierForDelete?.companyName || ''"
      :canDelete="getSupplierProductsCount(selectedSupplierForDelete?.id) === 0"
      :warningMessage="getSupplierProductsCount(selectedSupplierForDelete?.id) > 0 ? `لا يمكن حذف هذا المورد لأنه مرتبط بـ (${getSupplierProductsCount(selectedSupplierForDelete?.id)}) أصناف في المخزون. يرجى تعديل الأصناف أولاً.` : ''"
      :confirm="handleDelete"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useOhdaInventoryStore } from "../stores/useOhdaInventoryStore";
import { useToastStore } from "@/stores/toastStore";
import { useI18n } from "vue-i18n";
import DeleteDialog from "@/components/DeleteDialog.vue";
import EmptyState from "@/components/EmptyState.vue";
import LoadingSkeleton from "@/components/LoadingSkeleton.vue";

const { t } = useI18n();
const inventoryStore = useOhdaInventoryStore();
const toastStore = useToastStore();

const searchQuery = ref("");
const showModal = ref(false);
const isEditing = ref(false);
const isSaving = ref(false);
const editingId = ref(null);

const showDeleteDialog = ref(false);
const selectedSupplierForDelete = ref(null);

const form = ref({
  companyName: "",
  contactPerson: "",
  phone: "",
  email: "",
  address: ""
});

onMounted(() => {
  inventoryStore.fetchSuppliers();
  inventoryStore.fetchProducts();
});

const filteredSuppliers = computed(() => {
  if (!searchQuery.value?.trim()) return inventoryStore.suppliers || [];
  const q = searchQuery.value.toLowerCase().trim();
  return (inventoryStore.suppliers || []).filter(
    s => s.companyName?.toLowerCase().includes(q) ||
         s.contactPerson?.toLowerCase().includes(q) ||
         s.phone?.toLowerCase().includes(q) ||
         s.email?.toLowerCase().includes(q) ||
         s.address?.toLowerCase().includes(q)
  );
});

function getSupplierProductsCount(supId) {
  if (!supId) return 0;
  return (inventoryStore.products || []).filter(p => p.supplierId === supId).length;
}

function openAddModal() {
  isEditing.value = false;
  editingId.value = null;
  form.value = { companyName: "", contactPerson: "", phone: "", email: "", address: "" };
  showModal.value = true;
}

function editSupplier(sup) {
  isEditing.value = true;
  editingId.value = sup.id;
  form.value = { ...sup };
  showModal.value = true;
}

async function saveSupplier() {
  if (!form.value.companyName?.trim()) return;
  isSaving.value = true;
  try {
    if (isEditing.value) {
      await inventoryStore.updateSupplier(editingId.value, form.value);
    } else {
      await inventoryStore.addSupplier(form.value);
    }
    toastStore.addSuccessToast(t("ohda.common.operationSuccess"));
    showModal.value = false;
  } catch (err) {
    console.error("Save supplier failed", err);
  } finally {
    isSaving.value = false;
  }
}

function promptDelete(sup) {
  selectedSupplierForDelete.value = sup;
  showDeleteDialog.value = true;
}

async function handleDelete() {
  if (!selectedSupplierForDelete.value) return;
  try {
    const res = await inventoryStore.deleteSupplier(selectedSupplierForDelete.value.id);
    if (res && res.success === false) {
      toastStore.addErrorToast(res.message || "تعذر حذف المورد");
      return res;
    }
    toastStore.addSuccessToast(t("ohda.common.operationSuccess"));
  } catch (err) {
    console.error("Delete supplier failed", err);
    toastStore.addErrorToast(err?.response?.data?.returnMessage || err?.message || "تعذر حذف المورد");
    throw err;
  } finally {
    selectedSupplierForDelete.value = null;
  }
}
</script>
