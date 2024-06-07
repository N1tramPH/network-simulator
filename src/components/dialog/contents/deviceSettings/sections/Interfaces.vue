<script setup>
import { nanoid } from "nanoid";

import { useDeviceStore } from "../../../../../stores/DeviceStore";
import { Layer as l } from "../../../../../utils/constants";

import ToggleSwitch from "../../../../input/ToggleSwitch.vue";
import TextInput from "../../../../input/TextInput.vue";
import Collapsable from "../../../../Collapsable.vue";
import InputChecked from "../../../../input/InputChecked.vue";

const device = useDeviceStore().activeDevice;

function addInterface() {
  device.addAdapter(`enp0s-${nanoid(3)}`);
}

function removeInterface(index) {
  const confirm = window.confirm(
    `Are you sure you want to delete\n${device.networkAdapters[index]}?`
  );

  if (confirm) {
    device.removeAdapter(index);
  }
}
</script>

<template>
  <div class="overflow-y-scroll">
    <div class="space-y-4 p-6">
      <div v-if="!device.networkAdapters.length">
        No network interface's been mounted
      </div>
      <ul v-else class="space-y-6">
        <li v-for="(iface, i) in device.networkAdapters" :key="i">
          <Collapsable>
            <template v-slot:header>
              <header>
                <h3>Interface - {{ iface.name }}</h3>
              </header>
            </template>

            <template v-slot:body>
              <body class="space-y-2 mt-4">
                <div class="inline-input grid grid-cols-3">
                  <div class="col-span-2">
                    <span class="description"> Name </span>
                  </div>
                  <div class="col-span-1 flex justify-end">
                    <TextInput v-model="iface.name" class="w-full" />
                    <!-- <InputChecked
                      :setter="(value) => (iface.name = value)"
                      :repr="() => iface.name"
                      class="w-full"
                    /> -->
                  </div>
                </div>

                <div class="inline-input grid grid-cols-3">
                  <div class="col-span-2">
                    <span class="description">MAC address</span>
                  </div>
                  <div class="col-span-1 flex justify-end">
                    <!-- <TextInput v-model="iface.macAddress" class="w-full" /> -->
                    <InputChecked
                      :setter="(value) => (iface.macAddress = value)"
                      :repr="() => iface.macAddress.toString()"
                      class="w-full"
                    />
                  </div>
                </div>

                <div
                  v-if="device.layerType >= l.L3"
                  class="inline-input grid grid-cols-3"
                >
                  <div class="col-span-2">
                    <span class="description"> IP address </span>
                  </div>
                  <div class="col-span-1 flex justify-end">
                    <!-- <TextInput v-model="iface.ipAddress" class="w-full" /> -->
                    <InputChecked
                      :setter="(value) => (iface.ipAddress = value)"
                      :repr="() => iface.ipAddress.toString()"
                      class="w-full"
                    />
                  </div>
                </div>

                <div class="inline-input grid grid-cols-3">
                  <div class="col-span-2">
                    <span class="description"> Promiscuous mode </span>
                  </div>
                  <div class="col-span-1 flex justify-end">
                    <ToggleSwitch v-model="iface.promiscuousMode" />
                  </div>
                </div>

                <div class="inline-input grid grid-cols-3">
                  <div class="col-span-2">
                    <span class="description"> Remove </span>
                  </div>
                  <div class="col-span-1 flex justify-end">
                    <button @click="removeInterface(i)">
                      <svg
                        class="w-6"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24px"
                        height="24px"
                        viewBox="0 0 24 24"
                      >
                        <g fill="currentColor">
                          <path
                            fill-rule="evenodd"
                            d="M17 5V4a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v1H4a1 1 0 0 0 0 2h1v11a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3V7h1a1 1 0 1 0 0-2zm-2-1H9v1h6zm2 3H7v11a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1z"
                            clip-rule="evenodd"
                          />
                          <path d="M9 9h2v8H9zm4 0h2v8h-2z" />
                        </g>
                      </svg>
                    </button>
                  </div>
                </div>
              </body>
            </template>
          </Collapsable>
        </li>
      </ul>
      <button class="btn mt-2" @click="addInterface">Add interface</button>
    </div>
  </div>
</template>

<style scoped></style>
