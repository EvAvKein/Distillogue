<template>
  <section id="summariesFinder">
    <summariesSearch
      id="summariesSearch"
      :fetchAllOnMount="true"
      @fetchedSummaries="(response:PostSummary[]) => {summariesArray = response}"
    />
    <hr>
    <summariesContainer v-if="summariesArray"
      :summariesArray="summariesArray"
    />
    <hr>
  </section>
</template>

<script setup lang="ts">
  import {ref} from "vue";
  import {PostSummary} from "../../../../../backend/src/objects";
  import summariesContainer from "./summariesContainer.vue";
  import summariesSearch from "./summariesSearch.vue";
  const summariesArray = ref<PostSummary[]|null|undefined>(undefined);
  const summariesFilter = ref<string>("");
</script>

<style scoped>
  #summariesFinder {
    width: clamp(10em, 90vw, 45em);
    margin: auto;
    padding: 0.5em;
  }

  #summariesSearch {
    font-size: 1.5em;
  }
</style>