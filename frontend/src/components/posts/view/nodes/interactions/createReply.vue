<template>
  <form @submit.prevent>
    <labelledInput
      :label="'Title'"
      :type="'text'"
      :required="true"
      :inputId="'postTitle'"
      v-model="replyTitle"
    />
    <labelledInput
      :label="'Body'"
      :type="'textarea'"
      :required="true"
      :inputId="'replyBody'"
      :minLineHeight="5"
      v-model="replyBody"
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
  import {Node, NodeCreationRequest, NodeInteractionRequest} from "../../../../../../../shared/objects";
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
  const notifDesirability = ref<boolean|undefined>(undefined);

  const replyTitle = ref<Node["title"]>("");
  const replyBody = ref<Node["body"]>("");

  async function submitNode() {
    notifText.value = "";
    
    const response = await jsonFetch("PATCH", "/interaction",
      new NodeInteractionRequest(
        props.nodePath,
        "reply",
        {nodeReplyRequest: new NodeCreationRequest(
          [user.data.id],
          replyTitle.value,
          replyBody.value,
          props.postConfig,
          props.nodePath,
        )}
      ),
      user.data.authKey
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