<!-- Represents a sections that opens from a sidebar -->

<script setup>
import Icon from "../icons/Icon.vue";

const emit = defineEmits(["close-section"]);
const props = defineProps({
  section: {
    type: Object,
  },
  open: {
    type: Boolean,
    default: true,
  },
});

const closeIconColor = "#9ca3af";
</script>

<template>
  <section class="side-section" tabindex="0">
    <div class="box-light h-full w-full overflow-y-auto">
      <template v-if="section">
        <header v-if="section.title">
          <h2 class="heading">
            {{ section.title }}
          </h2>
        </header>

        <button
          class="close-icon flex items-center justify-center absolute right-0 top-1/2 -translate-y-1/2 translate-x-full w-7 h-12 rounded-r-md group"
          @click="emit('close-section')"
        >
          <div
            class="w-1.5 h-5 rounded group-hover:hidden"
            :style="{ backgroundColor: closeIconColor }"
          ></div>
          <Icon
            name="chevron-left"
            size="38px"
            class="icon text-gray-600 hidden group-hover:block"
          />

          <div
            class="tooltip tooltip-open tooltip-right invisible scale-110 group-hover:visible"
            :data-tip="'Close'"
          ></div>
        </button>

        <body class="space-y-2 font-medium px-2">
          <template v-if="section.content">
            <component :is="section.content"></component>
          </template>
        </body>

        <footer class="mt-8">
          <slot name="footer"></slot>
        </footer>
      </template>
    </div>
  </section>
</template>

<style scoped>
.close {
  display: block;
  margin-left: auto;
}

.body {
  height: 100%;
  width: 100%;
  overflow-y: auto;
  overflow-x: hidden;
}

.close-icon :deep(svg) {
  /* ... */
  color: v-bind(closeIconColor);
}
</style>
