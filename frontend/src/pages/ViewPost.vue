<template>
  <main>
    <postContainer v-if="post"
      :postObject="post"
    />
    <notification v-else
      :text="notif.message"
      :desirablityStyle="notif.desirability"
    />
  </main>
</template>

<script setup lang="ts">
  import {ref} from "vue";
  import notification from "../components/notification.vue";
  import {Node} from "../../../shared/objects/post";
  import {jsonFetch} from "../helpers/jsonFetch";
  import {useUser} from "../stores/user";
  import postContainer from "../components/posts/view/postContainer_core.vue";

  const user = useUser();

  const props = defineProps<{
    postId:string;
  }>();
  
  const post = ref<Node|undefined>(undefined);
  const notif = ref<{message:string, desirability?:boolean}>({message: "Fetching post...", desirability: undefined});

  jsonFetch("GET", "/posts/" + props.postId, null, user.data.authKey)
  .then((response) => {
    if (response.error) {
      notif.value = {message: response.error.message, desirability: false};
      return;
    };
    post.value = response.data as Node;
  });
</script>

<style scoped>
</style>