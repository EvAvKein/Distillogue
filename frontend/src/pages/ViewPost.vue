<template>
  <main>
    <postDisplay v-if="post"
      :centralNode="post"
    />
    <notification v-else
      :text="notif.message"
      :desirablityStyle="notif.desirability"
    />
  </main>
</template>

<script setup lang="ts">
  import {ref} from 'vue';
  import notification from '../components/notification.vue';
  import postDisplay from "../components/postDisplay.vue"
  import {Node} from '../../../backend/src/objects';
  import {jsonFetch} from "../helpers/jsonFetch";
  import {useUser} from "../stores/user";
  const user = useUser();

  const props = defineProps<{
    postId:string;
  }>();
  
  const post = ref<Node|null|undefined>(undefined);
  const notif = ref({message: 'Fetching post...', desirability: undefined});

  jsonFetch("/getPost", {
    userId: user.data.id,
    postId: props.postId,
  }).then((response) => {
    if (response.error) {
      notif.value = {message: response.error.message, desirability: false}
      return;
    };
    post.value = response.data as Node;
  });
</script>

<style scoped>
</style>