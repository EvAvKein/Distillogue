<template>
  <form @submit.prevent>
    <section id="content">
      <labelledInput id="contentTitle"
        :label="'Title'"
        :type="'text'"
        :required="true"
        :inputId="'postTitle'"
        v-model="postTitle"
      />
      <labelledInput
        :label="'Body'"
        :type="'textarea'"
        :minLineHeight="10"
        :required="true"
        :inputId="'postBody'"
        v-model="postBody"
      />
    </section>
    <section id="config">
      <configPresets v-model:chosenPreset="configOverridingPreset"/>
      <editConfig v-model:config="postConfig" :presetOverride="configOverridingPreset"/>
    </section>
    <section id="confirmation">
      <notification :text="notifText" :desirablityStyle="notifDesirability"/>
      <button id="submitButton"
        class="globalStyle_textButton"
        @click="submitPost"
      >Post</button>
    </section>
  </form>
</template>

<script setup lang="ts">
  import {ref} from "vue";
  import {Node, PostConfig, NodeCreationRequest} from "../../../../../backend/src/objects";
  import {jsonFetch} from "../../../helpers/jsonFetch";
  import {useUser} from "../../../stores/user";
  import {useRouter} from "vue-router";
  import labelledInput from "../../labelledInput.vue";
  import configPresets from "./config/configPresets.vue";
  import editConfig from "./config/editConfig.vue";
  import notification from "../../notification.vue";
  const user = useUser();
  const router = useRouter();

  const postTitle = ref<Node["title"]>("");
  const postBody = ref<Node["body"]>("");
  const postConfig = ref<PostConfig>({});
  const configOverridingPreset = ref<PostConfig|undefined>(undefined);
 
  const notifText = ref<string>("");
  const notifDesirability = ref<boolean>(true);

  async function submitPost() {
    notifText.value = "";

    const response = await jsonFetch("/createPost",
      new NodeCreationRequest(
        null,
        [user.data.id],
        postTitle.value,
        postBody.value,
        postConfig.value,
      )
    );

    if (response.error) {
      notifText.value = response.error.message;
      notifDesirability.value = false;
      return;
    };

    router.push("/browse"); // should redirect to created post instead, change to that once post URLs are properly implemented
  };
</script>

<style scoped>
  form {
    width: clamp(20em, 90%, 50em);
    margin: auto;
    padding: 0;
  }

  #content {font-size: clamp(1.2em, 1.8vw, 1.5em)}
  #contentTitle {font-size: 1.15em}

  #config > * + * {
    margin-top: 0.5em;
  }

  #submitButton {
    margin-top: 0.5em;
    width: 100%;
  }

  @media (min-width: 40rem) {
    form {
      display: grid;
      grid-template-columns: 3fr 1fr;
      grid-template-rows: min-content 1fr;
      gap: 0 0.5em;
      grid-template-areas: 
        "content config"
        "confirmation config";
    }

    #content {grid-area: content}
    #config {grid-area: config}
    #confirmation {grid-area: confirmation}
  }
</style>