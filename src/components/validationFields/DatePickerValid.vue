<template>
    <div class="flex flex-col gap-1">
        <DatePicker
            v-model="value"
            :disabled="disabled"
            :show-time="showTime"
            :minDate="minDate"
            :maxDate="maxDate"
        />
        <span v-if="errorMessage" class="text-red-500 text-sm leading-tight min-h-5">{{ errorMessage }}</span>
    </div>
</template>
<script setup>
const props = defineProps({
    name: String,
    showTime: Boolean,
    disabled: Boolean,
    minDate: Date,
    maxDate: Date,
});
const { value, errorMessage } = useField(() => props.name);
</script>
