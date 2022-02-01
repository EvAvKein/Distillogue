<template>
  <section>
    <h4>{{title}}</h4>
    <h5><timestamp :pastUnix="lastActiveUnix"/></h5>
    <p>{{body}}</p>
  </section>
</template>

<script setup lang="ts">
  import timestamp from "./timestamp.vue";
  defineProps<{
    title:string,
    body:string,
    lastActiveUnix:number
  }>();
</script>

<style scoped>
  section {
    padding: 0.5em;
  }
</style>