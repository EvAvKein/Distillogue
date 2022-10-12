<template>
  <section>
    <labelledInput
      :inputId="'editProfileName'"
      :type="'text'"
      :label="'Name'"
      v-model="inputText.name.value"
    />
  </section>
</template>

<script setup lang="ts">
  import {reactive, watch} from "vue";
  import {useUser} from "../../../stores/user";
  import {UserPatchRequest} from "../../../../../shared/objects/api";
  import {editableUserData} from "../../../../../shared/objects/user";
  import labelledInput from "../../labelledInput.vue";
  const user = useUser();

  const emit = defineEmits(["newState"]);

  const inputText = reactive({ // error fields are prep for clientside data validation, haven't implemented any checks yet since the limits haven't been decided on (as of 18.6.22)
    name: {value: user.data!.name, error: ""},
  } as const);

  const inputKeys = Object.keys(inputText) as (keyof typeof inputText)[];

  watch(inputText, () => {
    const states = [] as UserPatchRequest<editableUserData>[];

    inputKeys.forEach((inputKey) => {
      states.push(new UserPatchRequest(inputKey, inputText[inputKey].value));
    });
      
    emit("newState", states);
  });
</script>

<style scoped>
  section > * + * {margin-top: 1em}
</style>