<template>
  <section>
    <details>
      <summary>Voting</summary>
      <div>
        <label>
          Upvotes:
          <input type="checkbox"
            @change="(event) => {editConfig(event, 'votes', 'up')}"
          />
        </label>
        <label>
          Downvotes:
          <input type="checkbox"
            @change="(event) => {editConfig(event, 'votes', 'down')}"
          />
        </label>
        <label>
          Anonymous:
          <input type="checkbox"
            @change="(event) => {editConfig(event, 'votes', 'anon')}"
          />
        </label>
      </div>
    </details>
    <details>
      <summary>Activity</summary>
      <div>
        <label>
          Last Active:
          <input type="checkbox"
            @change="(event) => {editConfig(event, 'lastActive')}"
          />
        </label>
      </div>
    </details>
    <details>
      <summary>Visibility</summary>
      <div>
        <label>
          Public:
          <input type="checkbox"
            @change="(event) => {editConfig(event, 'public')}"
          />
        </label>
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
    align-content: flex-start;
    gap: 0.75em;
  }

  details {
    height: fit-content;
    width: fit-content;
    background-color: var(--backgroundSubColor);
    border-radius: 0.5em;
  }
  details[open] {width: 100%}

  summary {
    font-size: 1.25em;
    cursor: pointer;
    padding: 0.25em 0.5em;
  }

  details > div {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
    padding: 0.5em 1em 1em;
    gap: 0.5em 1.25em;
  }

  @media (min-width: 40rem) {
    section {display: block}
    details {width: 100%}
    details + details {margin-top: 0.5em}
  }
</style>