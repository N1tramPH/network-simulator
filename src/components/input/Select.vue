<script setup>
import { onMounted, ref, watch } from "vue";
import Icon from "../icons/Icon.vue";
import ExpandButton from "../buttons/ExpandButton.vue";

const props = defineProps({
  /**
   * A label associated with a select element
   */
  label: {
    type: String,
    default: "",
  },

  modelValue: {
    required: true,
  },

  /**
   * Options are defined as an array of  { label: ..., value: ... } objects
   * Each option can have an attribute "icon" with a name of an icon specified in icons.js
   */
  options: {
    type: Array,
  },

  /**
   * A default { label: ..., value: ... } option to be displayed
   */
  defaultOption: {
    type: Object,
    default: null,
  },

  /**
   * In case a reactive display of a current value is required (expects reactive value)
   *  */
  displayValue: {
    default: null,
  },

  /**
   * Converts a displayValue into a readable string as the value might not be anything else but a string
   */
  reprFun: {
    type: Function,
    default: (value) => value,
  },

  disabled: {
    default: false,
  },
});

const emit = defineEmits(["update:modelValue"]);

const showOptions = ref(false);
const currentOption = ref(
  props.defaultOption ? props.defaultOption : props.options[0]
);

function emitValue(option) {
  if (props.disabled) return;

  try {
    currentOption.value = option;

    emit("update:modelValue", option.value);
  } catch (e) {
    throw new Error(`${e}`);
  }
}

// Set the first value, might be unwanted
emitValue(currentOption.value);
</script>

<template>
  <div>
    <label v-if="label" class="label">{{ label }}</label>

    <div
      class="input-box flex relative justify-between w-full"
      :class="{ 'disabled-sm': disabled }"
      @click="showOptions = disabled ? !disabled : !showOptions"
    >
      <div class="flex gap-2 options-center">
        <template v-if="currentOption.icon">
          <Icon :name="currentOption.icon" color="black" size="18px" />
        </template>

        <span class="current-option">
          {{ displayValue ? reprFun(displayValue) : currentOption.label }}
        </span>
      </div>

      <ExpandButton :expanded="showOptions && !disabled" />

      <ul
        class="options shadow-md rounded-b-md overflow-hidden"
        :class="{ 'options--hidden': !showOptions }"
      >
        <li
          v-for="(option, idx) in options"
          :key="idx"
          @click="emitValue(option)"
          class="input-box flex gap-2 justify-start mb-0 rounded-none shadow-sm shadow-gray dark:shadow-slate-50 cursor-default"
        >
          <template v-if="option.icon">
            <Icon :name="option.icon" color="black" size="18px" />
          </template>
          <span>{{ option.label }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.options {
  position: absolute;
  top: 100%;
  left: 0;

  list-style-type: none;
  width: 100%;
  max-height: 999px;
  transition: max-height 0.15s ease-in-out;

  overflow: hidden;

  z-index: 10;
}

.options--hidden {
  max-height: 0;
}
</style>
