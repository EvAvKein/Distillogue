<template>
  <section>
    <article :id="isCentral ? 'central' : ''">
      <component v-if="node.title"
        :is="'h' + (isCentral ? 2 : 3)"
      >
        {{node.title}}
      </component>
      <p>{{node.body || typeof node.body}}</p>
      <section id="interactions">
        <votes v-if="postConfig?.votes"
          :upvoters="node.stats.votes.up"
          :downvoters="node.stats.votes.down"
          @interactionError="(errorText:string) => {nodeError = errorText}"
        />
        <reply :locked="undefined"/>
      </section>
      <notification :text="nodeError" :desirablity-style="false"/>
    </article>
    <node v-for="reply of node.replies"
      :node="reply"
    />
  </section>
</template>

<script setup lang="ts">
  import {provide, inject, ref, Ref} from "vue";
  import {PostConfig, Node as NodeClass} from "../../../../../../backend/src/objects"; // importing without renaming it causes the vite to mix up this class (Node) with this component (node.vue, referenced in the template for recursion) and thus throw an error on runtime when trying to load a node with replies
  import votes from "./interactions/vote.vue";
  import reply from "./interactions/replyButton.vue";
  import notification from "../../../notification.vue";

  const props = defineProps<{
    node:NodeClass;
    isCentral?:true;
  }>();

  provide("nodeId", props.node.id);

  const postConfig = inject<Ref<PostConfig>>("postConfig");

  const nodeError = ref<string>("");
</script>

<style scoped>
  article {
    background-color: var(--backgroundSubColor);
    padding: 1em;
    border-radius: 1em;
    max-width: 45em;
  }
  article#central {font-size: 1.1em}
  article * + * {margin-top: 1.5em}

  h3, h4 {
    margin: 0;
  }

  p {
    white-space: pre-line;
  }

  #interactions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 0.5em;
  }
</style>