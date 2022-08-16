<template>
  <section :aria-label="open ? 'Opened category' : 'Closed category'"> <!-- here for ease of testing, and as a substitute for the equivalent <details> attribute -->
    <button
      class="core_contentButton"
      type="button"
      @click="open = !open"
    >
      <slot name="summary"></slot>
    </button>
    <transition name="collapse" v-show="open">
      <slot name="content"></slot>
    </transition>
  </section>
</template>

<script setup lang="ts">
  import {ref} from "vue";

  const props = defineProps<{
    openByDefault?:true;
  }>();

  const open = ref(props.openByDefault || false);
</script>

<style scoped>
  button {
    width: 100%;
    color: inherit;
    background-color: transparent;
    text-align: unset;
    padding: 0;
  }
</style>