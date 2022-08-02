<template>
  <button @click="saveDraft"
    type="button"
    class="core_backgroundButton"
    :disabled="typeAtCapacity ? true : false"
  >
    {{typeAtCapacity ? `${type}s at capacity` : `Save ${type}`}}
  </button>
</template>

<script setup lang="ts">
  import {computed} from "vue";
  import {UserData, UserPatchRequest} from "../../../../shared/objects";
  import {deepCloneFromReactive} from "../../helpers/deepCloneFromReactive";
  import {unix as unixStamp} from "../../../../shared/helpers/timestamps";
  import {jsonFetch} from "../../helpers/jsonFetch";
  import {useUser} from "../../stores/user";
  const user = useUser();

  const props = defineProps<{
    type:"draft"|"preset";
    data:Omit<UserData["drafts"][number], "lastEdited"> | UserData["configPresets"][number];
  }>();
  const emit = defineEmits(["error"]);

  const typeDataName = props.type === "draft" ? "drafts" : "configPresets";

  const typeAtCapacity = computed(() => user.data[typeDataName].length >= 3);

  async function saveDraft() {
    if (typeAtCapacity.value) return; // the button using this would be disabled in the first place, but i added this for the function's completeness (and an extra precaution)

    const savedData = props.type === "draft"
      ? {
          title: (props.data as UserData["drafts"][number]).title,
          body: (props.data as UserData["drafts"][number]).body,
          lastEdited: unixStamp()
        }
      : props.data
    ;

    const newTypeState = [
      ...deepCloneFromReactive(user.data[typeDataName]),
      savedData
    ];
    
    const response = await jsonFetch("PATCH", "/user/me",
      [new UserPatchRequest(typeDataName, newTypeState)],
      user.data.authKey
    );

    if (response.error) {
      emit("error", response.error.message);
      return;
    };
    
    user.data[typeDataName] = newTypeState as any; // considering the circumstances, i dont think coercing an "any" here is actually harmful
  };
</script>

<style scoped>
  button {
    display: block;
    margin: auto;
    text-transform: capitalize;
  }

  button[disabled] {
    opacity: 0.8;
  }
</style>