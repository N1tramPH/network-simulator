<script setup>
/*

A custom Icon component that maps a given name
with an svg string that is then rendered using vue v-html directive.

Since v-html treats a string icon simply as a string, we cannot
modify the SVG's property like size, color etc. This component
wraps the v-html element inside a wrapper that will define the svg's size.
For that reason, all of the svg defined in icons.js have
width and height set to 100%.

There are some limitations when it comes to manipulation with
individual svg properties though.

A good use case is when a UI is dynamically rendered based some data 
and requires icons within it.

*/

import { onMounted, ref, watch } from "vue";
import { camelCase } from "lodash";

import { mapIcon } from "../../utils/icons";
import { useSettingsStore } from "../../stores/SettingsStore";

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    default: "black",
  },
  darkModeColor: {
    type: String,
    default: "white",
  },
  size: {
    type: String,
    default: "24px",
  },
});

const svg = ref(null);
let icon = null;

onMounted(() => {
  // Set the color
  icon = svg.value.children[0];
  icon.setAttribute("color", props.color);
});

const display = useSettingsStore().display;
watch(display, () => {
  // Change the color based on dark/light mode
  display.darkMode
    ? icon.setAttribute("color", props.darkModeColor)
    : icon.setAttribute("color", props.color);
});
</script>

<template>
  <div
    ref="svg"
    v-html="mapIcon(camelCase(name))"
    :style="{
      width: size,
      height: size,
    }"
  ></div>
</template>

<style scoped></style>
