<script setup>
import Select from "../../../../input/Select.vue";

const props = defineProps({
  endpoint: {
    type: [Object, null],
    required: true,
  },
  addressOptions: {
    required: true,
  },
});
</script>

<template>
  <div>
    <Select
      label="IP address"
      :options="addressOptions"
      v-model="endpoint.ipAddress"
      :displayValue="endpoint.ipAddress"
      :reprFun="(ip) => ip.toString(false)"
      class="rounded"
    />
  </div>
</template>

<style scoped></style>
