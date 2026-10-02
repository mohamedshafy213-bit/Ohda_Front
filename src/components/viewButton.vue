<template>
  <Button
    type="button"
    class="bg-transparent !rounded-xl w-8 h-8 !p-1 border border-transparent hover:!border-brand-gray/30 hover:!bg-brand-gray/10 text-brand-gray hover:text-brand-dark dark:hover:text-white transition-all cursor-pointer flex items-center justify-center shadow-none"
    :title="$t('view') || 'عرض'"
    :aria-label="$t('view') || 'عرض'"
  >
    <Eye class="w-3.5 h-3.5" />
  </Button>
</template>

