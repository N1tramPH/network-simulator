<script setup>
import { useSettingsStore } from "../../stores/SettingsStore";
import { useBoardStore } from "../../stores/BoardStore";
import { getState } from "../../utils/state";
import { addLog } from "../../utils/utils";
import Icon from "../icons/Icon.vue";

const settings = useSettingsStore();
const boardStore = useBoardStore();

const zoomIn = () => {
  boardStore.zoom += 0.25;
};

const zoomOut = () => {
  boardStore.zoom -= 0.25;
};

function saveState() {
  try {
    getState();
    addLog("Application state has been saved!", 5);
  } catch (e) {
    addLog("State saving has failed!!", 5);
  }
}
</script>

<template>
  <div
    class="box toolbar p-0 absolute flex justify-between top-0 right-0 m-2 rounded"
  >
    <button class="item" @click="zoomIn" aria-label="Zoom the board in">
      <Icon name="zoomIn" color="white" size="20px" />
    </button>

    <button class="item" @click="zoomOut" aria-label="Zoom the board out">
      <Icon name="zoomOut" color="white" size="20px" />
    </button>

    <button
      class="item text-white"
      @click="saveState"
      aria-label="Save the application state"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
        viewBox="0 0 24 24"
      >
        <g fill="none" stroke="currentColor" stroke-width="1.5">
          <path
            d="M3 19V5a2 2 0 0 1 2-2h11.172a2 2 0 0 1 1.414.586l2.828 2.828A2 2 0 0 1 21 7.828V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"
          />
          <path
            d="M8.6 9h6.8a.6.6 0 0 0 .6-.6V3.6a.6.6 0 0 0-.6-.6H8.6a.6.6 0 0 0-.6.6v4.8a.6.6 0 0 0 .6.6ZM6 13.6V21h12v-7.4a.6.6 0 0 0-.6-.6H6.6a.6.6 0 0 0-.6.6Z"
          />
        </g>
      </svg>
    </button>

    <button
      class="item"
      @click="settings.toggleDarkMode"
      aria-label="Toggle light/dark mode"
    >
      <Icon
        v-if="settings.darkMode"
        name="darkMode"
        color="white"
        size="17px"
      />
      <Icon v-else name="lightMode" color="white" size="17px" />
    </button>
  </div>
</template>

<style scoped>
.item {
  @apply flex items-center w-10 h-10 p-2.5 hover:bg-gray-900;
}
</style>
