<script setup>
import Device from "./draggables/device/Device.vue";
import PhysicalLink from "./PhysicalLink.vue";
import Packet from "./moveables/Packet/Packet.vue";

const emit = defineEmits(["remove-link", "remove-device"]);

const props = defineProps({
  devices: {},
  links: {},
  packets: {
    type: Array,
  },
});
</script>

<template>
  <Device
    v-for="[id, device] in devices"
    :key="id"
    :device="device"
    @remove-device="emit('remove-device', device)"
    class="z-5"
  />

  <PhysicalLink
    v-for="[id, link] in links"
    :key="id"
    :link="link"
    @remove-link="emit('remove-link', link)"
    class="z-4"
  />

  <Packet
    v-for="packet in packets"
    :key="packet.id"
    :packet="packet"
    class="z-5"
  />
</template>

<style scoped></style>
