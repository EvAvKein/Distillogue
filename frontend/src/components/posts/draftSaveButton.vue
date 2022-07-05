<template>
  <button @click="saveDraft"
    type="button"
    class="core_backgroundButton"
    :disabled="draftsAtCapacity ? true : false"
  >
    {{draftsAtCapacity ? "Drafts at capacity" : "Save draft"}}
  </button>
</template>

<script setup lang="ts">
  import {computed} from "vue";
  import {Node, UserPatchRequest} from "../../../../shared/objects";
  import {deepCloneFromReactive} from "../../helpers/deepCloneFromReactive";
  import {unix as unixStamp} from "../../../../shared/helpers/timestamps";
  import {jsonFetch} from "../../helpers/jsonFetch";
  import {useUser} from "../../stores/user";
  const user = useUser();

  const props = defineProps<{
    sourceTitle:Node["title"];
    sourceBody:Node["body"]; 
  }>();
  const emit = defineEmits(["error"]);

  const draftsAtCapacity = computed(() => user.data.drafts.length >= 3);

  async function saveDraft() {
    if (draftsAtCapacity.value) return; // the button using this would be disabled in the first place, but i added this for the function's completeness (and an extra precaution)

    const newDraftsState = [...deepCloneFromReactive(user.data.drafts), {
      title: props.sourceTitle,
      body: props.sourceBody,
      lastEdited: unixStamp(),
    }];
    
    const response = await jsonFetch("PATCH", "/user/me",
      [new UserPatchRequest("drafts", newDraftsState)],
      user.data.authKey
    );

    if (response.error) {
      emit("error", response.error.message);
      return;
    };
    
    user.data.drafts = newDraftsState;
  };
</script>

<style scoped>
  button[disabled] {
    opacity: 0.8;
  }
</style>