<template>
  <button class="ofButtonStyling" @click="reply">
    <img v-if="locked" src="../../assets/locked.svg">
    <img v-else src="../../assets/reply.svg"/> <!-- would've used a ternary src attribute if vite knew to change the file paths -->
  </button>
</template>

<script setup lang="ts">
  import {inject} from "vue";
  import {useUser} from "../../../stores/user";
  const user = useUser();

  const props = defineProps<{
    locked:boolean;
  }>();
  const emit = defineEmits(["componentError", "replyToNode"]);
  const nodeId = inject("nodeId");

  function reply() {
    if (!user.data.id) {
      emit("componentError", "Must be logged in to vote");
      return;
    };

    if (props.locked) {
      emit("componentError", "Replies locked");
      return;
    };
    emit("replyToNode", nodeId);
  };
</script>

<style scoped>
  
</style>