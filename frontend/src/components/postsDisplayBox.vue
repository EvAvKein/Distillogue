<template>
  <ul id="postsList">
      <li v-for="(post, i) in postsArray" :key="post.title + i">
        <postSummary :key="post.title + i"
          :title="post.title"
          :body="post.body"
          :lastActiveUnix="post.lastActiveUnix"
        />
      </li>
    </ul>
</template>

<script setup lang="ts">
  import postSummary from "./postSummary.vue";

  defineProps<{
    postsArray:{
      title:string,
      body:string,
      lastActiveUnix:number
    }[],
  }>();
</script>

<style scoped>
  #postsList {
    margin: 0.5em;
    padding: 0;
    list-style: none;
  }

  #postsList li + li {
    border-top: 0.25em solid var(--textSubColor);
  }
</style>