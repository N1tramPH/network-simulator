<!-- eslint-disable no-unused-vars -->
<script setup>
import { ref } from "vue";
import AdapterPorts from "./AdapterPorts.vue";

const props = defineProps({
  adapters: {
    type: Array,
    required: true,
  },
});

const showPorts = ref(props.adapters.map((_) => false));
</script>

<template>
  <ul class="adapter-list">
    <li
      v-for="(a, idx) in adapters"
      :key="idx"
      :title="`Interface: ${a.name}`"
      class="relative p-0 group rounded list-none"
      :class="{
        'opacity-0 hover:opacity-100': !a.ipAddress,
      }"
    >
      <span
        v-if="!showPorts[idx] && a.ipAddress"
        @click="showPorts[idx] = true"
        class="bg-board dark:text-stone-200 text-[.95rem]"
      >
        {{ `${a.ipAddress ? a.ipAddress.toString(true) : "Connect"}` }}
      </span>

      <AdapterPorts v-else :adapter="a" />

      <div
        v-if="a.ipAddress"
        @click="showPorts[idx] = !showPorts[idx]"
        class="absolute icon w-5 left-full invisible group-hover:visible pl-1.5"
      >
        <div class="icon w-5">
          <button v-if="showPorts[idx]" title="Show IP address">
            <svg
              title="Back"
              xmlns="http://www.w3.org/2000/svg"
              width="100%"
              height="100%"
              viewBox="0 0 48 48"
            >
              <path
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="4"
                d="M43 11L16.875 37L5 25.182"
              />
            </svg>
          </button>

          <button v-else title="Show physical ports">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="100%"
              height="100%"
              viewBox="0 0 48 48"
            >
              <g
                fill="none"
                stroke="currentColor"
                stroke-linejoin="round"
                stroke-width="4"
              >
                <path stroke-linecap="round" d="m39 34l5 5l-5 5" />
                <path
                  fill="currentColor"
                  d="M8 12a4 4 0 1 0 0-8a4 4 0 0 0 0 8Z"
                />
                <path
                  stroke-linecap="round"
                  d="M12 8h8a4 4 0 0 1 4 4v23a4 4 0 0 0 4 4h16"
                />
              </g>
            </svg>
          </button>
        </div>
      </div>
    </li>
  </ul>
</template>

<style scoped>
.adapter-list {
  text-align: center;
  font-size: 1.15rem;
}

.adapter-list li {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  width: min(auto, 100%);
}
</style>
