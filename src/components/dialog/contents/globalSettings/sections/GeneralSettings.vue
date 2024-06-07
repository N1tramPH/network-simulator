<script setup>
import { useSettingsStore } from "../../../../../stores/SettingsStore";
import { useDeviceStore } from "../../../../../stores/DeviceStore";
import { useTransmitStore } from "../../../../../stores/TransmitStore";
import { usePacketStore } from "../../../../../stores/PacketStore";

import { getState } from "../../../../../utils/state";
import { useAlertStore } from "../../../../../stores/AlertStore";
import ToggleSwitch from "../../../../input/ToggleSwitch.vue";

const settings = useSettingsStore();

function clear() {
  try {
    useDeviceStore().clear();
    useTransmitStore().clear();
    usePacketStore().clear();

    localStorage.clear(); // Must, or old invalid settings might collide

    useAlertStore().addSuccess("Application has been reset!", 5);
  } catch (e) {
    useAlertStore().addWarning("Application has failed!", 5);
  }
}

function saveState() {
  try {
    getState();
    useAlertStore().addSuccess("Application state has been saved!", 5);
  } catch (e) {
    useAlertStore().addWarning("State saving has failed!!", 5);
  }
}
</script>

<template>
  <section class="space-y-3">
    <h3 class="heading">Application state</h3>
    <div class="inline-input grid grid-cols-3">
      <div class="col-span-2">
        <span class="description"> Load state from localStorage</span>
      </div>
      <div class="col-span-1 flex justify-end">
        <ToggleSwitch v-model="settings.loadLocalStorage" />
      </div>
    </div>

    <div class="inline-input grid grid-cols-3">
      <div class="col-span-2">
        <span class="description">
          Save state to localStorage &ndash; devices and links
        </span>
      </div>
      <div class="col-span-1 flex justify-end">
        <button class="btn rounded-2xl" @click="saveState()">Save</button>
      </div>
    </div>

    <div class="inline-input grid grid-cols-3">
      <div class="col-span-2">
        <span class="description"> Clear application state </span>
      </div>
      <div class="col-span-1 flex justify-end">
        <button class="btn rounded-2xl" @click="clear()">Clear</button>
      </div>
    </div>
  </section>
</template>

<style scoped>
h3 {
  @apply text-lg text-gray-950 dark:text-gray-50;
}
</style>
