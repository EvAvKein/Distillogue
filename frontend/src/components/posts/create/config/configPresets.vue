<template>
  <section>
    <button @click="emitConfigChange('blank')">
      <img src="../../../../assets/work-in-progress.svg">
      Wipe Config
    </button>
    <button @click="emitConfigChange('testEverything')">
      <img src="../../../../assets/work-in-progress.svg">
      Test Everything
    </button>
  </section>
</template>

<script setup lang="ts">
  import {PostConfig} from '../../../../../../backend/src/objects';
  

  const configs = {
    blank: {},
    testEverything: {
      lastActive: true,
      votes: {
        up: true,
        down: true,
        anon: true,
      },
    },
  };

  type configsObject = typeof configs;

  const props = defineProps<{
    chosenPreset?:PostConfig;
  }>();

  const emit = defineEmits(["update:chosenPreset"]);

  function emitConfigChange(configName:keyof configsObject) {
    emit("update:chosenPreset", configs[configName]);
  };
</script>

<style scoped>
  section {
    display: flex;
    justify-content: space-evenly;
    flex-wrap: wrap;
    gap: 0.25em;
  }

  button {
    color: var(--textColor);
    background-color: var(--backgroundSubColor);
    border-radius: 1em;
    padding: 0.5em 0.75em;
    text-align: center;
    cursor: pointer;
  }
  
  button img {
    display: block;
    height: 2.5em;
    margin: auto;
  }
</style>