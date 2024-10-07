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

/**
 * Updates the MAC address of a CAM table entry with the specified ID.
 *
 * @param {number} id - The ID of the CAM table entry to update.
 * @param {Object} updated - An object containing the updated MAC address.
 */
function update(id, updated) {
  const newMAC = updated.macAddress;
  camTable.update(id, newMAC);
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
