<script setup>
import { useDialogStore } from "../../../../../stores/DialogStore";
import { useDeviceStore } from "../../../../../stores/DeviceStore";
import { Layer as l } from "../../../../../utils/constants";
import OpenButton from "../../../../buttons/OpenButton.vue";

const device = useDeviceStore().activeDevice;
const dialog = useDialogStore();
</script>

<template>
  <div class="space-y-4 overflow-y-scroll p-4">
    <section>
      <header v-if="device.layerType >= l.L3">
        <h3>Network configuration</h3>
      </header>

      <body class="space-y-2 mt-2">
        <div v-if="device.arpTable" class="inline-input grid grid-cols-3">
          <div class="col-span-2">
            <span class="description"> ARP table </span>
          </div>
          <OpenButton :callback="() => dialog.openArpCache(false)" label="" />
        </div>

        <div v-if="device.routingTable" class="inline-input grid grid-cols-3">
          <div class="col-span-2">
            <span class="description"> Routing table </span>
          </div>
          <OpenButton
            :callback="() => dialog.openRoutingTable(false)"
            label=""
          />
        </div>

        <div v-if="device.socketsTable" class="inline-input grid grid-cols-3">
          <div class="col-span-2">
            <span class="description"> Sockets table </span>
          </div>
          <OpenButton
            :callback="() => dialog.openSocketTable(false)"
            label=""
          />
        </div>
      </body>
    </section>

    <section v-if="device.layerType === l.L2">
      <header>
        <h3>CAM table</h3>
      </header>

      <body class="space-y-2 mt-2">
        <div class="inline-input grid grid-cols-3">
          <div class="col-span-2">
            <span class="description"> Physical ports </span>
          </div>
          <OpenButton :callback="() => dialog.openCamTable(false)" label="" />
        </div>
      </body>
    </section>
  </div>
</template>

<style scoped></style>
