<template>
  <section id="editConfig">
    <category title="Access" :openByDefault="true">
      <label>
        Public: <input id="public" type="checkbox" @change="updateConfigByCheckbox">
      </label>
    </category>
    <category title="Voting">
      <label>
        Upvotes: <input id="votes.up" type="checkbox" @change="updateConfigByCheckbox"/>
      </label>
      <label>
        Downvotes: <input id="votes.down" type="checkbox" @change="updateConfigByCheckbox"/>
      </label>
      <label>
        Anonymous: <input id="votes.anon" type="checkbox"  @change="updateConfigByCheckbox"/>
      </label>
    </category>
    <category title="Activity">
      <label>
        Last Interacted: <input id="lastInteracted" type="checkbox" @change="updateConfigByCheckbox"/>
      </label>
    </category>
  </section>
</template>

<script setup lang="ts">
  import {watch, toRef, onMounted} from "vue";
  import {PostConfig} from "../../../../../../backend/src/objects";
  import {propertiesByType} from "../../../../helpers/propertiesByType";
  import category from "./configCategory.vue";

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

  label {width: max-content}

  @media (min-width: 40rem) {
    section {display: block}
    section > * {width: 100%}
    section > * + * {margin-top: 0.5em}
  }
</style>