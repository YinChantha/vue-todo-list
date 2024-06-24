<template>
    <li class="flex justify-between items-center bg-white p-2 rounded-lg shadow ">
      <div class="flex justify-center items-center">
        <input type="checkbox" v-model="name.completed" @change="toggleComplete" class="mr-2" />
        <div v-if="isEditing">
          <input type="text" v-model="editedTitle" @keyup.enter="saveChanges" @blur="saveChanges"
            class="mr-6 w-56 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div v-else>
          <label :class="{ 'line-through': name.completed }">{{ Title(name.title) }}</label>
        </div>
      </div>
      <div class="flex gap-2">
        <button 
          v-if="!isEditing" 
          @click="toggleEdit" 
          class="text-blue-500 hover:text-blue-700">
            <Icon icon="material-symbols:edit-outline" />
        </button>
        <button 
          v-else 
          @click="saveChanges" 
          :disabled="!isValidTitle" 
          class="text-green-500 hover:text-green-700">
            <Icon icon="ic:baseline-update" />
        </button>
        <button 
          @click="remove" 
          class="text-red-500 hover:text-red-700">
            <Icon icon="material-symbols:delete-outline" />
        </button>
      </div>
    </li>
</template>

<script>
import { defineComponent, ref, watch } from 'vue';

export default defineComponent({
  props: {
    name: {
      type: Object,
      required: true
    },
    editing: {
      type: Boolean,
      default: false
    }
  },
  setup(props, { emit }) {
    const editedTitle = ref(props.name.title);
    const isEditing = ref(props.editing);

    watch(() => props.editing, (newVal) => {
      isEditing.value = newVal;
      if (!newVal) {
        editedTitle.value = props.name.title;
      }
    });

    function toggleComplete() {
      emit('complete');
    }

    function toggleEdit() {
      isEditing.value = true;
      editedTitle.value = props.name.title;
    }

    function Title(title) {
      if (title.length > 30) {
        return title.slice(0, 30) + '...';
      }
      return title;
    }

    function saveChanges() {
      const trimmedTitle = editedTitle.value.trim();

      if (!trimmedTitle) {
        alert('Name cannot be empty.');
        return;
      }

      if (trimmedTitle !== props.name.title) {
        emit('check-duplicate', trimmedTitle, (isDuplicate) => {
          if (isDuplicate) {
            alert(`Name "${trimmedTitle}" already exists.`);
          } else {
            emit('save-changes', trimmedTitle);
          }
        });
      }
      isEditing.value = false;
    }

    function remove() {
      emit('remove');
    }

    function isValidTitle() {
      return editedTitle.value.trim() !== '';
    }

    return {
      editedTitle,
      isEditing,
      toggleComplete,
      Title,
      toggleEdit,
      saveChanges,
      remove,
      isValidTitle
    };
  }
});
</script>
