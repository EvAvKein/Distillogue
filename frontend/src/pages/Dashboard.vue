<template>
  <main>
    <profileEditor id="profileEditor"/>
  </main>
</template>

<script setup lang="ts">
  import profileEditor from '../components/users/profileEditor.vue';
</script>

<style scoped>
  main {padding: 1em}

  #profileEditor {
    margin: 0 auto;
    max-width: 50em;
  }
</style>