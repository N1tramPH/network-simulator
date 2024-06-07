<script setup>
import { computed, ref } from "vue";
import { capitalize } from "lodash-es";

import { loadState } from "../../../utils/state";

const items = ref([
  {
    label: "devices",
    selected: true,
  },
  {
    label: "links",
    selected: true,
  },
  {
    label: "settings",
    selected: true,
  },
]);

const selectedItems = computed(() => {
  const selected = [];

  items.value.forEach((item) => {
    item.selected ? selected.push(item.label) : 1;
  });

  return selected;
});

const allowedTypes = ["application/json"];
const importData = ref(null); // Loaded import data

const onUpload = (e) => {
  const importFile = e.target.files[0];
  if (!importFile) throw new Error("Please import the JSON data.");

  if (!allowedTypes.includes(importFile.type))
    throw new Error("Invalid file format! Only a JSON export is supported.");

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      importData.value = JSON.parse(e.target.result);
    } catch (e) {
      throw new Error(
        "An unexpected error ocurred during file load.\nLikely due to the corrupted export file."
      );
    }
  };
  reader.readAsText(importFile);
};

const onImport = () => {
  if (!importData.value) throw Error("Please select a valid export file.");
  loadState(selectedItems.value, importData.value);
};
</script>

<template>
  <div style="width: 32rem" class="space-y-2">
    <h3 class="heading">Select an import file:</h3>
    <input
      accept=".json"
      type="file"
      @change="onUpload"
      class="file-input file-input-bordered w-full max-w-xs h-12 block bg-slate-50 shadow dark:bg-slate-600"
    />

    <div class="text-red-600 text-sm">
      <span>Warning: a transmission history will be lost.</span>
    </div>

    <ul v-if="importData" class="list-disc pl-6">
      <template v-for="(item, idx) in items" :key="item.label">
        <li>
          <div class="flex center-between text-sm">
            <label :for="item.label">{{ capitalize(item.label) }}</label>
            <input
              type="checkbox"
              class="checkbox"
              v-model="items[idx].selected"
              :name="item.caption"
            />
          </div>
        </li>
      </template>
    </ul>

    <button @click="onImport" class="btn">Import</button>
  </div>
</template>

<style scoped></style>
