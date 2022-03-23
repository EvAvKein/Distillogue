<template>
  <main>
    <section>
      <signUp v-show="registerMode"/>
      <signIn v-show="!registerMode"/>
    
      <button id="joinModeToggler" @click="registerMode = !registerMode">
        <span v-show="registerMode">Sign In</span>
        <span v-show="!registerMode">Sign Up</span>
      </button>
    </section>
  </main>
</template>

<script setup lang="ts">
  import {ref} from "vue"
  import signIn from "../components/users/signIn.vue";
  import signUp from "../components/users/signUp.vue";

  const registerMode = ref<boolean>(true);
</script>

<style scoped>
  main {
    height: calc(75vh - 4rem);
    display: flex;
    justify-content: center;
    align-items: center;
  }

  #joinModeToggler {
    display: block;
    margin: 1em auto;
  }
</style>