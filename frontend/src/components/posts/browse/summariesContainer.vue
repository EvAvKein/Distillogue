<template>
  <ol id="summariesList">
    <li v-for="(summaryObject, i) in summariesArray" :key="summaryObject.id + i">
      <postSummary :key="summaryObject.id + i"
        :summary="summaryObject"
      />
    </li>
  </ol>
</template>

<script setup lang="ts">
  import {PostSummary} from "../../../../../backend/src/objects";
  import postSummary from "./summary.vue";

  defineProps<{
    summariesArray:PostSummary[],
  }>();
</script>

<style scoped>
  #summariesList {
    margin: 1em 0.25em 0.25em;
    padding: 0;
    list-style: none;
  }

  #summariesList li + li {
    border-top: 0.25em solid var(--textSubColor);
  }
</style>