<script setup>
import { useBoardStore } from "../../stores/BoardStore";
import Collapsable from "../Collapsable.vue";

const board = useBoardStore();
</script>

<template>
  <section class="absolute top-0 left-0 text-gray-800 w-64 p-2">
    <Collapsable :collapse-default="false">
      <template v-slot:header>
        <header class="flex justify-between w-1/2">
          <h3 class="font-medium dark:text-white">Board info:</h3>
        </header>
      </template>

      <template v-slot:body>
        <div class="dark:text-white">
          <div>Coordinates: x: {{ board.x }}; y: {{ board.y }}</div>
          <div>Zoom: {{ parseInt(board.zoom * 100) }}%</div>
        </div>
      </template>
    </Collapsable>
  </section>
</template>

<style scoped></style>
