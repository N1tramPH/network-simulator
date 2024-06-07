import { useAlertStore } from "../stores/AlertStore";
import { useDeviceStore } from "../stores/DeviceStore";
import { usePacketStore } from "../stores/PacketStore";
import { useSettingsStore } from "../stores/SettingsStore";
import { useSimulationStore } from "../stores/SimulationStore";
import { useTransmitStore } from "../stores/TransmitStore";

/* Definitions of getState and loadState serve for exporting/importing application data. */

// All exportables
const defaultItems = ["devices", "links", "settings"];

/**
 * Returns the exportable data specified by 'items' keys array
 * @param {*} items Keys array of the data specified to be imported "devices"/"links"/"settings"
 * @param {Boolean} toLocalStorage Whether the exported data should be set to LocalStorage
 * @returns exportable data specified by 'items' keys array
 */
export function getState(items = null, toLocalStorage = true) {
  const exportMap = new Map([
    ["devices", useDeviceStore().exportDevices],
    ["links", useDeviceStore().exportLinks],
    ["settings", useSettingsStore().exportSettings],
  ]);

  const state = {};
  items = items ? items : defaultItems;

  items.forEach((item) => {
    const cb = exportMap.get(item);
    if (cb) {
      state[item] = cb();
    }
  });

  if (toLocalStorage) {
    localStorage.setItem("state", JSON.stringify(state));
  }
  return state;
}

/**
 * Imports the a given settings data, if none is given,
 * one in the localStorage is loaded.
 * @param {Array} items Keys array of the data specified to be imported "devices"/"links"/"settings"
 * @param {Object} source Object with settings data, otherwise state from the localStorage is used
 */
export async function loadState(items = null, source = null) {
  const importMap = new Map([
    ["devices", useDeviceStore().importDevices],
    ["links", useDeviceStore().importLinks],
    ["settings", useSettingsStore().importSettings],
  ]);

  // Always clear possibly conflicting states
  usePacketStore().clear();
  useTransmitStore().clear();
  useSimulationStore().clear();

  source = source ? source : JSON.parse(localStorage.getItem("state"));
  if (!source) return;

  items = items ? items : defaultItems;

  try {
    for (const item of items) {
      const cb = importMap.get(item);
      if (cb && source[item]) await cb(source[item]);
    }
  } catch (e) {
    useAlertStore().addWarning(
      "An unexpected error ocurred during state load.\nLikely due to a corrupted export file.",
      8
    );
  }
}
