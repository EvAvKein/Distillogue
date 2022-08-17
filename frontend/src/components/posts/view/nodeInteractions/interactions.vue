<template>
  <section class="interactions">
    <timestamps v-if="node.stats.timestamps" 
      :timestamps="node.stats.timestamps"
      class="timestamps"
    />
    <div>
      <votes v-if="node.stats.votes"
        :interactionPath="nodePath"
        :voters="node.stats.votes"
        @interactionError="(errorText:string) => {interactionError = errorText}"
      />
      <reply :locked="node.locked"
        :interactionPath="nodePath"
        class="replyButton" 
      />
    </div>
    <notification :text="interactionError" :desirablity-style="false"/>
  </section>
</template>

<script setup lang="ts">
  import {ref} from "vue";
  import {Node} from "../../../../../../shared/objects";
  import timestamps from "../../nodeTimestamps.vue";
  import votes from "./vote.vue";
  import reply from "./replyButton.vue";

  const props = defineProps<{
    node:Node;
    pathToNode:Node["id"][];
  }>();

  const nodePath = [...props.pathToNode, props.node.id];
  const interactionError = ref("");
</script>

<style scoped>
  .timestamps {
    font-size: 0.9em;
    margin-bottom: 0.25em;
  }

  div {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 0.5em;
  }

  .replyButton {
    margin: 0.5em 0.25em 0 auto;
  }
</style>