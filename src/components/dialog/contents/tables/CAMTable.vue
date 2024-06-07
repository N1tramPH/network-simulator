<script setup>
import { useDialogStore } from "../../../../stores/DialogStore";
import Table from "../../../table/Table.vue";

const camTable = useDialogStore().activeDevice.camTable;

// Specifies titles of each column with some additional configuration
const columns = [
  { title: "Interface", placeholder: "Interface", key: "iface", fixed: true },
  {
    title: "Physical port",
    placeholder: "Physical port",
    key: "port",
    fixed: true,
  },
  { title: "MAC address", placeholder: "MAC address", key: "macAddress" },
  {
    title: "Clear",
    operation: true,
    callback: (id) => clear(id),
    icon: "cross",
  },
];

function clear(id) {
  camTable.clear(id);
}

function update(id, updated) {
  camTable.update(id, updated);
}
</script>

<template>
  <div style="min-width: 33rem; max-height: 20rem" class="overflow-y-auto">
    <Table
      :cols="columns"
      :rows="camTable.data"
      editable
      @remove-row="clear"
      @update-row="update"
    >
    </Table>
  </div>
</template>

<style scoped></style>
