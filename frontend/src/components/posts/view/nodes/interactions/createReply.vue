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
  import {inject, ref, Ref} from "vue";
  import {Node, NodeCreationRequest, NodeInteractionRequest} from "../../../../../../../backend/src/objects";
  import {jsonFetch} from "../../../../../helpers/jsonFetch";
  import {findPathToNode} from "../../../../../helpers/findPathToNode";
  import {useUser} from "../../../../../stores/user";
  import labelledInput from "../../../../labelledInput.vue";
  import notification from "../../../../notification.vue";
  const user = useUser();

  const postObject = inject("postObject") as Node;
  const nodeId = inject("nodeInteractionId") as Ref<Node["id"]>;

  const notifText = ref<string>("");
  const notifDesirability = ref<boolean|undefined>(true);
  const pathingLoadingText = "Loading reply functionality, wait a few seconds";

  let nodePath:undefined|Node["id"][];
  findPathToNode(postObject, nodeId.value).then((path) => {
    nodePath = path;
    if (notifText.value === pathingLoadingText) {
      notifText.value = "";
    };
  });

  const postTitle = ref<Node["title"]>("");
  const postBody = ref<Node["body"]>("");

  async function submitNode() {
    notifText.value = "";

    if (!nodePath) {
      notifText.value = "Loading reply functionality, wait a few seconds";
      notifDesirability.value = undefined;
      return;
    };
    
    const response = await jsonFetch("/nodeInteraction",
      new NodeInteractionRequest(
        user.data.id,
        nodePath,
        "reply",
        {nodeReplyRequest: new NodeCreationRequest(
          {postId: postObject.id,
          parentId: nodeId.value},
          [user.data.id],
          postTitle.value,
          postBody.value
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