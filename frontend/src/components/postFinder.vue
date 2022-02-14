<template>
  <section id="postsFinder">
    <postsFetchBySearch
      id="postsSearch"
      :fetchOnMount="true"
      @fetchedPosts="setPostsToResponse"
    />
    <hr>
    <postsBox v-if="posts"
      :postsArray="posts"
    />
  </section>
</template>

<script setup lang="ts">
  import {ref} from 'vue';
  import {Post} from '../../../backend/src/objects';
  import postsBox from './postsDisplayBox.vue';
  import postsFetchBySearch from './postsFetchBySearch.vue';

  const posts = ref<Post[]|undefined|false>(undefined);

  function setPostsToResponse(response:Post[]) {
    posts.value = response;
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