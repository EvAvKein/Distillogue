<template>
  <main>
    <signing/>
  </main>
</template>

<script setup lang="ts">
  import signing from "../components/users/signing.vue";
</script>

<style scoped>
  main {
    height: calc(75vh - 4rem);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
</style>