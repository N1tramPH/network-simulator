<script setup>
import Collapsable from "../../../Collapsable.vue";
import PingForm from "./forms/PingForm.vue";
import SocketForm from "./forms/SocketForm.vue";
import Tables from "./Tables.vue";
import SelectButton from "./SelectButton.vue";

const props = defineProps({
  type: { type: String, required: true }, // "server"/"client"
  endpoint: {
    type: [Object, null],
    required: true,
  },

  protocol: {
    type: String,
    default: "TCP",
  },
  addressOptions: {
    required: true,
  },
});
</script>

<template>
  <section>
    <header class="center-between mb-2">
      <span class="text-base font-medium text-cyan-700 dark:text-cyan-500">
        <span class="capitalize">{{ type }}</span>
        <span v-if="endpoint && endpoint.device">
          - {{ endpoint.device.name }}
        </span>
      </span>

      <SelectButton :endPointType="type" />
    </header>

    <section>
      <template v-if="endpoint && endpoint.device">
        <div>
          <PingForm
            v-if="protocol === 'ICMP'"
            :endpoint="endpoint"
            :addressOptions="addressOptions"
          />
          <div v-else>
            <SocketForm
              :socket="endpoint.activeSocket"
              :addressOptions="addressOptions"
            />
          </div>
        </div>

        <div class="px-2">
          <Collapsable clickableHeader class="mt-2">
            <template v-slot:header>
              <span class="text-sm">Show more</span>
            </template>
            <template v-slot:body>
              <Tables :device="endpoint.device" />
            </template>
          </Collapsable>
        </div>
      </template>

      <template v-else>
        <span class="text-center block">No {{ type }} selected</span>
      </template>
    </section>
  </section>
</template>

<style scoped></style>
