<template>
  <section>
    <transition name="collapse">
      <draftsSelection v-if="draftsState.length" id="draftsPicker"
        :editingModeDraftsState="draftsState"
        @draftSelected="selectDraft"
      />
    </transition>

    <transition name="collapse">
      <button v-if="draftsState.length < maxDrafts"
        id="newDraft"
        class="core_backgroundButton"
        @click="createNewDraft"
      ><p>New draft</p></button>
      <notification v-else
        :text="'Drafts at capacity, consider triage'"
        :desirablityStyle="undefined"
      />
    </transition>
      
    <transition name="collapse">
      <section v-if="currentDraft"
        id="draftsEditor"
      >
        <labelledInput
          :inputId="'editDraftTitle'"
          :type="'text'"
          :label="'Title'"
          @update:modelValue="(newValue) => {updateCurrentDraft('title', newValue)}"
          v-model="currentDraft.title"
        />
        <labelledInput
          :inputId="'editDraftBody'"
          :type="'textarea'"
          :label="'Body'"
          :minLineHeight="4"
          @update:modelValue="(newValue) => {updateCurrentDraft('body', newValue)}"
          v-model="currentDraft.body"
        />
        <button id="draftDelete"
          class="core_contentButton"
          @click="deleteCurrentDraft"
        >
          <img src="../../../assets/trash.svg" alt="Trashcan icon"/>
          <span>Delete</span>
        </button>
      </section>
    </transition>
  </section>
</template>

<script setup lang="ts">
  import {ref, toRaw} from "vue";
  import {useUser} from "../../../stores/user";
  import {UserData} from "../../../../../shared/objects/user";
  import {UserPatchRequest} from "../../../../../shared/objects/api";
  import {unix as unixStamp} from "../../../../../shared/helpers/timestamps";
  import {deepCloneFromReactive} from "../../../helpers/deepCloneFromReactive";
  import draftsSelection from "../draftsList.vue";
  import notification from "../../notification.vue";
  import labelledInput from "../../labelledInput.vue";
  const user = useUser();
  const draftsState = ref(deepCloneFromReactive(user.data.drafts))
  const maxDrafts = 3;

  const currentDraft = ref<UserData["drafts"][number]|null>(null);
  const currentDraftIndex = ref<number|null>(null);

  const emit = defineEmits(["newState"]);
  function emitNewDraftsState() {
    emit("newState", [new UserPatchRequest("drafts", toRaw(draftsState.value))]);
  };

  function createNewDraft() {
    draftsState.value.push({title: "", body: "", lastEdited: unixStamp()});

    const newDraftIndex = draftsState.value.length - 1;
    currentDraftIndex.value = newDraftIndex;
    currentDraft.value = draftsState.value[newDraftIndex];
    emitNewDraftsState();
  };

  function selectDraft(data:{draft:UserData["drafts"][number], index:number}) {
    currentDraftIndex.value = data.index;
    currentDraft.value = draftsState.value[data.index];
  };

  function updateCurrentDraft(draftSection:"title"|"body", newValue:string) {
    currentDraft.value![draftSection] = toRaw(newValue);
    emitNewDraftsState();
  };

  function deleteCurrentDraft() {
    draftsState.value.splice(currentDraftIndex.value as number, 1);
    currentDraftIndex.value = null;
    currentDraft.value = null;
    emitNewDraftsState();
  };
</script>

<style scoped>
  #draftsPicker {margin-bottom: 0.5em}

  #newDraft {
    font-size: 0.9em;
    display: block;
    width: 90%;
    margin-inline: auto;
    padding: 0.3em;
  }
  #newDraft p {margin: 0}

  #draftDelete {
    display: block;
    margin: auto;
    font-size: inherit;
  }
  #draftDelete img {height: 1.75em}
  #draftDelete span {vertical-align: super}
</style>