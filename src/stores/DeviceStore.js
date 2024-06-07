import { ref, reactive, computed, watch, nextTick } from "vue";
import { defineStore } from "pinia";
import { nanoid } from "nanoid";

import { useBoardStore as board } from "./BoardStore";
import { addLog } from "../utils/utils";

// import Device from '../network/devices/Device';
import Computer from "../network/devices/Computer";
import Router from "../network/devices/Router";
import Switch from "../network/devices/Switch";
import Device from "../network/devices/Device";
import Hub from "../network/devices/Hub";

import PhysicalLink from "../network/stack/physicalLayer/PhysicalLink";

// Maps the name of the Device to a more readable shortcut
const prefixMap = new Map([
  ["Computer", "PC"],
  ["Router", "R"],
  ["Switch", "S"],
  ["Hub", "H"],
]);

// Maps the device type strings with the constructors
const constructors = new Map([
  ["Computer", Computer],
  ["Router", Router],
  ["Switch", Switch],
  ["Hub", Hub],
]);

/**
 *  Lists available device types
 */
const types = [
  {
    label: "Computer",
    value: Computer,
    icon: "computer",
  },
  {
    label: "Router",
    value: Router,
    icon: "router",
  },
  {
    label: "Switch",
    value: Switch,
    icon: "switch",
  },
  {
    label: "Hub",
    value: Hub,
    icon: "switch",
  },
];

export const useDeviceStore = defineStore("deviceStore", () => {
  /**
   *  Specifies a type of a currently added device
   *  */
  const currentType = ref(Computer);
  watch(currentType, () => initDevice());

  // Current state of added devices, links between them
  const state = reactive({
    devices: new Map(),
    activeDevice: null,
    addedDevice: null,
    links: new Map(),
    linking: null,
  });

  // Mapping of the interfaces - MAC:interface
  // Used mainly for importing physical links that connect these interfaces
  const ifaceMap = computed(() => {
    const map = new Map();

    devices.value.forEach((device) => {
      device.networkAdapters.forEach((a) => {
        map.set(a.macAddress.toString(), a);
      });
    });

    return map;
  });

  /**
   * Creates a new instance of a device (exact type is given by currentType constructor)
   */
  function initDevice() {
    const constructor = currentType.value;
    const name = `${prefixMap.get(constructor.name)}-${nanoid(5)}`;

    const addedDevice = new constructor(name);
    state.addedDevice = addedDevice;

    // Move to a default position
    addedDevice.move(...Object.values(board().getCenter()));

    // Set a default network interface
    if (constructor === Computer || constructor === Router) {
      addedDevice.addAdapter("enp0s0", null, "192.168.1.1/24");
    } else {
      addedDevice.addAdapter("enp0s0", null);
    }

    return addedDevice;
  }

  function addDevice() {
    state.devices.set(state.addedDevice.id, state.addedDevice);
    initDevice();
  }

  function removeDevice(device) {
    // Destroy all link connected to a device first
    device.networkAdapters.forEach((adapter) => {
      adapter.ports.forEach((port) => {
        const link = port.physicalLink;
        if (link) removeLink(link);
      });
    });

    state.devices.delete(device.id);
  }

  /**
   * Destroys a link with a given ID
   * @param {PhysicalLink} linkId
   */
  function removeLink(link) {
    // Remove a link from mapping
    state.links.delete(link.id);
    if (link) link.destroy();
  }

  /**
   * Creates or initiates a physical link between two network adapters.
   * When one device initiates a link connection, linkInit is set for
   * a linkage with another device adapter.
   * @param {NetworkAdapter} adapter Network adapter to be linked
   */
  function linkDevices(port) {
    if (!port.isFree()) throw new Error("A port must be free!");

    if (!state.linking) {
      state.linking = port;
      const dev = port.adapter.mountOn.name;
      return addLog(
        `${dev} initiated physical linking... (right click to cancel)`
      );
    }
    const dev1 = port.adapter.mountOn.name;
    const dev2 = state.linking.adapter.mountOn.name;
    addLog(`Physical link between ${dev1} and ${dev2} established.`, 5);

    const link = new PhysicalLink(state.linking, port);
    state.links.set(link.id, link);
    state.linking = null;
  }

  /**
   * Cancels out link initiation
   */
  function cancelLinking() {
    if (state.linking) {
      addLog(`Connection initialization cancelled.`, 5);
      state.linking = null;
    }
  }

  /******** State *********/

  /**
   * All the network devices on a board
   */
  const devices = computed(() => {
    return state.devices;
  });

  /**
   * All the links on a board
   */
  const links = computed(() => state.links);
  const linking = computed(() => state.linking);

  /**
   * A device with a special purpose, e.g opening its routing/arp table
   */
  const activeDevice = computed({
    get() {
      return state.activeDevice;
    },
    set(device) {
      if (!(device instanceof Device)) {
        throw new Error(
          "The set active device must be the instance of Device!"
        );
      }
      state.activeDevice = device;
    },
  });

  /**
   * A current instance of an added device
   */
  const addedDevice = computed(() => state.addedDevice);

  /**
   * Sets a device as an active one
   * @param {Device} device
   */
  function setActiveDevice(device) {
    if (device && !(device instanceof Device))
      throw new Error("An active device must be of type Device!");

    state.activeDevice = device;
  }

  /**
   * Removes all the devices including links
   */
  function clear() {
    clearDevices();
  }

  /**
   * Removes all the devices including links
   */
  function clearDevices() {
    clearLinks();
    state.devices.clear(); // Clear the mapping
  }

  /**
   * Removes all the links
   */
  function clearLinks() {
    state.links.clear(); // Clear the mapping
  }

  /****** Export and Import *******/

  /**
   * @returns An an array of exported device data
   */
  function exportDevices() {
    // Unfortunately cannot use .map() as the devices state is stored in a Map
    const devices = [];
    state.devices.forEach((device) => devices.push(device.exportData()));
    return devices;
  }

  /**
   * @returns An array of exported links data
   */
  function exportLinks() {
    const exported = [];

    links.value.forEach((l) => {
      exported.push({
        id: l.id,
        adapter1: {
          macAddress: l.adapter1.macAddress.toString(),
          portId: l.end1.id,
        },
        adapter2: {
          macAddress: l.adapter2.macAddress.toString(),
          portId: l.end2.id,
        },
      });
    });

    return exported;
  }

  async function importDevices(devices) {
    clearDevices();
    await nextTick(); // Must wait for device rerendering before import

    devices.forEach((device) => {
      const imported = constructors.get(device.type).fromExport(device);
      state.devices.set(imported.id, imported);
    });
  }

  async function importLinks(links = []) {
    clearLinks();
    await nextTick(); // Must wait before device rerendering occur before import
    const mapping = ifaceMap.value;

    links.forEach((l) => {
      const a1 = mapping.get(l.adapter1.macAddress);
      const a2 = mapping.get(l.adapter2.macAddress);

      const port1 = a1.ports.get(l.adapter1.portId);
      const port2 = a2.ports.get(l.adapter2.portId);

      const link = a1.connectAdapter(a2, port1, port2);
      link.id = l.id; // Keep the same link id

      state.links.set(link.id, link); // Push to the storage
    });
  }

  return {
    devices,
    types,
    links,
    currentType,
    activeDevice,
    addedDevice,

    initDevice,
    addDevice,
    removeDevice,
    setActiveDevice,

    clear,
    exportDevices,
    importDevices,
    exportLinks,
    importLinks,

    linking,
    removeLink,
    linkDevices,
    cancelLinking,
  };
});
