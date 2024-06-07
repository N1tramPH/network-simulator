import { defineStore } from "pinia";
import { computed, reactive, toRaw, watch } from "vue";
import { cloneDeep } from "lodash-es";

const defaultSettings = {
  loadLocalStorage: true,

  display: {
    darkMode: false,
  },
};

/**
 * Stores the basic settings of the application
 */
export const useSettingsStore = defineStore("defineStore", () => {
  // Retrieve the settings from localStorage, otherwise, set the default
  const saved = _fromLocalStorage();
  const state = reactive(saved ? saved : _getDefault());

  const display = computed(() => state.display);

  const loadLocalStorage = computed({
    get() {
      return state.loadLocalStorage;
    },
    set(value) {
      if (typeof value !== "boolean") {
        throw new TypeError("A value must be a boolean!");
      }
      state.loadLocalStorage = value;
    },
  });

  const darkMode = computed({
    set(value) {
      state.display.darkMode = value;
    },
    get() {
      return state.display.darkMode;
    },
  });

  // Set the dark/mode from initial settings
  darkMode.value
    ? document.documentElement.classList.add("dark")
    : document.documentElement.classList.remove("dark");

  // Store to localStorage on change
  watch(state, () => _toLocalStorage());

  watch(darkMode, () => {
    localStorage.setItem("darkMode", darkMode.value);

    darkMode.value
      ? document.documentElement.classList.add("dark")
      : document.documentElement.classList.remove("dark");
  });

  /******* Dark/Light mode *******/

  function toggleDarkMode() {
    darkMode.value = !darkMode.value;
  }

  function importSettings(json) {
    state.value = json;
    _toLocalStorage();
  }

  // Sets the default settings
  function _getDefault() {
    return cloneDeep(defaultSettings);
  }

  function _toLocalStorage() {
    localStorage.setItem("settings", JSON.stringify(exportSettings()));
  }

  function _fromLocalStorage() {
    return JSON.parse(localStorage.getItem("settings"));
  }

  /******* Import/Export *******/
  function exportSettings() {
    const raw = toRaw(state);

    // Remove a property from reactive proxy
    delete raw.value;
    return raw;
  }

  return {
    loadLocalStorage,
    display,
    darkMode,

    exportSettings,
    importSettings,

    toggleDarkMode,
  };
});
