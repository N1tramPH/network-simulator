<script setup>
import { onMounted, ref } from "vue";
import { storeToRefs } from "pinia";
import { clamp } from "lodash-es";

import { useSimulationStore } from "../../stores/SimulationStore";

const store = useSimulationStore();
const { progress } = storeToRefs(store);

const slider = ref(null); // A parent slider element
let isDragging = false;
let wasPlaying = false;

const startDrag = () => {
  isDragging = true;
  wasPlaying = !store.paused;
  store.pause();
};

const getEventValue = (e) => {
  const rect = slider.value.getBoundingClientRect();
  const xOffset = e.clientX - rect.left;
  return clamp(xOffset / rect.width, 0, 1);
};

const handleDrag = (e) => {
  if (isDragging) {
    progress.value = getEventValue(e);
  }
};

const handleClick = (e) => {
  progress.value = getEventValue(e);
};

const stopDrag = () => {
  isDragging = false;

  // Prevent from playing if wasn't playing before
  if (wasPlaying) {
    store.play();
    wasPlaying = false;
  }
};

onMounted(() => {
  // If not set, moving away from a dragger will not stop dragging
  window.addEventListener("mousemove", handleDrag);
  window.addEventListener("mouseup", stopDrag);
});
</script>

<template>
  <div
    class="relative w-full h-1.5 bg-gray-50 rounded-sm"
    @mousedown="startDrag"
    @mousemove="handleDrag"
    @mouseup="stopDrag"
    @click="handleClick"
    ref="slider"
    role="progressbar"
    aria-label="A progress of an animation"
  >
    <div
      class="bg-slate-500 h-full rounded-sm"
      :style="{ width: `${progress * 100}%` }"
    ></div>
    <div
      class="absolute w-3.5 h-3.5 bg-slate-500 rounded-full -translate-x-1/2 top-1/2 -translate-y-1/2 cursor-grab"
      :style="{ left: `${progress * 100}%` }"
      @mousedown.prevent
    ></div>
  </div>
</template>

<style scoped></style>
