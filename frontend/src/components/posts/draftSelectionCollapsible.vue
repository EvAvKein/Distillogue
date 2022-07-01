<template>
  <details><summary>Drafts</summary>
    <section id="draftsModal">
      <button v-if="typeof latestDraftIndex === 'number'"
        type="button"
        class="globalStyle_textButton"
        @click="unselectDraft"
      >Preserve chosen draft</button>
      <draftsSelection @draftSelected="selectDraft"/>
    </section>
  </details>
</template>

<script setup lang="ts">
  import {ref} from "vue";
  import {UserData} from "../../../../shared/objects";
  import {deepCloneFromReactive} from "../../helpers/deepCloneFromReactive";
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
  details {
    padding: 0.5em 0.75em;
    border-radius: 0.75em;
  }
  summary {
    color: var(--textColor);
    outline: none;
  }
  details[open] summary {margin-bottom: 0.5em}

  summary:focus, summary:hover {color: var(--highlightSubColor)}
  summary:active {color: var(--highlightColor)}

  button {
    width: 100%;
    padding: 0.3em;
    margin-bottom: 1em;
  }
  button + button {margin-top: 1em}

  p {margin: 0}
  div {font-size: 0.7em}
</style>