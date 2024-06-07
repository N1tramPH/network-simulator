import { ref, computed, markRaw } from "vue";
import { defineStore } from "pinia";

import { useDeviceStore } from "./DeviceStore.js";
import { useDialogStore } from "./DialogStore.js";
import DeviceAdd from "../components/sidebar/sections/DeviceAdd/DeviceAdd.vue";
import DeviceList from "../components/sidebar/sections/DeviceList.vue";

/**
 * Stores a state of a sidebar...
 * Crucial for changing its state (opening certain sections) from anywhere of the tree component
 */
export const useSidebarStore = defineStore("sidebarStore", () => {
  /**
   * Contents of the upper sidebar, each content consisting of:
   * - Title
   * - A component content to rendered on the SidebarSection.vue component which opens on clicking
   * - Icon to be rendered on the sidebar (a string defined in icon.js)
   */
  const upperBar = [
    {
      title: "Add device",
      content: markRaw(DeviceAdd),
      icon: "deviceAdd",
    },
    {
      title: "Manage device",
      content: markRaw(DeviceList),
      icon: "deviceSettings",
    },
  ];

  /**
   * Contents of the lower sidebar, each content consisting of:
   * - Title
   * - Callback to be called when clicked on (likely an opening callback)
   * - Icon to be rendered on the sidebar (a string defined in icon.js)
   */
  const lowerBar = [
    {
      title: "Export",
      openCallback: useDialogStore().openExportBar,
      icon: "export",
    },
    {
      title: "Import",
      openCallback: useDialogStore().openImportBar,
      icon: "import",
    },
    {
      title: "Settings",
      openCallback: useDialogStore().openSettings,
      icon: "settings",
    },
    {
      title: "About",
      openCallback: useDialogStore().openAbout,
      icon: "info",
    },
  ];

  /******* States *******/
  // Indices of currently active sections on the sidebar
  const activeUpper = ref(-1);
  const activeLower = ref(-1);

  /**
   * An open upper section's content (component)
   * If the activeUpper is uqual to -1, returns null (closed)
   */
  const activeSection = computed(() => {
    if (activeUpper.value == -1) return null;
    return upperBar[activeUpper.value];
  });

  /******* Actions  *******/
  function closeUpper() {
    activeUpper.value = -1;

    // Also reset the activeDevice, so the same device doesn't appear again
    useDeviceStore().setActiveDevice(null);
  }

  const toggleUpper = (index) => {
    if (index != activeUpper.value) {
      activeUpper.value = index;
    } else {
      closeUpper();
    }
  };

  const toggleLower = (index) => {
    if (index != activeLower.value) {
      activeLower.value = index;
    } else {
      activeLower.value = -1;
    }
  };

  function openAddDevice() {
    toggleUpper(0);
  }
  function openManagement() {
    toggleUpper(1);
  }

  return {
    upperBar,
    lowerBar,
    activeUpper,
    activeLower,
    activeSection,

    toggleUpper,
    toggleLower,
    closeUpper,
    openManagement,
    openAddDevice,
  };
});
