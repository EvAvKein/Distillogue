<template>
  <ul id="postsList">
    <li v-for="(summaryObject, i) in summariesArray" :key="summaryObject.id + i">
      <postSummary :key="summaryObject.id + i"
        :summary="summaryObject"
      />
    </li>
  </ul>
</template>

<script setup lang="ts">
  import {NodeSummary} from "../../../../../backend/src/objects";
  import postSummary from "./summary.vue";

  defineProps<{
    summariesArray:NodeSummary[],
  }>();
</script>

<style scoped>
  #postsList {
    margin: 0.5em;
    padding: 0;
    list-style: none;
  }

  #postsList li + li {
    border-top: 0.25em solid var(--textSubColor);
  }
</style>