<template>
  <section>
    <button v-for="preset in defaultPresets.concat(user.data.configPresets)"
      @click="emitConfigChange(preset)"
      type="button"
    >
      <img v-if="defaultPresetNames.includes(preset.name)"
        src="../../../../assets/defaultConfig.svg"
      />
        <!-- vite can't handle ternary src, at least currently (2.7.2) -->
      <img v-else
        src="../../../../assets/customConfig.svg"
      />
      <span>{{preset.name || "[No Title, Edit in Dashboard]"}}</span>
    </button>
  </section>
</template>

<script setup lang="ts">
  import {UserData} from "../../../../../../shared/objects";
  import {useUser} from "../../../../stores/user";
  const user = useUser();

  const props = defineProps<{
    chosenPreset?:UserData["configPresets"][number];
  }>();

  const emit = defineEmits(["update:chosenPreset"]);

  const defaultPresets = [
    {
      name: "Reset Selection",
      config: {}
    },
    {
      name: "Everything",
      config: {
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
    }
  ] as UserData["configPresets"];

  const defaultPresetNames = defaultPresets.map((preset) => {return preset.name});

  function emitConfigChange(configPreset:UserData["configPresets"][number]) {
    emit("update:chosenPreset", configPreset);
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