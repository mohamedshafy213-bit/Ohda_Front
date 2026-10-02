<template>
  <Button
    type="button"
    class="!bg-blue-600 hover:!bg-blue-700 active:!bg-blue-800 !text-white !rounded-xl w-8 h-8 !p-1 border border-blue-600/20 hover:border-blue-700 shadow-sm transition-all cursor-pointer flex items-center justify-center shrink-0"
    :title="$t('ohda.common.edit') || $t('edit') || 'تعديل'"
    :aria-label="$t('ohda.common.edit') || $t('edit') || 'تعديل'"
  >
    <Pen class="w-3.5 h-3.5 text-white" />
  </Button>
</template>
