<template>
  <form @submit.prevent>
    <h3>Sign Up</h3>
    <inputField :label="'Username'" :type="'text'" v-model="username" class="input" :inputId="'loginUsernameField'"/>
    <notification v-show="signUpMessage" :text="signUpMessage" :desirablityStyle="signUpStatus"/>
    <button @click="signUpByInput"
      class="globalStyle_textButton"
    >Continue<br>(testUser if empty)</button>
  </form>
</template>

<script setup lang="ts">
  import {ref} from "vue";
  import {useRouter} from "vue-router";
  import {userEntry} from "../../helpers/userEntry";
  import inputField from "../labelledInput.vue";
  import notification from "../notification.vue";
  const router = useRouter();

  const username = ref<string>("");

  const signUpMessage = ref<string|undefined>("");
  const signUpStatus = ref<boolean|undefined>();

  async function signUpByInput() {
    signUpMessage.value = "Signing Up...";
    signUpStatus.value = undefined;
    
    const response = await userEntry("signUp", username.value || "testUser");

    if (response.error) {
      signUpMessage.value = response.error.message;
      signUpStatus.value = false;
      return;
    };

    router.push({name: "dashboard"});
  };
</script>

<style scoped>
  form {
    font-size: 1.5rem;
    width: 12.5em;
    text-align: center;
  }
  form h3 {
    font-size: 2em;
    margin: 0;
  }
  form * + * {
    margin-top: 0.3em;
  }
  button {
    font-size: 1.25rem;
    margin-block: 0.5em;
    padding: 0.25em 0.75em;
  }
</style>