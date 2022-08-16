<template>
  <customDetails class="draftsDetails">
    <template #summary>
      <span>Drafts</span>
    </template>
    <template #content>
      <section id="draftsContent">
        <transition name="collapse">
          <button v-if="typeof latestDraftIndex === 'number'"
            type="button"
            class="core_backgroundButton"
            @click="unselectDraft"
          >Preserve chosen draft</button>
        </transition>
        <draftsSelection @draftSelected="selectDraft"/>
      </section>
    </template>
  </customDetails>
</template>

<script setup lang="ts">
  import {ref} from "vue";
  import {UserData} from "../../../../shared/objects";
  import {deepCloneFromReactive} from "../../helpers/deepCloneFromReactive";
  import customDetails from "../animatedDetails.vue";
  import draftsSelection from "../users/draftsList.vue";

  const latestDraftIndex = ref<number|null>();

  const emit = defineEmits(["draftSelected"]);

  function selectDraft(data:{draft:UserData['drafts'][number], index:number}) {
    latestDraftIndex.value = data.index;
    const clonedDraft = deepCloneFromReactive(data.draft);
    emit('draftSelected', {draft: clonedDraft, index: data.index});
  };

  function unselectDraft() {
    latestDraftIndex.value = null;
    emit('draftSelected', null);
  };
</script>

<style scoped>
  .draftsDetails {
    padding: 0.5em;
    border-radius: 0.5em;
  }
  span {
    display: block;
    color: var(--textColor);
    text-align: center;
  }

  #draftsContent {margin-top: 0.5em}

  button {
    width: 100%;
    padding: 0.3em;
    margin-bottom: 1em;
  }
  button + button {margin-top: 1em}

  p {margin: 0}
  div {font-size: 0.7em}
</style>