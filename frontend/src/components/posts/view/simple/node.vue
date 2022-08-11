<template>
  <section :class="'nodeBranch' + (central ? ' central' : '')">
    <coreNode :node="node" :pathToNode="pathToNode" v-model:expanded="expanded"/>
    <section class="replies"
      v-show="node.replies.length && expanded"
    >
      <button v-if="!central"
        class="repliesIndent core_backgroundButton"
        @click="() => {if (!central) expanded = !expanded}"
      ></button>
      <div v-else class="repliesIndent"></div>
      <node v-for="reply of node.replies"
        :node="reply"
        :pathToNode="nodePath"
        v-model:expanded="expanded"
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

  const central = !props.pathToNode.length;
  const nodePath = [...props.pathToNode, props.node.id];

  const expanded = ref(central) as Ref<boolean>;
</script>

<style>
  .replies {
    position: relative;
    padding: 0.5em 0 0 1.25em;
    margin: 0 0 0 0.8em;
  }

  .repliesIndent {
    position: absolute;
    top: -0.25em;
    left: 0;
    height: calc(100% + 0.25em);
    width: 0.9em;
    padding: 0;
    background-color: var(--backgroundSubColor);
    border-radius: 0 0 0.5em 0.5em;
    z-index: -1;
  }
  button.repliesIndent:hover,
  button.repliesIndent:focus,
  button.repliesIndent:active {
    opacity: 0.7;
  }

  .node {
    background-color: var(--backgroundSubColor);
    padding: 1em;
    border-radius: 1em;
    box-sizing: border-box;
    width: clamp(15em, 95vw, 40em);
  }

  .node#central {
    font-size: 1.1em;
    margin-top: 0;
    max-width: 50em;
  }

  .node:not(#central) {max-width: 87.5vw}

  .node h2 {font-size: 1.6em}
  .node h3 {font-size: 1.5em}

  .node > * + * {margin-top: 1.25em}

  .nodeBranch + .nodeBranch {margin-top: 0.5em}
</style>