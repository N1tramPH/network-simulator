<script setup>
import { ref } from "vue";

const emit = defineEmits(["update:modelValue"]);
const props = defineProps({
  /**
   * An array of pairs { label: ..., value: ... }
   * - label is used for displaying a currently selected item
   * - value is a v-modeled value with a given reactive attribute
   */
  items: {
    type: Array,
    required: true,
  },
  modelValue: {
    required: true,
  },
});

const dropdown = ref(null);
const collapse = () => (dropdown.value.open = false);
</script>

<template>
  <details class="dropdown" ref="dropdown">
    <summary
      class="label flex gap-1 bg-gray-200 dark:bg-gray-700 rounded py-1 px-2"
    >
      <span class="text-cyan-700 dark:text-cyan-500">
        {{ modelValue.label }}
      </span>

      <div class="icon w-4 text-gray-800 dark:text-gray-300">
        <svg
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
      </div>
    </summary>
    <ul
      class="dropdown-content z-[1] menu p-2 shadow bg-gray-200 dark:bg-gray-700 w-[11rem] rounded-md"
    >
      <li
        v-for="item in items"
        :key="item.label"
        class="hover:bg-gray-300 dark:hover:bg-gray-600 rounded-md"
        @click="collapse"
      >
        <button @click="emit('update:modelValue', item.value)">
          {{ item.label }}
        </button>
      </li>
    </ul>
  </details>
</template>

<style scoped></style>
