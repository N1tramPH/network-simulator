<script setup>
import { computed } from "vue";

const emit = defineEmits(["close-section", "open-section"]);
const props = defineProps({
  position: {
    type: String,
    default: "left",
  },
  open: {
    type: Boolean,
    required: true,
  },
});

const classes = computed(() => {
  return [`${props.position}-0`];
});

const toggle = () => {
  emit(props.open ? "close-section" : "open-section");
};
</script>

<template>
  <div
    class="absolute top-1/2 -translate-y-1/2 tooltip tooltip-left"
    :data-tip="open ? 'Close' : 'Transmit'"
  >
    <button
      @click="toggle"
      class="flex items-center justify-center w-8 h-8 rounded-r-md group"
      :class="classes"
      aria-label="Toggle a sidebar"
    >
      <div
        class="w-1.5 h-5 rounded group-hover:hidden bg-gray-400 dark:text-gray-300"
      ></div>

      <div
        class="icon w-full hidden group-hover:block text-gray-400 dark:text-gray-300"
      >
        <svg
          v-if="!open"
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          height="100%"
          viewBox="0 0 24 24"
        >
          <path
            fill="none"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="m15 6l-6 6l6 6"
          />
        </svg>
        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          height="100%"
          viewBox="0 0 24 24"
        >
          <path
            fill="none"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="m9 6l6 6l-6 6"
          />
        </svg>
      </div>
    </button>
  </div>
</template>

<style scoped></style>
