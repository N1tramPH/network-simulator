<script setup>
import { computed } from "vue";
import { useDialogStore } from "../../../../stores/DialogStore";

import Table from "../../../table/Table.vue";

const arpTable = useDialogStore().activeDevice.arpTable;

// Specifies titles of each column with some additional configuration
const columns = [
  { title: "IP address", placeholder: "IP address", key: "ipAddress" },
  { title: "MAC address", placeholder: "MAC address", key: "macAddress" },
  { title: "Type", fixed: "static", key: "type" },
  {
    title: "Remove row",
    operation: true,
    callback: (id) => removeRow(id),
    icon: "cross",
  },
];

function removeRow(id) {
  arpTable.remove(id);
}

function addRow(row) {
  arpTable.add(row.ipAddress, row.macAddress, row.type ? row.type : "static");
}

function updateRow(id, updated) {
  arpTable.update(id, updated);
}

const rows = computed(() => {
  return arpTable.data.map((row) => {
    return {
      id: row.id,
      ipAddress: row.ipAddress.toString(false),
      macAddress: row.macAddress,
      type: row.type,
    };
  });
});
</script>

<template>
  <div style="min-width: 33rem; max-height: 20rem" class="overflow-y-auto">
    <Table
      :cols="columns"
      :rows="rows"
      addable
      editable
      @remove-row="remove"
      @add-row="addRow"
      @update-row="updateRow"
    >
    </Table>
  </div>
</template>

<style scoped></style>
