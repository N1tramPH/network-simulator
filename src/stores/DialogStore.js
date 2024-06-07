import { defineStore } from "pinia";
import { reactive, computed, markRaw } from "vue";

import { toCapitalCase } from "../utils/utils";

// Contents
import CAMTable from "../components/dialog/contents/tables/CAMTable.vue";
import ArpTable from "../components/dialog/contents/tables/ArpTable.vue";
import RoutingTable from "../components/dialog/contents/tables/RoutingTable.vue";
import SocketsTable from "../components/dialog/contents/tables/SocketsTable.vue";

import PacketView from "../components/dialog/contents/packetView/PacketView.vue";
import ImportBar from "../components/dialog/contents/ImportBar.vue";
import ExportBar from "../components/dialog/contents/ExportBar.vue";
import About from "../components/dialog/contents/About.vue";
import GlobalSettings from "../components/dialog/contents/globalSettings/GlobalSettings.vue";

import General from "../components/dialog/contents/deviceSettings/sections/General.vue";
import Interfaces from "../components/dialog/contents/deviceSettings/sections/Interfaces.vue";
import Network from "../components/dialog/contents/deviceSettings/sections/Network.vue";

import TransmitSettings from "../components/transmission/TransmitSettings.vue";

const dialogs = [
  {
    title: "Device settings",
    width: "40rem",
    height: "31rem",
    sections: [
      {
        title: "General",
        content: markRaw(General),
      },
      {
        title: "Interfaces",
        content: markRaw(Interfaces),
      },
      {
        title: "Network",
        content: markRaw(Network),
      },
    ],
    sectionIdx: 0,
  },
  {
    title: "CAM table",
    content: markRaw(CAMTable),
  },
  {
    title: "ARP cache",
    content: markRaw(ArpTable),
  },
  {
    title: "Routing table",
    content: markRaw(RoutingTable),
  },
  {
    title: "Socket table",
    content: markRaw(SocketsTable),
  },
  {
    title: "Packet view",
    content: markRaw(PacketView),
  },
  {
    title: "Export bar",
    content: markRaw(ExportBar),
  },
  {
    title: "Import bar",
    content: markRaw(ImportBar),
  },
  {
    title: "About",
    content: markRaw(About),
    overlay: true,
  },
  {
    title: "Settings",
    content: markRaw(GlobalSettings),
    overlay: true,
  },
  {
    title: "Transmit Settings",
    content: markRaw(TransmitSettings),
    overlay: true,
  },
];

export const useDialogStore = defineStore("dialogStore", () => {
  const state = reactive({
    dialogStack: [],
    activeDialog: null,
    activeDevice: null, // Some dialog content is dependent on some device data
  });

  /**
   * Whether the dialog is to be displayed with a background overlay
   */
  const overlay = computed(() => {
    return state.activeDialog && state.activeDialog.overlay;
  });

  /**
   * A currently opened dialog
   */
  const activeDialog = computed(() => {
    if (!state.dialogStack.length) return null;

    return state.dialogStack[state.dialogStack.length - 1];
  });

  /**
   * There might be a need to reference a device in certain dialogs
   */
  const activeDevice = computed({
    get() {
      return state.activeDevice;
    },
    set(device) {
      state.activeDevice = device;
    },
  });

  /**
   * Closes a currently opened dialog
   *  */
  function close() {
    state.dialogStack.forEach((dialog) => {
      // When closing, set the initial section of every dialog to the first one
      if (dialog.sectionIdx) {
        dialog.sectionIdx = 0;
      }
    });
    state.dialogStack = [];
  }

  /**
   * @returns a back dialog if any is present in the dialog stack
   */
  function back() {
    const current = state.dialogStack.pop();
    if (current.sectionIdx) current.sectionIdx = 0;

    return current;
  }

  /**
   * @returns whether there's a back dialog present
   */
  function isBack() {
    return state.dialogStack.length > 1;
  }

  // Object of open callbacks for each dialog dialog
  const openDialogs = {};

  // Creating a open callbacks for each dialog
  dialogs.forEach((dialog) => {
    // A callback name is dialog name converted to camelCase
    const callbackName = "open" + toCapitalCase(dialog.title);
    openDialogs[callbackName] = (root = true, sectionIdx = 0) => {
      // Should the dialog be opened as a root (no back dialogs)?
      if (root) {
        state.dialogStack = [dialog];
      }
      // Add a new "layer" dialog
      else {
        state.dialogStack.push(dialog);
      }

      // If section index is specified within the opened dialog
      dialog.sectionIdx = sectionIdx;
    };
  });

  return {
    activeDialog,
    activeDevice,
    overlay,
    close,
    back,
    isBack,
    ...openDialogs,
  };
});
