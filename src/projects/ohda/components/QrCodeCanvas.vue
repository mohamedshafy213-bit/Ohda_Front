<template>
  <img v-if="dataUrl" :src="dataUrl" :alt="value" :style="{ width: `${size}px`, height: `${size}px` }" class="inline-block bg-white p-0.5 rounded" />
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import QRCode from "qrcode";

const props = defineProps({
  value: { type: String, required: true },
  size: { type: Number, default: 84 }
});

const dataUrl = ref("");

async function renderQr() {
  if (!props.value) {
    dataUrl.value = "";
    return;
  }
  try {
    dataUrl.value = await QRCode.toDataURL(props.value, {
      width: props.size * 2,
      margin: 1,
      errorCorrectionLevel: "M"
    });
  } catch (err) {
    console.warn("QR render error", err);
  }
}

onMounted(renderQr);
watch(() => props.value, renderQr);
</script>
