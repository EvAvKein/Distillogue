<template>
  <main>
    <h3>Page Not Found!</h3>
    <router-link to="/">Return to Home page</router-link>
  </main>
</template>

<script setup lang="ts">
</script>

<style scoped>
  main {
    text-align: center;
  }

  a {
    cursor: pointer;
    border: none;
    color: var(--backgroundColor);
    text-decoration: none;
    background-color: var(--textColor);
    padding: 0.3em;
    border-radius: 0.2em;
  }
</style>