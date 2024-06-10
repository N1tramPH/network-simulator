<script setup>
import { storeToRefs } from "pinia";

import { useTransmitStore } from "../../../stores/TransmitStore";
import { useSimulationStore } from "../../../stores/SimulationStore";
import Collapsable from "../../Collapsable.vue";
import Packet from "../../board/moveables/Packet/Packet.vue";

/**
 * Currently visualized history.
 */
let currentHistory = null;

const histories = useTransmitStore().history;
const simulation = useSimulationStore();

const { activeLabel } = storeToRefs(simulation);

/**
 * Checks if given history is being visualized.
 * Used for prevention of animation recomputation.
 * @param {Packet} packet
 */
const isHistoryVisualized = (history) => {
  return currentHistory && history.id === currentHistory.id;
};

const isPacketVisualized = (packet) => {
  return activeLabel.value === packet.label;
};

/**
 * Visualizes a transmission from given a history.
 * Optionally moving to the given position in timeline by specifying a label
 * @param {Object} history A history that's to be visualized
 * @param {String} label A label in a given transmission timeline
 */
async function visualize(history, label = "") {
  const packet = history.packet;

  try {
    // There is no visualization initialized
    if (!isHistoryVisualized(history)) {
      currentHistory = history;
      await simulation.animatePacket(packet);
    }

    // If the label within animation is specified
    if (label) simulation.seek(label);
    simulation.play();
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
  <ul v-if="histories.length" class="rounded-lg max-w-xs w-full p-0">
    <div v-for="(history, idx) in histories" :key="idx">
      <Collapsable>
        <template v-slot:header>
          <header>
            <span class="label text-sm inline">
              {{ history.label }}&nbsp;
            </span>

            <span class="text-xs">
              ({{ history.client.name }} &#8594; {{ history.server.name }})
            </span>
          </header>
        </template>

        <template v-slot:body>
          <ul class="p-0 ml-1 w-full">
            <li
              v-for="packet in history.packet.flatten()"
              class="hover:opacity-75 cursor-pointer py-0.5 pl-2 my-0.5 text-[0.77rem]"
              :class="{
                'font-semibold text-cyan-600 dark:text-amber-400':
                  isPacketVisualized(packet),
              }"
              :key="packet.id"
              @click="visualize(history, packet.label)"
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
