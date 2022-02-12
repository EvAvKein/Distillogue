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
  import {jsonFetch} from "../helpers/jsonFetch";
  import {fetchResponse} from '../../../backend/src/devInterfaces';
  import {debounce} from "../helpers/debounce"
  import labelledInput from "./labelledInput.vue";

  const props = defineProps<{fetchOnMount?:boolean}>();
  const emit = defineEmits(["fetchedPosts"]);

  const searchValue = ref<string>("");
  const summariesDescription = ref<string>("");
  
  function fetchAndEmitPosts() {
    summariesDescription.value = "Fetching Posts...";
    jsonFetch("/getPostSummaries", {filter: searchValue.value})
    .then((fetchResponse:fetchResponse) => {
      if (fetchResponse.error) {
        summariesDescription.value = "Connection error: Failed to fetch posts :(";
        return;
      };

      const fetchedPosts = fetchResponse.data;
      summariesDescription.value = `${(fetchedPosts as object[]).length} result${(fetchedPosts as object[]).length == 1 ? "" : "s"}${searchValue.value ? ` for "${searchValue.value}"` : ""}`;
      
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