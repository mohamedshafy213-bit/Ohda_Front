<template>
  <div class="space-y-6">
    <!-- Header Title & Action Bar -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-brand-white p-6 rounded-2xl border border-brand-gray/10 shadow-sm">
      <div>
        <h1 class="text-2xl font-bold text-brand-dark flex items-center gap-3">
          <Folder class="w-7 h-7 text-brand-accent" />
          {{ $t('ohda.categories.title') }}
        </h1>
        <p class="text-xs text-brand-gray mt-1">
          {{ $t('ohda.categories.subTitle') }}
        </p>
      </div>

      <Button
        @click="openAddModal"
        class="!bg-brand-accent hover:!bg-brand-accent/90 !text-brand-dark !font-bold !rounded-xl !px-4 !py-2 !text-xs flex items-center gap-2 shadow-md shadow-brand-accent/10"
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
        class="bg-brand-white border border-brand-gray/10 rounded-2xl p-5 shadow-sm space-y-3 relative group hover:border-brand-accent/40 transition-all"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="w-10 h-10 bg-brand-soft rounded-xl flex items-center justify-center text-brand-accent border border-brand-accent/20">
              <Folder class="w-5 h-5" />
            </div>
            <div>
              <h3 class="font-bold text-brand-dark text-sm">{{ cat.name }}</h3>
              <span class="text-[10px] font-mono text-brand-accent uppercase">{{ cat.code }}</span>
            </div>
          </div>

          <div class="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
            <editButton @click="editCategory(cat)" />
            <deleteButton @click="deleteCategory(cat.id)" />
          </div>
        </div>

        <p class="text-xs text-brand-gray min-h-[36px]">{{ cat.description || 'لا يوجد وصف مُدخل لهذه الفئة' }}</p>

        <div class="pt-2 border-t border-brand-gray/10 flex items-center justify-between text-xs">
          <span class="text-brand-gray">المنتجات المرتبطة</span>
          <span class="font-bold text-brand-accent bg-brand-soft px-2 py-0.5 rounded-full border border-brand-accent/20">
            {{ getCategoryProductsCount(cat.id) }} منتج
          </span>
        </div>
      </div>
    </div>

    <!-- Volt Dialog for Category Modal -->
    <Dialog v-model:visible="showModal" modal :header="isEditing ? 'تعديل الفئة' : $t('ohda.categories.addCategory')" class="!bg-brand-white !border-brand-gray/15 max-w-md w-full !text-brand-dark">
      <form @submit.prevent="saveCategory" class="space-y-4 text-xs">
        <div>
          <label class="block font-semibold text-brand-dark mb-1">{{ $t('ohda.categories.name') }}</label>
          <InputText v-model="form.name" required class="w-full !bg-brand-light !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark" />
        </div>

        <div>
          <label class="block font-semibold text-brand-dark mb-1">{{ $t('ohda.categories.code') }}</label>
          <InputText v-model="form.code" required class="w-full !bg-brand-light !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark font-mono" />
        </div>

        <div>
          <label class="block font-semibold text-brand-dark mb-1">{{ $t('ohda.categories.description') }}</label>
          <Textarea v-model="form.description" rows="3" class="w-full !bg-brand-light !border-brand-gray/25 focus:!border-brand-accent !text-brand-dark" />
        </div>

        <div class="flex items-center justify-end gap-3 pt-3 border-t border-brand-gray/10">
          <SecondaryButton type="button" @click="showModal = false">
            {{ $t('ohda.common.cancel') }}
          </SecondaryButton>
          <Button type="submit" class="!bg-brand-accent hover:!bg-brand-accent/90 !text-brand-dark !font-bold">
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
