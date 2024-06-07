<script setup>
const props = defineProps({
  expanded: {
    type: Boolean,
    required: true,
  },

  size: {
    type: String,
    default: "17px",
  },
});
</script>

<template>
  <button
    :style="{ width: size, height: size }"
    :aria-label="expanded ? `Collapse content` : `Expand content`"
    class="transparent text-black dark:text-white"
  >
    <svg
      v-if="expanded"
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
        stroke-width="48"
        d="m112 328l144-144l144 144"
      />
    </svg>

    <svg
      v-else
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
        stroke-width="48"
        d="m112 184l144 144l144-144"
      />
    </svg>
  </button>
</template>

<style scoped></style>
