<template>
  <div class="space-y-6">
    <!-- Header Title Bar -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-800/60 p-6 rounded-2xl border border-slate-700/60 backdrop-blur">
      <div>
        <h1 class="text-2xl font-bold text-white flex items-center gap-3">
          <Users class="w-7 h-7 text-emerald-400" />
          {{ $t('ohda.suppliers.title') }}
        </h1>
        <p class="text-xs text-slate-400 mt-1">
          {{ $t('ohda.suppliers.subTitle') }}
        </p>
      </div>

      <Button
        @click="openAddModal"
        class="!bg-emerald-500 hover:!bg-emerald-400 !text-slate-950 !font-bold !rounded-xl !px-4 !py-2 !text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20"
      >
        <UserPlus class="w-4 h-4" />
        {{ $t('ohda.suppliers.addSupplier') }}
      </Button>
    </div>

    <!-- Suppliers Grid Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="sup in inventoryStore.suppliers"
        :key="sup.id"
        class="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 backdrop-blur space-y-4 relative group hover:border-emerald-500/40 transition-all"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 border border-blue-500/20">
              <Users class="w-5 h-5" />
            </div>
            <div>
              <h3 class="font-bold text-white text-sm">{{ sup.companyName }}</h3>
              <span class="text-xs text-slate-400">{{ sup.contactPerson }}</span>
            </div>
          </div>

          <div class="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
            <editButton @click="editSupplier(sup)" />
            <deleteButton @click="deleteSupplier(sup.id)" />
          </div>
        </div>

        <div class="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-700/40">
          <div class="flex items-center gap-2">
            <Phone class="w-3.5 h-3.5 text-emerald-400" />
            <span class="font-mono">{{ sup.phone }}</span>
          </div>
          <div class="flex items-center gap-2">
            <Mail class="w-3.5 h-3.5 text-blue-400" />
            <span class="font-mono">{{ sup.email }}</span>
          </div>
          <div class="flex items-center gap-2">
            <LayoutGrid class="w-3.5 h-3.5 text-slate-400" />
            <span class="text-slate-400">{{ sup.address }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Volt Dialog for Supplier Modal -->
    <Dialog v-model:visible="showModal" modal :header="isEditing ? 'تعديل بيانات المورد' : $t('ohda.suppliers.addSupplier')" class="!bg-slate-800 !border-slate-700 max-w-md w-full">
      <form @submit.prevent="saveSupplier" class="space-y-4 text-xs">
        <div>
          <label class="block font-semibold text-slate-300 mb-1">{{ $t('ohda.suppliers.companyName') }}</label>
          <InputText v-model="form.companyName" required class="w-full !bg-slate-900 !border-slate-700 !text-white" />
        </div>

        <div>
          <label class="block font-semibold text-slate-300 mb-1">{{ $t('ohda.suppliers.contactPerson') }}</label>
          <InputText v-model="form.contactPerson" required class="w-full !bg-slate-900 !border-slate-700 !text-white" />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold text-slate-300 mb-1">{{ $t('ohda.suppliers.phone') }}</label>
            <InputText v-model="form.phone" required class="w-full !bg-slate-900 !border-slate-700 !text-white font-mono" />
          </div>
          <div>
            <label class="block font-semibold text-slate-300 mb-1">{{ $t('ohda.suppliers.email') }}</label>
            <InputText v-model="form.email" type="email" required class="w-full !bg-slate-900 !border-slate-700 !text-white font-mono" />
          </div>
        </div>

        <div>
          <label class="block font-semibold text-slate-300 mb-1">{{ $t('ohda.suppliers.address') }}</label>
          <InputText v-model="form.address" class="w-full !bg-slate-900 !border-slate-700 !text-white" />
        </div>

        <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-700/60">
          <SecondaryButton type="button" @click="showModal = false">
            {{ $t('ohda.common.cancel') }}
          </SecondaryButton>
          <Button type="submit" class="!bg-emerald-500 !text-slate-950 !font-bold">
            {{ $t('ohda.common.save') }}
          </Button>
        </div>
      </form>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useOhdaInventoryStore } from "../stores/useOhdaInventoryStore";

const inventoryStore = useOhdaInventoryStore();

onMounted(() => {
  inventoryStore.fetchSuppliers();
});

const showModal = ref(false);
const isEditing = ref(false);
const editingId = ref(null);

const form = ref({
  companyName: "",
  contactPerson: "",
  phone: "",
  email: "",
  address: ""
});

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
  if (isEditing.value) {
    await inventoryStore.updateSupplier(editingId.value, form.value);
  } else {
    await inventoryStore.addSupplier(form.value);
  }
  showModal.value = false;
}

async function deleteSupplier(id) {
  if (confirm("هل أنت تأكد من حذف هذا المورد؟")) {
    await inventoryStore.deleteSupplier(id);
  }
}
</script>
