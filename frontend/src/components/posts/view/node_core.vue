<template>
  <section class="node" :id="centralNode ? 'central' : undefined">
    <h2 v-if="centralNode">{{node.title}}</h2>
    <button v-else
      class="core_contentButton"
      @click="emitExpandToggle"
    >
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
</template>

<script setup lang="ts">
  import {ref} from "vue";
  import {Node as NodeObj} from "../../../../../shared/objects"; // importing without renaming it causes vite to mix up this class (Node) with this component (node.vue, referenced in the template for recursion) and thus throw an error on runtime when trying to load a node with replies
  import timestamps from "../nodeTimestamps.vue";
  import votes from "./nodeInteractions/vote.vue";
  import reply from "./nodeInteractions/replyButton.vue";
  import notification from "../../notification.vue";

  const props = defineProps<{
    node:NodeObj;
    pathToNode:NodeObj["id"][];
    expanded:boolean;
  }>();
  const emit = defineEmits(["update:expanded"]);

  const centralNode = !props.pathToNode.length;
  const nodePath = [...props.pathToNode, props.node.id];

  function emitExpandToggle() {emit("update:expanded", !props.expanded)}

  const nodeError = ref<string>("");
</script>

<style scoped>
  .titleButton {
    color: inherit;
    text-align: inherit;
    background-color: inherit;
    padding: 0;
    width: 100%;
  }
  h2, h3 {margin: 0}

  p {white-space: pre-line}

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