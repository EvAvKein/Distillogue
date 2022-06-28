<template>
  <form @submit.prevent>
    <draftsSelection v-if="user.data.drafts.length > 0"
      id="draftsSelection"
      @draftSelected="draftSelected"
    />
    <labelledInput
      :label="'Title'"
      :type="'text'"
      :required="true"
      :inputId="'replyTitle'"
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
    <notification
      :text="notifText"
      :desirablityStyle="notifDesirability"
    />
    <div id="confirmation">
      <draftSaveButton
        :sourceTitle="replyTitle"
        :sourceBody="replyBody"
        @error="(text) => {notifText = text; notifDesirability = false}"
      />
      <button id="reply"
        type="button"
        class="globalStyle_textButton"
        @click="submitNode"
      >Reply{{typeof currentDraftIndex === "number" ? ` (& Delete Draft ${currentDraftIndex + 1})` : ""}}</button>
    </div>
  </form>
</template>

<script setup lang="ts">
  import {ref} from "vue";
  import {Node, NodeCreationRequest, NodeInteractionRequest, UserData} from "../../../../../../../shared/objects";
  import {jsonFetch} from "../../../../../helpers/jsonFetch";
  import {useUser} from "../../../../../stores/user";
  import labelledInput from "../../../../labelledInput.vue";
  import notification from "../../../../notification.vue";
  import draftSaveButton from "../../../draftSaveButton.vue";
  import draftsSelection from "../../../draftSelectionCollapsible.vue";
  const user = useUser();

  const props = defineProps<{
    nodePath:Node["id"][];
    postConfig:Node["config"];
  }>();

  const notifText = ref<string>("");
  const notifDesirability = ref<boolean|undefined>(undefined);

  const replyTitle = ref<Node["title"]>("");
  const replyBody = ref<Node["body"]>("");
  const currentDraftIndex = ref<number|undefined>();

  function draftSelected(data:{draft:UserData["drafts"][number], index:number}|null) {
    if (!data) {
      currentDraftIndex.value = undefined;
      return;
    };

    replyTitle.value = data.draft.title;
    replyBody.value = data.draft.body;
    currentDraftIndex.value = data.index;
  };

  async function submitNode() {
    notifText.value = "";
    const newDraftsState = user.data.drafts.filter((draft, index) => index !== currentDraftIndex.value);
    
    const response = await jsonFetch("PATCH", "/interaction",
      new NodeInteractionRequest(
        props.nodePath,
        "reply",
        {nodeReplyRequest: new NodeCreationRequest(
          [user.data.id],
          replyTitle.value,
          replyBody.value,
          newDraftsState,
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

  #draftsSelection {
    background-color: var(--backgroundColor);
    margin-bottom: 0.25em;
  }

  #confirmation {
    display: flex;
    flex-wrap: nowrap;
    gap: 0.5em;
  }

  button#reply {flex-grow: 1}
</style>