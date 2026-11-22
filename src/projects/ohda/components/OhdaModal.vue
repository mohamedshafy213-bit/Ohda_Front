<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="visible"
        :class="[zIndex, 'fixed inset-0 flex items-center justify-center p-4 bg-brand-dark/50 backdrop-blur-xs']"
        @click.self="closeOnBackdrop && close()"
      >
        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 scale-95 translate-y-2"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="opacity-100 scale-100 translate-y-0"
          leave-to-class="opacity-0 scale-95 translate-y-2"
        >
          <div
            class="w-full bg-brand-white dark:bg-brand-dark rounded-3xl shadow-2xl border border-brand-gray/15 overflow-hidden flex flex-col max-h-[90vh] text-brand-dark dark:text-white"
            :class="maxWidthClass"
          >
            <!-- Header (Title + Description + Close button) -->
            <div class="p-5 px-6 border-b border-brand-gray/10 flex items-start justify-between gap-4 shrink-0 bg-brand-white/80 dark:bg-brand-dark/80 backdrop-blur-sm z-10">
              <div class="flex items-start gap-3">
                <div
                  v-if="icon"
                  class="w-10 h-10 rounded-2xl bg-brand-soft dark:bg-brand-accent/15 text-brand-accent flex items-center justify-center shrink-0 border border-brand-accent/20 mt-0.5"
                >
                  <component :is="icon" class="w-5 h-5" />
                </div>
                <div>
                  <h3 class="text-base font-bold text-brand-dark dark:text-white leading-tight">
                    {{ title }}
                  </h3>
                  <p v-if="description || subtitle" class="text-xs text-brand-gray dark:text-brand-gray/80 mt-1 leading-relaxed">
                    {{ description || subtitle }}
                  </p>
                </div>
              </div>

              <!-- Close Button -->
              <button
                type="button"
                @click="close"
                class="p-2 rounded-xl text-brand-gray hover:text-brand-dark dark:hover:text-white hover:bg-brand-light dark:hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
                aria-label="إغلاق"
              >
                <X class="w-5 h-5" />
              </button>
            </div>

            <!-- Scrollable Body with Padding -->
            <div class="p-6 overflow-y-auto flex-1 space-y-4">
              <slot />
            </div>

            <!-- Sticky Footer with Actions -->
            <div
              v-if="$slots.footer"
              class="p-4 px-6 border-t border-brand-gray/10 bg-brand-light/40 dark:bg-brand-dark/90 flex items-center justify-end gap-3 shrink-0 sticky bottom-0 z-10"
            >
              <slot name="footer" :close="close" />
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed } from "vue";
import { X } from "lucide-vue-next";

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ""
  },
  subtitle: {
    type: String,
    default: ""
  },
  description: {
    type: String,
    default: ""
  },
  icon: {
    type: [Object, Function],
    default: null
  },
  maxWidth: {
    type: String,
    default: "max-w-2xl"
  },
  closeOnBackdrop: {
    type: Boolean,
    default: false
  },
  zIndex: {
    type: String,
    default: "z-50"
  }
});

const emit = defineEmits(["update:visible", "close"]);

const maxWidthClass = computed(() => {
  return props.maxWidth || "max-w-2xl";
});

function close() {
  emit("update:visible", false);
  emit("close");
}
</script>
