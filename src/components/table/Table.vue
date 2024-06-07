<script setup>
import { ref } from "vue";
import Icon from "../icons/Icon.vue";
import Select from "../input/Select.vue";
const emit = defineEmits(["remove-row", "add-row", "update-row"]);

const props = defineProps({
  caption: {
    default: "",
  },
  cols: {
    type: Array,
    required: true,
  },
  rows: {
    required: true,
  },
  addable: {
    type: Boolean,
    default: false,
  },
  editable: {
    type: Boolean,
    default: false,
  },
});

// Indicates whether a row is being added
const addActive = ref(false);

// Storing the added values
const addedData = ref(initRow());

// Edited rows
const edited = ref({});

function initRow() {
  const added = {};
  props.cols.forEach((col) => {
    if (col.default) {
      added[col.key] = col.default;
    } else {
      added[col.key] = col.fixed ? col.fixed : "";
    }
  });
  return added;
}

function initEdit(row) {
  if (row.type === "dynamic") {
    throw new Error("A dynamic row cannot be edited!");
  }

  edited.value[row.id] = { ...row };
}

function cancelEdit(id) {
  edited.value[id] = null;
}

function updateRow(id) {
  emit("update-row", id, edited.value[id]);
  edited.value[id] = null;
}

function handleEditKeyDown(e, id) {
  e.stopPropagation();

  if (e.key === "Escape") {
    cancelEdit(id);
  } else if (e.key === "Enter") {
    updateRow(id);
  }
}

function clearAdded() {
  for (let i = 0; i < addedData.value.length; i++) {
    addedData.value[i] = "";
  }
}

function toggleAdd() {
  addActive.value = !addActive.value;
  if (addActive.value) clearAdded();
}

function handleAdd() {
  emit("add-row", addedData.value);
  toggleAdd();
}
</script>

<template>
  <div class="overflow-x-hidden">
    <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
      <caption v-if="caption" class="mb-2">
        {{
          caption
        }}
      </caption>

      <!-- Table head -->
      <thead
        class="text-xs uppercase bg-slate-200 text-gray-800 dark:bg-gray-700 dark:text-gray-400"
      >
        <tr>
          <th v-for="(col, i) in cols" :key="i" scope="col" class="py-2">
            {{ col.operation ? "#" : col.title }}
          </th>

          <!-- Special column for edit -->
          <th v-if="editable">#</th>
        </tr>
      </thead>

      <!-- Table body -->
      <tbody>
        <tr
          v-for="row in rows"
          :key="row.id"
          class="dark:bg-gray-800 dark:border-gray-700"
        >
          <td v-for="col in cols" :key="col.key">
            <div class="flex justify-center items-center h-full">
              <!-- Edit mode -->
              <template v-if="edited[row.id] && !col.operation">
                <input
                  v-if="!col.options"
                  v-model="edited[row.id][col.key]"
                  class="w-full h-full"
                  type="text"
                  :class="{ 'input--fixed': col.fixed }"
                  :disabled="col.fixed"
                  @keydown="handleEditKeyDown($event, row.id)"
                />

                <Select
                  v-else-if="!col.fixed"
                  v-model="edited[row.id][col.key]"
                  :options="col.options"
                  class="w-full"
                />
              </template>

              <!-- Read mode -->
              <span v-else-if="!col.operation" class="py-2">
                {{ row[col.key] }}
              </span>

              <!-- Edit button -->
              <button v-else @click="col.callback(row.id)" :title="col.title">
                <Icon :name="col.icon" size="18px" />
              </button>
            </div>
          </td>

          <!-- Special row for edit button -->
          <td v-if="editable">
            <button
              class="text-black w-5 flex justify-center items-center m-auto"
            >
              <svg
                v-if="!edited[row.id]"
                @click="initEdit(row)"
                xmlns="http://www.w3.org/2000/svg"
                width="100%"
                height="100%"
                viewBox="0 0 24 24"
              >
                <path
                  fill="none"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="m15.214 5.982l1.402-1.401a1.982 1.982 0 0 1 2.803 2.803l-1.401 1.402m-2.804-2.804L6.98 14.216c-1.045 1.046-1.568 1.568-1.924 2.205S4.342 18.561 4 20c1.438-.342 2.942-.7 3.579-1.056s1.16-.879 2.205-1.924l8.234-8.234m-2.804-2.804l2.804 2.804M11 20h6"
                  color="currentColor"
                />
              </svg>

              <svg
                v-else
                @click="updateRow(row.id)"
                xmlns="http://www.w3.org/2000/svg"
                width="100%"
                height="100%"
                viewBox="0 0 48 48"
              >
                <path
                  fill="none"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="4"
                  d="M43 11L16.875 37L5 25.182"
                />
              </svg>
            </button>
          </td>
        </tr>

        <!-- Add row -->
        <tr v-show="addActive" class="dark:bg-gray-800 dark:border-gray-700">
          <td v-for="(col, idx) in cols" :key="idx">
            <Select
              v-if="col.options"
              v-model="addedData[col.key]"
              :options="col.options"
              class="w-full"
            />

            <input
              v-else-if="!col.operation"
              type="text"
              v-model="addedData[col.key]"
              class="w-full h-full"
              :placeholder="col.placeholder"
              :disabled="col.fixed"
              :class="{ 'input--fixed': col.fixed }"
              @keyup.enter="handleAdd"
              @keyup.esc="toggleAdd"
            />
          </td>

          <td v-if="editable"></td>
        </tr>
      </tbody>
    </table>

    <div v-if="!(rows.length || addActive)" class="text-center mt-3 text-lg">
      The table is empty
    </div>

    <!-- Add row control -->
    <div v-show="addable" class="flex justify-between mt-4">
      <button @click="toggleAdd" class="btn">
        {{ addActive ? "Cancel" : "Add new" }}
      </button>
      <button v-if="addActive" @click="handleAdd" class="btn">Add row</button>
    </div>
  </div>
</template>

<style scoped>
table {
  table-layout: unset;
  border-collapse: collapse;
  empty-cells: hide;
}

th,
td {
  position: relative;
  text-align: center;

  /* Sort of deals with an issue of overly expanding cells with input elements */
  width: 0;
}

td {
  font-size: 0.85rem;
  border: 1.2px dashed rgba(235, 236, 236, 0.796);
}

td:empty::before {
  content: "–"; /* Default content */
  color: #999; /* Optional: Change the color of the default content */
}

input {
  @apply input-box border-none text-sm text-center placeholder:dark:text-gray-100 rounded-sm inline-block border-red-300;
}

.input--fixed {
  @apply bg-transparent shadow-none hover:bg-transparent;
}
</style>
