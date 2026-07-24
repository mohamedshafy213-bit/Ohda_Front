<template>
    <div class="flex flex-col gap-1">
        <label v-if="label" class="font-medium text-surface-900 dark:text-surface-0">{{ label }}</label>
        <InputText v-model="value" :disabled="disabled" :placeholder="placeholder || label" :class="{ 'p-invalid': errorMessage }" />
        <span v-if="errorMessage" class="text-red-500 text-sm leading-tight min-h-5">{{ errorMessage }}</span>
    </div>
</template>
<script setup>
import { useField } from 'vee-validate';

const props = defineProps({
    name: String,
    label: String,
    placeholder: String,
    disabled: Boolean,
});
const { value, errorMessage } = useField(() => props.name);
</script>
