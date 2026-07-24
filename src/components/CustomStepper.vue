<template>
  <div class="custom-stepper flex flex-col">
    <div class="steps flex-col flex p-2 mt-2 mb-0 mr-2 pb-0">
      <div
        v-for="(step, index) in steps"
        :key="index"
        class="step flex flex-col gap-8 justify-around"
        :class="{ active: index === currentStep, completed: index < currentStep }"
      >
        <div class="flex flex-row justify-between">
          <div class="flex flex-grow gap-3 items-center justify-between">
            <div
              class="step-number p-4"
              :class="[props.index == index && props.Edit ? 'bg-orange-500' : 'bg-primary-500', 'transition-all duration-300']"
            >
              {{ index + 1 }}
            </div>
            <slot name="body" :Data="step" :Index="index"></slot>
          </div>
        </div>

        <div v-if="currentStep == index"></div>
        <!-- <div v-if="index !== props.steps.length - 1" class="h-7 w-0.5 border pt-0 mt-0 mr-4 mb-2 border-slate-300"></div> -->
        <div v-if="index !== props.steps.length - 1" class="h-7 w-full pt-0 mt-0  border-slate-300"
        style="display: flex;justify-content: center;align-items: center;"
        >
          <svg
            width="20%"
            height="100"
            viewBox="0 0 24 34"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            data-v-a4d84fa4=""
            
          >
            <g id="SVGRepo_bgCarrier" stroke-width="0" data-v-a4d84fa4=""></g>
            <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" data-v-a4d84fa4=""></g>
            <g id="SVGRepo_iconCarrier" data-v-a4d84fa4="">
              <path
                d="M12 20L18 14M12 20L6 14M12 20L12 9.5M12 4V6.5"
                stroke="#385f5b"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                data-v-a4d84fa4=""
              ></path>
            </g>
          </svg>
        </div>
      </div>
    </div>

    <!-- <div class="step-content ">
      <slot :step="steps[currentStep]" />
    </div> -->
  </div>
</template>

<script setup>
import { ref,  defineProps } from 'vue'

const props = defineProps({
  steps: {
    type: Array,
    required: true
  },
  Edit: {
    type: Boolean,
    required: true
  },
  index: {
    type: Number,
    required: false
  }
})


const currentStep = ref(-1)


</script>

<style scoped>
.custom-stepper {
  width: 100%;
}

.steps {
  display: flex;
  justify-content: space-between;
}

.step {
  text-align: center;
  flex: 1;
  position: relative;
}

.step-number {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  /* background-color: rgb(20, 184, 166); */
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 5px;
  font-size: 1.5rem;
}

.step-title {
  font-weight: bold;
}

/* .active .step-number {
  background-color: #ebdd5e;
  color: white;
} */

.step-content {
  margin: 20px 0;
}

.buttons {
  display: flex;
  justify-content: space-between;
}
</style>
