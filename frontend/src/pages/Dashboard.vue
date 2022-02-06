<template>
  <main>
    <h2>Name: {{user.data.name}}</h2>
    <h6>Registered: {{user.registered}}</h6>
    <p>About: {{user.data.about}}</p>
  </main>
</template>

<script setup lang="ts">
  import {useUser} from "../stores/user";
  const user = useUser();
</script>

<style scoped>
</style>