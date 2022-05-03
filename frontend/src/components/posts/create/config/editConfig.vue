<template>
  <section>
    <details>
      <summary>Voting</summary>
      <div>
        <div>
          Upvotes:
          <input type="checkbox"
            @change="(event) => {editConfig(event, 'votes', 'up')}"
          />
        </div>
        <div>
          Downvotes:
          <input type="checkbox"
            @change="(event) => {editConfig(event, 'votes', 'down')}"
          />
        </div>
        <div>
          Anonymous:
          <input type="checkbox"
            @change="(event) => {editConfig(event, 'votes', 'anon')}"
          />
        </div>
      </div>
    </details>
    <details>
      <summary>Activity</summary>
      <div>
        <div>
          Last Active:
          <input type="checkbox"
            @change="(event) => {editConfig(event, 'lastActive')}"
          />
        </div>
      </div>
    </details>
    <details>
      <summary>Visibility</summary>
      <div>
        <div>
          Public:
          <input type="checkbox"
            @change="(event) => {editConfig(event, 'public')}"
          />
        </div>
      </div>
    </details>
  </section>
</template>

<script setup lang="ts">
  import {PostConfig} from "../../../../../../backend/src/objects";

  const props = defineProps<{
    config:PostConfig;
  }>();

  const emit = defineEmits(["update:config"]);
  function editConfig(event:Event, property:keyof PostConfig, subproperty?:"up"|"down"|"anon") { // for some reason typing subproperty as 'keyof PostConfig["votes"]' just ends up as undefined (and this project's lookupInOptional helper doesn't correct that)
    const newValue = (event.currentTarget as HTMLInputElement).checked || undefined;

    if (subproperty && !props.config[property]) {
      props.config[property as "votes"] = {};
    };

    if (subproperty) {
      props.config[property as "votes"]![subproperty] = newValue;
    } else {
      props.config[property] = newValue;
    };

    emit("update:config", props.config);
  };
</script>

<style scoped>
  section {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-evenly;
    gap: 0.75em;
  }

  details {
    min-width: 15em;
    max-width: 50%;
    background-color: var(--backgroundSubColor);
    border-radius: 0.5em;
  }
  details[open] {
    flex-basis: 100%;
    max-width: none;
  }

  summary {
    font-size: 1.25em;
    cursor: pointer;
    padding: 0.25em;
    padding-left: 0.5em;
  }

  details > div {
    display: flex;
    justify-content: space-around;
    padding: 1em;
  }
</style>