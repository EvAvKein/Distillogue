<template>
  <ol id="summariesList">
    <TransitionGroup name="posts">
      <li v-for="(summaryObject, i) in summariesArray" :key="summaryObject.id">
        <postSummary
          :summary="summaryObject"
        />
      </li>
    </TransitionGroup>
  </ol>
</template>

<script setup lang="ts">
  import {PostSummary} from "../../../../../shared/objects/post";
  import postSummary from "./summary.vue";

  defineProps<{
    summariesArray:PostSummary[],
  }>();
</script>

<style scoped>
  #summariesList {
    margin: 0 0.25em;
    padding: 0;
    list-style: none;
  }

  #summariesList li + li {
    border-top: 0.25em solid var(--textSubColor);
  }

  .posts-enter-from,
  .posts-leave-to {
    opacity: 0;
    max-height: 0;
  }

  .posts-leave-from,
  .posts-enter-to {
    max-height: 5em;
    opacity: 1;
  }
  
  .posts-enter-active,
  .posts-leave-active {
    transition: all 400ms ease-out;
  }
</style>