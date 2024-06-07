<script setup>
import { ref } from "vue";
import { storeToRefs } from "pinia";

import { useTransmitStore } from "../../../stores/TransmitStore";
import { useSimulationStore } from "../../../stores/SimulationStore";
import Collapsable from "../../Collapsable.vue";

let visualized = ref(null);
let currentHistory = null;
const history = useTransmitStore().history;

const store = useSimulationStore();
const { activeLabel } = storeToRefs(store);

const isVisualized = (packet) => {
  return visualized.value && packet.id === visualized.value.id;
};

/**
 * Visualizes a transmission given a by a root packet
 * also moving within the visualization timeline specifying a label
 * @param {Packet} packet A root packet representing a transmission
 * @param {String} label A label in a given transmission timeline
 */
async function visualize(packet, label = "") {
  try {
    // There is no visualization initialized
    if (!isVisualized(packet)) {
      visualized.value = packet;
      await store.animatePacket(packet);
    }

    if (label) store.seek(label);
    store.play();
  } catch (e) {
    const confirmation = window.confirm(
      "This animations seems to be corrupted. Would you like to remove it?"
    );
    if (confirmation && currentHistory) {
      useTransmitStore().removeHistory(currentHistory.id);
    }
    throw e;
  }
}
</script>

<template>
  <ul v-if="history.length" class="rounded-lg max-w-xs w-full p-0">
    <div v-for="(t, idx) in history" :key="idx">
      <Collapsable>
        <template v-slot:header>
          <header>
            <span class="label text-sm inline"> {{ t.label }}&nbsp; </span>
            <span class="text-xs">
              ({{ t.client.name }} &#8594; {{ t.server.name }})
            </span>
          </header>
        </template>

        <template v-slot:body>
          <ul class="p-0 ml-1 w-full">
            <li
              v-for="packet in t.packet.flatten()"
              :key="packet.id"
              @click="
                visualize(t.packet, packet.label);
                currentHistory = t;
              "
              class="hover:opacity-75 cursor-pointer py-0.5 pl-2 my-0.5 text-[0.77rem]"
              :class="{
                'font-semibold text-cyan-600 dark:text-amber-400':
                  packet.label === activeLabel,
              }"
            >
              {{ packet.title }} &nbsp; ({{
                packet.startPoint ? packet.startPoint.name : ""
              }}
              &#8594;
              {{ packet.endPoint ? packet.endPoint.name : "" }})
            </li>
          </ul>
        </template>
      </Collapsable>
    </div>
  </ul>
  <div v-else class="text-center">No transmissions recorded</div>
</template>

<style scoped></style>
