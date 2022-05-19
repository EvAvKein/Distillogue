<template>
  <details :open="openByDefault || false">
    <summary>{{title}}</summary>
    <div>
      <slot></slot>
    </div>
  </details>
</template>

<script setup lang="ts">
  defineProps<{
    title:string;
    openByDefault?:true;
  }>();
</script>

<style scoped>
  details {
    height: fit-content;
    width: fit-content;
    background-color: var(--backgroundSubColor);
    border-radius: 0.5em;
  }
  details[open] {width: 100%}

  summary {
    font-size: 1.25em;
    cursor: pointer;
    padding: 0.25em 0.5em;
  }

  details > div {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
    padding: 0.5em 1em 1em;
    gap: 0.5em 1.25em;
  }
  
</style>