<script setup>
import { ref } from "vue";

const props = defineProps({
  label: {
    type: String,
    default: "",
  },
  setter: {
    type: Function,
    required: true,
  },
  repr: {
    type: Function,
    default: null,
  },

  // string - input/select/textarea
  type: {
    type: String,
    default: "text",
  },
});

// Where a shown input value is stored
// On submission a setter is called with temp value
const temp = ref(props.repr());

// Indicates if an input value is being modified
const isEdited = ref(false);

/**
 * Calls a provided setter with a current temp value
 */
function updateValue(e) {
  try {
    if (props.default !== temp.value) {
      props.setter(temp.value);
    }
  } catch (e) {
    throw new Error(`An error ocurred on input: ${e.message}`);
  } finally {
    // Set the repr regardless of whether the input was successful or not
    temp.value = props.repr();
    isEdited.value = false;
    if (e) e.target.blur();
  }
}

function handleEnter(e) {
  updateValue(e);
  e.target.blur(); // Remove the focus
}

function handleEsc(e) {
  e.stopPropagation();

  // Set the temp value to original v-modeled value
  temp.value = props.modelValue;
  isEdited.value = false;
}

function toggleEdit() {
  isEdited.value = !isEdited.value;

  if (!isEdited.value) updateValue();
}
</script>

<template>
  <div class="wrapper">
    <label v-if="label">{{ label }}</label>

    <!-- Text area -->
    <template v-if="type === 'textarea'"> Not implemented </template>

    <!-- Text input -->
    <template v-else-if="type === 'text'">
      <div
        class="edit h-9 bg-slate-200 hover:bg-gray-100 focus:bg-gray-200 dark:bg-gray-700 dark:focus:bg-slate-600 dark:hover:bg-slate-600 dark:text-gray-200 shadow border-none outline-none sm:text-sm rounded"
        :class="{ 'edit--enabled': isEdited }"
      >
        <input
          v-model="temp"
          @click="isEdited = true"
          @keydown.enter="handleEnter"
          @keydown.esc="handleEsc"
          v-bind="$attrs"
          class="bg-red bg-transparent border-none p-2 h-12 text-sm rounded mr-2"
        />

        <button
          class="icon w-[1.3rem] mr-2 hover:scale-105"
          @click="toggleEdit"
        >
          <svg
            v-if="isEdited"
            xmlns="http://www.w3.org/2000/svg"
            width="100%"
            height="100%"
            viewBox="0 0 48 48"
          >
            <path
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="4"
              d="M43 11L16.875 37L5 25.182"
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
              stroke-width="1.5"
              d="m15.214 5.982l1.402-1.401a1.982 1.982 0 0 1 2.803 2.803l-1.401 1.402m-2.804-2.804L6.98 14.216c-1.045 1.046-1.568 1.568-1.924 2.205S4.342 18.561 4 20c1.438-.342 2.942-.7 3.579-1.056s1.16-.879 2.205-1.924l8.234-8.234m-2.804-2.804l2.804 2.804M11 20h6"
              color="currentColor"
            />
          </svg>
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.edit {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

input {
  display: flex;
  align-items: center;
  flex: 1;

  width: 100%;
  height: 100%;
}

input:focus {
  outline: none;
  border: none;
}

button {
  display: flex;
  align-items: center;
}
</style>
