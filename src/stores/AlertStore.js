import { defineStore } from "pinia";
import { reactive, computed } from "vue";
import { nanoid } from "nanoid";

/** */
function createAlert(title, details = "", type = "Alert", timeout = 6) {
  return {
    id: `alert-${nanoid(5)}`,
    type: type ? type : "Alert", // warning/generic/success
    title: title ? title : "Title",
    details: details ? details : "",
    timeout: timeout ? timeout : 0,
  };
}

/**
 * Storing created alerts, provides with functions to create alerts.
 */
export const useAlertStore = defineStore("alertStore", () => {
  const state = reactive({
    alerts: [],
  });

  const alerts = computed(() => {
    return state.alerts;
  });

  function addAlert(details = "", timeout = 0) {
    state.alerts.push(createAlert("Alert", details, "Alert", timeout));
  }

  function addWarning(details = "", timeout = 0) {
    state.alerts.push(createAlert("Warning", details, "Warning", timeout));
  }

  function addSuccess(details = "", timeout = 0) {
    state.alerts.push(createAlert("Success!", details, "Success", timeout));
  }

  function popAlert(id) {
    state.alerts = state.alerts.filter((a) => a.id != id);
  }

  function clearAlerts() {
    state.alerts.length = 0;
  }

  return {
    addAlert,
    addWarning,
    addSuccess,
    popAlert,
    clearAlerts,

    alerts,
  };
});
