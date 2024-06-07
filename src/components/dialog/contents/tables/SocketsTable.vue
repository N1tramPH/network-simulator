<script setup>
import { ref } from "vue";
import { useDialogStore } from "../../../../stores/DialogStore";
import { useTransmitStore } from "../../../../stores/TransmitStore";

import Table from "../../../table/Table.vue";

const errors = ref([]);
const activeDevice = useDialogStore().activeDevice;
const socketsTable = activeDevice.socketsTable;

// Specifies the titles of each column with some additional config
const columns = [
  { title: "Protocol", placeholder: "UDP/TCP", key: "protocol" },
  {
    title: "Local address",
    placeholder: "192.168.1.1:1024",
    key: "localAddress",
  },
  {
    title: "Remote address",
    placeholder: "192.168.1.1:1024",
    key: "remoteAddress",
  },
  {
    title: "State",
    placeholder: "CLOSED/LISTEN",
    fixedValue: "LISTEN",
    key: "state",
  },
  {
    title: "Select socket",
    operation: true,
    icon: "chevronRight",
    callback: (id) => selectSocket(id),
  },
];

function selectSocket(id) {
  const store = useTransmitStore();
  store.setActiveSocket(id);
}
</script>

<template>
  <div style="width: 38rem; max-height: 28rem" class="overflow-y-auto">
    <Table :cols="columns" :rows="socketsTable.data"> </Table>
  </div>
</template>

<style scoped></style>
