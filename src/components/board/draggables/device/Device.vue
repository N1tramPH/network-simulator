<script setup>
import { onMounted, ref } from "vue";
import { Draggable } from "gsap/Draggable";
import { storeToRefs } from "pinia";
import gsap from "gsap";

import { useTransmitStore } from "../../../../stores/TransmitStore";
import { useSimulationStore } from "../../../../stores/SimulationStore";

import Computer from "../../../../network/devices/Computer";
import Router from "../../../../network/devices/Router";
import Switch from "../../../../network/devices/Switch";
import Hub from "../../../../network/devices/Hub";
import AdapterList from "./AdapterList.vue";
import DeviceMenu from "./DeviceMenu.vue";
import DeviceIcon from "./DeviceIcon.vue";

const emit = defineEmits(["open-settings", "remove-device"]);
const props = defineProps({
  device: {
    type: [Computer, Router, Switch, Hub],
    required: true,
  },
  size: {
    type: Number,
    default: 110,
  },
});

// Get the outer element's reference
const dragged = ref(null);

// Once it's been mounted, apply the draggable plugin on it
onMounted(() => {
  gsap.registerPlugin(Draggable);

  Draggable.create(dragged.value, {
    type: "x,y",
    onDrag: function () {
      // Update the xy values on drag
      props.device.setxy(this.endX, this.endY);
    },
    onDragEnd: function () {
      // To ensure that the animation isn't off (a method takes care of the reanimation if necessary)
      useSimulationStore().reanimate();
    },
  })[0];

  // Move the element representing a draggable object to its position
  gsap.fromTo(
    dragged.value,
    { x: window.innerWidth, y: 0 },
    { x: props.device.x, y: props.device.y }
  );
});

// Selecting a device for transmission
const { selectType } = storeToRefs(useTransmitStore());

// Showing a device menu on right click
const showMenu = ref(false);
const toggleMenu = () => (showMenu.value = !showMenu.value);

// A tooltip on hover
const tooltip = ref(`${props.device.type} - (${props.device.name})`);

// Adjusting cursor on selection
const cursor = ref("grab");

// On device selection -> change a tooltip and cursor indicating that
const onMouseOver = () => {
  if (selectType.value) {
    cursor.value = "crosshair";
    tooltip.value = `Click to select ${props.device.name} as ${selectType.value}`;
  }
};

// Otherwise...
const onMouseLeave = () => {
  cursor.value = "grab";
  tooltip.value = `${props.device.type} - (${props.device.name})`;
};
</script>

<template>
  <div
    class="node"
    ref="dragged"
    :class="{ 'hover:opacity-40': selectType }"
    :style="{ width: `${size}px` }"
    @click.right="toggleMenu"
    @click.left="useTransmitStore().applySelection(device)"
    @mouseover="onMouseOver"
    @mouseleave="onMouseLeave"
    :title="tooltip"
  >
    <DeviceMenu
      v-show="showMenu"
      :device="device"
      class="opacity-100 translate-x-1/3 translate-y-5"
      @close-panel="toggleMenu"
      @remove-device="emit('remove-device', device)"
      title
    />

    <!-- A report message container -->
    <div
      class="item hidden z-10 bottom-[185%] left-1/2 -translate-x-1/2 text-gray-900 dark:text-gray-300 w-max whitespace-pre-line text-center bg-board"
      :id="`report-${device.id}`"
    >
      Potato
    </div>

    <!-- Icon is centered in the x,y -->
    <!-- Title is positioned at the top of the icon and AdapterList at the bottom -->
    <div
      class="relative flex justify-center text-black text-sm"
      :class="{ 'disabled-lg': !device.powerOn }"
    >
      <div class="item font-semibold bottom-full dark:text-gray-200 bg-board">
        {{ device.name }}
      </div>

      <div class="icon-container"></div>
      <DeviceIcon class="icon w-8 h-8 bg-board" :type="device.type" />
      <AdapterList class="item top-full" :adapters="device.networkAdapters" />
    </div>
  </div>
</template>

<style scoped>
.item {
  @apply absolute rounded;
}

.node {
  position: absolute;
  /* Center the to the x,y */
  translate: -50% -50%;

  z-index: 5;
  cursor: v-bind(cursor) !important;
}
</style>
