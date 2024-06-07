<script setup>
import { onMounted, ref } from "vue";
import { gsap } from "gsap/gsap-core";
import { useAlertStore } from "../../stores/AlertStore";
import Icon from "../icons/Icon.vue";

const props = defineProps({
  alert: {
    type: Object,
  },
});

const alertRef = ref(null);

let fade;

onMounted(() => {
  gsap.from(alertRef.value, {
    x: "100%",
    ease: "power4.out",
  });
  if (props.alert.timeout) {
    fade = gsap.to(alertRef.value, {
      duration: props.alert.timeout,
      opacity: 0,
      onComplete: pop,
    });
  }
});

const handleMouseOver = () => {
  // Resets the gsap tween fading effect
  if (fade) {
    fade.restart();
    fade.pause();
  }
};

const handleMouseOut = () => {
  // Resumes the fading effect
  if (fade) fade.play();
};

const pop = () => {
  // Clean up the animation
  if (fade) fade.revert();

  // Remove the element from DOM
  useAlertStore().popAlert(props.alert.id);
};
</script>

<template>
  <div
    role="alert"
    class="rounded-xl min-w-7 min-w-96 bg-white p-4 shadow-lg transition-all ease-in-out"
    ref="alertRef"
    @mouseover="handleMouseOver"
    @mouseout="handleMouseOut"
  >
    <div class="flex items-center justify-between gap-4 w-full">
      <div class="w-8">
        <svg
          v-if="alert.type === 'Success'"
          class="text-green-600"
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          height="100%"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>

        <svg
          v-else-if="alert.type === 'Warning'"
          class="text-red-500"
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          height="100%"
          viewBox="0 0 512 512"
        >
          <path
            fill="none"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="32"
            d="M85.57 446.25h340.86a32 32 0 0 0 28.17-47.17L284.18 82.58c-12.09-22.44-44.27-22.44-56.36 0L57.4 399.08a32 32 0 0 0 28.17 47.17"
          />
          <path
            fill="none"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="32"
            d="m250.26 195.39l5.74 122l5.73-121.95a5.74 5.74 0 0 0-5.79-6h0a5.74 5.74 0 0 0-5.68 5.95"
          />
          <path
            fill="currentColor"
            d="M256 397.25a20 20 0 1 1 20-20a20 20 0 0 1-20 20"
          />
        </svg>
      </div>

      <div class="flex-1">
        <strong class="block font-medium text-gray-900 capitalize">
          {{ alert.title }}
        </strong>

        <p class="mt-1 text-sm text-gray-700 whitespace-pre-line">
          {{ alert.details }}
        </p>
      </div>

      <button class="text-gray-500 transition hover:scale-110" @click="pop">
        <Icon name="cross" color="black" size="20px" />
      </button>
    </div>
  </div>
</template>

<style scoped></style>
