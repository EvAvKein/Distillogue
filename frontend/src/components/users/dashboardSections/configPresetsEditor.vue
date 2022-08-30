<template>
  <section>
    <transition name="collapse">
      <button v-for="(preset, index) in presetsState"
        type="button"
        class="presetButton core_backgroundButton"
        @click="() => {selectPreset(index)}"
      >
        <p>{{preset.name || "[No Title]"}}</p>
      </button>
    </transition>

    <transition name="collapse">
      <button v-if="presetsState.length < maxPresets"
        id="newPreset"
        class="core_backgroundButton"
        @click="createNewPreset"
      ><p>New preset</p></button>
      <notification v-else
        :text="'Presets at capacity, consider triage'"
        :desirablityStyle="undefined"
      />
    </transition>
    
    <transition name="collapse">
      <section v-if="currentPreset"
        id="presetsEditor"
      >
        <labelledInput
          id="presetNameInput"
          :inputId="'editPresetName'"
          :type="'text'"
          :label="'Name'"
          @update:modelValue="(newValue) => {updateCurrentPreset('name', newValue)}"
          v-model="currentPreset.name"
        />
        <editCurrentConfig v-if="currentPreset"
          id="editConfig"
          v-model:config="currentPreset.config"
          @update:config="(newValue) => {updateCurrentPreset('config', newValue)}"
          :presetOverride="currentPreset.config"
          :hideUnsavables="true"
        />
        <button id="presetDelete"
          class="core_contentButton"
          @click="deleteCurrentPreset"
        >
          <img src="../../../assets/trash.svg" alt="Trashcan icon"/>
          <span>Delete</span>
        </button>
      </section>
    </transition>
  </section>
</template>

<script setup lang="ts">
  import {ref, toRaw} from "vue";
  import {useUser} from "../../../stores/user";
  import {UserPatchRequest} from "../../../../../shared/objects/api";
  import {UserData} from "../../../../../shared/objects/user";
  import {deepCloneFromReactive} from "../../../helpers/deepCloneFromReactive";
  import notification from "../../notification.vue";
  import labelledInput from "../../labelledInput.vue";
  import editCurrentConfig from "../../posts/create/config/editConfig.vue";
  const user = useUser();
  const presetsState = ref(deepCloneFromReactive(user.data.configPresets));
  const maxPresets = 3;

  const currentPreset = ref<UserData["configPresets"][number]|null>(null);
  const currentPresetIndex = ref<number|null>(null);

  const emit = defineEmits(["newState"]);
  function emitNewPresetsState() {
    emit("newState", [new UserPatchRequest("configPresets", toRaw(presetsState.value))]);
  };

  function createNewPreset() {
    presetsState.value.push({name: "", config:{}});

    const newPresetIndex = presetsState.value.length - 1;
    currentPresetIndex.value = newPresetIndex;
    currentPreset.value = toRaw(presetsState.value)[newPresetIndex];
    emitNewPresetsState();
  };

  function selectPreset(index:number) {
    currentPresetIndex.value = index;
    currentPreset.value = presetsState.value[index];
  };

  function updateCurrentPreset(presetSection:"name"|"config", newValue:string) {
    currentPreset.value![presetSection] = toRaw(newValue);
    
    emitNewPresetsState();
  };

  function deleteCurrentPreset() {
    presetsState.value.splice(currentPresetIndex.value as number, 1);
    currentPresetIndex.value = null;
    currentPreset.value = null;
    emitNewPresetsState();
  };
</script>

<style scoped>
  #presetsPicker + * {margin-top: 1em}

  .presetButton {
    display: block;
    width: 100%;
    margin-bottom: 0.5em;
    font-weight: bold;
  }
  button p {margin: 0}
  #newPreset {
    font-size: 0.9em;
    display: block;
    width: 90%;
    margin-inline: auto;
    padding: 0.3em;
  }
  
  #presetNameInput {font-size: 1.3em}
  #editConfig {
    margin-block: 1em 0.5em;
    font-size: 0.9em;
  }

  #presetDelete {
    display: block;
    margin: auto;
    font-size: inherit;
  }
  #presetDelete img {height: 1.75em}
  #presetDelete span {vertical-align: super}
  #draftDelete:not(:hover, :focus, :active) span {color: var(--textColor)}
</style>