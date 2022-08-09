<template>
  <modalWrapper :activeByTruthiness="replyPath" 
    @deactivate="() => {replyPath = null}"
  >
    <createReply
      :nodePath="(replyPath as string[])"
      :postConfig="props.postObject.config"
    />
  </modalWrapper>

  <simpleLayout v-if="currentLayout === 'simple'" :postObject="postObject"/>
  <!-- will later include v-else for other layouts, and some expandable menu for switching between layouts -->
</template>

<script setup lang="ts">
  import {ref, provide} from "vue";
  import {Node} from "../../../../../shared/objects";
  import modalWrapper from "../../modalWrapper.vue";
  import createReply from "./nodeInteractions/createReply.vue";

  import simpleLayout from "./simple/postContainer.vue";

  const props = defineProps<{
    postObject:Node;
  }>();

  type layout = "simple";
  const currentLayout = ref("simple" as layout);

  const replyPath = ref<Node["id"][]|null>(null);
  provide("replyPath", replyPath);
</script>