<template>
  <article>
    <router-link :to="{name: 'viewPost', params: {postId: summary.id}}">
      <div class="topSection">
        <h4>{{summary.title}}</h4>
        <img v-if="summary.public"
          alt="Open lock icon"
          src="../../../assets/unlocked.svg"
        />
        <img v-else
          alt="Closed lock icon"
          src="../../../assets/locked.svg"
        />
      </div>
      <div v-if="summary.stats.timestamps?.latestInteraction"
        class="timestampSection"
      > Latest Direct Interaction: <timestamp 
          class="timestamp"
          :pastUnix="summary.stats.timestamps.latestInteraction"
        />
      </div>
    </router-link>
  </article>
</template>

<script setup lang="ts">
  import {PostSummary} from "../../../../../backend/src/objects";
  import timestamp from "../../timestamp.vue";
  defineProps<{
    summary:PostSummary;
  }>();
</script>

<style scoped>
  a {
    display: block;
    text-decoration: none;
    color: var(--textColor);
    padding: 1em 0.5em;
  }

  .topSection {
    width: 100%;
    display: flex;
    justify-content: space-between;
  }

  h4 {
    margin: 0;
    font-size: 1.2em;
  }

  img {
    height: 1.5em;
    filter: var(--filterToTextColor);
    margin-left: 0.4em;
  }

  .timestampSection {
    margin-top: 0.45em;
    font-size: 0.95em;
  }
</style>