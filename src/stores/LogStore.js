import { defineStore } from "pinia";
import { ref } from "vue";

export const useLogStore = defineStore("logStore", () => {
  const logs = ref([]);
  const lastLog = ref("");
  const logCount = ref(0);
  let logDuration = ref(0);

  function clearLog() {
    logs.value = [];
  }

  function addLog(log, duration = 0) {
    logs.value.push(log);
    lastLog.value = log;
    logDuration.value = duration;
    logCount.value += 1;
  }

  function getLogs() {
    return logs.value;
  }

  return {
    clearLog,
    addLog,
    getLogs,
    logs,
    lastLog,
    logCount,
    logDuration,
  };
});
