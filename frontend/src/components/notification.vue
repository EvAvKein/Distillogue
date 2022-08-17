<template>
  <transition name="notification">
    <p v-show="notifText" :class="'notification ' + styleClass">
      {{notifText}}
    </p>
  </transition>
</template>

<script setup lang="ts">
  import {ref, watch, computed} from "vue";
  import {debounce} from "../helpers/debounce";

  const props = defineProps<{
    text?:string,
    desirablityStyle?:boolean,
    customDuration?:number|null,
  }>();

  const emit = defineEmits(["expiration"]); // optional, to prompt the containing component to reset the text passed to here; had a bug with a component (signing.vue) in which resetting the value didn't work properly for a bewildering apparent lack of reason, so had to resort to this 

  const notifText = ref<string>(props.text || "");

  watch(() => props.text, (newText) => {
    notifText.value = newText || "";

    if (props.customDuration !== null && notifText.value !== "") {
      debounce(
        () => {
          notifText.value = "";
          emit("expiration");
        },
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

  .notification-enter-from {
    max-height: 0em;
    opacity: 0;
  }
  .notification-enter-to {
    max-height: 15em;
    opacity: 1;
  }
  .notification-enter-active {
    transition: all 300ms ease-in;
  }
  /* no leave transition because when the text is removed the element instantly snaps to its minimum size, and any transition after that only gives the user more time to notice what remains after the snapping. a fix to prevent/minimize the snapping would be much appreciated */
</style>