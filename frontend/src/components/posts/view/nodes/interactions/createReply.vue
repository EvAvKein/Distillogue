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
      :minLineHeight="5"
      v-model="postBody"
    />
    <notification :text="notifText" :desirablityStyle="notifDesirability"/>
    <button 
      type="button"
      class="globalStyle_textButton"
      @click="submitNode"
    >Reply</button>
  </form>
</template>

<script setup lang="ts">
  import {ref} from "vue";
  import {Node, NodeCreationRequest, NodeInteractionRequest} from "../../../../../../../backend/src/objects";
  import {jsonFetch} from "../../../../../helpers/jsonFetch";
  import {useUser} from "../../../../../stores/user";
  import labelledInput from "../../../../labelledInput.vue";
  import notification from "../../../../notification.vue";
  const user = useUser();

  const props = defineProps<{
    nodePath:Node["id"][];
    postConfig:Node["config"];
  }>();

  const notifText = ref<string>("");
  const notifDesirability = ref<boolean|undefined>(true);
  const pathingLoadingText = "Loading reply functionality, wait a few seconds";

  if (notifText.value === pathingLoadingText) {
    notifText.value = "";
  };

  const postTitle = ref<Node["title"]>("");
  const postBody = ref<Node["body"]>("");

  async function submitNode() {
    notifText.value = "";
    
    const response = await jsonFetch("/nodeInteraction",
      new NodeInteractionRequest(
        user.data.id,
        props.nodePath,
        "reply",
        {nodeReplyRequest: new NodeCreationRequest(
          [user.data.id],
          postTitle.value,
          postBody.value,
          props.postConfig,
          props.nodePath,
        )}
      )
    );

    if (response.error) {
      notifText.value = response.error.message;
      notifDesirability.value = false;
      return;
    };

    window.location.reload();
  };
</script>

<style scoped>
  form {
    width: clamp(15em, 90%, 35em);
    margin: auto;
    padding: 0;
    background-color: var(--backgroundSubColor);
    padding: 0.75em 1.25em 1em;
    border-radius: 2em;
  }

  button {
    display: block;
    margin-left: auto;
    margin-top: 0.25em;
    font-size: 0.75em;
  }
</style>