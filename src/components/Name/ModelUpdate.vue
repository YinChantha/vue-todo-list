<template>
  <div
    class="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center"
  >
    <div class="bg-white p-4 rounded-lg shadow-lg max-w-md w-full">
      <h3 class="text-lg font-semibold mb-4">{{ title }}</h3>
      <div class="mb-4">
        <input
          type="text"
          v-model="internalValue"
          class="w-full py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div class="flex justify-end space-x-2 mt-4">
        <button
          @click="cancel"
          class="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
        >
          Cancel
        </button>
        <button
          @click="confirm"
          class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Confirm
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  inputValue: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["confirm", "cancel"]);

const internalValue = ref(props.inputValue);

watch(
  () => props.inputValue,
  (newValue) => {
    internalValue.value = newValue;
  }
);

const confirm = () => emit("confirm", internalValue.value);

const cancel = () => emit("cancel");
</script>
