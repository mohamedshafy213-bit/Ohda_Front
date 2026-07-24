<template>
    <div class="flex flex-col items-center gap-2">
        <div class="relative w-24 h-24 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 cursor-pointer hover:border-primary hover:bg-primary-50 dark:hover:bg-primary-950 transition-all duration-200 group overflow-hidden"
            @click="triggerFileInput">
            <input ref="fileInput" type="file" class="hidden" accept=".jpg,.jpeg,.png" @change="handleFileSelect" />

            <!-- Profile Picture or Placeholder -->
            <div v-if="profilePictureUrl" class="w-full h-full">
                <img :src="profilePictureUrl" alt="Profile Picture" class="w-full h-full object-cover rounded-full" />
                <!-- Overlay on hover -->
                <div
                    class="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                    <Camera class="w-6 h-6 text-white" />
                </div>
            </div>

            <!-- Default placeholder -->
            <div v-else class="w-full h-full flex items-center justify-center">
                <component :is="placeholderIcon"
                    class="w-8 h-8 text-gray-400 group-hover:text-primary transition-colors duration-200" />
            </div>
        </div>

        <!-- Remove button (only show if there's a picture) -->
        <Button v-if="profilePicture" variant="text" size="small" @click.stop="removePicture"
            class="text-red-500 hover:text-red-700 text-xs">
            <X class="w-3 h-3" />
            {{ t("remove") }}
        </Button>

        <!-- Crop Dialog -->
        <Dialog v-model:visible="cropperVisible" modal :header="t('profilePicture.crop') || 'Crop Image'"
            :style="{ width: '50rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
            <div class="flex flex-col gap-4">
                <div class="cropper-wrapper bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden relative">
                    <Cropper ref="cropperRef" class="cropper" :src="cropperImage" :stencil-component="CircleStencil"
                        :stencil-props="{
                            aspectRatio: 1
                        }" />
                </div>
                <div class="flex justify-end gap-2">
                    <Button :label="t('cancel') || 'Cancel'" severity="secondary" @click="cancelCrop" />
                    <Button :label="t('save') || 'Save'" @click="saveCrop" />
                </div>
            </div>
        </Dialog>
    </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from "vue";
import { useI18n } from "vue-i18n";
import { Cropper, CircleStencil } from 'vue-advanced-cropper';
import 'vue-advanced-cropper/dist/style.css';

const emit = defineEmits(["update:modelValue"]);

const modelValue = defineModel("modelValue");
const props = defineProps({
    disabled: {
        type: Boolean,
        default: false,
    },
    placeholderIcon: {
        type: String,
        default: "User",
    },
});
const { t } = useI18n();
const fileInput = ref(null);
const profilePicture = ref(modelValue.value);

// Cropper State
const cropperVisible = ref(false);
const cropperImage = ref(null);
const cropperRef = ref(null);
const tempFileType = ref(null); // Store original file type
const tempFileName = ref(null); // Store original file name

const profilePictureUrl = computed(() => {
    if (profilePicture.value) {
        // If it's a File/Blob object
        if (profilePicture.value instanceof File || profilePicture.value instanceof Blob) {
            return URL.createObjectURL(profilePicture.value);
        }
        // If it's a string (URL from backend)
        if (typeof profilePicture.value === 'string') {
            return profilePicture.value;
        }
    }
    return null;
});

const triggerFileInput = () => {
    if (props.disabled) {
        return;
    }
    fileInput.value?.click();
};

const handleFileSelect = (event) => {
    if (props.disabled) {
        return;
    }
    const file = event.target.files[0];
    if (file) {
        // Validate file type
        if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
            // You might want to show a toast here using useToast if available
            // For now, fail silently or reuse existing error handling logic if any
            return;
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            return;
        }

        tempFileType.value = file.type;
        tempFileName.value = file.name;

        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                cropperImage.value = e.target.result;
                cropperVisible.value = true;
            };
            reader.readAsDataURL(file);
        }

        // Reset input so same file can be selected again if cancelled
        event.target.value = '';
    }
};

const cancelCrop = () => {
    cropperVisible.value = false;
    cropperImage.value = null;
    tempFileType.value = null;
    tempFileName.value = null;
};

const saveCrop = () => {
    const { canvas } = cropperRef.value.getResult();
    if (canvas) {
        canvas.toBlob((blob) => {
            if (blob) {
                // Create a File object from the Blob
                // Use original name or default
                const fileName = tempFileName.value || `profile_pic.${tempFileType.value === 'image/png' ? 'png' : 'jpg'}`;
                const file = new File([blob], fileName, { type: tempFileType.value || 'image/jpeg' });

                profilePicture.value = file;
                emit("update:modelValue", file);

                // Cleanup
                cropperVisible.value = false;
                cropperImage.value = null;
                tempFileType.value = null;
                tempFileName.value = null;
            }
        }, tempFileType.value || 'image/jpeg');
    }
};

const removePicture = () => {
    if (props.disabled) {
        return;
    }
    profilePicture.value = null;
    emit("update:modelValue", null);
    // Reset file input
    if (fileInput.value) {
        fileInput.value.value = "";
    }
};

// Watch for external changes to modelValue
watch(
    () => modelValue.value,
    (newValue) => {
        profilePicture.value = newValue;
    },
    { immediate: true }
);
</script>

<style scoped>
.cropper {
    height: 400px;
    width: 100%;
}

.cropper-wrapper {
    width: 100%;
    height: 400px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #f3f4f6;
    /* bg-gray-100 */
}

/* Dark mode background for cropper wrapper */
:global(.dark) .cropper-wrapper {
    background-color: #1f2937;
    /* bg-gray-800 */
}
</style>
