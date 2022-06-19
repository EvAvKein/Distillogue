<template>
  <div class="progressContainer">
    <div v-for="number of totalSteps"
      :class="number < currentStep ? 'completed' : ''"
    ></div>
  </div>
</template>

<script setup lang="ts">
  defineProps<{
    totalSteps:number,
    currentStep:number,
    emSize?:number,
  }>();
</script>

<style scoped>
  .progressContainer {
    font-size: v-bind("(emSize || 1) + 'em'");
    margin: auto;
    display: flex;
    flex-flow: row wrap;
    justify-content: center;
    gap: 0.75em;
  }

  .progressContainer div {
    opacity: 0.75;
    height: 1em;
    width: 1em;
    border-radius: 2em;
    background-color: var(--textSubColor);
  }

  div.completed {
    opacity: 1;
    background-color: var(--textColor);
  }
</style>