<template>
  <div>
    <labelledInput id="postsSearch"
      :inputId="'summariesSearchInput'"
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
  import {ref, onMounted} from "vue";
  import {PostSummary} from "../../../../../backend/src/objects";
  import {jsonFetch} from "../../../helpers/jsonFetch";
  import {debounce} from "../../../helpers/debounce";
  import labelledInput from "../../labelledInput.vue";
  import {useUser} from "../../../stores/user";
  const user = useUser();

  const props = defineProps<{fetchAllOnMount?:true}>();
  const emit = defineEmits(["fetchedSummaries"]);

  const searchValue = ref<string>("");
  const summariesDescription = ref<string>("");

  async function fetchAndEmitPosts() {
    summariesDescription.value = "Fetching Posts...";

    const fetchResponse = await jsonFetch("GET", "/posts/" + searchValue.value , null, user.data.authKey);
    if (fetchResponse.error) {
      summariesDescription.value = fetchResponse.error.message;
      return;
    };

    const fetchedPosts = fetchResponse.data as PostSummary[];
    summariesDescription.value = `${fetchedPosts.length} result${fetchedPosts.length !== 1 ? "s" : ""}${searchValue.value ? ` for "${searchValue.value}"` : ""}`;
      
    emit("fetchedSummaries", fetchedPosts);
  };

  onMounted(() => {
    if (props.fetchAllOnMount) {
      fetchAndEmitPosts();
    };
  });
</script>

<style scoped>
  p {
    font-size: 0.6em;
    margin: 0.4em;
  }
</style>