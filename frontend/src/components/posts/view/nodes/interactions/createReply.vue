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
    <notification :text="notifText" :desirablityStyle="notifDesirability"/>
    <button @click="submitNode"
      :id="nodePath ? '' : 'replyButtonNotReady'"
      class="globalStyle_textButton"
    >Reply</button>
  </form>
</template>

<script setup lang="ts">
  import {ref} from "vue";
  import {Node, NodeCreationRequest, NodeInteractionRequest, PostConfig} from "../../../../../../../backend/src/objects";
  import {jsonFetch} from "../../../../../helpers/jsonFetch";
  import {useUser} from "../../../../../stores/user";
  import labelledInput from "../../../../labelledInput.vue";
  import notification from "../../../../notification.vue";
  const user = useUser();

  const props = defineProps<{
    nodePath:Node["id"][]|null;
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

    if (!props.nodePath) {
      notifText.value = "Loading reply functionality, wait a few seconds";
      notifDesirability.value = undefined;
      return;
    };
    
    const response = await jsonFetch("/nodeInteraction",
      new NodeInteractionRequest(
        user.data.id,
        props.nodePath,
        "reply",
        {nodeReplyRequest: new NodeCreationRequest(
          props.nodePath,
          [user.data.id],
          postTitle.value,
          postBody.value,
          props.postConfig,
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
    padding: 1.5em;
    border-radius: 2em;
  }

  #replyButtonNotReady {
    filter: brightness(40%);
  }
</style>