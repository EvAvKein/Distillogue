<template>
  <form @submit.prevent="requestSignIn">
    <h3>Sign In</h3>
    <inputField :type="'email'" v-model="email" class="input" :inputId="'loginEmailField'" />
    <inputField :type="'password'" v-model="password" class="input" :inputId="'loginPasswordField'" />
    <button @click="$emit('submit')">Next</button>
  </form>
</template>

<script setup lang="ts">
  import {ref} from "vue";
  import inputField from "./labelledInput.vue";
  const email = ref("");
  const password = ref("");
  // defineProps<{
    
  // }>();

  // defineEmits({

  // });
  function requestSignIn() {
    console.log(email.value + ": " + password.value)
  };
</script>

<style scoped>
  form {
    font-size: 1.5rem;
    width: 12.5em;
    text-align: center;
    background-color: var(--lighterBackgroundColor);
    padding: 1em 1.5em;
    border-radius: 1em;
  }

  h3 {
    font-size: 2em;
    margin-block: 0;
  }

  form div ~ div {
    margin-top: 0.3em;
  }

  button {
    margin-top: 1em;
    font-size: 1.25rem;
    padding: 0.25em 0.75em;
  }
</style>