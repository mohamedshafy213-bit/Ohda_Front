<template>
  <!-- eslint-disable-next-line vue/no-v-html -- trusted rich text from app/Quill sources -->
  <div class="rich-text-preview ql-editor" v-html="content" />
</template>

<script setup>
import "quill/dist/quill.snow.css";

defineProps({
  content: {
    type: String,
    default: "",
  },
});
</script>

<style scoped>
/* Read-only: avoid full-height editor chrome */
.rich-text-preview {
  height: auto;
  min-height: 0;
  overflow: visible;
  padding: 0;
}

.rich-text-preview :deep(> *) {
  cursor: default;
}

/* Quill alignment / direction classes on pasted HTML (often on <p>, <h*>…) */
.rich-text-preview :deep(.ql-align-right) {
  text-align: right;
}
.rich-text-preview :deep(.ql-align-center) {
  text-align: center;
}
.rich-text-preview :deep(.ql-align-justify) {
  text-align: justify;
}
.rich-text-preview :deep(.ql-direction-rtl) {
  direction: rtl;
}

/* Match RichText editor list spacing for RTL/LTR */
.rich-text-preview :deep(ol),
.rich-text-preview :deep(ul) {
  padding-inline-start: 1.5em;
  padding-inline-end: 0;
}
.rich-text-preview :deep(.ql-direction-rtl ol),
.rich-text-preview :deep(.ql-direction-rtl ul) {
  padding-inline-start: 0;
  padding-inline-end: 1.5em;
}
</style>
