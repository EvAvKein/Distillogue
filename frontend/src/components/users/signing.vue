<template>
  <form @submit.prevent>
    <h3>Sign {{signingMode}}</h3>
    <inputField
      :label="'Username'" :type="'text'" 
      id="usernameInput" :inputId="'loginUsernameField'"
      v-model="username"
    />
    <notification
      :text="signingMessage"
      :desirablityStyle="signingStatus"
    />
    <button @click="signingByInput"
      class="globalStyle_textButton"
    >Continue</button>
  </form>
  <button id="signingSwitch"
    class="globalStyle_textButton"
    @click="() => {signingMode = signingMode === 'Up' ? 'In' : 'Up'}"
  >Switch to sign-{{signingMode === "Up" ? "in" : "up"}}</button>
</template>

<script setup lang="ts">
  import {ref} from "vue";
  import {UserData} from "../../../../backend/src/objects";
  import {useRouter} from "vue-router";
  import {useUser} from "../../stores/user";
  import {jsonFetch} from "../../helpers/jsonFetch";
  import inputField from "../labelledInput.vue";
  import notification from "../notification.vue";
  const router = useRouter();
  const user = useUser();

  const username = ref<string>("");

  const signingMode = ref<"In"|"Up">("Up");
  const signingMessage = ref<string|undefined>(undefined);
  const signingStatus = ref<boolean|undefined>(undefined);

  async function signingByInput() {
    signingMessage.value = `Signing ${signingMode.value.toLowerCase()}...`;
    signingStatus.value = undefined;
    
    const response = await jsonFetch("/sign" + signingMode.value, {
      username: username.value
    });

    if (response.error) {
      signingMessage.value = response.error.message;
      signingStatus.value = false;
      return;
    };

    user.data = response.data as UserData;
    localStorage.setItem("autoSignInKey", user.data.autoSignInKey);

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
  form #usernameInput {
    margin-top: 0.2em;
  }
  form button {
    font-size: 1.3rem;
    margin: 0.5em 0 0;
    padding: 0.25em 0.75em;
  }

  form + button {
    filter: brightness(0.75);
    display: block;
    margin: 1.75em auto 0;
  }
</style>