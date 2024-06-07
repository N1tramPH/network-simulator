<script setup>
import { ref } from "vue";

const emit = defineEmits(["update:modelValue"]);
const props = defineProps({
  modelValue: {
    required: true,
  },
  label: {
    type: String,
    default: "",
  },
  type: {
    type: String,
    default: "text",
  },
  validator: {
    type: Function,
    default: (_) => true,
  },
  onChangeCallback: {
    type: Function,
    default: null,
  },
  inline: {
    type: Boolean,
    default: false,
  },
  disabled: {
    default: false,
  },
});

const input = ref(null);

const onChange = (e) => {
  const value = e.target.value;
  if (props.validator(value)) {
    emit("update:modelValue", value);

    if (props.onChangeCallback) {
      props.onChangeCallback();
    }
  } else {
    input.value.value = props.modelValue;
  }
};
</script>

<template>
  <div :class="{ 'flex items-center gap-1': inline }">
    <label v-if="label" class="label">{{ label }}</label>
    <input
      :type="type"
      :value="modelValue"
      @change="onChange"
      v-bind="$attrs"
      ref="input"
      :disabled="disabled"
      class="input-box"
      :class="{ 'disabled-sm': disabled }"
    />
  </div>
</template>

<style scoped></style>
