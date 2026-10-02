<template>
  <Button
    type="button"
    class="!bg-red-600 hover:!bg-red-700 active:!bg-red-800 !text-white !rounded-xl w-8 h-8 !p-1 border border-red-600/20 hover:border-red-700 shadow-sm transition-all cursor-pointer flex items-center justify-center shrink-0"
    :title="$t('ohda.common.delete') || $t('delete') || 'حذف'"
    :aria-label="$t('ohda.common.delete') || $t('delete') || 'حذف'"
  >
    <Trash class="w-3.5 h-3.5 text-white" />
  </Button>
</template>
