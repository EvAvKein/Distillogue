<template>
  <p v-show="notifText" :class="'notification ' + styleClass">
    {{notifText}}
  </p>
</template>

<script setup lang="ts">
  import {ref, watch, computed} from "vue";
  import {debounce} from "../helpers/debounce";

  const props = defineProps<{
    text?:string,
    desirablityStyle?:boolean,
    customDuration?:number|null,
  }>();

  const notifText = ref<string>(props.text || "");

  watch(() => props.text, (newText) => {
    notifText.value = newText || "";

    if (props.customDuration !== null && notifText.value !== "") {
      debounce(
        () => {notifText.value = ""},
        props.customDuration || 3000 + (notifText.value.length * 150)
      )};
  });

  const styleClass = computed(() => {
    if (props.desirablityStyle === true) {return "positive"};
    if (props.desirablityStyle === false) {return "negative"};
    return "";
  });
</script>

<style scoped>
  .notification {
    width: fit-content;
    text-align: center;
    font-size: 1em;
    padding: 0.3em;
    color: var(--textColor);
    background-color: #797979;
    border-inline: 0.2em solid #505050;
    margin: 0.75em auto 0.75em;
  }
  .notification.negative {
    border-color: #ff0000;
    background-color: #ff000088;
  }
  .notification.positive {
    border-color: #00ff00;
    background-color: #00ff0088;
  }
</style>