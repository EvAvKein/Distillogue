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
    width: 100%;
    white-space: nowrap;
    background-color: var(--backgroundSubColor);
    border-radius: 0.5em;
  }

  summary {
    font-size: 1.25em;
    padding: 0.25em 0.5em;
  }
  summary:hover, summary:focus {
    color: var(--highlightSubColor);
    outline: none;
  }
  summary:active {
    color: var(--highlightColor);
  }

  details > div {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0.5em 1em 1em;
    gap: 0.5em 1.25em;
  }
</style>