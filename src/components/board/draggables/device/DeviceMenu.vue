<script setup>
import { useDeviceStore } from "../../../../stores/DeviceStore";
import { useTransmitStore } from "../../../../stores/TransmitStore";
import { useDialogStore } from "../../../../stores/DialogStore";

import Menu from "../../../menu/Menu.vue";

const props = defineProps({
  device: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["close-panel", "remove-device"]);

function openSettings(idx = 0) {
  // Open the management section that renders
  // settings of an activeDevice
  useDeviceStore().activeDevice = props.device;
  useDialogStore().activeDevice = props.device;

  // Open as a following dialog (false) + open a given section within a dialog
  useDialogStore().openDeviceSettings(false, idx);
}

// Abstracting setter caused lags for whatever reason
function openTransmission() {
  useTransmitStore().setClient(props.device);
  useTransmitStore().openControl();
}

const menu = [
  {
    sectionLabel: "Options",
    items: [
      {
        label: "Settings",
        icon: "settings",
        callback: () => openSettings(0),
        nested: [
          {
            sectionLabel: "",
            items: [
              {
                label: "General",
                callback: () => openSettings(0),
              },
              {
                label: "Interfaces",
                callback: () => openSettings(1),
              },
              {
                label: "Network",
                callback: () => openSettings(2),
              },
            ],
          },
        ],
      },
      {
        label: "Transmission",
        icon: "switchHorizontal",
        callback: openTransmission,
      },
      {
        label: "Power",
        icon: "power",
        callback: () => props.device.togglePower(),
      },
    ],
  },
  {
    sectionLabel: "Danger zone",
    items: [
      {
        label: "Remove",
        icon: "trash",
        callback: () => emit("remove-device"),
      },
    ],
  },
];
</script>

<template>
  <Menu
    :menu="menu"
    @close-panel="emit('close-panel')"
    class="absolute right z-10"
  />
</template>

<style scoped></style>
