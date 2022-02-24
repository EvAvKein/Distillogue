<template>
  <section id="postsFinder">
    <postsFetchBySearch
      id="postsSearch"
      :fetchOnMount="true"
      @fetchedPosts="setPostsToResponse"
    />
    <hr>
    <postsDisplayBox v-if="summaries"
      :summariesArray="summaries"
    />
  </section>
</template>

<script setup lang="ts">
  import {ref} from 'vue';
  import {NodeSummary} from '../../../../backend/src/objects';
  import postsDisplayBox from './summariesDisplayBox.vue';
  import postsFetchBySearch from './fetchBySearch.vue';
  const summaries = ref<NodeSummary[]|undefined|false>(undefined);

  function setPostsToResponse(response:NodeSummary[]) {
    summaries.value = response;
  };
  
  // defineProps<{
    
  // }>();

  // defineEmits({

  // });
  
  
</script>

<style scoped>
  #postsFinder {
    width: clamp(10em, 90vw, 45em);
    margin: auto;
    padding: 0.5em;
  }

  #postsSearch {
    font-size: 1.5em;
  }

  
</style>