<script setup>
import { ref, computed } from "vue";
import { usePacketStore } from "../../../../stores/PacketStore";

import PacketItem from "./PacketItem.vue";
import Dropdown from "../../../menu/Dropdown.vue";
import SectionNavigation from "../../../menu/SectionNavigation.vue";

// There can only be one display Packet at once, thus the one stored in the PacketStore

// Extract all the data units within the viewed Packet
let dataUnits = [...usePacketStore().viewedPacket.getUnits()];

// Index of a currently viewed DataUnit within a packet (typically a LinkFrame)
const activeIdx = ref(0);

// A computed DataUnit instance computed based on the activeIndex and dataUnits (ensures a rerendering when activeIndex changes)
const activeUnit = computed(() => dataUnits[activeIdx.value]);

// A structure of a current DataUnit that contains needed information for correct rendering
const structItems = computed(() => activeUnit.value.struct.items);

// DataUnits headers - Link Frame, ARP, IP packet etc.
const sections = dataUnits.map((unit) => {
  return {
    title: unit.struct.name,
  };
});

// Arguments for the custom toString with params - radix, delimiter, padStart, padChar
function reprOption(label, repr) {
  this.label = label; // An option label
  this.repr = repr; // A function that converts a byte array into a readable string
  this.value = this; // A self reference of the option necessary for a Dropdown component
}

const reprOptions = [
  // 1-4b values print as a single integer, otherwise as individual bytes in a certain base
  new reprOption("Default", (value) =>
    value.byteLength > 4 ? value.toString(10, " ", 0) : value.decimal
  ),
  new reprOption("Decimal", (value) => value.toString(10, " ", 0)),
  new reprOption("Binary", (value) => value.toString(2, " ", 8, "0")),
  new reprOption("Hexadecimal", (value) => value.toString(16, " ", 2, "0")),
];

// Current radix in which packet items are printed
const currentRepr = ref(reprOptions[0]);

/**
 * Returns a readable string using a current reprOption based on an item values
 * Also deals with items that are of some special types (data, optional data)
 */
let repr = (item) => {
  const key = item.propName;
  const value = activeUnit.value[key];

  // If the item has its own repr function defined
  if (item.reprFun && currentRepr.value.label === "Default")
    return item.reprFun(value);

  // As for the data, print out the size in bytes (if there's any)
  if (item.special === "data") {
    return activeUnit.value.data ? activeUnit.value.dataBytes : 0;
  }

  // Or use the repr of the current reprOption
  return value ? currentRepr.value.repr(value) : "";
};

/**
 * Computes a width of each item bits proportionate to bit_width in %
 *  */
function itemWidth(item) {
  return `${(item.bitCount / activeUnit.value.struct.bitWidth) * 100}%`;
}

/**
 * Decapsulates a current DataUnit (decreases an activeIdx of a currently display DataUnit)
 */
function decapsulate() {
  if (activeIdx.value < dataUnits.length - 1) activeIdx.value++;
}

/**
 * A callback function for a DataUnit navigation, sets the activeIdx
 * so a reactive system will update a currently displayed DataUnit accordingly
 * @param {Number} idx
 */
function onSectionChange(idx) {
  activeIdx.value = idx;
}
</script>

<template>
  <SectionNavigation
    :sections="sections"
    :activeIdx="activeIdx"
    @change-section="onSectionChange"
    class="mb-4"
  />

  <section class="w-[40rem] h-full">
    <Dropdown v-model="currentRepr" :items="reprOptions" class="mb-2" />
    <div class="flex flex-wrap overflow-y-auto">
      <PacketItem
        v-for="(item, idx) in structItems"
        :key="idx"
        :label="item.title"
        :data="repr(item)"
        :special="item.special"
        :width="itemWidth(item)"
        @decapsulate="decapsulate"
      />
    </div>
  </section>
</template>

<style scoped></style>
