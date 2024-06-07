<!-- Defines a unified structure for dialogs consisting of title and body -->
<script setup>
import { ref } from "vue";

import { useDialogStore } from "../../stores/DialogStore";
import CrossButton from "../buttons/CrossButton.vue";
import Icon from "../icons/Icon.vue";

const props = defineProps({
  /**
   * Each dialog could be divided into sections. This prop takes
   * as an array of { title: ..., content: ... } pairs, where 'content' is a component.
   * Example use can be seen in the DeviceSettings component.
   *
   * If a props is defined, a menu with the sections will be displayed which can be used for sections navigation.
   */
  sections: {
    type: Array,
    default: null,
  },
});

const dialog = useDialogStore();

// An index of a currently opened section (if any section is defined)
const activeSectionIdx = ref(0);

if (!props.sections) {
  activeSectionIdx.value = 0;
}
</script>

<template>
  <section>
    <header class="flex justify-between p-1.5 bg-gray-700">
      <button
        v-show="dialog.isBack()"
        @click="dialog.back"
        class="w-4"
        title="Go back"
      >
        <Icon name="chevron-left" color="white"></Icon>
      </button>

      <h3 class="font-medium text-center flex-grow text-white">
        <slot name="title">name</slot>
      </h3>
      <CrossButton @click="dialog.close" color="white" />
    </header>

    <body class="box-light space-y-2">
      <slot name="body">
        <template v-if="sections[activeSectionIdx].content">
          <component :is="sections[activeSectionIdx].content" />
        </template>
      </slot>
    </body>
  </section>
</template>

<style scoped>
.box-light {
  min-width: 36rem;
  height: min(auto, 80vh);
  max-height: 80vh;
}
</style>
