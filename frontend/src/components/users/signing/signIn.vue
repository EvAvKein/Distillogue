<template>
  <form @submit.prevent>
    <h3>Sign In</h3>
    <inputField
      :label="'Username'" :type="'text'" 
      id="usernameInput" :inputId="'loginUsernameField'"
      v-model="username"
    />
    <notification :text="signingMessage" :desirablityStyle="signingStatus"/>
    <button @click="signingByInput"
      type="button"
      class="core_backgroundButton"
    >Continue</button>
  </form>
</template>

<script setup lang="ts">
  import {ref} from "vue";
  import {UserCreationRequest} from "../../../../../shared/objects/api";
  import {UserPayload} from "../../../../../shared/objects/user";
  import {useRouter} from "vue-router";
  import {useUser} from "../../../stores/user";
  import {jsonFetch} from "../../../helpers/jsonFetch";
  import inputField from "../../labelledInput.vue";
  import notification from "../../notification.vue";
  const router = useRouter();
  const user = useUser();

  const username = ref<string>("");

  const signingMessage = ref<string|undefined>(undefined);
  const signingStatus = ref<boolean|undefined>(undefined);

  async function signingByInput() {
    signingMessage.value = `Signing in...`;
    signingStatus.value = undefined;
    
    const response = await jsonFetch("POST", "/sessions",
      new UserCreationRequest(username.value)
    );

    if (response.error) {
      signingMessage.value = response.error.message;
      signingStatus.value = false;
      return;
    };

    user.data = (response.data as UserPayload).data;
    localStorage.setItem("sessionKey", (response.data as UserPayload).sessionKey);

    router.push({name: "browse"});
  };
</script>

<style scoped>
  form {
    font-size: 1.5rem;
    width: 12.5em;
    text-align: center;
  }
  h3 {
    font-size: 2em;
    margin: 0;
  }
  #usernameInput {
    margin-top: 0.2em;
  }
  button {
    font-size: 1.3rem;
    margin: 0.5em 0 0;
    padding: 0.25em 0.75em;
  }
</style>