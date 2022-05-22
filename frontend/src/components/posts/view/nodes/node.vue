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
        <span v-if="node.stats.lastInteracted">Latest Interaction: <timestamp :pastUnix="node.stats.lastInteracted"/></span>
        <div>
          <votes v-if="node.stats.votes"
            :interactionPath="nodePath"
            :voters="node.stats.votes"
            @interactionError="(errorText:string) => {nodeError = errorText}"
          />
          <reply id="replyButton" :interactionPath="nodePath" :locked="undefined"/>
        </div>
      </section>
      <notification :text="nodeError" :desirablity-style="false"/>
    </article>
    <node v-for="reply of node.replies"
      :node="reply"
      :pathToNode="nodePath"
    />
  </section>
</template>

<script setup lang="ts">
  import {ref} from "vue";
  import {Node as NodeClass} from "../../../../../../backend/src/objects"; // importing without renaming it causes the vite to mix up this class (Node) with this component (node.vue, referenced in the template for recursion) and thus throw an error on runtime when trying to load a node with replies
  import timestamp from "../../../timestamp.vue";
  import votes from "./interactions/vote.vue";
  import reply from "./interactions/replyButton.vue";
  import notification from "../../../notification.vue";

  const props = defineProps<{
    node:NodeClass;
    pathToNode:NodeClass["id"][];
    isCentral?:true;
  }>();
  
  const nodePath = [...props.pathToNode, props.node.id];

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
  article > * + * {margin-top: 1.5em}

  h2, h3 {
    margin: 0;
  }

  p {
    white-space: pre-line;
  }

  #interactions > span {
    display: block;
    font-size: .9em;
    width: max-content;
    margin-left: auto;
  }

  #interactions > div {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 0.5em;
  }

  #replyButton {
    margin-top: 0.25em;
  }
</style>