<template>
    <div class="flex flex-col relative">
        <InputNumber v-model="value" :disabled="disabled" :min="min" :max="max" class="w-full" />
        <span class="text-red-500 absolute -bottom-6 start-0">
            {{ errorMessage }}
        </span>
    </div>
</template>
<script setup>
const props = defineProps({
    name: String,
    disabled: Boolean,
    min: Number,
    max: Number,
});
const { value, errorMessage } = useField(() => props.name);
</script>

