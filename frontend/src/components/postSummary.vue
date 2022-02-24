<template>
  <router-link :to="{name: 'viewPost', params: {postId: summary.id}}">
    <h4>{{summary.title}}</h4>
    <h5><timestamp :pastUnix="summary.stats.lastActiveUnix"/></h5>
    <h6>Public: {{summary.public}}</h6>
    <p>Replies: {{summary.stats.replyCount}}</p>
  </router-link>
</template>

<script setup lang="ts">
  import {NodeSummary} from "../../../backend/src/objects";
  import timestamp from "./timestamp.vue";
  defineProps<{
    summary:NodeSummary;
  }>();
</script>

<style scoped>
  a {
    text-decoration: none;
    color: var(--textColor);
    padding: 0.5em;
  }
</style>