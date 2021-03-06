<template>
  <section class="nodeBranch">
    <section :class="'node'" :id="isCentral ? 'central' : undefined">
      <h2 v-if="isCentral">{{node.title}}</h2>
      <button v-else @click="() => {expanded = !expanded}">
        <h3>{{node.title}}</h3>
      </button>
      <section v-show="expanded"
        class="body"
      >
        <p>{{node.body}}</p>
        <section class="interactions">
          <timestamps v-if="node.stats.timestamps" 
            :timestamps="node.stats.timestamps"
            class="timestamps"
          />
          <div>
            <votes v-if="node.stats.votes"
              :interactionPath="nodePath"
              :voters="node.stats.votes"
              @interactionError="(errorText:string) => {nodeError = errorText}"
            />
            <reply :locked="node.locked"
              :interactionPath="nodePath"
              class="replyButton" 
            />
          </div>
        </section>
      </section>
      <notification :text="nodeError" :desirablity-style="false"/>
    </section>
    <section v-show="expanded"
      class="replies"
    >
      <node v-for="reply of node.replies"
        :node="reply"
        :pathToNode="nodePath"
      />
    </section>
  </section>
</template>

<script setup lang="ts">
  import {ref} from "vue";
  import {Node as NodeObj} from "../../../../../../shared/objects"; // importing without renaming it causes vite to mix up this class (Node) with this component (node.vue, referenced in the template for recursion) and thus throw an error on runtime when trying to load a node with replies
  import timestamps from "../../nodeTimestamps.vue";
  import votes from "./interactions/vote.vue";
  import reply from "./interactions/replyButton.vue";
  import notification from "../../../notification.vue";

  const props = defineProps<{
    node:NodeObj;
    pathToNode:NodeObj["id"][];
    isCentral?:true;
  }>();
  
  const nodePath = [...props.pathToNode, props.node.id];

  const expanded = ref(props.isCentral ? true : false);

  const nodeError = ref<string>("");
</script>

<style scoped>
  .node {
    background-color: var(--backgroundSubColor);
    padding: 1em;
    border-radius: 1em;
    min-width: 15em;
    max-width: 45em;
    margin: 1em auto 0;
  }
  .node#central {
    font-size: 1.1em;
    margin-top: 0;
  }

  .node > button {
    color: inherit;
    text-align: inherit;
    background-color: inherit;
    padding: 0;
    width: 100%;
  }
  
  .node > * + * {margin-top: 1.25em}

  h2, h3 {margin: 0}
  h2 {font-size: 1.6em}
  h3 {font-size: 1.5em}

  p {
    white-space: pre-line;
  }

  .timestamps {
    font-size: 0.9em;
    margin-bottom: 0.25em;
  }

  .interactions > div {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 0.5em;
  }

  .replyButton {
    margin: 0.5em 0.25em 0 auto;
  }
</style>