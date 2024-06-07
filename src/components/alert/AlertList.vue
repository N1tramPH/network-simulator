<script setup>
import Alert from "./Alert.vue";

import { useAlertStore } from "../../stores/AlertStore";
import { storeToRefs } from "pinia";
const { alerts } = storeToRefs(useAlertStore());
</script>

<template>
  <div class="space-y-3">
    <Alert v-for="alert in alerts" :key="alert.id" :alert="alert" />
  </div>
</template>

<style scoped></style>
