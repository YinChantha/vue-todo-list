<template>
  <div id="app" class="flex items-center justify-center min-h-screen bg-green-500">
    <Name />
  </div>
</template>

<script>
import Name from "./components/Item.vue";
export default {
  components: {
    Name,
  },
};
</script>