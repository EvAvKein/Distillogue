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
    <category title="Timestamps">
      <label>
        Latest Interaction: <input id="timestamps.latestInteraction" type="checkbox" @change="updateConfigByCheckbox"/>
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

  type keysFromAllObjects<T> = T extends object ? keyof T : never;

  type keysOfObjectsInPostConfig = keyof propertiesByType<PostConfig, object>;
  type keysInObjectsOfPostConfig = keysFromAllObjects<PostConfig[keysOfObjectsInPostConfig]>;

  type configProperty = "votes"; 
    // i tried and failed to create a generic which either:
      // 1. dynamically narrows the subproperty param's union to only the keys that fit whichever object PostConfig[property] is attempting to resolve to
      // 2. dynamically narrows the property param's union to whichever key refers to the object that includes the subproperty key being passed
    // i'm not even sure these kinds of behaviors are possible, i might be thinking about this way too imperatively
  type configSubproperty = "up";

  function editConfigProperty(newValue:true|undefined, property:keyof PostConfig, subproperty?:keysInObjectsOfPostConfig) {
    if (!subproperty) {
      newValue
        ? props.config[property] = newValue
        : delete props.config[property];
      return;
    };
    
    if (subproperty && !props.config[property]) {
      props.config[property as keysOfObjectsInPostConfig] = {};
    };

    newValue
      ? props.config[property as configProperty]![subproperty as configSubproperty] = newValue
      : delete props.config[property as configProperty]![subproperty as configSubproperty];

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
        inputElement.checked = (configPreset[property as configProperty])?.[subProperty as configSubproperty] || false;
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