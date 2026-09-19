<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between bg-brand-white p-6 rounded-2xl border border-brand-gray/10">
      <div>
        <h1 class="text-2xl font-bold">حالات المنتجات</h1>
        <p class="text-xs text-brand-gray">إدارة حالات المنتج (جديد، مستعمل، تالف...)</p>
      </div>
      <Button @click="openAdd" class="!bg-brand-accent !text-brand-dark">إضافة حالة</Button>
    </div>

    <div class="bg-brand-white border border-brand-gray/10 rounded-2xl overflow-hidden shadow-sm">
      <DataTable :value="states" paginator :rows="10" :rowsPerPageOptions="[5, 10, 20, 50]" class="w-full text-xs">
        <Column field="name" header="الاسم">
          <template #body="{ data }">
            <div class="font-semibold">{{ data.name }}</div>
          </template>
        </Column>

        <Column field="code" header="الكود">
          <template #body="{ data }">
            <div class="text-brand-gray">{{ data.code || '-' }}</div>
          </template>
        </Column>

        <Column header="الإجراءات">
          <template #body="{ data }">
            <div class="flex items-center gap-2">
              <editButton @click="editItem(data)" />
              <deleteButton @click="confirmDelete(data.id)" />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <Dialog v-model:visible="showModal" modal :header="isEditing ? 'تعديل الحالة' : 'إضافة حالة'" class="max-w-md">
      <form @submit.prevent="save" class="space-y-4 text-xs">
        <div>
          <label class="block mb-1">الاسم</label>
          <InputText v-model="form.name" required />
        </div>

        <div>
          <label class="block mb-1">الكود (اختياري)</label>
          <InputText v-model="form.code" />
        </div>

        <div class="flex justify-end gap-2 pt-3 border-t border-brand-gray/10">
          <SecondaryButton type="button" @click="showModal = false">إلغاء</SecondaryButton>
          <Button type="submit" class="!bg-brand-accent">حفظ</Button>
        </div>
      </form>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { apiGet, apiPost, apiPut, apiDelete } from '@/utilities/fetchApi';

const states = ref([]);
const showModal = ref(false);
const isEditing = ref(false);
const editingId = ref(null);

const form = ref({ name: '', code: '' });

async function load() {
  try {
    const res = await apiGet('/api/ProductState');
    const data = res?.data?.objects || res?.data?.singleObject || [];
    states.value = data || [];
  } catch (err) {
    console.error('Failed to load product states', err);
  }
}

onMounted(load);

function openAdd() {
  isEditing.value = false;
  editingId.value = null;
  form.value = { name: '', code: '' };
  showModal.value = true;
}

function editItem(item) {
  isEditing.value = true;
  editingId.value = item.id;
  form.value = { name: item.name, code: item.code };
  showModal.value = true;
}

async function save() {
  try {
    if (isEditing.value && editingId.value) {
      await apiPut(`/api/ProductState/${editingId.value}`, form.value);
      await load();
    } else {
      await apiPost('/api/ProductState', form.value);
      await load();
    }
    showModal.value = false;
  } catch (err) {
    console.error('Save product state failed', err);
    alert('فشل الحفظ');
  }
}

async function confirmDelete(id) {
  if (!confirm('هل أنت متأكد من حذف هذه الحالة؟')) return;
  try {
    await apiDelete(`/api/ProductState/${id}`);
    await load();
  } catch (err) {
    console.error('Delete failed', err);
    alert('فشل الحذف');
  }
}
</script>
