<template>
  <section id="editConfig">
    <category v-if="!hideUnsavables" title="Access" class="category" :openByDefault="true">
      <label>
        Public: <input id="access.public" type="checkbox" @change="updateConfigByCheckbox">
      </label>
    </category>
    <category title="Timestamps" class="category">
      <label>
        Posted: <input id="timestamps.posted" type="checkbox" @change="updateConfigByCheckbox"/>
      </label>
      <label>
        Latest Interacted: <input id="timestamps.latestInteracted" type="checkbox" @change="updateConfigByCheckbox"/>
      </label>
    </category>
    <category title="Voting" class="category">
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
  </section>
</template>

<script setup lang="ts">
  import {watch, toRef, onMounted} from "vue";
  import {PostConfig} from "../../../../../../shared/objects";
  import {propertiesByType} from "../../../../helpers/propertiesByType";
  import category from "./configCategory.vue";

  const props = defineProps<{
    config:PostConfig;
    presetOverride?:PostConfig;
    hideUnsavables?:true;
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

  function editConfigProperty(property:keyof PostConfig, subproperty:keysInObjectsOfPostConfig, newValue:true|undefined) {    
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
    const subProperty = configProperties[1] as keysInObjectsOfPostConfig;

    editConfigProperty(property, subProperty, checkboxEventToConfigValue(event));
    emit("update:config", props.config);
  };

  let inputsAffectedByPresets = [] as HTMLInputElement[];
  onMounted(() => {
    const presetDetailsElements = Array.from(document.querySelectorAll<HTMLDetailsElement>("#editConfig details"))
      .filter((detailsElement) => {
        return detailsElement.querySelector("summary")!.innerText === "Access" ? false : detailsElement;
      });
    presetDetailsElements.forEach((category) => {
      const inputsInCategory = Array.from(category.querySelectorAll<HTMLInputElement>("input"));
      inputsAffectedByPresets =  inputsAffectedByPresets.concat(inputsInCategory);
    });

    updateConfigByPreset(props.config);
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
  label {width: max-content}

  section {display: block}
  .category + .category {margin-top: 0.5em}
</style>