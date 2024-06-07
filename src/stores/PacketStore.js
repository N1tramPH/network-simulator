import { defineStore } from "pinia";
import { computed, nextTick, reactive } from "vue";

import Packet from "../network/Packet";
import LinkFrame from "../network/stack/linkLayer/LinkFrame";

/**
 * Stores the Packet related state
 */
export const usePacketStore = defineStore("packetStore", () => {
  const state = reactive({
    activePackets: [], // Currently visualized packets
    viewedPacket: null, // Active in sense of visualization (view etc.)
    // packetFilters: {},
  });

  // Packet filter implementation does not make a lot of sense yet (Not that many types of packets to filter)
  // Object.keys(pt).forEach((key) => (state.packetFilters[key] = true));
  // const packetFilters = computed(() => state.packetFilters);

  const activePackets = computed(() => state.activePackets);
  const viewedPacket = computed(() => state.viewedPacket);

  /**
   * Adds a new instance of a Packet to the packets array.
   * All these packet get rendered on the board.
   * Wraps the data in a special object for animation purposes.
   *
   */
  function add(packet) {
    if (packet instanceof Packet) {
      state.activePackets.push(packet);
      return packet;
    }

    if (packet instanceof LinkFrame) {
      packet = new Packet(packet);
      state.activePackets.push(packet);
      return packet;
    }
    throw new Error("Packet must be an instance of Linkframe/Packet!");
  }

  /**
   * Flattens a given packet and loads all its packets to the store.
   * Loaded packets are rendered on the board.
   * This function is async as it deals with an async Vue.js rendering system.
   * @param {Packet} packet A root packet which is to be loaded along with its children
   */
  async function load(packet) {
    if (!packet) throw new Error("No packet timeline with given label exists!");

    state.activePackets = packet.flatten();

    await nextTick();
    return state.activePackets;
  }

  /**
   * Sets a packet that's being inspected
   * @param {Packet} packet A packet to be viewed
   */
  function viewPacket(packet) {
    if (packet instanceof Packet) {
      state.viewedPacket = packet;
    } else {
      throw new Error("Packet must be an instace of Linkframe!");
    }
  }

  function clear() {
    state.activePackets.length = 0;
  }

  function addFilter(type) {
    state.packetFilters[type] = true;
  }

  function removeFilter(type) {
    state.packetFilters[type] = false;
  }

  function toggleFilter(type) {
    state.packetFilters[type] = !state.packetFilters[type];
  }

  return {
    activePackets,
    viewedPacket,
    // packetFilters,

    load,
    add,
    addFilter,
    removeFilter,
    toggleFilter,
    viewPacket,
    clear,
  };
});
