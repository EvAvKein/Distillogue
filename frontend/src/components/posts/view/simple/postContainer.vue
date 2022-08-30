<template>
  <section id="nodesContainer">
    <node :node="postObject" :pathToNode="[]"/>
  </section>
</template>


<script setup lang="ts">
  import node from "./node.vue";
  import {Node} from "../../../../../../shared/objects/post";

  const props = defineProps<{
    postObject:Node;
  }>();
</script>

<style scoped>
  #nodesContainer {
    padding: 0 0.5em 0;
    width: max-content;
    margin: auto;
  }
</style>