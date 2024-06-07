<script setup>
import { ref } from "vue";
import ExpandButton from "./buttons/ExpandButton.vue";

const props = defineProps({
  buttonColor: {
    type: String,
    default: "black",
  },
  collapseDefault: {
    type: Boolean,
    default: true,
  },
  activeHeader: {
    type: Boolean,
    default: true,
  },
});

const isCollapsed = ref(props.collapseDefault);
const toggle = (activeHeader) => {
  if (activeHeader) {
    isCollapsed.value = !isCollapsed.value;
  }
};
</script>

<template>
  <div class="collapsable">
    <div
      class="center-between m-0"
      :class="{ 'cursor-pointer': activeHeader }"
      @click="toggle(activeHeader)"
    >
      <slot name="header"></slot>
      <ExpandButton
        :expanded="!isCollapsed"
        :color="buttonColor"
        @click="toggle(!activeHeader)"
      />
    </div>

    <div class="content" :class="{ 'content--collapsed': isCollapsed }">
      <slot name="body"></slot>
    </div>
  </div>
</template>

<style scoped>
.content {
  overflow: hidden;
  max-height: 9999px;
  transition: max-height 0.3s ease-in-out;
}

.content--collapsed {
  max-height: 0;
  transition: max-height 0.3s ease-out;
}
</style>
