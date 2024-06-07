<script setup>
import { useDeviceStore } from "../../../../stores/DeviceStore";
import NetworkAdapter from "../../../../network/stack/linkLayer/NetworkAdapter";

const props = defineProps({
  adapter: {
    type: NetworkAdapter,
    required: true,
  },
});

const createLink = useDeviceStore().linkDevices;

const removeLink = (link) => {
  const confirm = window.confirm(`Are you sure about removing \n ${link}?`);
  if (confirm) useDeviceStore().removeLink(link);
};

function handleClick(port) {
  port.free ? createLink(port) : removeLink(port.physicalLink);
}
</script>

<template>
  <ul class="flex gap-[.1rem]">
    <li v-for="[key, port] in adapter.ports" :key="key">
      <button
        :title="port.free ? 'Connect port' : `Disconnect ${port.physicalLink}`"
        class="flex items-center justify-center p-1.5 hover:scale-105 bg-green-400 w-5 h-5 text-black"
        :class="{ 'bg-red-400': !port.free }"
        @click="handleClick(port)"
      >
        <svg
          v-if="!port.free"
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          height="100%"
          viewBox="0 0 15 15"
        >
          <path
            fill="currentColor"
            fill-rule="evenodd"
            d="M11.782 4.032a.575.575 0 1 0-.813-.814L7.5 6.687L4.032 3.218a.575.575 0 0 0-.814.814L6.687 7.5l-3.469 3.468a.575.575 0 0 0 .814.814L7.5 8.313l3.469 3.469a.575.575 0 0 0 .813-.814L8.313 7.5z"
            clip-rule="evenodd"
          />
        </svg>
        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          height="100%"
          viewBox="0 0 16 16"
        >
          <path
            fill="currentColor"
            d="M7.75 2a.75.75 0 0 1 .75.75V7h4.25a.75.75 0 0 1 0 1.5H8.5v4.25a.75.75 0 0 1-1.5 0V8.5H2.75a.75.75 0 0 1 0-1.5H7V2.75A.75.75 0 0 1 7.75 2"
          />
        </svg>
      </button>
    </li>
  </ul>
</template>

<style scoped></style>
