<template>
  <p v-show="text" :class="'notification ' + styleClass">
    {{text}}
  </p>
</template>

<script setup lang="ts">
  import {computed} from "vue";
  const props = defineProps<{
    text?:string,
    desirablityStyle?:boolean,
  }>();

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