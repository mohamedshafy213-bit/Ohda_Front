<template>
    <div class="flex flex-col relative">
        <Textarea v-model="value" :rows="rows" />
        <span class="text-red-500 absolute -bottom-6 start-0">
            {{ errorMessage }}
        </span>
    </div>
</template>
<script setup>
const props = defineProps({
    name: String,
    rows: Number,
});
const { value, errorMessage } = useField(() => props.name);
</script>
