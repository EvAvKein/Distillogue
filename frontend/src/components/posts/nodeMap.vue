<template>
  <section>
    <node :node="postObj" :is-central="true"/>
  </section>
</template>

<script setup lang="ts">
  import {provide} from "vue";
  import node from "./node.vue";
  import {Node} from "../../../../backend/src/objects";
  // import {ref, computed} from "vue";
  // import {useRouter} from "vue-router";
  // import {useUser} from '../stores/user';

  const props = defineProps<{
    postObj:Node;
  }>();

  provide("postId", props.postObj.id)

  // const emit = defineEmits([

  // ]);
</script>

<style scoped>
  
</style>