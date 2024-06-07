<script setup>
const emit = defineEmits(["decapsulate"]);
const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  data: {
    type: [String, Number],
  },
  width: {
    type: String,
  },
  special: {
    type: String,
    default: "",
  },
  onClick: {
    type: Function,
    default: () => {},
  },
});

const handleOnClick = () => {
  if (props.special === "data") {
    emit("decapsulate");
  }
  props.onClick();
};
</script>

<template>
  <div
    @click="handleOnClick"
    :style="{ width: width }"
    class="flex items-center justify-center rounded-md border border-stone-50 bg-stone-200 hover:bg-stone-300 dark:bg-gray-900 dark:hover:bg-gray-700 dark:border-gray-800 dark:text-white text-black p-2 text-center text-sm cursor-pointer no-break h-[3.3rem]"
  >
    <div>
      <div class="font-semibold leading-4">
        {{ label }}
      </div>

      <div>
        <template v-if="!special">
          {{ data }}
        </template>

        <template v-else-if="special === 'data'">
          {{ data ? `${data}b` : "" }}
        </template>

        <template v-else> NOT IMPLEMENTED </template>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
