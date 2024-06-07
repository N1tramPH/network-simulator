<script setup>
import { storeToRefs } from "pinia";
import { uniqueId } from "lodash";

import { useDeviceStore } from "../../../../stores/DeviceStore";
import TextInput from "../../../input/TextInput.vue";
import Select from "../../../input/Select.vue";
import InterfaceForm from "./InterfaceForm.vue";

const store = useDeviceStore();
store.initDevice();
const { addedDevice } = storeToRefs(store);

const addInterface = () => {
  addedDevice.value.addAdapter(uniqueId("enp0s"), null, "192.168.1.1/24");
};
</script>

<template>
  <section>
    <div class="space-y-6 divide-y">
      <div class="space-y-2">
        <h3 class="header-sm dark:text-stone-100 flex justify-between">
          General
        </h3>

        <Select
          label="Device type"
          v-model="store.currentType"
          :options="store.types"
          class="rounded"
        />

        <TextInput label="Device name" v-model="addedDevice.name" />
      </div>

      <div class="adapters pt-2">
        <div
          class="text-sm text-stone-500 dark:text-stone-100 flex justify-between mt-3"
        >
          <h3 class="header-sm">Network adapters</h3>
          <button class="icon" @click="addInterface">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="100%"
              height="100%"
              viewBox="0 0 16 16"
            >
              <path
                fill="currentColor"
                d="M7.75 2a.75.75 0 0 1 .75.75V7h4.25a.75.75 0 0 1 0 1.5H8.5v4.25a.75.75 0 0 1-1.5 0V8.5H2.75a.75.75 0 0 1 0-1.5H7V2.75A.75.75 0 0 1 7.75 2"
              />
            </svg>
          </button>
        </div>

        <div class="divide-y pt-0">
          <InterfaceForm
            v-for="(iface, idx) in addedDevice.networkAdapters"
            :key="idx"
            :iface="iface"
            class="py-4"
          >
            <template v-slot:header>
              <button
                @click="addedDevice.removeAdapter(idx)"
                title="Remove interface"
                class="w-5"
              >
                <svg
                  class="text-red-600"
                  xmlns="http://www.w3.org/2000/svg"
                  width="100%"
                  height="100%"
                  viewBox="0 0 15 15"
                >
                  <path
                    fill="currentColor"
                    fill-rule="evenodd"
                    d="M11.782 4.032a.575.575 0 1 0-.813-.814L7.5 6.687L4.032 3.218a.575.575 0 0 0-.814.814L6.687 7.5l-3.469 3.468a.575.575 0 0 0 .814.814L7.5 8.313l3.469 3.469a.575.575 0 0 0 .813-.814L8.313 7.5z"
                    clip-rule="evenodd"
                  />
                </svg>
              </button>

              <span>{{ `Interface ${idx + 1}` }}</span>
            </template>
          </InterfaceForm>
        </div>
      </div>
    </div>

    <div class="m-auto mt-3">
      <button @click="store.addDevice()" class="btn btn-sm" variant="tonal">
        Add device
      </button>
    </div>
  </section>
</template>

<style scoped>
section {
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  height: 100%;
}
</style>
