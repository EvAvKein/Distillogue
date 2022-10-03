<template>
  <main>
    <signIn v-if="signingMode === 'In'"/>
    <signUp v-else/>

    <button id="signingSwitch"
      class="core_backgroundButton"
      @click="() => {signingMode = signingMode === 'Up' ? 'In' : 'Up'}"
    >Switch to sign-{{signingMode === "Up" ? "in" : "up"}}</button>
  </main>
</template>

<script setup lang="ts">
  import {ref} from "vue";
  import signIn from "../components/users/signing/signIn.vue";
  import signUp from "../components/users/signing/signUp.vue";

  const signingMode = ref<"In"|"Up">("Up");
</script>

<style scoped>
  main {
    height: calc(85vh - 4rem);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  button {
    filter: brightness(0.75);
    display: block;
    margin: 1.5em auto 0;
  }
</style>