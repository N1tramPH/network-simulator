<script setup>
/*
  A horizontal menu bar for moving between sections
*/

import { ref } from "vue";

const emit = defineEmits(["change-section"]);
const props = defineProps({
  sections: {
    type: Array,
    required: true,
  },
  activeIdx: {
    type: Number,
    default: 0,
  },
});

const activeSection = ref(0);

/**
 * Handles a clicked section button in the menu
 * @param {*} id Index of the section in the list
 */
function handleSelect(id) {
  const clickedSection = props.sections[id];
  activeSection.value = id;

  // Emit the id of a clicked section to the parent

  emit("change-section", id);

  // When callback is defined
  if (clickedSection.callback) {
    clickedSection.callback();
  }
}
</script>

<template>
  <nav>
    <ul role="tablist" class="tabs tabs-bordered">
      <li
        v-for="(section, idx) in sections"
        :key="idx"
        role="tab"
        class="tab font-semibold text-black dark:text-gray-100 dark:hover:text-gray-400 hover:text-gray-700 transition-colors"
        :class="{ 'tab-active': activeIdx == idx }"
        @click="handleSelect(idx)"
      >
        <div>{{ section.title }}</div>
      </li>
    </ul>
  </nav>
</template>
<style scoped>
.active {
  filter: brightness(80%);
}
</style>
