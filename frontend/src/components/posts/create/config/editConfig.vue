<template>
  <section id="editConfig">
    <details>
      <summary>Voting</summary>
      <div>
        <label>
          Upvotes:
          <input type="checkbox" id="votes.up"
            @change="(event) => {updateConfigByCheckbox(event, 'votes', 'up')}"
          />
        </label>
        <label>
          Downvotes:
          <input type="checkbox"  id="votes.down"
            @change="(event) => {updateConfigByCheckbox(event, 'votes', 'down')}"
          />
        </label>
        <label>
          Anonymous:
          <input type="checkbox" id="votes.anon"
            @change="(event) => {updateConfigByCheckbox(event, 'votes', 'anon')}"
          />
        </label>
      </div>
    </details>
    <details>
      <summary>Activity</summary>
      <div>
        <label>
          Last Active:
          <input type="checkbox" id="lastActive"
            @change="(event) => {updateConfigByCheckbox(event, 'lastActive')}"
          />
        </label>
      </div>
    </details>
    <details>
      <summary>Visibility</summary>
      <div>
        <label>
          Public:
          <input type="checkbox" id="public"
            @change="(event) => {updateConfigByCheckbox(event, 'public')}"
          />
        </label>
      </div>
    </details>
  </section>
</template>
<!-- checkboxes and/or details should probably be turned into components. not high priority, just that there's a lot of code duplication in this template -->

<script setup lang="ts">
  import {watch, toRef} from "vue";
  import {PostConfig} from "../../../../../../backend/src/objects";
  import {propertiesByType} from "../../../../helpers/propertiesByType";

  const props = defineProps<{
    config:PostConfig;
    presetOverride?:PostConfig;
  }>();

  const emit = defineEmits(["update:config"]);

  type keysOfObjectsInPostConfig = keyof NonNullable<propertiesByType<PostConfig, object>>;
  type keysInObjectsOfPostConfig = keyof NonNullable<PostConfig[keysOfObjectsInPostConfig]>;

  function editConfigProperty(newValue:true|undefined, property:keyof PostConfig, subproperty?:keysInObjectsOfPostConfig) {
    if (!subproperty) {
      props.config[property] = newValue;
      return;
    };
    
    if (subproperty && !props.config[property]) {
      props.config[property as "votes"] = {};
    };

    props.config[property as keysOfObjectsInPostConfig]![subproperty] = newValue;

    if (typeof props.config[property] === "object" && Object.keys(props.config[property] as object).length == 0) {
      props.config[property] = undefined;
    };
  };

  function checkboxEventToConfigValue(event:Event) {
    return (event.currentTarget as HTMLInputElement).checked || undefined;
  };
    
  function updateConfigByCheckbox(event:Event, property:keyof PostConfig, subproperty?:keysInObjectsOfPostConfig) {
    editConfigProperty(checkboxEventToConfigValue(event), property, subproperty);
    emit("update:config", props.config);
  };

  function updateConfigByPreset(configPreset:PostConfig) {
    document.querySelectorAll<HTMLInputElement>("#editConfig input").forEach((inputElement) => {
      const configProperties = inputElement.id.split(".");
      const property = configProperties[0] as keyof PostConfig;
      const subProperty = configProperties[1] as keysInObjectsOfPostConfig|undefined;

      if (subProperty) {
        inputElement.checked = (configPreset[property as keysOfObjectsInPostConfig])?.[subProperty] || false;
      } else {
        inputElement.checked = (configPreset[property] as true|undefined) || false;
      };
    });

    emit("update:config", configPreset);
  };

  const presetOverride = toRef(props, "presetOverride");
  watch(presetOverride, () => {
    if (presetOverride.value) {
      updateConfigByPreset(presetOverride.value)
    };
  });
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