<script setup>
import { ref } from "vue";
import { gsap } from "gsap/gsap-core";
import { useTransmitStore } from "../../../stores/TransmitStore";

import EndPoint from "./endpoint/EndPoint.vue";

const store = useTransmitStore();
store.setProtocol("ICMP");

const state = ref(null);
const icmpResponse = ref(null);

const ping = () => {
  icmpResponse.value = store.ping();

  gsap.fromTo(
    state.value,
    {
      opacity: 1,
      display: "block",
    },
    {
      duration: 8,
      opacity: 0,
      onComplete: () => {
        icmpResponse.value = null;
      },
    }
  );
};
</script>

<template>
  <div class="space-y-6">
    <section class="sender">
      <EndPoint
        type="client"
        :endpoint="store.client"
        protocol="ICMP"
        :addressOptions="store.clientAddresses"
      />
    </section>

    <section class="recipient">
      <EndPoint
        type="server"
        :endpoint="store.server"
        protocol="ICMP"
        :addressOptions="store.serverAddresses"
      />
    </section>

    <button @click="ping" class="btn block mx-auto my-4">Ping</button>

    <div class="hidden text-sm text-center" ref="state">
      <template v-if="icmpResponse">
        <span
          class="text-green-600 text-[1.025rem]"
          :class="{ 'text-red-700': !icmpResponse.success }"
        >
          {{ icmpResponse.msg }}
        </span>
      </template>
    </div>
  </div>
</template>

<style scoped></style>
