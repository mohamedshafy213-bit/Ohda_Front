<template>
  <div class="space-y-6">
    <!-- Header Title & Action Bar -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-800/60 p-6 rounded-2xl border border-slate-700/60 backdrop-blur">
      <div>
        <h1 class="text-2xl font-bold text-white flex items-center gap-3">
          <Folder class="w-7 h-7 text-emerald-400" />
          {{ $t('ohda.categories.title') }}
        </h1>
        <p class="text-xs text-slate-400 mt-1">
          {{ $t('ohda.categories.subTitle') }}
        </p>
      </div>

      <Button
        @click="openAddModal"
        class="!bg-emerald-500 hover:!bg-emerald-400 !text-slate-950 !font-bold !rounded-xl !px-4 !py-2 !text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20"
      >
        <Plus class="w-4 h-4" />
        {{ $t('ohda.categories.addCategory') }}
      </Button>
    </div>

    <!-- Categories Grid Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="cat in inventoryStore.categories"
        :key="cat.id"
        class="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 backdrop-blur space-y-3 relative group hover:border-emerald-500/40 transition-all"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400">
              <Folder class="w-5 h-5" />
            </div>
            <div>
              <h3 class="font-bold text-white text-sm">{{ cat.name }}</h3>
              <span class="text-[10px] font-mono text-emerald-400 uppercase">{{ cat.code }}</span>
            </div>
          </div>

          <div class="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
            <editButton @click="editCategory(cat)" />
            <deleteButton @click="deleteCategory(cat.id)" />
          </div>
        </div>

        <p class="text-xs text-slate-400 min-h-[36px]">{{ cat.description || 'لا يوجد وصف مُدخل لهذه الفئة' }}</p>

        <div class="pt-2 border-t border-slate-700/40 flex items-center justify-between text-xs">
          <span class="text-slate-400">المنتجات المرتبطة</span>
          <span class="font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            {{ getCategoryProductsCount(cat.id) }} منتج
          </span>
        </div>
      </div>
    </div>

    <!-- Volt Dialog for Category Modal -->
    <Dialog v-model:visible="showModal" modal :header="isEditing ? 'تعديل الفئة' : $t('ohda.categories.addCategory')" class="!bg-slate-800 !border-slate-700 max-w-md w-full">
      <form @submit.prevent="saveCategory" class="space-y-4 text-xs">
        <div>
          <label class="block font-semibold text-slate-300 mb-1">{{ $t('ohda.categories.name') }}</label>
          <InputText v-model="form.name" required class="w-full !bg-slate-900 !border-slate-700 !text-white" />
        </div>

        <div>
          <label class="block font-semibold text-slate-300 mb-1">{{ $t('ohda.categories.code') }}</label>
          <InputText v-model="form.code" required class="w-full !bg-slate-900 !border-slate-700 !text-white font-mono" />
        </div>

        <div>
          <label class="block font-semibold text-slate-300 mb-1">{{ $t('ohda.categories.description') }}</label>
          <Textarea v-model="form.description" rows="3" class="w-full !bg-slate-900 !border-slate-700 !text-white" />
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
  inventoryStore.fetchCategories();
  inventoryStore.fetchProducts();
});

const showModal = ref(false);
const isEditing = ref(false);
const editingId = ref(null);

const form = ref({
  name: "",
  code: "",
  description: ""
});

function getCategoryProductsCount(catId) {
  return inventoryStore.products.filter(p => p.categoryId === catId).length;
}

function openAddModal() {
  isEditing.value = false;
  editingId.value = null;
  form.value = { name: "", code: "", description: "" };
  showModal.value = true;
}

function editCategory(cat) {
  isEditing.value = true;
  editingId.value = cat.id;
  form.value = { ...cat };
  showModal.value = true;
}

async function saveCategory() {
  if (isEditing.value) {
    await inventoryStore.updateCategory(editingId.value, form.value);
  } else {
    await inventoryStore.addCategory(form.value);
  }
  showModal.value = false;
}

async function deleteCategory(id) {
  if (confirm("هل أنت تأكد من حذف هذه الفئة؟")) {
    await inventoryStore.deleteCategory(id);
  }
}
</script>
