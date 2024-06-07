<script setup>
import Icon from "../icons/Icon.vue";

const props = defineProps({
  color: {
    type: String,
    default: "white",
  },
  size: {
    type: Number,
    default: 18,
  },
});
</script>

<template>
  <button>
    <Icon name="cross" :color="color" :size="`${size}px`" />
  </button>
</template>

<style scoped>
button {
  background: transparent;
  padding: 0;
}
</style>
