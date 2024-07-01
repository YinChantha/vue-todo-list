<template>
  <div class="pagination-buttons flex items-center justify-between space-x-2">
    <div class="flex items-center gap-2 text-gray-500">
      <a
        @click="goToPage(1)"
        class="block border rounded-l-lg p-1 text-sm hover:bg-gray-200 text-gray-500"
        href="#"
      >
        <Icon icon="icomoon-free:first" class="text-gray-500" />
      </a>
      <a
        @click="goToPage(currentPage - 1)"
        class="block border hover:bg-gray-200 p-1 text-sm text-gray-500"
        href="#"
      >
        <Icon icon="material-symbols:chevron-backward" class="text-gray-600" />
      </a>
      <span>Page {{ currentPage }} of {{ totalPages }}</span>
      <a
        @click="goToPage(currentPage + 1)"
        class="block border p-1 hover:bg-gray-200 text-sm text-gray-600"
        href="#"
      >
        <Icon icon="ic:baseline-navigate-next" class="text-gray-600" />
      </a>
      <a
        @click="goToPage(totalPages)"
        class="block border rounded-r-lg p-1 text-sm hover:bg-gray-200 text-gray-600"
        href="#"
      >
        <Icon icon="icomoon-free:last" class="text-gray-500" />
      </a>
    </div>
    <div class="text-gray-400">
      <select
        v-model="selectedPerPage"
        @change="handleChangePerPage"
        class="border border-gray-400 outline-none rounded-lg p-1"
      >
        <option
          v-for="option in perPageOptions"
          :key="String(option)"
          :value="option"
        >
          Items: {{ option }} per page
        </option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { savePaginationSettings } from "../../services/pagenationService.ts";
import { Icon } from "@iconify/vue";

const props = defineProps({
  currentPage: {
    type: Number,
    required: true,
  },
  totalPages: {
    type: Number,
    required: true,
  },
  itemsPerPage: {
    type: Number,
    required: true,
  },
  perPageOptions: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(["pageChange", "itemsPerPageChange"]);

const selectedPerPage = computed({
  get: () => props.itemsPerPage,
  set: (value) => {
    emit("itemsPerPageChange", value);
    savePaginationSettings({
      currentPage: props.currentPage,
      itemsPerPage: value,
    });
  },
});

function goToPage(page: number) {
  if (page < 1) {
    page = 1;
  }
  if (page > props.totalPages) {
    page = props.totalPages;
  }
  emit("pageChange", page);
}

function handleChangePerPage(event: Event) {
  const value = Number((event.target as HTMLSelectElement).value);
  emit("itemsPerPageChange", value);
  savePaginationSettings({
    currentPage: props.currentPage,
    itemsPerPage: value,
  });
}
</script>
