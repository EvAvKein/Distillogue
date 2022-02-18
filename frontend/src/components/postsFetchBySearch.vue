<template>
  <div>
    <labelledInput id="postsSearch"
      :inputId="'postsSearchInput'"
      :type="'search'"
      v-model="searchValue"
      @input="debounce(fetchAndEmitPosts, 1000)"
    />
    <p v-show="summariesDescription">
      {{summariesDescription}}
    </p>
  </div>
</template>

<script setup lang="ts">
  import {ref, onMounted} from 'vue';
  import {Post} from '../../../backend/src/objects';
  import {jsonFetch} from "../helpers/jsonFetch";
  import {debounce} from "../helpers/debounce"
  import labelledInput from "./labelledInput.vue";
  import {useUser} from '../stores/user';
  const user = useUser();

  const props = defineProps<{fetchOnMount?:boolean}>();
  const emit = defineEmits(["fetchedPosts"]);

  const searchValue = ref<string>("");
  const summariesDescription = ref<string>("");
  
  function fetchAndEmitPosts() {
    summariesDescription.value = "Fetching Posts...";
    jsonFetch("/getPostSummaries", {userId: user.data.id, filter: searchValue.value})
    .then((fetchResponse) => {
      if (fetchResponse.error) {
        summariesDescription.value = "Connection error: Failed to fetch posts :(";
        return;
      };

      const fetchedPosts = fetchResponse.data as Post[];
      summariesDescription.value = `${fetchedPosts.length} result${fetchedPosts.length == 1 ? "" : "s"}${searchValue.value ? ` for "${searchValue.value}"` : ""}`;
      
      emit('fetchedPosts', fetchedPosts);
    });
  };

  onMounted(() => {
    if (props.fetchOnMount) {
      fetchAndEmitPosts()
    };
  });
</script>

<style scoped>
  p {
    font-size: 0.6em;
    margin: 0.4em;
  }
</style>