<script setup>
import { useSettingsStore } from "../../../../../stores/SettingsStore";
import ToggleSwitch from "../../../../input/ToggleSwitch.vue";

const settings = useSettingsStore();
</script>

<template>
  <section class="space-y-1">
    <h3 class="heading">Appearance</h3>

    <div class="inline-input grid grid-cols-3">
      <div class="col-span-2">
        <span class="description">Dark mode</span>
      </div>
      <div class="col-span-1 flex justify-end">
        <ToggleSwitch v-model="settings.darkMode" />
      </div>
    </div>
  </section>
</template>

<style scoped>
h3 {
  @apply text-lg text-gray-950 dark:text-gray-50;
}
</style>
