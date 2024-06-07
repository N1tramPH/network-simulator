<script setup>
import { ref, watchEffect } from "vue";
import PhysicalLink from "../../network/stack/physicalLayer/PhysicalLink";

const emit = defineEmits(["remove-link"]);
const props = defineProps({
  link: {
    type: [PhysicalLink, Object],
    required: true,
  },
  width: {
    type: String,
    default: "3px",
  },
  color: {
    type: String,
    default: "#000",
  },
});

// Adapters of the edge
const a1 = props.link.adapter1;
const a2 = props.link.adapter2;

// Extract the devices on which the adapters are installed
const e1 = a1.mountOn;
const e2 = a2.mountOn;

const styles = ref({
  transform: "",
  width: "0px",
});

// Calculates and updates the positions, angle of the edge
function updateLine() {
  const angle = Math.atan2(e2.y - e1.y, e2.x - e1.x);
  const dist = Math.sqrt((e2.x - e1.x) ** 2 + (e2.y - e1.y) ** 2);

  // additional x offset required when the line is rotated
  const temp = (dist - Math.abs(e1.x - e2.x)) / 2;

  const xOffset = Math.min(e1.x, e2.x) - temp;
  const yOffset = (e1.y + e2.y) / 2;

  styles.value.transform = `translate(${xOffset}px, ${yOffset}px) rotate(${angle}rad)`;
  styles.value.width = `${dist}px`;
}

// Whenever a change occurs in reactive object within watchEffect, line style props are updated
watchEffect(() => updateLine());
</script>

<template>
  <!-- Using html element gives a greater control over it than svg -->

  <div>
    <div
      ref="line"
      class="line bg-black dark:bg-slate-300 cursor-not-allowed"
      :class="{ 'disabled-lg': !link.isTransferable() }"
      :title="link"
      :style="styles"
      @click="emit('remove-link', link)"
    ></div>
  </div>
</template>

<style scoped>
.line {
  @apply absolute hover:opacity-65 cursor-context-menu;
  height: v-bind(width);
}
</style>
