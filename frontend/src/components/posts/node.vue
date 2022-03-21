<template>
  <section>
    <article :class="isCentral ? 'central' : false">
      <component v-if="node.title"
        :is="'h' + (isCentral ? 3 : 4)"
      >
        {{node.title}}
      </component>
      <p>{{node.body}}</p>
      <section>
        <votes v-if="node.stats.upvoters || node.stats.downvoters"
          :upvoters="node.stats.upvoters"
          :downvoters="node.stats.downvoters"
          @component-error="displayError"
        />
      </section>
      <notification :text="nodeError" :desirablity-style="false"/>
    </article>
    <node v-for="child in node.replies"
      :node="child"
      :isCentral="false"
    />
  </section>
</template>

<script setup lang="ts">
  import {provide, ref} from "vue";
  import {Node} from "../../../../backend/src/objects";
  import votes from "./votes.vue";
  import notification from "../notification.vue";
  import {debounce} from "../../helpers/debounce";

  const props = defineProps<{
    node:Node;
    isCentral:boolean;
  }>();

  provide("nodeId", props.node.id);

  const nodeError = ref<string>('');
  function displayError(errorMessage:string) {
    nodeError.value = errorMessage;
    debounce(() => {nodeError.value = ''}, 3000);
  };
</script>

<style scoped>
  article {
    background-color: var(--backgroundSubColor);
    padding: 1em;
    border-radius: 1em;
    max-width: 45em;
  }
  article.central {font-size: 1.1em}
  article * + * {margin-top: 1.5em}

  h3, h4 {margin: 0}
  
  p {white-space: pre-line}
</style>