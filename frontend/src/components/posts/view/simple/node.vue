<template>
  <section class="nodeBranch">
    <coreNode :node="node" :pathToNode="pathToNode" v-model:expanded="expanded"/>
    <section v-show="expanded"
      class="replies"
    >
      <node v-for="reply of node.replies"
        :node="reply"
        :pathToNode="nodePath"
      />
    </section>
  </section>
    
</template>

<script setup lang="ts">
  import {ref, Ref} from "vue";
  import {Node as NodeObj} from "../../../../../../shared/objects"; // importing without renaming it causes vite to mix up this class (Node) with this component (node.vue, referenced in the template for recursion) and thus throw an error on runtime when trying to load a node with replies
  import coreNode from "../node_core.vue";

  const props = defineProps<{
    node:NodeObj;
    pathToNode:NodeObj["id"][];
  }>();

  const nodePath = [...props.pathToNode, props.node.id];
  const expanded = ref() as Ref<boolean>;
</script>

<style>
  .node {
    background-color: var(--backgroundSubColor);
    padding: 1em;
    border-radius: 1em;
    min-width: 15em;
    max-width: 45em;
    margin: 1em auto 0;
  }

  .node#central {
    font-size: 1.1em;
    margin-top: 0;
  }

  .node h2 {font-size: 1.6em}
  .node h3 {font-size: 1.5em}

  .node > * + * {margin-top: 1.25em}
</style>