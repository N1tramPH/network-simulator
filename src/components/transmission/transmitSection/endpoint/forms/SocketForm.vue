<script setup>
import { useTransmitStore } from "../../../../../stores/TransmitStore";

import { TcpState as s } from "../../../../../utils/constants";
import TextInput from "../../../../input/TextInput.vue";
import Select from "../../../../input/Select.vue";

// import Socket from "../../../../../network/networkStack/Socket/Socket";

const props = defineProps({
  socket: {
    type: Object,
    required: true,
  },
  addressOptions: {
    type: Array,
    required: true,
  },
});

const store = useTransmitStore();
const reset = () => store.refreshSocket(props.socket.type);
</script>

<template>
  <button
    @click="reset"
    class="text-[.9rem] text-black dark:text-gray-100 rounded ml-auto block -mb-2"
    title="Refresh with new sockets "
  >
    Refresh
  </button>
  <div
    class="space-y-2"
    :title="socket.isBound ? 'Cannot modify a bound socket' : ''"
  >
    <Select
      label="IP address"
      :options="addressOptions"
      v-model="socket.srcIpAddress"
      :displayValue="socket.srcIpAddress"
      :reprFun="(ip) => ip.toString(false)"
      :disabled="socket.isBound"
    />

    <TextInput
      v-model="socket.srcPort"
      label="Port number"
      type="number"
      :onChangeCallback="() => store.onExistingSocket(socket)"
      :disabled="socket.isBound"
      :title="socket.isBound ? 'Cannot modify a bound socket' : ''"
    />

    <div class="inline-input">
      <span class="label">State: </span>

      <button
        v-if="socket.type === 'server' && socket.state === s.CLOSED"
        @click="socket.open"
        class="h-6 min-w-14 w-14 text-sm bg-gray-600 text-white rounded"
      >
        {{ socket.state === s.LISTEN ? "Unbind" : "Bind" }}
      </button>

      <span v-else class="text-sm font-medium">{{ socket.state }}</span>
    </div>
  </div>
</template>

<style scoped></style>
