<script setup>
import { ref, onMounted } from "vue";
import { storeToRefs } from "pinia";

import { useDeviceStore } from "../../stores/DeviceStore";
import { useTransmitStore } from "../../stores/TransmitStore";
import { usePacketStore } from "../../stores/PacketStore";
import { useBoardStore } from "../../stores/BoardStore";
import InfoBar from "./InfoBar.vue";
import StatusBar from "./StatusBar.vue";
import BoardItems from "./BoardItems.vue";

const { linking, devices, links } = storeToRefs(useDeviceStore());
const { activePackets } = storeToRefs(usePacketStore());
const { selectType } = storeToRefs(useTransmitStore());

const removeLink = (link) => {
  const confirm = window.confirm(`Are you sure about removing \n ${link}?`);
  if (confirm) useDeviceStore().removeLink(link);
};

const removeDevice = (device) => {
  const confirm = window.confirm(`Are you sure about removing \n ${device}?`);
  if (confirm) useDeviceStore().removeDevice(device);
};

const board = ref(null);
onMounted(() => useBoardStore().initBoard(board.value));
</script>

<template>
  <div
    class="bg-board relative focus:outline-none"
    :class="{ 'select-type': linking || selectType }"
    @click.right="
      useDeviceStore().cancelLinking();
      useTransmitStore().cancelSelection();
    "
  >
    <div class="w-full h-full" ref="board">
      <BoardItems
        :devices="devices"
        :links="links"
        :packets="activePackets"
        @remove-link="removeLink"
        @remove-device="removeDevice"
      />
    </div>

    <InfoBar />
    <StatusBar class="bottom-0" />
  </div>
</template>

<style scoped>
.select-cursor,
.select-type {
  cursor: crosshair !important;
}
</style>
./InfoBar.vue
