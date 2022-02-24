<template>
  <main>
    <button @click="setUser">Instant User <h6 style="margin: 0">(for quick frontend testing)</h6></button>
    <signIn v-show="!registerMode"/>
    <signUp v-show="registerMode"/>

    <button id="registerModeToggler" @click="registerMode = !registerMode">
      <span v-show="!registerMode">Sign up a new account</span>
      <span v-show="registerMode">Sign in with existing account</span>
    </button>
  </main>
</template>

<script setup lang="ts">
  import {ref} from "vue"
  import {UserData} from "../../../backend/src/objects"
  import signIn from "../components/joining/signIn.vue";
  import signUp from "../components/joining/signUp.vue";

  import {useUser} from "../stores/user";
  import {useRouter} from "vue-router";

  const registerMode = ref<boolean>(false);

  const router = useRouter();
  function setUser() {
    const user = useUser();
    user.data = new UserData("EvAvKein");

    router.push("/dashboard");
  };
</script>

<style>
  main > * {
    display: block;
    margin: auto;
  }

  form {
    font-size: 1.5rem;
    width: 12.5em;
    text-align: center;
    background-color: var(--lighterBackgroundColor);
    padding: 1em 1.5em;
    border-radius: 1em;
  }
  form h3 {
    font-size: 2em;
    margin-block: 0;
  }
  form div ~ div {
    margin-top: 0.3em;
  }
  button {
    font-size: 1.25rem;
    margin-block: 0.5em;
    padding: 0.25em 0.75em;
  }

  .inputError {
    font-size: 0.65em;
    padding: 0.3em;
    border-inline: 0.3em solid #ff0000;
    background-color: #ff000088;
    margin: 0.75em auto 0.75em;
  }
</style>