<script setup>
import { onMounted } from "vue";
import { storeToRefs } from "pinia";

import { useSimulationStore } from "../../stores/SimulationStore";
import ProgressBar from "./ProgressBar.vue";

const animation = useSimulationStore();
const { animationSpeed } = storeToRefs(useSimulationStore());

const speedValues = [
  { label: "0.5x", value: 0.5 },
  { label: "1x", value: 1 },
  { label: "1.25x", value: 1.25 },
  { label: "1.5x", value: 1.5 },
  { label: "2x", value: 2 },
];

onMounted(() => {
  // Controlling pauses using space
  window.addEventListener("keydown", (e) => {
    if (e.key === " ") animation.togglePlay();
  });
});
</script>

<template>
  <div
    class="player box absolute mx-auto w-[17rem] rounded pt-1 pb-3 px-4 bottom-4 left-1/2 transform -translate-x-1/2"
    @keydown="handleKeyDown"
    v-show="animation.showControl"
  >
    <div class="items flex justify-around mt-1 pb-3">
      <div
        class="item item-sm icon w-[1.15rem]"
        @click="animation.repeat = !animation.repeat"
      >
        <svg
          v-if="animation.repeat"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
        >
          <path
            fill="none"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 12V9a3 3 0 0 1 3-3h13m-3-3l3 3l-3 3m3 3v3a3 3 0 0 1-3 3H4m3 3l-3-3l3-3"
          />
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path
            fill="none"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 12V9a3 3 0 0 1 2.08-2.856M10 6h10m-3-3l3 3l-3 3m3 3v3a3 3 0 0 1-.133.886m-1.99 1.984A3 3 0 0 1 17 18H4m3 3l-3-3l3-3M3 3l18 18"
          />
        </svg>
      </div>

      <div class="item" @click="animation.previous">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <g
            fill="none"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
          >
            <path d="M0 0h24v24H0z" />
            <path
              fill="currentColor"
              d="m19.496 4.136l-12 7a1 1 0 0 0 0 1.728l12 7A1 1 0 0 0 21 19V5a1 1 0 0 0-1.504-.864M4 4a1 1 0 0 1 .993.883L5 5v14a1 1 0 0 1-1.993.117L3 19V5a1 1 0 0 1 1-1"
            />
          </g>
        </svg>
      </div>

      <div class="item icon" @click="animation.togglePlay()">
        <svg
          v-if="animation.paused"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
        >
          <g
            fill="none"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
          >
            <path d="M0 0h24v24H0z" />
            <path
              fill="currentColor"
              d="M6 4v16a1 1 0 0 0 1.524.852l13-8a1 1 0 0 0 0-1.704l-13-8A1 1 0 0 0 6 4"
            />
          </g>
        </svg>
        <svg
          v-else
          class="text-white"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
        >
          <g
            fill="none"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
          >
            <path d="M0 0h24v24H0z" />
            <path
              fill="currentColor"
              d="M17 4H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3"
            />
          </g>
        </svg>
      </div>

      <div class="item icon" @click="animation.next">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <g
            fill="none"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
          >
            <path d="M0 0h24v24H0z" />
            <path
              fill="currentColor"
              d="M3 5v14a1 1 0 0 0 1.504.864l12-7a1 1 0 0 0 0-1.728l-12-7A1 1 0 0 0 3 5m17-1a1 1 0 0 1 .993.883L21 5v14a1 1 0 0 1-1.993.117L19 19V5a1 1 0 0 1 1-1"
            />
          </g>
        </svg>
      </div>

      <div class="item dropdown dropdown-top">
        <div
          tabindex="0"
          role="button"
          class="mt-0.5 text-[0.85rem] font-medium text-white"
        >
          {{ animationSpeed }}x
        </div>
        <ul
          tabindex="0"
          class="dropdown-content menu p-2 shadow bg-gray-800 rounded w-24"
        >
          <li
            v-for="speed in speedValues"
            :key="speed.label"
            @click="animationSpeed = speed.value"
            class="hover:bg-gray-600 p-1 cursor-pointer"
          >
            {{ speed.label }}
          </li>
        </ul>
      </div>
    </div>

    <ProgressBar></ProgressBar>
  </div>
</template>

<style scoped>
.player {
  user-select: none; /* Standard property */
  -webkit-user-select: none; /* Safari and Chrome */
  -moz-user-select: none; /* Firefox */
  -ms-user-select: none; /* Internet Explorer/Edge */
}

.item {
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;

  color: white;

  cursor: pointer;
}

.item:hover {
  filter: opacity(0.7);
}

.item svg {
  width: 1.15rem;
}

.item-sm svg {
  width: 1.2rem;
}
</style>
