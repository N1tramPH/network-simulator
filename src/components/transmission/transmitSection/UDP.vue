<script setup>
import { useTransmitStore } from "../../../stores/TransmitStore";
import EndPoint from "./endpoint/EndPoint.vue";

const store = useTransmitStore();
store.setProtocol("UDP");
</script>

<template>
  <div class="flex justify-center items-center h-[25rem] w-full">
    UDP got lost :(
  </div>
  <!-- <div class="space-y-4">
    <EndPoint
      type="client"
      :endpoint="store.client"
      protocol="UDP"
      :addressOptions="store.clientAddresses"
      class="mb-8"
    />

    <EndPoint
      type="server"
      :endpoint="store.server"
      protocol="UDP"
      :addressOptions="store.serverAddresses"
    />
  </div>

  <button class="btn block mt-6 mx-auto">Transmit</button> -->
</template>

<style scoped></style>
