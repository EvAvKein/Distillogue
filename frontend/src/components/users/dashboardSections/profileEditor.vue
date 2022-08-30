<template>
  <section>
    <labelledInput
      :inputId="'editProfileName'"
      :type="'text'"
      :label="'Name'"
      v-model="inputText.name.value"
    />
    <labelledInput
      :inputId="'editProfileAbout'"
      :type="'textarea'"
      :label="'About'"
      v-model="inputText.about.value"
    />
  </section>
</template>

<script setup lang="ts">
  import {reactive, watch} from "vue";
  import {useUser} from "../../../stores/user";
  import {UserPatchRequest} from "../../../../../shared/objects/api";
  import labelledInput from "../../labelledInput.vue";
  const user = useUser();

  const emit = defineEmits(["newState"]);

  const inputText = reactive({ // error fields are prep for clientside data validation, haven't implemented any checks yet since the limits haven't been decided on (as of 18.6.22)
    name: {value: user.data.name, error: ""},
    about: {value: user.data.about, error: ""},
  } as const);

  const inputKeys = Object.keys(inputText) as (keyof typeof inputText)[];

  watch(inputText, () => {
    const states = [] as UserPatchRequest[];

    inputKeys.forEach((inputKey) => {
      states.push(new UserPatchRequest(inputKey, inputText[inputKey].value));
    });
      
    emit("newState", states);
  });
</script>

<style scoped>
  section > * + * {margin-top: 1em}
</style>