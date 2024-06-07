<script setup>
import Icon from "../icons/Icon.vue";

defineEmits(["toggle-bar"]);
const props = defineProps({
  id: {
    type: [Number, String],
    required: true,
  },
  isActive: {
    type: Boolean,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
  },
});
</script>

<template>
  <button
    @click="$emit('toggle-bar', id)"
    class="relative group p-3 hover:bg-gray-900"
    :aria-label="label"
  >
    <div
      v-show="isActive"
      class="absolute left-0 top-0 w-[.14rem] h-full bg-white"
    ></div>
    <Icon :name="icon" color="white" size="1.75rem"></Icon>

    <!-- Gets displayed on button hover -->
    <span
      class="absolute top-1/2 -translate-y-1/2 left-[120%] p-2.5 hidden group-hover:block bg-gray-100 text-gray-900 whitespace-nowrap shadow-lg"
    >
      {{ label }}
    </span>
  </button>
</template>

<style scoped></style>
