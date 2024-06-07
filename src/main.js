import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";

import { useAlertStore } from "./stores/AlertStore";

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.mount("#app");

// Report any runtime errors caught at a top-level using an alert (does not handle errors within async functions)
app.config.errorHandler = (err) => {
  useAlertStore().addWarning(`${err}`, 8);
};
