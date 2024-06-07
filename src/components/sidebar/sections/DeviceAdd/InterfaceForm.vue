<script setup>
import NetworkAdapter from "../../../../network/stack/linkLayer/NetworkAdapter";
import Collapsable from "../../../Collapsable.vue";
import InputChecked from "../../../input/InputChecked.vue";
import TextInput from "../../../input/TextInput.vue";
import ToggleSwitch from "../../../input/ToggleSwitch.vue";

const props = defineProps({
  iface: {
    type: [NetworkAdapter, Object],
    required: true,
  },
});

// Access to a device that the interface is mounted on
const mountOn = props.iface.mountOn;

// Checker for name uniqueness
const isNameUnique = (name) => {
  return mountOn.isAdapterNameUnique(name);
};
</script>

<template>
  <Collapsable>
    <template v-slot:header>
      <slot name="header"></slot>
    </template>

    <template v-slot:body>
      <div class="space-y-4 p-0.5">
        <TextInput
          label="Name"
          v-model="iface.name"
          :validator="isNameUnique"
        />
        <InputChecked
          :setter="(value) => (iface.macAddress = value)"
          :repr="() => iface.macAddress.toString()"
          class="w-full"
        />
        <template v-if="iface.ipAddress">
          <InputChecked
            :setter="(value) => (iface.ipAddress = value)"
            :repr="() => iface.ipAddress.toString()"
            class="w-full"
          />
        </template>

        <ToggleSwitch
          label="Promiscuous mode"
          v-model="iface.promiscuousMode"
          inline
        />

        <slot name="append"> </slot>
      </div>
    </template>
  </Collapsable>
</template>

<style scoped></style>
