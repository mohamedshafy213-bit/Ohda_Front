<template>
  <div class="text-danger-500 font-bold w-full text-center">{{ message }}</div>
</template>
<script>
export default {
  props: {
    message: {
      type: String,
      default:'',
      required:true
    }
  }
}
</script>
