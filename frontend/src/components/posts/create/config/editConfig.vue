<template>
  <section id="editConfig">
    <details>
      <summary>Access</summary> <!-- conflicted on this section's name. alternatives (including but not limited to): visibility, exposure -->
      <div>
        <label>
          Public:
          <input type="checkbox" id="public"
            @change="updateConfigByCheckbox"
          />
        </label>
      </div>
    </details>
    <details>
      <summary>Voting</summary>
      <div>
        <label>
          Upvotes:
          <input type="checkbox" id="votes.up"
            @change="updateConfigByCheckbox"
          />
        </label>
        <label>
          Downvotes:
          <input type="checkbox" id="votes.down"
            @change="updateConfigByCheckbox"
          />
        </label>
        <label>
          Anonymous:
          <input type="checkbox" id="votes.anon"
            @change="updateConfigByCheckbox"
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
            @change="updateConfigByCheckbox"
          />
        </label>
      </div>
    </details>
    {{props.config}}
  </section>
</template>
<!-- checkboxes and/or details should probably be turned into components. not high priority, just that there's a lot of code duplication in this template -->

<script setup lang="ts">
  import {watch, toRef, onMounted} from "vue";
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
      newValue
        ? props.config[property] = newValue
        : delete props.config[property];
      return;
    };
    
    if (subproperty && !props.config[property]) {
      props.config[property as "votes"] = {};
    };

    newValue
      ? props.config[property as keysOfObjectsInPostConfig]![subproperty] = newValue
      : delete props.config[property as keysOfObjectsInPostConfig]![subproperty];

    if (typeof props.config[property] === "object" && Object.keys(props.config[property] as object).length == 0) {
      delete props.config[property];
    };
  };

  function checkboxEventToConfigValue(event:Event) {
    return (event.currentTarget as HTMLInputElement).checked || undefined;
  };
    
  function updateConfigByCheckbox(event:Event) {
    const configProperties = (event.target as HTMLInputElement).id.split(".");
    const property = configProperties[0] as keyof PostConfig;
    const subProperty = configProperties[1] as keysInObjectsOfPostConfig|undefined;

    editConfigProperty(checkboxEventToConfigValue(event), property, subProperty);
    emit("update:config", props.config);
  };

  let inputsAffectedByPresets = [] as HTMLInputElement[];
  onMounted(() => {
    inputsAffectedByPresets = Array.from(document.querySelectorAll<HTMLInputElement>("#editConfig input")).filter((input) => {
      return !["public"].includes(input.id);
    });
  });

  function updateConfigByPreset(configPreset:PostConfig) {
    inputsAffectedByPresets.forEach((inputElement) => {
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