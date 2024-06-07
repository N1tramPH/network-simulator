import gsap from "gsap";
import { defineStore } from "pinia";
import { computed, reactive, toRaw, watch } from "vue";
import { clamp, uniq } from "lodash-es";

import { usePacketStore } from "./PacketStore";
import { animate } from "../animations/animations";
import Packet from "../network/Packet";

const _getDefaultSettings = () => {
  return {
    timeline: {
      timeScale: 1,
    },
    transportLayer: {
      immediateTcpClose: true,
    },
    ipLayer: {
      timeToLive: 64,
    },
    corrupt: false,
    showReports: true,
    autoPlay: true,
  };
};

// There's only one timeline that gets reanimated when's needed
let timeline = gsap.timeline({
  paused: true,
  defaults: {
    paused: true,
  },
});

/**
 * Stores all the state related to simulations, animations.
 * Also provides needed functions for managing the main timeline.
 */
export const useSimulationStore = defineStore("simulationStore", () => {
  const saved = _fromLocalStorage(); // Check for the existing settings

  const state = reactive({
    animation: {
      packet: null,
      progress: 0, // As a factor
      paused: timeline.paused(),
      repeat: false,

      labels: [],
      labelIdx: 0,
    },
    controller: {
      show: true,
    },
    settings: saved ? saved : _getDefaultSettings(),
  });

  _configTimeline(); // Configure the timeline based on settings

  /******* Provided state ********/
  const progress = computed({
    get() {
      return state.animation.progress;
    },
    set(value) {
      value = clamp(value, 0, 1);
      state.animation.progress = value;
      timeline.progress(value);
    },
  });

  const paused = computed({
    get() {
      return state.animation.paused;
    },
    set(value) {
      timeline.paused(value);
      state.animation.paused = value;
    },
  });

  const repeat = computed({
    get() {
      return state.animation.repeat;
    },
    set(value) {
      state.animation.repeat = value;
      value ? timeline.repeat(-1) : timeline.repeat(0);
    },
  });

  const settings = computed(() => state.settings);
  const showControl = computed(() => state.controller.show);
  const activeLabel = computed(
    () => state.animation.labels[state.animation.labelIdx]
  );

  const animationSpeed = computed({
    get() {
      return state.settings.timeline.timeScale;
    },
    set(value) {
      state.settings.timeline.timeScale = value;
      timeline.timeScale(value);
    },
  });

  // On timeline settings change, update the timeline configuration
  watch(state.settings, () => {
    _toLocalStorage();
    _configTimeline();
  });

  // Update the progress property on animation
  timeline.eventCallback("onUpdate", () => {
    state.animation.progress = timeline.progress();
  });

  // Set the paused property when timeline play head reaches the end
  timeline.eventCallback("onComplete", () => {
    state.animation.paused = true;
  });

  /******* Simulation settings attributes *******/
  const animateOnTransmit = computed({
    get() {
      return state.settings.autoPlay;
    },
    set(value) {
      if (!value) reset(); // Reset any previous animations if false
      state.settings.autoPlay = value;
    },
  });

  const showReports = computed({
    get() {
      return state.settings.showReports;
    },
    set(value) {
      state.settings.showReports = value;
      reanimate();
    },
  });

  const animateCorrupt = computed({
    get() {
      return state.settings.corrupt;
    },
    set(value) {
      state.settings.corrupt = value;
    },
  });

  const timeToLive = computed({
    get() {
      return state.settings.ipLayer.timeToLive;
    },
    set(value) {
      if (!(typeof value !== "number")) throw new Error("Invalid TTL input!");
      if (value < 0)
        throw new Error("The TTL number must be a positive number!");

      state.settings.ipLayer.timeToLive = value;
    },
  });

  const immediateTcpClose = computed({
    get() {
      return state.settings.transportLayer.immediateTcpClose;
    },
    set(value) {
      state.settings.transportLayer.immediateTcpClose = value;
    },
  });

  /******* Animation controllers *******/
  function pause() {
    paused.value = true;
  }

  function play() {
    paused.value = false;
  }

  function togglePlay() {
    paused.value = !paused.value;
  }

  function next() {
    // A last label is being animated, move the play head to the end of timeline
    if (state.animation.labelIdx >= state.animation.labels.length) {
      seek(timeline.duration());
    }
    // Or move to the next label (incrementing label index)
    else {
      state.animation.labelIdx++;
      timeline.seek(activeLabel.value);
    }

    progress.value = timeline.progress(); // Update the progress
  }

  function previous() {
    if (state.animation.labelIdx <= 0) {
      seek(0);
    } else {
      state.animation.labelIdx--;
      timeline.seek(activeLabel.value);
    }

    progress.value = timeline.progress(); // Update the progress
  }

  function seek(time) {
    timeline.seek(time);
  }

  /**
   * Changes the speed of the whole animation
   * @param {Number} factor A factor by which the animation is to be changed
   */
  function scaleDuration(factor) {
    timeline.timeScale(factor);
  }

  /**
   * Empties a timeline and sets a current time to 0
   */
  function reset() {
    timeline.seek(0);
    timeline.clear();
  }

  /******** Animation functions ********/

  /**
   * Computes a timeline that animates a given packet.
   * The animation is played automatically.
   * @param {Packet} packet
   */
  async function animatePacket(packet = null) {
    if (!packet || !(packet instanceof Packet))
      throw new Error("Invalid animation data!");

    packet = !packet ? packet.animation.packet : packet;

    // Clear out a main timeline of any previous tweens
    reset();

    // Load & render needed packets
    const packets = await usePacketStore().load(packet);

    // Extract packet labels for stepping (excluding before, after events)
    state.animation.labels = uniq(packets.map((p) => p.label));
    state.animation.packet = packet; // Store the animated packet
    animate(packets, timeline);

    // Settings callbacks at certain timeline points defined by labels
    // --> Storing the index of a current label for further use
    state.animation.labels.forEach((label, idx) => {
      timeline.call(() => (state.animation.labelIdx = idx), [], label);
    });

    play();
  }

  /**
   * Reanimates a current packet
   */
  async function reanimate() {
    if (state.animation.packet) {
      const wasPaused = paused.value;
      const time = timeline.time(); // Save the previous time
      await animatePacket(state.animation.packet); // Recalculate

      // Updating time must be delayed as animation is delayed too
      timeline.time(time);
      paused.value = wasPaused;
    }
  }

  /******** Managing SimulationStore settings ********/

  /**
   * Configures a timeline instance based on the settings within a store
   */
  function _configTimeline() {
    const tl = state.settings.timeline;
    if (tl) {
      timeline.timeScale(tl.timeScale);
    }
  }

  /**
   * Stores the settings to the localStorage
   */
  function _toLocalStorage() {
    const raw = toRaw(state.settings);
    delete raw.value;
    localStorage.setItem("simulation", JSON.stringify(raw));
  }

  /**
   * @returns Retrieved store settings from a localStorage
   */
  function _fromLocalStorage() {
    return JSON.parse(localStorage.getItem("simulation"));
  }

  /**
   * Imports settings, though does not check for correctness
   */
  function importSettings(json) {
    state.settings.value = json;
  }

  /**
   * @returns A JSON that represents the settings of SimulationStore
   */
  function exportSettings() {
    // Remove a property from a reactive proxy
    const raw = toRaw(state.settings);
    delete raw.value;

    return raw;
  }

  /**
   * Resets the timeline and removes an animated packet
   */
  function clear() {
    reset();
    state.animation.packet = null;
  }

  return {
    paused,
    progress,
    repeat,
    showControl,
    activeLabel,
    settings,

    timeToLive,
    immediateTcpClose,
    showReports,
    animationSpeed,
    animateOnTransmit,
    animateCorrupt,

    play,
    pause,
    togglePlay,
    next,
    previous,
    seek,
    reset,
    scaleDuration,
    animatePacket,
    reanimate,

    importSettings,
    exportSettings,
    clear,
  };
});

export { timeline };
