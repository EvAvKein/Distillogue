<template>
  <section>
    <button @click="emitConfigChange('blank')" type="button">
      <img src="../../../../assets/work-in-progress.svg">
      Wipe Config
    </button>
    <button @click="emitConfigChange('testEverything')" type="button">
      <img src="../../../../assets/work-in-progress.svg">
      Test Everything
    </button>
  </section>
</template>

<script setup lang="ts">
  import {PostConfig} from '../../../../../../shared/objects';
  

  const configs = {
    blank: {},
    testEverything: {
      timestamps: {
        posted: true,
        latestInteracted: true,
      },
      votes: {
        up: true,
        down: true,
        anon: true,
      },
    },
  } as const;

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
  }
  button:hover, button:focus {
    color: var(--highlightSubColor);
    outline: none;
  }
  button:active {color: var(--highlightColor)}
  
  button img {
    display: block;
    height: 2.5em;
    margin: auto;
  }
  button:hover img, button:focus img {
    filter: var(--filterToHighlightSubColor);
    outline: none;
  }
  button:active img {filter: var(--filterToHighlightColor)}
</style>