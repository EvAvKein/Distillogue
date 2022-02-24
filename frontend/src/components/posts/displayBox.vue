<template>
  <section>
    <h3>{{centralNode.title}}</h3>
    <p>{{centralNode.body}}</p>
  </section>
</template>

<script setup lang="ts">
  import {Node} from '../../../../backend/src/objects';

  defineProps<{
    centralNode:Node;
  }>();
</script>

<style scoped>
  
</style>