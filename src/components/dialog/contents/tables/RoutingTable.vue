<script setup>
import { computed } from "vue";
import { useDialogStore } from "../../../../stores/DialogStore";
import Table from "../../../table/Table.vue";

// Routing table are accessed directly from an active device
const activeDevice = useDialogStore().activeDevice;
const routingTable = activeDevice.routingTable;
const interfaces = activeDevice.networkAdapters.map((a) => {
  return { label: a.name, value: a };
});

let columns = [
  {
    title: "Network destination",
    key: "dstIpAddress",
    placeholder: "Network destination",
  },
  {
    title: "Gateway",
    key: "gateway",
    placeholder: "Gateway",
  },
  {
    title: "Interface",
    key: "iface",
    placeholder: "Interface",
    options: interfaces,
    default: interfaces[0],
  },
  { title: "Metric", key: "metric", placeholder: "Metric" },
  { title: "Type", fixed: "static", key: "type" },
  {
    title: "Remove row",
    operation: true,
    callback: (id) => removeRow(id),
    icon: "cross",
  },
];

function addRow(row) {
  routingTable.add(row.dstIpAddress, row.gateway, row.iface, row.metric);
}

function removeRow(id) {
  routingTable.remove(id);
}

function updateRow(id, updated) {
  routingTable.update(id, updated);
}

const rows = computed(() => {
  return routingTable.data.map((row) => {
    return {
      id: row.id,
      dstIpAddress: row.dstIpAddress,
      gateway: row.gateway.isUnspecified()
        ? "On-link"
        : row.gateway.toString(false),
      iface: row.iface.name,
      metric: row.metric,
      type: row.dynamic ? "dynamic" : "static",
    };
  });
});
</script>

<template>
  <div style="min-width: 40rem; max-height: 20rem">
    <Table
      :rows="rows"
      :cols="columns"
      addable
      editable
      @remove-row="removeRow"
      @add-row="addRow"
      @update-row="updateRow"
    >
      <template v-slot:errors> </template>
    </Table>
  </div>
</template>

<style scoped></style>
