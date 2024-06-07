<script setup>
import { useSidebarStore } from "../../stores/SidebarStore";
import { storeToRefs } from "pinia";

import SidebarButton from "./SidebarButton.vue";
import SidebarSection from "./SidebarSection.vue";

// The sidebar is controlled through its own store (so it can be controlled outside)
const store = useSidebarStore();
const upperBar = store.upperBar;
const lowerBar = store.lowerBar;

const { activeUpper } = storeToRefs(store);

const toggleLower = store.toggleLower;
const toggleUpper = store.toggleUpper;
</script>

<template>
  <div class="relative">
    <nav
      class="relative bg-gray-950 py-1.5 h-full flex flex-col justify-between z-10"
    >
      <ul>
        <li v-for="(bar, index) in upperBar" :key="index">
          <SidebarButton
            :id="index"
            :icon="bar.icon"
            :label="bar.title"
            :is-active="index === activeUpper"
            @toggle-bar="toggleUpper"
          />
        </li>
      </ul>

      <ul>
        <li v-for="(bar, index) in lowerBar" :key="index">
          <SidebarButton
            :id="index"
            :icon="bar.icon"
            :label="bar.title"
            :is-active="false"
            @toggle-bar="toggleLower"
            @click="bar.openCallback"
          />
        </li>
      </ul>
    </nav>

    <SidebarSection
      @close-section="store.closeUpper()"
      :section="store.activeSection"
      class="side-section absolute left-[100%] translate-x-[-100%] transition-all duration-200 ease-in-out"
      :class="{ 'translate-x-[0%]': activeUpper != -1 }"
    />
  </div>
</template>

<style scoped></style>
