<script setup>
import { computed, onMounted } from "vue";
import { useDialogStore } from "../../stores/DialogStore";

import SectionNavigation from "../menu/SectionNavigation.vue";
import CrossButton from "../buttons/CrossButton.vue";
import Icon from "../icons/Icon.vue";

const dialog = useDialogStore();

onMounted(() => {
  addEventListener("keydown", (e) => {
    if (e.key === "Escape") dialog.close();
  });
});

const activeContent = computed(() => {
  const activeDialog = dialog.activeDialog;
  if (!activeDialog) return null;

  return activeDialog.sections
    ? activeDialog.sections[activeDialog.sectionIdx].content
    : activeDialog.content;
});

const hasSections = computed(() => {
  const active = dialog.activeDialog;
  if (active) return active.sections;

  return false;
});

const handleSectionChange = (idx) => {
  dialog.activeDialog.sectionIdx = idx;
};

const styles = computed(() => {
  const active = dialog.activeDialog;
  return {
    width: `${active.width ? active.width : "max-content"}`,
    height: active.width ? active.height : "max-content",
  };
});
</script>

<template>
  <div @keydown="handleKey">
    <div v-if="dialog.overlay" class="overlay" @click="close"></div>

    <dialog
      v-if="dialog.activeDialog"
      class="dialog z-10 shadow-xl"
      :style="styles"
    >
      <section>
        <header class="flex justify-between p-1.5 bg-gray-700">
          <button
            v-show="dialog.isBack()"
            @click="dialog.back"
            class="w-4"
            title="Go back"
          >
            <Icon name="chevron-left" color="white"></Icon>
          </button>

          <h3 class="font-medium text-center flex-grow text-white">
            <slot name="title">{{ dialog.activeDialog.title }}</slot>
          </h3>
          <CrossButton @click="dialog.close" color="white" />
        </header>

        <body class="box-light space-y-2">
          <slot name="body">
            <SectionNavigation
              v-if="hasSections"
              :sections="dialog.activeDialog.sections"
              :activeIdx="dialog.activeDialog.sectionIdx"
              @change-section="handleSectionChange"
            />

            <div
              v-if="activeContent"
              class="overflow-y-scroll max-w-[42rem] max-h-[30rem] w-auto h-auto"
            >
              <component :is="activeContent" />
            </div>
          </slot>
        </body>
      </section>
    </dialog>
  </div>
</template>

<style scoped>
.dialog {
  position: absolute;
  top: 50%;
  translate: 0 -50%;
  border: none;

  display: block;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.829);

  z-index: 10;
}
</style>
