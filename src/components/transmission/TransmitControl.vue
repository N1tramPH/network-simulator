<script setup>
import { computed, markRaw, ref } from "vue";
import { useTransmitStore } from "../../stores/TransmitStore";

import SidebarToggle from "../buttons/SidebarToggle.vue";

import SectionNavigation from "../menu/SectionNavigation.vue";
import TransmitSection from "./transmitSection/TransmitSection.vue";
import HistorySection from "./historySection/HistorySection.vue";

const store = useTransmitStore();
const sections = [
  {
    title: "Transmit",
    content: markRaw(TransmitSection),
  },
  {
    title: "History",
    content: markRaw(HistorySection),
  },
];

const activeIdx = ref(0);
const currentContent = computed(() => sections[activeIdx.value].content);

function onSectionChange(idx) {
  activeIdx.value = idx;
}
</script>

<template>
  <section
    class="side-section right-0 transition-all"
    :class="{ 'translate-x-full': !store.controlOpen }"
  >
    <div class="box-light w-full h-full overflow-y-auto relative">
      <SectionNavigation
        class="mt-2 mb-4"
        :sections="sections"
        :activeIdx="activeIdx"
        @change-section="onSectionChange"
      />

      <div class="p-2">
        <component :is="currentContent" />
      </div>
    </div>

    <SidebarToggle
      class="left-0 -translate-x-full"
      :open="store.controlOpen"
      @close-section="store.closeControl"
      @open-section="store.openControl"
    />
  </section>
</template>

<style scoped></style>
