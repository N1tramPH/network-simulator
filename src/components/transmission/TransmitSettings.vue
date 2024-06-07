<script setup>
import { storeToRefs } from "pinia";
import { useSimulationStore } from "../../stores/SimulationStore";

import Select from "../input/Select.vue";
import ToggleSwitch from "../input/ToggleSwitch.vue";
import InputChecked from "../input/InputChecked.vue";

const {
  animateOnTransmit,
  animationSpeed,
  // animateCorrupt,
  showReports,
  timeToLive,
  immediateTcpClose,
} = storeToRefs(useSimulationStore());

const speedValues = [
  { label: "0.5x", value: 0.5 },
  { label: "1x", value: 1 },
  { label: "1.25x", value: 1.25 },
  { label: "1.5x", value: 1.5 },
  { label: "2x", value: 2 },
];

const defaultSpeed = {
  label: `${animationSpeed.value}x`,
  value: animationSpeed.value,
};
</script>

<template>
  <div class="h-[28rem] h-max-[70vh] w-[40rem] space-y-6 overflow-y-scroll p-4">
    <section class="space-y-2">
      <header>
        <h3>General</h3>
      </header>

      <body class="space-y-3">
        <div class="inline-input grid grid-cols-3">
          <div class="col-span-2">
            <span class="description"> Visualize on transmission </span>
          </div>
          <div class="col-span-1 flex justify-end">
            <ToggleSwitch v-model="animateOnTransmit" />
          </div>
        </div>

        <div class="inline-input grid grid-cols-3">
          <div class="col-span-2">
            <span class="description"> Visualize informative messages </span>
          </div>
          <div class="col-span-1 flex justify-end">
            <ToggleSwitch v-model="showReports" />
          </div>
        </div>

        <div class="inline-input grid grid-cols-3">
          <div class="col-span-2">
            <span class="description"> Animation speed </span>
          </div>
          <div class="col-span-1 flex justify-end">
            <Select
              v-model="animationSpeed"
              :options="speedValues"
              :defaultOption="defaultSpeed"
              class="w-28 rounded"
            />
          </div>
        </div>
      </body>
    </section>

    <section class="space-y-2">
      <header>
        <h3>Transport layer</h3>
      </header>

      <body class="space-y-3">
        <div class="inline-input grid grid-cols-3">
          <div class="col-span-2">
            <span class="description">
              Close connection on FIN receipt (3-phase closing)
            </span>
          </div>
          <div class="col-span-1 flex justify-end">
            <ToggleSwitch v-model="immediateTcpClose" />
          </div>
        </div>
      </body>
    </section>

    <section class="space-y-2">
      <header>
        <h3>IP layer</h3>
      </header>

      <body class="space-y-3">
        <div class="inline-input grid grid-cols-3">
          <div class="col-span-2">
            <span class="description"> IP packet Time-To-Live </span>
          </div>
          <div class="col-span-1 flex justify-end">
            <InputChecked
              :setter="(value) => (timeToLive = value)"
              :repr="() => timeToLive"
              class="w-28"
            />
          </div>
        </div>
      </body>
    </section>
  </div>
</template>

<style scoped>
h3 {
  @apply text-lg text-gray-950 dark:text-gray-50;
}
</style>
