<script setup>
import { useDeviceStore } from "../../../../../stores/DeviceStore";
import TextInput from "../../../../input/TextInput.vue";
import ToggleSwitch from "../../../../input/ToggleSwitch.vue";

const device = useDeviceStore().activeDevice;
</script>

<template>
  <div class="space-y-4 overflow-y-auto p-4">
    <header>
      <h3>General overview</h3>
    </header>

    <body class="space-y-2">
      <div class="inline-input grid grid-cols-3">
        <div class="col-span-2">
          <span class="description"> Device type </span>
        </div>
        <div class="col-span-1 flex justify-end">
          <span>{{ device.type }}</span>
        </div>
      </div>
      <div class="inline-input grid grid-cols-3">
        <div class="col-span-2">
          <span class="description"> Device name </span>
        </div>
        <div class="col-span-1 flex justify-end">
          <TextInput v-model="device.name" class="w-full" />
        </div>
      </div>

      <div class="inline-input grid grid-cols-3">
        <div class="col-span-2">
          <span class="description"> Power on </span>
        </div>
        <div class="col-span-1 flex justify-end">
          <ToggleSwitch v-model="device.powerOn" />
        </div>
      </div>
    </body>
  </div>
</template>

<style scoped></style>
