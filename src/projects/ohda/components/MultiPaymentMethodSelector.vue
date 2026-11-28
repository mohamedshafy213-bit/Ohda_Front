<template>
  <div class="space-y-3 bg-brand-light/40 dark:bg-brand-dark/40 p-3.5 rounded-2xl border border-brand-gray/20">
    <!-- Header / Label -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-brand-accent"></span>
        <label class="font-bold text-xs text-brand-dark dark:text-white">
          {{ label || "طرق السداد (تحديد متعدد وتوزيع المبالغ)" }}
        </label>
      </div>

      <span v-if="totalAmount > 0" class="text-[11px] font-mono text-brand-gray font-bold">
        المطلوب: <span class="text-brand-accent">{{ formatNumber(totalAmount) }} ج.م</span>
      </span>
    </div>

    <!-- Quick Presets -->
    <div v-if="totalAmount > 0 && !disabled" class="flex flex-wrap items-center gap-1.5 text-[10px]">
      <span class="text-brand-gray font-medium">توزيع سريع:</span>
      <button
        type="button"
        @click="applyPreset('allCash')"
        class="px-2 py-0.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 font-bold transition-colors cursor-pointer"
      >
        💵 100% كاش
      </button>
      <button
        type="button"
        @click="applyPreset('allVisa')"
        class="px-2 py-0.5 rounded-lg border border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400 hover:bg-blue-500/20 font-bold transition-colors cursor-pointer"
      >
        💳 100% فيزا / بنك
      </button>
      <button
        type="button"
        @click="applyPreset('allInsta')"
        class="px-2 py-0.5 rounded-lg border border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-400 hover:bg-purple-500/20 font-bold transition-colors cursor-pointer"
      >
        📱 100% إنستاباي
      </button>
      <button
        type="button"
        @click="applyPreset('halfCashHalfVisa')"
        class="px-2 py-0.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-500/20 font-bold transition-colors cursor-pointer"
      >
        ⚖️ 50% كاش + 50% فيزا
      </button>
    </div>

    <!-- Method Selection Buttons (Multi-Select) -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
      <button
        v-for="opt in availableMethods"
        :key="opt.value"
        type="button"
        :disabled="disabled"
        @click="toggleMethod(opt.value)"
        class="p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer text-xs"
        :class="
          isMethodSelected(opt.value)
            ? 'border-brand-accent bg-brand-accent/15 text-brand-dark dark:text-white font-extrabold shadow-sm ring-1 ring-brand-accent'
            : 'border-brand-gray/20 bg-white dark:bg-brand-dark/80 text-brand-gray hover:border-brand-accent/50'
        "
      >
        <span class="text-base">{{ opt.icon }}</span>
        <span>{{ opt.name }}</span>
        <span v-if="isMethodSelected(opt.value)" class="text-[10px] font-mono font-bold text-brand-accent">
          {{ formatNumber(amountsMap[opt.value] || 0) }} ج.م
        </span>
      </button>
    </div>

    <!-- Inputs for Selected Methods -->
    <div v-if="selectedMethodValues.length > 0" class="space-y-2 pt-1">
      <div
        v-for="methodVal in selectedMethodValues"
        :key="methodVal"
        class="p-2.5 rounded-xl bg-white dark:bg-brand-dark/90 border border-brand-gray/15 flex items-center justify-between gap-3 text-xs"
      >
        <div class="flex items-center gap-2 min-w-[130px]">
          <span class="text-base">{{ getMethodInfo(methodVal).icon }}</span>
          <span class="font-bold">{{ getMethodInfo(methodVal).name }}</span>
        </div>

        <div class="flex items-center gap-2 flex-1 justify-end">
          <div class="relative max-w-[140px] w-full">
            <input
              type="number"
              min="0"
              step="any"
              :disabled="disabled"
              :value="amountsMap[methodVal]"
              @input="onAmountInput(methodVal, $event.target.value)"
              class="w-full p-1.5 pr-2 pl-7 rounded-lg border border-brand-gray/30 font-mono font-bold text-center focus:border-brand-accent focus:ring-1 focus:ring-brand-accent"
              placeholder="0.00"
            />
            <span class="absolute left-2 top-1.5 text-[10px] text-brand-gray pointer-events-none">ج.م</span>
          </div>

          <!-- Fill Remaining Button -->
          <button
            v-if="!disabled && totalAmount > 0 && remainingToAllocate !== 0"
            type="button"
            @click="fillRemaining(methodVal)"
            class="px-2 py-1.5 rounded-lg bg-brand-accent/15 text-brand-accent hover:bg-brand-accent hover:text-brand-dark font-bold text-[10px] whitespace-nowrap transition-colors cursor-pointer"
            title="إضافة أو ضبط المتبقي في هذه الطريقة"
          >
            ضبط الباقي
          </button>
        </div>
      </div>
    </div>

    <!-- Validation Status & Summary Bar -->
    <div
      v-if="totalAmount > 0"
      class="p-2.5 rounded-xl flex flex-wrap items-center justify-between text-xs font-bold gap-2"
      :class="statusClass"
    >
      <div class="flex items-center gap-1.5">
        <span v-if="isBalanced">✓ المبالغ موزعة بالكامل ومتطابقة</span>
        <span v-else-if="allocatedTotal < totalAmount">
          ⚠️ متبقي {{ formatNumber(totalAmount - allocatedTotal) }} ج.م لم يتم توزيعها
        </span>
        <span v-else>
          ❌ إجمالي المدخل ({{ formatNumber(allocatedTotal) }} ج.م) أكبر من المطلوب ({{ formatNumber(totalAmount) }} ج.م)
        </span>
      </div>

      <div class="font-mono text-[11px]">
        الموزع: {{ formatNumber(allocatedTotal) }} / {{ formatNumber(totalAmount) }} ج.م
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  totalAmount: {
    type: Number,
    default: 0
  },
  label: {
    type: String,
    default: ""
  },
  disabled: {
    type: Boolean,
    default: false
  },
  allowPartial: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(["update:modelValue", "update:valid", "change"]);

const availableMethods = [
  { value: 1, name: "نقدي (كاش)", icon: "💵" },
  { value: 2, name: "فيزا / بنك", icon: "💳" },
  { value: 3, name: "إنستاباي", icon: "📱" },
  { value: 4, name: "تحويل بنكي", icon: "🏛️" }
];

const selectedMethodValues = ref([1]);
const amountsMap = ref({ 1: props.totalAmount || 0, 2: 0, 3: 0, 4: 0 });

function getMethodInfo(val) {
  return availableMethods.find(m => m.value === val) || { value: val, name: "أخرى", icon: "💰" };
}

function isMethodSelected(val) {
  return selectedMethodValues.value.includes(val);
}

const allocatedTotal = computed(() => {
  return selectedMethodValues.value.reduce((sum, val) => sum + (Number(amountsMap.value[val]) || 0), 0);
});

const remainingToAllocate = computed(() => {
  return Math.round((props.totalAmount - allocatedTotal.value) * 100) / 100;
});

const isBalanced = computed(() => {
  if (props.allowPartial) {
    return allocatedTotal.value > 0 && allocatedTotal.value <= props.totalAmount + 0.01;
  }
  return Math.abs(allocatedTotal.value - props.totalAmount) < 0.02;
});

const statusClass = computed(() => {
  if (isBalanced.value) {
    return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20";
  }
  if (allocatedTotal.value < props.totalAmount) {
    return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20";
  }
  return "bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20";
});

function formatNumber(num) {
  return (Number(num) || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function emitChanges() {
  const result = selectedMethodValues.value
    .filter(val => (Number(amountsMap.value[val]) || 0) > 0)
    .map(val => ({
      method: val,
      amount: Math.round((Number(amountsMap.value[val]) || 0) * 100) / 100
    }));

  emit("update:modelValue", result);
  emit("update:valid", isBalanced.value);
  emit("change", result);
}

function toggleMethod(val) {
  if (props.disabled) return;
  const idx = selectedMethodValues.value.indexOf(val);
  if (idx >= 0) {
    if (selectedMethodValues.value.length === 1) return; // Keep at least one selected
    selectedMethodValues.value.splice(idx, 1);
    amountsMap.value[val] = 0;
  } else {
    selectedMethodValues.value.push(val);
    const rem = remainingToAllocate.value;
    amountsMap.value[val] = rem > 0 ? rem : 0;
  }
  emitChanges();
}

function onAmountInput(val, rawVal) {
  const parsed = parseFloat(rawVal);
  amountsMap.value[val] = isNaN(parsed) ? 0 : parsed;
  emitChanges();
}

function fillRemaining(val) {
  const otherTotal = selectedMethodValues.value
    .filter(m => m !== val)
    .reduce((sum, m) => sum + (Number(amountsMap.value[m]) || 0), 0);
  amountsMap.value[val] = Math.max(0, Math.round((props.totalAmount - otherTotal) * 100) / 100);
  emitChanges();
}

function applyPreset(preset) {
  if (preset === "allCash") {
    selectedMethodValues.value = [1];
    amountsMap.value = { 1: props.totalAmount, 2: 0, 3: 0, 4: 0 };
  } else if (preset === "allVisa") {
    selectedMethodValues.value = [2];
    amountsMap.value = { 1: 0, 2: props.totalAmount, 3: 0, 4: 0 };
  } else if (preset === "allInsta") {
    selectedMethodValues.value = [3];
    amountsMap.value = { 1: 0, 2: 0, 3: props.totalAmount, 4: 0 };
  } else if (preset === "halfCashHalfVisa") {
    selectedMethodValues.value = [1, 2];
    const half = Math.round((props.totalAmount / 2) * 100) / 100;
    amountsMap.value = {
      1: half,
      2: Math.round((props.totalAmount - half) * 100) / 100,
      3: 0,
      4: 0
    };
  }
  emitChanges();
}

watch(
  () => props.totalAmount,
  newTotal => {
    if (selectedMethodValues.value.length === 1) {
      amountsMap.value[selectedMethodValues.value[0]] = newTotal;
    }
    emitChanges();
  }
);

onMounted(() => {
  if (props.modelValue && props.modelValue.length > 0) {
    selectedMethodValues.value = props.modelValue.map(x => x.method);
    props.modelValue.forEach(x => {
      amountsMap.value[x.method] = x.amount;
    });
  } else if (props.totalAmount > 0) {
    amountsMap.value[1] = props.totalAmount;
  }
  emitChanges();
});
</script>
