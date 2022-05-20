<template>
  <form @submit.prevent>
    <h3>Sign {{signingMode}}</h3>
    <inputField :label="'Username'" :type="'text'" v-model="username" class="input" :inputId="'loginUsernameField'"/>
    <notification :text="signingMessage" :desirablityStyle="signingStatus"/>
    <button @click="signingByInput"
      class="globalStyle_textButton"
    >Continue<br>(testUser if empty)</button>
  </form>
  <button @click="() => {signingMode = signingMode === 'Up' ? 'In' : 'Up'}"
      class="globalStyle_textButton"
    >
    Switch to sign-{{signingMode === "Up" ? "in" : "up"}}
  </button>
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
      username: username.value || "testUser"
    });

    if (response.error) {
      signingMessage.value = response.error.message;
      signingStatus.value = false;
      return;
    };

    user.data = response.data as UserData;
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
  form button {
    font-size: 1.25rem;
    margin-block: 0.5em;
    padding: 0.25em 0.75em;
  }

  form + button {
    display: block;
    margin: 1em auto;
  }
</style>