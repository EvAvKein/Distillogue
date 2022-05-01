<template>
  <section id="nodesContainer">
    <node :node="postObject" :isCentral="true"/>
  </section>
  
  <modalWrapper :activeByTruthiness="nodeInteractionId"
    @deactivate="() => {nodeInteractionId = null}"
  >
    <createReply :parentNodeId="nodeInteractionId"/>
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

  provide("postObject", props.postObject);

  const nodeInteractionId = ref<Node["id"]|null>(null);
  provide("nodeInteractionId", nodeInteractionId);
</script>