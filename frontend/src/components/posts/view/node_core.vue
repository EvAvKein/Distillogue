<template>
  <section class="node" :id="centralNode ? 'central' : undefined">
    <h2 v-if="centralNode">{{node.title}}</h2>
    <button v-else
      class="core_contentButton titleButton"
      @click="emitExpandToggle"
    >
      <h3>{{node.title}}</h3>
    </button>
    <section v-show="expanded"
      class="body"
    >
      <p>{{node.body}}</p>
      <interactions
        :node="node"
        :pathToNode="pathToNode"
      />
    </section>
  </section>
</template>

<script setup lang="ts">
  import {Node} from "../../../../../shared/objects";
  import interactions from "./nodeInteractions/interactions.vue";

  const props = defineProps<{
    node:Node;
    pathToNode:Node["id"][];
    expanded:boolean;
  }>();
  const emit = defineEmits(["update:expanded"]);

  const centralNode = !props.pathToNode.length;

  function emitExpandToggle() {emit("update:expanded", !props.expanded)}
</script>

<style scoped>
  .titleButton {
    text-align: inherit;
    width: 100%;
  }
  h2, h3 {margin: 0}

  p {white-space: pre-line}
</style>