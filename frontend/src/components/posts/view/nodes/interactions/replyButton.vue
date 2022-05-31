<template>
  <button @click="reply"
    :aria-label="locked ? 'Replies locked' : 'Reply'"
    class="globalStyle_imageButton"
  >
    <img v-if="locked" src="../../../../../assets/locked.svg">
      <!-- would've used a ternary src attribute if vite compiled it appropriately -->
    <img v-else aria-label="Reply" src="../../../../../assets/reply.svg"/> 
  </button>
</template>

<script setup lang="ts">
  import {inject, Ref} from "vue";
  import {Node} from "../../../../../../../backend/src/objects";
  import {useUser} from "../../../../../stores/user";
  const user = useUser();

  const props = defineProps<{
    interactionPath:Node["id"][]|null;
    locked:true|undefined;
  }>();
  const emit = defineEmits(["interactionError", "replyToNode"]);
  const replyPath = inject("replyPath") as Ref<Node["id"][]|null>;

  function reply() {
    if (!user.data.id) {
      emit("interactionError", "Must be logged in to vote");
      return;
    };

    if (props.locked) {
      emit("interactionError", "Replies locked");
      return;
    };

    replyPath.value = props.interactionPath;
  };
</script>

<style scoped>
  button {
    background-color: transparent;
    margin: 0;
    padding: 0;
  }
  button img {
    height: 2.25em;
  }

  button:hover, button:focus {
    filter: var(--filterToHighlightSubColor)
  }
</style>