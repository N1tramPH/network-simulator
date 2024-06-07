<script setup>
import { useTransmitStore } from "../../../stores/TransmitStore";
import EndPoint from "./endpoint/EndPoint.vue";

const store = useTransmitStore();
store.setProtocol("TCP");

const toggleConnection = () =>
  store.isEstablished ? store.disconnect() : store.connect();
</script>

<template>
  <div>
    <div>
      <EndPoint
        type="client"
        :endpoint="store.client"
        :addressOptions="store.clientAddresses"
      />

      <button
        class="block m-auto my-2 bg-transparent text-green-500 w-7"
        :class="{ 'text-red-500': !store.isEstablished }"
        :title="store.isEstablished ? 'disconnect' : 'connect'"
        @click="toggleConnection"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          height="100%"
          viewBox="0 0 20 20"
        >
          <path
            fill="currentColor"
            d="M8 5a1 1 0 1 0 0 2h5.586l-1.293 1.293a1 1 0 0 0 1.414 1.414l3-3a1 1 0 0 0 0-1.414l-3-3a1 1 0 1 0-1.414 1.414L13.586 5zm4 10a1 1 0 1 0 0-2H6.414l1.293-1.293a1 1 0 1 0-1.414-1.414l-3 3a1 1 0 0 0 0 1.414l3 3a1 1 0 0 0 1.414-1.414L6.414 15z"
          />
        </svg>
      </button>

      <EndPoint
        type="server"
        :endpoint="store.server"
        :addressOptions="store.serverAddresses"
      />
    </div>

    <!-- <button @click="store.transmit()" class="btn block mx-auto my-4">
      Transmit
    </button> -->
  </div>
</template>

<style scoped></style>
