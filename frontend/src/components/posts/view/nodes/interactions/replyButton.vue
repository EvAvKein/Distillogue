<template>
  <button @click="reply"
    class="globalStyle_imageButton"
  >
    <img v-if="locked" src="../../../../../assets/locked.svg">
      <!-- would've used a ternary src attribute if vite compiled it appropriately -->
    <img v-else src="../../../../../assets/reply.svg"/> 
  </button>
</template>

<script setup lang="ts">
  import {inject, Ref} from "vue";
  import {Node} from "../../../../../../../backend/src/objects";
  import {useUser} from "../../../../../stores/user";
  const user = useUser();

  const props = defineProps<{
    locked:true|undefined;
  }>();
  const emit = defineEmits(["interactionError", "replyToNode"]);
  const nodeId = inject("nodeId") as Node["id"];
  const parentNodeId = inject("nodeInteractionId") as Ref<Node["id"]|null>;

  function reply() {
    if (!user.data.id) {
      emit("interactionError", "Must be logged in to vote");
      return;
    };

    if (props.locked) {
      emit("interactionError", "Replies locked");
      return;
    };

    parentNodeId.value = nodeId;
  };
</script>

<style scoped>
  button {
    background-color: transparent;
    margin: 0;
    padding: 0;
  }
  button img {
    height: 1.75em;
  }

  button:hover, button:focus {
    filter: var(--filterToHighlightSubColor)
  }
</style>