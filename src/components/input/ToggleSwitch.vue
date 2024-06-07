<script setup>
const emit = defineEmits(["update:modelValue"]);
const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  label: {
    type: String,
    default: "",
  },
  inline: {
    type: Boolean,
    default: false,
  },
});

const onClick = () => emit("update:modelValue", !props.modelValue);
</script>

<template>
  <div :class="{ 'flex center-between w-full': inline }">
    <div v-if="label" class="label">{{ label }}</div>
    <label
      class="relative h-[1.535rem] w-12 m-0 cursor-pointer block [-webkit-tap-highlight-color:_transparent]"
    >
      <input
        type="checkbox"
        class="peer sr-only"
        :checked="modelValue"
        @click="onClick"
      />

      <span
        class="absolute inset-0 rounded-full bg-gray-300 transition peer-checked:bg-emerald-500"
      ></span>

      <span
        class="absolute inset-y-0 start-0 m-1 h-4 w-4 rounded-full bg-white transition-all peer-checked:start-6"
      ></span>
    </label>
  </div>
</template>

<style scoped></style>
