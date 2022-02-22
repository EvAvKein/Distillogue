<template>
  <form @submit.prevent>
    <h3>Sign In</h3>
    <inputField :label="'Username'" :type="'text'" v-model="username" class="input" :inputId="'loginUsernameField'"/>
    <notification :text="signInMessage" :desirablityStyle="signInStatus"/>
    <button @click="signInByInput">Sign In</button>
  </form>
</template>

<script setup lang="ts">
  import {ref} from "vue";
  import {useRouter} from "vue-router";
  import {signIn} from "../helpers/signIn";
  import inputField from "./labelledInput.vue";
  import notification from "./notification.vue";
  const router = useRouter();

  const username = ref<string>("");

  const signInMessage = ref<string|undefined>(undefined);
  const signInStatus = ref<boolean|undefined>(undefined);

  async function signInByInput() {
    signInMessage.value = "Signing In...";
    signInStatus.value = undefined;
    
    const response = await signIn(username.value);

    if (response.error) {
      signInMessage.value = response.error.message;
      signInStatus.value = false;
      return;
    };

    router.push({name: "browse"});
  };
</script>

<style scoped>
</style>