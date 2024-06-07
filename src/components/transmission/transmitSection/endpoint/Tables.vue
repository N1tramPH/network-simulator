<script setup>
import OpenButton from "../../../buttons/OpenButton.vue";
import { useDialogStore } from "../../../../stores/DialogStore";
import { Layer } from "../../../../utils/constants";

const props = defineProps({
  device: {
    type: Object,
    required: true,
  },
});

/**
 * Opens a dialog with table of
 * given device's open sockets
 */
function openSocketTable() {
  useDialogStore().activeDevice = props.device;
  useDialogStore().openSocketTable();
}

/**
 * Opens a dialog with table of
 * given device's routing table
 */
function openRoutingTable() {
  useDialogStore().activeDevice = props.device;
  useDialogStore().openRoutingTable();
}

/**
 * Opens a dialog with table of
 * given device's ARP cache
 */
function openArpCache() {
  useDialogStore().activeDevice = props.device;
  useDialogStore().openArpCache();
}
</script>

<template>
  <div>
    <OpenButton
      v-if="device.layerType > Layer.L3"
      label="Sockets"
      :callback="openSocketTable"
    />
    <OpenButton label="Routing table" :callback="openRoutingTable" />
    <OpenButton label="ARP cache" :callback="openArpCache" />
  </div>
</template>

<style scoped></style>
