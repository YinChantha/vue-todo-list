<template>
  <li
    v-if="!showDoneOnly || name.completed"
    class="flex justify-between items-center bg-white p-2 rounded-lg shadow"
  >
    <div class="flex justify-center items-center">
      <input
        type="checkbox"
        v-model="name.completed"
        @change="toggleComplete"
        class="mr-2"
      />
      <div>
        <label
          :class="{ 'line-through': name.completed }"
          v-tooltip="name.title"
        >
          {{ truncateTitle(name.title) }}
        </label>
      </div>
    </div>

    <div class="flex gap-2">
      <button @click="showEditModal" class="text-blue-500 hover:text-blue-700">
        <Icon icon="material-symbols:edit-outline" />
      </button>
      <button @click="removeItem" class="text-red-500 hover:text-red-700">
        <Icon icon="material-symbols:delete-outline" />
      </button>
    </div>

    <!-- Modal Edit -->
    <Modal
      v-if="isModalVisible"
      title="Edit Name"
      :inputValue="editedTitle"
      @confirm="saveChangesLocally"
      @cancel="closeModal"
    />
  </li>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, defineEmits } from "vue";
import Modal from "./ModelUpdate.vue";

const props = defineProps({
  name: {
    type: Object,
    required: true,
  },
  saveChanges: {
    type: Function,
    required: true,
  },
  checkDuplicate: {
    type: Function,
    required: true,
  },
  showDoneOnly: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["complete", "remove"]);

const editedTitle = ref(props.name.title);
const isModalVisible = ref(false);

watch(
  () => props.name.title,
  (newTitle) => {
    editedTitle.value = newTitle;
  }
);

const toggleComplete = () => emit("complete");

const showEditModal = () => {
  isModalVisible.value = true;
  editedTitle.value = props.name.title;
};

const closeModal = () => {
  isModalVisible.value = false;
};

const truncateTitle = (title: string) =>
  title.length > 30 ? `${title.slice(0, 30)}...` : title;

const saveChangesLocally = (newTitle: string) => {
  const trimmedTitle = newTitle.trim();
  if (!trimmedTitle) {
    alert("Name cannot be empty.");
    return;
  }

  if (trimmedTitle !== props.name.title) {
    props.checkDuplicate(trimmedTitle, (isDuplicate: boolean) => {
      if (isDuplicate) {
        alert(`Name "${trimmedTitle}" already exists.`);
      } else {
        props.saveChanges(trimmedTitle);
        isModalVisible.value = false; // Close modal on successful save
      }
    });
  } else {
    isModalVisible.value = false; // Close modal if title didn't change
  }
};

const removeItem = () => emit("remove");
</script>
