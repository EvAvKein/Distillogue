<template>
  <section id="nodesContainer">
    <node :node="postObject" :pathToNode="[]"/>
  </section>
</template>


<script setup lang="ts">
  import node from "./node.vue";
  import {Node} from "../../../../../../shared/objects";

  const props = defineProps<{
    postObject:Node;
  }>();
</script>

<style scoped>
  #nodesContainer {padding: 1em}

  #createReplyModal {
    font-size: clamp(1em, 3vw, 1.5em);
    width: clamp(20em, 70vw, 35em);
  }
</style>