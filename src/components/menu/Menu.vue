<script setup>
import Icon from "../icons/Icon.vue";
import CrossButton from "../buttons/CrossButton.vue";

/*
    This is generic menu that appears at the side of a relatively positioned parent.
    A menu can be divided into sections based on the given 'menu' prop data e.g

    {
    sectionLabel: "Options",
    items: [
      {
        label: "Settings",
        icon: "settings",
        callback: openSettings,
      },
      {
        label: "Transmission",
        icon: "switchHorizontal",
        callback: openTransmission,
      },
      {
        label: "Power",
        icon: "power",
        callback: () => props.device.togglePower(),
      },
    ],
  },

  --> represents one section within a menu (baned "Options") that contains items (objects)
  that are defined by a label, icon name (defined in icons.js) and callback that should be called on clicking on the item
*/

const emit = defineEmits(["close-panel"]);
const props = defineProps({
  menu: {
    /**
     * An array of sections within a menu
     */
    type: Array,
    required: true,
  },
  root: {
    type: Boolean,
    default: true,
  },
});
</script>

<template>
  <div
    class="w-44 rounded-md bg-gray-100 shadow dark:border-gray-800 dark:bg-gray-800"
    role="menu"
  >
    <!-- Menu header -->
    <div
      v-if="root"
      class="flex justify-end bg-gray-400 dark:bg-gray-600 p-1 px-2 rounded-t"
    >
      <CrossButton @click="emit('close-panel')" color="white" />
    </div>

    <!-- Menu body -->
    <div class="divide-y divide-gray-100 dark:divide-gray-800 p-1">
      <ul v-for="(section, idx) in menu" :key="idx">
        <h3
          class="block p-1 text-xs font-medium uppercase text-gray-700 dark:text-gray-200"
        >
          {{ section.sectionLabel }}
        </h3>

        <li
          v-for="item in section.items"
          :key="item.label"
          @click.stop="item.callback"
          class="relative flex w-full items-center gap-3 rounded-lg px-3 py-1.5 text-[.8rem] text-gray-600 hover:bg-stone-300 hover:text-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100 cursor-pointer group"
          role="menuitem"
        >
          <Icon v-if="item.icon" :name="item.icon" color="black" size="16px" />
          <span>{{ item.label }}</span>

          <!-- Nested menu -->
          <Icon
            v-if="item.nested"
            name="chevron-right"
            color="black"
            size="17px"
            class="ml-auto"
          />

          <div
            class="absolute left-full top-0 w-full pl-2 h-auto z-20 hidden group-hover:block"
          >
            <Menu v-if="item.nested" :menu="item.nested" :root="false" />
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped></style>
