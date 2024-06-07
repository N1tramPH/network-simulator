<!-- A button with a callback thet opens 'something great and beautiful' -->
<script setup>
const props = defineProps({
  label: {
    type: String,
    default: "Tab",
  },
  callback: {
    type: Function,
    default: () => null,
  },
});
</script>

<template>
  <button
    @click="callback()"
    class="flex flex-row justify-between w-full p-2 hover:scale-[102%] focus:bg-primary-light rounded"
  >
    <span class="text-[.95rem]">{{ label }}</span>
    <div class="icon w-4.5">
      <svg
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
          d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4m-8-2l8-8m0 0v5m0-5h-5"
        />
      </svg>
    </div>
  </button>
</template>

<style scoped></style>
