<template>
  <div class="rich-text-wrapper">
    <div ref="editorRef" class="rich-text-editor"></div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from "vue";
import Quill from "quill";
import "quill/dist/quill.snow.css";

const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  theme: {
    type: String,
    default: "snow",
  },
});

const emit = defineEmits(["update:modelValue"]);

const editorRef = ref(null);
let quillInstance = null;
let isSettingFromOutside = false;

let _listStyleRegistered = false;
function ensureListStyleFormat() {
  if (_listStyleRegistered) return;
  try {
    const Parchment = Quill.import("parchment");
    const attr = new Parchment.Attributor.Attribute("list-style", "data-list-style", {
      scope: Parchment.Scope.BLOCK,
    });
    Quill.register(attr, true);
    _listStyleRegistered = true;
  } catch (_) {}
}



onMounted(() => {
  if (!editorRef.value) return;

  ensureListStyleFormat();

  quillInstance = new Quill(editorRef.value, {
    theme: props.theme,
    modules: {
      toolbar: [
        ["bold", "italic", "underline"],
        [{ color: [] }, { background: [] }],
        [{ list: "ordered" }, { list: "bullet" }, { list: "check" }],
        [{ direction: "rtl" }],
        ["clean"],
      ],
    },
  });

  const isRtl = !!editorRef.value.closest?.('[dir="rtl"]');
  if (isRtl) {
    try {
      quillInstance.format("direction", "rtl");
      quillInstance.format("align", "right");
    } catch (_) {}
  }

  if (props.modelValue) {
    quillInstance.clipboard.dangerouslyPasteHTML(props.modelValue);
  }

  quillInstance.on("text-change", () => {
    if (isSettingFromOutside) return;
    const html = quillInstance.root.innerHTML;
    emit("update:modelValue", html === "<p><br></p>" ? "" : html);
  });
});

watch(
  () => props.modelValue,
  (val) => {
    if (!quillInstance) return;
    const current = quillInstance.root.innerHTML;
    if (val !== current) {
      isSettingFromOutside = true;
      quillInstance.clipboard.dangerouslyPasteHTML(val || "");
      isSettingFromOutside = false;
    }
  }
);

onBeforeUnmount(() => {
  quillInstance = null;
});
</script>

<style scoped>
.rich-text-wrapper {
  width: 100%;
  min-height: 0;
}

.rich-text-editor :deep(.ql-container) {
  min-height: 140px;
  border-radius: 0 0 0.5rem 0.5rem;
}

.rich-text-editor :deep(.ql-toolbar) {
  border-radius: 0.5rem 0.5rem 0 0;
}

.rich-text-editor :deep(.ql-editor) {
  min-height: 140px;
  direction: ltr;
  text-align: left;
}

/* Custom list-style toolbar buttons */
.rich-text-editor :deep(.ql-list-style-btn) {
  font-size: 11px;
  font-weight: 600;
  padding: 0 4px;
  min-width: 28px;
  height: 24px;
  line-height: 24px;
}

/* Default LTR list spacing */
.rich-text-editor :deep(.ql-editor ol),
.rich-text-editor :deep(.ql-editor ul) {
  padding-inline-start: 1.5em;
  padding-inline-end: 0;
}

/* RTL block list spacing */
.rich-text-editor :deep(.ql-editor .ql-direction-rtl ol),
.rich-text-editor :deep(.ql-editor .ql-direction-rtl ul) {
  padding-inline-start: 0;
  padding-inline-end: 1.5em;
}

/* RTL block direction */
.rich-text-editor :deep(.ql-editor .ql-direction-rtl) {
  direction: rtl;
  text-align: right;
}


</style>
