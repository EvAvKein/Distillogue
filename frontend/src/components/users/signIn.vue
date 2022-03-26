<template>
  <form @submit.prevent>
    <h3>Sign In</h3>
    <inputField :label="'Username'" :type="'text'" v-model="username" class="input" :inputId="'loginUsernameField'"/>
    <notification :text="signInMessage" :desirablityStyle="signInStatus"/>
    <button @click="signInByInput"
      class="globalStyle_textButton"
    >Continue</button>
  </form>
</template>

<script setup lang="ts">
  import {ref} from "vue";
  import {useRouter} from "vue-router";
  import {signIn} from "../../helpers/signIn";
  import inputField from "../labelledInput.vue";
  import notification from "../notification.vue";
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