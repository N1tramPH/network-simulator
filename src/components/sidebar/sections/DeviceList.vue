<script setup>
import { computed, ref } from "vue";
import { groupBy } from "lodash-es";

import { useDeviceStore } from "../../../stores/DeviceStore";
import { useDialogStore } from "../../../stores/DialogStore";
import { useBoardStore } from "../../../stores/BoardStore";

import Collapsable from "../../Collapsable.vue";
import DeviceIcon from "../../board/draggables/device/DeviceIcon.vue";

const deviceStore = useDeviceStore();
const dialogStore = useDialogStore();
const boardStore = useBoardStore();

// Remove an active device (from add device section)
deviceStore.setActiveDevice(null);
const devices = computed(() => [...deviceStore.devices.values()]);

// Create groups
const groups = deviceStore.types;
const grouped = ref(groupBy(devices.value, (d) => d.type));

function openSettings(device) {
  // Opens the settings dialog of the device
  deviceStore.setActiveDevice(device);
  dialogStore.openDeviceSettings();
}

function zoomToDevice(device) {
  // Zooms to a particular devices
  const xOffset = window.innerWidth / 2;
  const yOffset = window.innerHeight / 2;
  boardStore.moveTo(device.x - xOffset, device.y - yOffset);
}
</script>

<template>
  <div class="">
    <Collapsable
      v-for="group in groups"
      :key="group.label"
      class="group space-y-2"
    >
      <template v-slot:header>
        <span class="header-sm">
          {{ group.label }}
        </span>
      </template>

      <template v-slot:body>
        <ul class="mb-2 divide-y dark:divide-gray-700">
          <li
            v-for="device in grouped[group.label]"
            :key="device.id"
            class="flex justify-between align-center p-3"
          >
            <!-- An icon and the name of the device -->
            <div class="flex items-center gap-2">
              <DeviceIcon :type="group.label" class="w-6" />
              <span class="text-sm">
                {{ device.name }}
              </span>
            </div>

            <!-- Controllers -->
            <div class="flex items-center gap-2">
              <button
                @click="openSettings(device)"
                class="hover:scale-105 w-5"
                :title="`Open settings of ${device.name}`"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="100%"
                  height="100%"
                  viewBox="0 0 512 512"
                >
                  <path
                    fill="currentColor"
                    d="M256 176a80 80 0 1 0 80 80a80.24 80.24 0 0 0-80-80m172.72 80a165.53 165.53 0 0 1-1.64 22.34l48.69 38.12a11.59 11.59 0 0 1 2.63 14.78l-46.06 79.52a11.64 11.64 0 0 1-14.14 4.93l-57.25-23a176.56 176.56 0 0 1-38.82 22.67l-8.56 60.78a11.93 11.93 0 0 1-11.51 9.86h-92.12a12 12 0 0 1-11.51-9.53l-8.56-60.78A169.3 169.3 0 0 1 151.05 393L93.8 416a11.64 11.64 0 0 1-14.14-4.92L33.6 331.57a11.59 11.59 0 0 1 2.63-14.78l48.69-38.12A174.58 174.58 0 0 1 83.28 256a165.53 165.53 0 0 1 1.64-22.34l-48.69-38.12a11.59 11.59 0 0 1-2.63-14.78l46.06-79.52a11.64 11.64 0 0 1 14.14-4.93l57.25 23a176.56 176.56 0 0 1 38.82-22.67l8.56-60.78A11.93 11.93 0 0 1 209.94 26h92.12a12 12 0 0 1 11.51 9.53l8.56 60.78A169.3 169.3 0 0 1 361 119l57.2-23a11.64 11.64 0 0 1 14.14 4.92l46.06 79.52a11.59 11.59 0 0 1-2.63 14.78l-48.69 38.12a174.58 174.58 0 0 1 1.64 22.66"
                  />
                </svg>
              </button>

              <button
                @click="zoomToDevice(device)"
                class="hover:scale-105 w-5"
                :title="`Locate ${device.name} on a board`"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="100%"
                  height="100%"
                  viewBox="0 0 16 16"
                >
                  <path
                    fill="currentColor"
                    fill-rule="evenodd"
                    d="M11.5 7a4.5 4.5 0 1 1-9 0a4.5 4.5 0 0 1 9 0m-.82 4.74a6 6 0 1 1 1.06-1.06l2.79 2.79a.75.75 0 1 1-1.06 1.06z"
                    clip-rule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </li>
        </ul>
      </template>
    </Collapsable>
  </div>
</template>

<style scoped></style>
