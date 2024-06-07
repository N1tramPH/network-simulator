<script setup>
import { storeToRefs } from "pinia";
import { onMounted } from "vue";
import { loadState } from "./utils/state";

import Player from "./components/player/Player.vue";
import Sidebar from "./components/sidebar/Sidebar.vue";
import Toolbar from "./components/toolbar/Toolbar.vue";
import Board from "./components/board/Board.vue";
import Dialog from "./components/dialog/Dialog.vue";
import TransmitControl from "./components/transmission/TransmitControl.vue";
import AlertList from "./components/alert/AlertList.vue";

import { useTransmitStore } from "./stores/TransmitStore";
import { useSettingsStore } from "./stores/SettingsStore";

// Load state from localStorage if opt-in
onMounted(() => {
  if (useSettingsStore().loadLocalStorage) {
    loadState();
  }
});

// Indicator of selection
const { selectType } = storeToRefs(useTransmitStore());

const handleRightClick = (e) => {
  e.preventDefault();
};
</script>

<template>
  <div class="h-full w-full" @click.right="handleRightClick">
    <div class="flex h-full w-full" :class="{ 'select-device': selectType }">
      <Sidebar class="z-10"></Sidebar>
      <Board class="board z-5"></Board>
    </div>

    <Toolbar />
    <TransmitControl></TransmitControl>

    <Dialog class="z-15"></Dialog>
    <Player class="z-5"></Player>

    <AlertList class="alerts z-20" />
  </div>
</template>

<style scoped>
.board {
  top: 0;
  left: 0;
  width: 100%;
}

.alerts {
  position: absolute;
  top: 1rem;
  right: 1rem;
}

.select-device {
  cursor: crosshair;
}
</style>
