<template>
  <section id="nodesContainer">
    <node :node="postObject" :pathToNode="[]" :isCentral="true"/>
  </section>
  
  <modalWrapper :activeByTruthiness="replyPath" 
    @deactivate="() => {replyPath = null}"
  >
    <createReply id="createReplyModal"
      :nodePath="(replyPath as string[])"
      :postConfig="props.postObject.config"
    />
  </modalWrapper>
</template>

<script setup lang="ts">
  import {ref, provide} from "vue";
  import {Node} from "../../../../../backend/src/objects";
  import node from "./nodes/node.vue";
  import modalWrapper from "../../modalWrapper.vue";
  import createReply from "./nodes/interactions/createReply.vue";

  const props = defineProps<{
    postObject:Node;
  }>();

  const replyPath = ref<Node["id"][]|null>(null);
  provide("replyPath", replyPath);
</script>

<style scoped>
  #nodesContainer {padding: 1em}

  #createReplyModal {
    font-size: clamp(1em, 3vw, 1.5em);
    width: clamp(20em, 70vw, 35em);
  }
</style>