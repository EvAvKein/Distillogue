<template>
  <main>
    <h2>{{testVar}}</h2>
    <labelledInput :inputId="'TWBtest'" :type="'textarea'" v-model="testVar"/>
  </main>
</template>

<script setup lang="ts">
  import {ref} from 'vue';
  import labelledInput from '../components/labelledInput.vue';

  const testVar = ref("");
</script>

<style scoped>
</style>