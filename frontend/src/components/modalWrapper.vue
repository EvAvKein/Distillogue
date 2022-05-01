<template>
  <Teleport :to="'body'">
    <div v-if="activeByTruthiness"
      id="backdrop" 
      @click="emitDeactivateIfClicked"
    >
      <dialog open>
        <slot></slot>
      </dialog> 
    </div>
  </Teleport>
</template>

<script setup lang="ts">
  defineProps<{
    activeByTruthiness:any;
  }>();

  const emit = defineEmits(["deactivate"]); // emitting a deactivation request, as opposed to deactivating within this component, allows the parent component to set the variable used for activeByTruthiness to whichever falsey is appropriate for its type

  function emitDeactivateIfClicked(event:Event) {
    if (event.target === event.currentTarget) {
      emit("deactivate");
    };
  };
</script>

<style>
  html {overflow: hidden}
</style>

<style scoped>
  #backdrop {
    z-index: 1000;
    position: fixed;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    background-color: #00000044;
    backdrop-filter: blur(1.75rem);
    display: flex;
    justify-content: center;
    align-items: center;
  }

  dialog {
    position: relative;
    margin: 0;
    padding: 0;
    background-color: transparent;
    border: none;
  }
</style>