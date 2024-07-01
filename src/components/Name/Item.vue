<template>
  <div class="container p-4 max-w-2xl bg-gray-100 rounded-lg shadow-md">
    <div class="space-y-4">
      <div class="flex justify-center">
        <div class="typing-demo">
          <h1>To Do List 😍</h1>
        </div>
      </div>
      <div class="flex space-x-2">
        <input
          type="text"
          placeholder="Name"
          v-model="newName"
          @keyup.enter="addName"
          class="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          @click="addName"
          class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
        >
          <Icon icon="carbon:add-filled" />
        </button>
      </div>
      <div class="flex items-center justify-between">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Search..."
          class="mb-4 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          v-model="selectedFilter"
          class="p-2 m-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All</option>
          <option value="done">Done</option>
        </select>
      </div>
      <div>
        <ul v-if="filteredNames.length" class="space-y-2">
          <NameItem
            v-for="(name, index) in paginatedNames"
            :key="name.id"
            :name="name"
            :saveChanges="(newTitle: string) => saveChanges(index + (currentPage - 1) * itemsPerPage, newTitle)"
            :removeName="
              () => removeName(index + (currentPage - 1) * itemsPerPage)
            "
            :checkDuplicate="checkDuplicate"
            :showDoneOnly="selectedFilter === 'done'"
            @remove="removeName(index + (currentPage - 1) * itemsPerPage)"
            @complete="completeName()"
          />
        </ul>
        <p v-else class="text-center mt-12 text-gray-500">No Data</p>
      </div>
      <hr class="h-0.5 bg-gray-200" />
      <div class="buttons flex justify-around space-x-2">
        <button
          @click="clearDone"
          class="flex w-56 py-3 items-center justify-center bg-red-500 text-white rounded-lg hover:bg-red-600"
        >
          <Icon icon="material-symbols:delete-outline" />
          <span>Delete Done/checked</span>
        </button>
        <button
          @click="showModal = true"
          class="flex w-56 py-3 items-center justify-center bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
        >
          <Icon icon="material-symbols:delete-outline" />
          <span>Delete all</span>
        </button>
      </div>
      <Modal
        v-if="showModal"
        title="Delete"
        message="Are you sure you want to delete all items?"
        @confirm="handleConfirm"
        @cancel="showModal = false"
      />
      <div class="flex justify-around pending-names text-center text-gray-600">
        <p>Done names: {{ completeCount }}</p>
        <p>Pending names: {{ incompleteCount }}</p>
      </div>
      <hr class="h-0.5 bg-gray-200" />
      <Pagination
        :currentPage="currentPage"
        :totalPages="totalPages"
        :itemsPerPage="itemsPerPage"
        :perPageOptions="perPageOptions"
        @page-change="goToPage"
        @items-per-page-change="saveItemsPerPage"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import NameItem from "./ListItem.vue";
import Modal from "../../services/ui-element/modelMessage.vue";
import Pagination from "./Pagination.vue";
import {
  filterNames,
  getIncompleteCount,
  getCompleteCount,
  Name,
} from "../../services/filteringService";
import {
  loadPaginationSettings,
  savePaginationSettings as savePaginationSettingsToStorage,
  getPerPageOptions,
} from "../../services/pagenationService";

// State
const newName = ref<string>("");
const searchQuery = ref<string>("");
const selectedFilter = ref<string>("all");
const names = ref<Name[]>(loadNames());
const currentPage = ref<number>(
  Math.max(1, loadPaginationSettings().currentPage)
); // Default to 1

const itemsPerPage = ref<number>(loadPaginationSettings().itemsPerPage);
const perPageOptions = ref<number[]>(getPerPageOptions());
const showModal = ref<boolean>(false);

// Computed Properties
const paginatedNames = computed<Name[]>(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return filteredNames.value.slice(start, start + itemsPerPage.value);
});

const filteredNames = computed<Name[]>(() => {
  let filtered = filterNames(names.value, searchQuery.value);
  if (selectedFilter.value === "done") {
    filtered = filtered.filter((name) => name.completed);
  }
  return filtered;
});

const incompleteCount = computed<number>(() => getIncompleteCount(names.value));
const completeCount = computed<number>(() => getCompleteCount(names.value));
const totalPages = computed<number>(() => {
  const pages = Math.ceil(filteredNames.value.length / itemsPerPage.value);
  return pages > 0 ? pages : 1; // Ensure at least 1 page is displayed
});

// Functions
function loadNames(): Name[] {
  return JSON.parse(localStorage.getItem("names") || "[]");
}

function saveNames(): void {
  localStorage.setItem(
    "names",
    JSON.stringify(
      names.value.map(({ id, title, completed }) => ({ id, title, completed }))
    )
  );
}

function saveChanges(index: number, newTitle: string): void {
  if (index >= 0 && index < names.value.length) {
    names.value[index].title = newTitle;
    saveNames();
  } else {
    console.error(`Index out of bounds: ${index}`);
  }
}

function addName(): void {
  const trimmedName = newName.value.trim();
  if (
    trimmedName &&
    !names.value.some(
      (name) => name.title.toLowerCase() === trimmedName.toLowerCase()
    )
  ) {
    names.value.unshift({
      id: Date.now(),
      title: newName.value,
      completed: false,
    });
    newName.value = "";
    saveNames();
  } else {
    alert(`Name "${trimmedName}" already exists.`);
  }
}

function checkDuplicate(
  newTitle: string,
  callback: (isDuplicate: boolean) => void
): void {
  callback(
    names.value.some(
      (name) => name.title.toLowerCase() === newTitle.trim().toLowerCase()
    )
  );
}

function clearDone(): void {
  names.value = names.value.filter((name) => !name.completed);
  resetPagination();
}

function clearAll(): void {
  names.value = [];
  resetPagination();
}

function handleConfirm(): void {
  clearAll();
  showModal.value = false;
}

function completeName(): void {
  saveNames();
}

function removeName(index: number): void {
  names.value.splice(index, 1);
  if (paginatedNames.value.length === 0 && currentPage.value > 1) {
    currentPage.value = 1;
  }
  savePaginationSettings();
  saveNames();
}

function goToPage(page: number): void {
  currentPage.value = page;
  savePaginationSettings();
}

function saveItemsPerPage(newItemsPerPage: number): void {
  itemsPerPage.value = newItemsPerPage;
  currentPage.value = 1;
  savePaginationSettings();
}

function savePaginationSettings(): void {
  savePaginationSettingsToStorage({
    currentPage: currentPage.value,
    itemsPerPage: itemsPerPage.value,
  });
}

function resetPagination(): void {
  currentPage.value = 1;
  savePaginationSettings();
  saveNames();
}

// Watchers
watch([searchQuery, selectedFilter], resetPagination);
</script>
