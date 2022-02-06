<template>
  <form @submit.prevent>
    <h3>Sign Up</h3>
    <inputField :label="'Username'" :type="'text'" v-model="username" class="input" :inputId="'loginUsernameField'"/>
    <notification v-show="signUpMessage" :text="signUpMessage" :desirablityStyle="signUpStatus"/>
    <button @click="signUpByInput">Sign Up</button>
  </form>
</template>

<script setup lang="ts">
  import {ref} from "vue";
  import {useRouter} from "vue-router";
  import {signUp} from "../helpers/signUp";
  import inputField from './labelledInput.vue';
  import notification from "./notification.vue";
  const router = useRouter();

  const username = ref<string>("");

  const signUpMessage = ref<string|undefined>("");
  const signUpStatus = ref<boolean|undefined>();

  async function signUpByInput() {
    signUpMessage.value = "Signing Up...";
    signUpStatus.value = undefined;
    
    const response = await signUp(username.value);

    if (response.error) {
      signUpMessage.value = response.error.message;
      signUpStatus.value = false;
      return;
    };

    router.push({path: "/dashboard"});
  };
</script>

<style scoped>
</style>