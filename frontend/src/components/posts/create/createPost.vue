<template>
  <form @submit.prevent>
    <labelledInput
      :label="'Title'"
      :type="'text'"
      :required="true"
      :inputId="'postTitle'"
      v-model="postTitle"
    />
    <labelledInput
      :label="'Body'"
      :type="'textarea'"
      :required="true"
      :inputId="'postBody'"
      v-model="postBody"
    />
    <config v-model:config="postConfig"/>
    <notification :text="notifText" :desirablityStyle="notifDesirability"/>
    <button @click="submitPost"
      class="globalStyle_textButton"
    >Post</button>
  </form>
</template>

<script setup lang="ts">
  import {ref} from "vue";
  import {Node, PostConfig, NodeCreationRequest} from "../../../../../backend/src/objects";
  import {jsonFetch} from "../../../helpers/jsonFetch";
  import {useUser} from "../../../stores/user";
  import {useRouter} from "vue-router";
  import labelledInput from "../../labelledInput.vue";
  import config from "./config/editConfig.vue";
  import notification from "../../notification.vue";
  const user = useUser();
  const router = useRouter();

  const postTitle = ref<Node["title"]>("");
  const postBody = ref<Node["body"]>("");
  const postConfig = ref<PostConfig>({});
 
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
    width: clamp(15em, 90%, 35em);
    margin: auto;
    padding: 0;
  }
</style>