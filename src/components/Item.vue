<template>
     <div class="container p-4 max-w-xl bg-gray-100 rounded-lg shadow-md">
          <div class="space-y-4 mt-16">
               <div class="title text-center">
                    <h1 class="text-2xl font-bold text-gray-800">To Do List</h1>
               </div>
               <div class="flex space-x-2">
                    <input 
                         type="text" 
                         placeholder="Name" 
                         v-model="newName" 
                         @keyup.enter="addName"
                         class="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <button 
                         @click="addName" 
                         class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                              <Icon icon="carbon:add-filled" />
                    </button>
               </div>
               <input
                    type="text"
                    v-model="searchQuery"
                    placeholder="Search..."
                    class="mb-4 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
               />
               <div>
                    <ul v-if="filteredNames.length" class="space-y-2">
                         <NameItem 
                              v-for="(name, index) in paginatedNames" 
                              :key="name.id" 
                              :name="name" 
                              :editing="false"
                              @remove="removeName(index + (currentPage - 1) * itemsPerPage)"
                              @complete="completeName(name)" @check-duplicate="checkDuplicate"
                              @save-changes="saveChanges(index + (currentPage - 1) * itemsPerPage, $event)" />
                    </ul>
                    <p v-else class="text-center mt-12 text-gray-500">No Data</p>
               </div>
               <hr class="h-0.5 bg-gray-200">
               <div class="buttons flex justify-around space-x-2">
                    <button 
                         @click="clearDone"
                         class="flex w-56 py-3 items-center justify-center bg-red-500 text-white rounded-lg hover:bg-red-600">
                              <Icon icon="material-symbols:delete-outline" />
                              <span>
                                   Delete Done/checked
                              </span>
                    </button>
                    <button 
                         @click="showModal = true"
                         class="flex w-56 py-3 items-center justify-center bg-yellow-500 text-white rounded-lg hover:bg-yellow-600">
                              <Icon icon="material-symbols:delete-outline" />
                              <span>
                                   Delete all
                              </span>
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
               <hr class="h-0.5 bg-gray-200">
               <div class="pagination-controls flex justify-between items-center mt-4">
                    <div class="pagination-buttons space-x-2">
                         <button v-for="page in totalPages" :key="page" @click="goToPage(page)"
                              :class="['px-2 py-1 rounded-lg', currentPage === page ? 'bg-blue-500 text-white' : 'bg-gray-200']">
                              {{ page }}
                         </button>
                    </div>
                    <div class="items-per-page">
                         <span class="mr-2">Page {{ currentPage }} of {{ totalPages }}</span>
                         <select id="itemsPerPage" v-model="itemsPerPage" @change="saveItemsPerPage"
                              class="border rounded-lg p-1">
                         <option v-for="option in perPageOptions" :key="option" :value="option">
                         {{ option }} per page
                         </option>
                         </select>

                    </div>
               </div>
          </div>
     </div>
</template>

<script>
import NameItem from "./ListItem.vue";
import Modal from "../services/ui-element/model.vue";
import { ref, computed } from "vue";
import {
     loadPaginationSettings,
     savePaginationSettings as savePaginationSettingsToStorage,
     getPerPageOptions,
} from "../services/pagenationService";

export default {
     components: {
          NameItem,
          Modal
     },
     setup() {
          const newName = ref("");
          const searchQuery = ref("");
          const names = ref(loadNames());
          const currentPage = ref(loadPaginationSettings().currentPage);
          const itemsPerPage = ref(loadPaginationSettings().itemsPerPage);
          const perPageOptions = ref(getPerPageOptions());
          const showModal = ref(false);
          const paginatedNames = computed(() => {
               const start = (currentPage.value - 1) * itemsPerPage.value;
               const end = start + itemsPerPage.value;
               return filteredNames.value.slice(start, end);
          });

          const incompleteCount = computed(() => names.value.filter((name) => !name.completed).length);
          const completeCount = computed(() => names.value.filter((name) => name.completed).length);
          const totalPages = computed(() => Math.ceil(filteredNames.value.length / itemsPerPage.value));


          function loadNames() {
               const storedNames = localStorage.getItem("names");
               return storedNames ? JSON.parse(storedNames) : [];
          }

          const filteredNames = computed(() => {
               const query = searchQuery.value.toLowerCase();
               return names.value.filter((name) =>
                    name.title.toLowerCase().includes(query)
            )  ;
          });

          function saveNames() {
               const serializableNames = names.value.map(({ id, title, completed }) => ({ id, title, completed }));
               localStorage.setItem("names", JSON.stringify(serializableNames));
          }

          function saveChanges(index, newTitle) {
               const name = names.value[index];
               name.title = newTitle;
               name.editing = false;
               saveNames();
          }

          function addName() {
               if (newName.value.trim()) {
                    const existingName = names.value.some(
                         (name) => name.title.toLowerCase() === newName.value.trim().toLowerCase()
                    );
                    if (!existingName) {
                         names.value.unshift({
                              id: Date.now(),
                              title: newName.value,
                              completed: false,
                              editing: false,
                         });
                         newName.value = "";
                         saveNames();
                    } else {
                         alert(`Name "${newName.value}" already exists.`);
                    }
               }
          }

          function checkDuplicate(newTitle, callback) {
               const isDuplicate = names.value.some(
                    (name) => name.title.toLowerCase() === newTitle.trim().toLowerCase()
               );
               callback(isDuplicate);
          }

          function clearDone() {
               names.value = names.value.filter((name) => !name.completed);
               saveNames();
               currentPage.value = 1;
               savePaginationSettings();
               showModal.value = false;
          }

          function clearAll() {
               names.value = [];
               saveNames();
               currentPage.value = 1;
               savePaginationSettings();
          }

          function handleConfirm() {
               clearAll();
               showModal.value = false;
          }

          function completeName(name) {
               saveNames();
          }

          function removeName(index) {
               const page = currentPage.value;
               names.value.splice(index, 1);

               if (paginatedNames.value.length === 0 && currentPage.value > 1) {

                    currentPage.value = 1;
               }

               savePaginationSettings();
               saveNames();
          }


          function goToPage(page) {
               currentPage.value = page;
               savePaginationSettings();
          }

          function saveItemsPerPage() {
               currentPage.value = 1;
               savePaginationSettings();
          }

          function savePaginationSettings() {
               savePaginationSettingsToStorage({
                    currentPage: currentPage.value,
                    itemsPerPage: itemsPerPage.value,
               });
          }

          return {
               newName,
               names,
               paginatedNames,
               currentPage,
               itemsPerPage,
               perPageOptions,
               incompleteCount,
               completeCount,
               totalPages,
               addName,
               saveChanges,
               checkDuplicate,
               clearDone,
               clearAll,
               completeName,
               removeName,
               goToPage,
               filteredNames,
               searchQuery,
               saveItemsPerPage,
               savePaginationSettings,
               showModal,
               handleConfirm
          };
     },
};
</script>