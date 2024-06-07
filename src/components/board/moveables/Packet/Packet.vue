<script setup>
import { useSimulationStore } from "../../../../stores/SimulationStore";
import { usePacketStore } from "../../../../stores/PacketStore";
import { useDialogStore } from "../../../../stores/DialogStore";

import Packet from "../../../../network/Packet";

const props = defineProps({
  packet: {
    type: Packet,
    required: true,
  },
});

// Showing data details
function view() {
  // Stop the animation
  useSimulationStore().pause();
  usePacketStore().viewPacket(props.packet);
  useDialogStore().openPacketView();
}
</script>

<template>
  <div
    class="absolute hidden cursor-pointer z-10"
    :id="packet.id"
    @click="view()"
  >
    <div
      class="packet flex flex-col items-center text-black dark:text-slate-100"
    >
      <span v-show="packet.title" class="block text-sm font-medium bg-board">
        {{ packet.title }}
      </span>

      <span
        v-if="packet.subtitle"
        class="whitespace-pre-line bg-board text-[0.86rem]"
      >
        {{ packet.subtitle }}
      </span>

      <div class="w-[1.9rem] text-amber-400">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          height="100%"
          viewBox="-2 -5 24 24"
        >
          <path
            fill="currentColor"
            d="M18.572.083L10.676 7.12a1 1 0 0 1-1.331 0L1.416.087A2 2 0 0 1 2 0h16a2 2 0 0 1 .572.083m1.356 1.385c.047.17.072.348.072.532v10a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2a2 2 0 0 1 .072-.534l7.942 7.148a3 3 0 0 0 3.992 0z"
          />
        </svg>
      </div>
    </div>
  </div>
</template>

<style scoped>
.packet {
  /* Centering the content */
  translate: -50% 0;
}
</style>
