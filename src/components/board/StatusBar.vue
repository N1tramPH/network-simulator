<script setup>
import gsap from "gsap";
import { storeToRefs } from "pinia";
import { useLogStore } from "../../stores/LogStore";
import { watch, ref } from "vue";

const store = useLogStore();
const { lastLog, logDuration, logCount } = storeToRefs(store);
const statusBar = ref(null);

watch(logCount, () => {
  if (logDuration.value) {
    gsap.fromTo(
      statusBar.value,
      {
        opacity: 1,
      },
      {
        duration: 3,
        ease: "expo.in",
        opacity: 0,
      }
    );
  } else gsap.to(statusBar.value, { opacity: 1 });
});
</script>

<template>
  <div
    class="absolute bg-board 0 w-auto rounded-tr-md py-1.5 px-3"
    ref="statusBar"
  >
    <span class="text-black dark:text-white"> {{ lastLog }}</span>
  </div>
</template>

<style scoped></style>
