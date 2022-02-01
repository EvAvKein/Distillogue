<template>
  <main>
    <userLogin id="logIn"/>
  </main>
</template>

<script setup lang="ts">
  import userLogin from "../components/signIn.vue";
</script>

<style scoped>
  #logIn {
    position: absolute;
    top: 40%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
</style>