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
  import postsBox from './postsDisplayBox.vue';
  import postsFetchBySearch from './postsFetchBySearch.vue';

  interface post {
    title:string,
    body:string,
    lastActiveUnix:number,
  };

  const posts = ref<post[]|undefined|false>(undefined);

  function setPostsToResponse(response:post[]) {
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