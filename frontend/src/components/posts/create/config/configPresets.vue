<template>
  <section>
    <button id="reset"
      @click="emitConfigChange('blank')" type="button"
    >
      <img src="../../../../assets/reset.svg">
      <span>Reset Selection</span>
    </button>
    <button @click="emitConfigChange('everything')" type="button">
      <img src="../../../../assets/defaultConfig.svg">
      <span>Everything!</span>
    </button>
  </section>
</template>

<script setup lang="ts">
  import {PostConfig} from '../../../../../../shared/objects';
  

  const configs = {
    blank: {},
    everything: {
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
  button {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: center;
    gap: 0.5em;
    width: 100%;
    color: var(--textColor);
    background-color: var(--backgroundSubColor);
    border-radius: 1em;
    padding: 0.5em 0.75em;
  }
  button:hover, button:focus {
    color: var(--highlightSubColor);
    outline: none;
  }
  button:active {color: var(--highlightColor)}
  
  button img {height: 2em}
  button:hover img, button:focus img {
    filter: var(--filterToHighlightSubColor);
    outline: none;
  }
  button:active img {filter: var(--filterToHighlightColor)}

  button span {font-size: 1.5em}

  button + button {margin-top: 0.5em}
</style>