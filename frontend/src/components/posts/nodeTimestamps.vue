<template>
  <section>
    <div v-if="timestamps.posted"
      class="posted"
    ><span></span>Posted: <timestamp :pastUnix="timestamps.posted"/></div>
    <div v-if="timestamps.latestInteracted"
      class="interacted"
    ><span>Latest{{inPostSummary ? " Directly" : ""}} Interacted:</span> <timestamp :pastUnix="timestamps.latestInteracted"/></div>
  </section>
</template>

<script setup lang="ts">
  import {NodeStats} from "../../../../shared/objects";
  import timestamp from "../timestamp.vue";

  defineProps<{
    timestamps:NonNullable<NodeStats["timestamps"]>;
    inPostSummary?:true;
  }>();
</script>

<style scoped>
  section {
    display: flex;
    flex-direction: row;
    gap: 1.5em;
  }

  span {white-space: nowrap}

  .interacted {margin-left: auto}

  @media (max-width: 30rem) {
    div:not(:only-child) {
      max-width: min-content;
      text-align: center;
    }
  }
</style>