<script setup>
/*  Abstracting a device icon based on the type for readability  */

const props = defineProps({
  type: {
    type: String,
    default: "Computer",
  },
});
</script>

<template>
  <div class="relative rounded-lg">
    <svg
      v-if="type === 'Computer'"
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      height="100%"
      viewBox="0 0 48 48"
    >
      <g
        fill="none"
        stroke="currentColor"
        stroke-linejoin="round"
        stroke-width="4"
      >
        <rect width="36" height="28" x="6" y="6" rx="3" />
        <path stroke-linecap="round" d="M14 42h20m-10-8v8" />
      </g>
    </svg>
    <svg
      v-else-if="type === 'Router'"
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      height="100%"
      viewBox="0 0 48 48"
    >
      <g fill="none">
        <rect
          width="39"
          height="14"
          x="4"
          y="28"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="4"
          rx="2"
        />
        <path
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="4"
          d="M14 35h8"
        />
        <rect width="4" height="4" x="30" y="33" fill="currentColor" rx="2" />
        <path
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="4"
          d="M12 28V8m24 20V8"
        />
      </g>
    </svg>
    <svg
      v-else
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      height="100%"
      viewBox="0 0 36 36"
    >
      <path
        fill="currentColor"
        d="M33.91 18.47L30.78 8.41A2 2 0 0 0 28.87 7H7.13a2 2 0 0 0-1.91 1.41L2.09 18.48a2 2 0 0 0-.09.59V27a2 2 0 0 0 2 2h28a2 2 0 0 0 2-2v-7.94a2 2 0 0 0-.09-.59ZM32 27H4v-7.94L7.13 9h21.74L32 19.06Z"
        class="clr-i-outline clr-i-outline-path-1"
      />
      <path
        fill="currentColor"
        d="M7.12 22h1.8v3h-1.8z"
        class="clr-i-outline clr-i-outline-path-2"
      />
      <path
        fill="currentColor"
        d="M12.12 22h1.8v3h-1.8z"
        class="clr-i-outline clr-i-outline-path-3"
      />
      <path
        fill="currentColor"
        d="M17.11 22h1.8v3h-1.8z"
        class="clr-i-outline clr-i-outline-path-4"
      />
      <path
        fill="currentColor"
        d="M22.1 22h1.8v3h-1.8z"
        class="clr-i-outline clr-i-outline-path-5"
      />
      <path
        fill="currentColor"
        d="M27.1 22h1.8v3h-1.8z"
        class="clr-i-outline clr-i-outline-path-6"
      />
      <path
        fill="currentColor"
        d="M6.23 18h23.69v1.4H6.23z"
        class="clr-i-outline clr-i-outline-path-7"
      />
      <path fill="none" d="M0 0h36v36H0z" />
    </svg>
  </div>
</template>

<style scoped></style>
