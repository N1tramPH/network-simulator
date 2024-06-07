<script setup>
import { ref, computed } from "vue";
import { capitalize } from "lodash-es";

import { getState } from "../../../utils/state";

const items = ref([
  {
    label: "devices",
    selected: false,
  },
  {
    label: "links",
    selected: false,
  },
  {
    label: "settings",
    selected: false,
  },
]);

const selectedItems = computed(() => {
  const selected = [];

  items.value.forEach((item) => {
    item.selected ? selected.push(item.label) : 1;
  });

  return selected;
});

const onExport = () => {
  let exportJSON = getState(selectedItems.value, false);

  // Save to a file
  const blob = new Blob([JSON.stringify(exportJSON)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "export_data.json";
  a.click();

  return JSON.stringify(exportJSON);
};
</script>

<template>
  <div class="w-[32rem] space-y-2">
    <h3 class="heading">Select exported items:</h3>
    <ul class="list-disc pl-6">
      <li v-for="(item, key) in items" :key="key">
        <div class="flex center-between text-sm">
          <label :for="item.label">{{ capitalize(item.label) }}</label>
          <input
            type="checkbox"
            class="checkbox"
            v-model="items[key].selected"
            :name="item.label"
          />
        </div>
      </li>
    </ul>
    <button @click="onExport" class="btn">Export</button>
  </div>
</template>

<style scoped></style>
