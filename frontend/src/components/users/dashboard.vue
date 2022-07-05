<template>
  <section id="dashboardContainer">
    <section id="dashboardSidebar">
      <button v-show="changes.length > 0"
        id="dashboardSubmit"
        class="core_backgroundButton"
        @click="submitAllChanges"
      >
        <img src="../../assets/save.svg"/>
        <span>Save</span>
      </button>
      <nav aria-label="Dashboard page navigation">
        <button @click="currentPage = 'profile'"
          class="core_contentButton"
        >
          <img src="../../assets/userWithoutPfp.svg"/>
          <span>Profile</span>
        </button>
        <button @click="currentPage = 'drafts'"
          class="core_contentButton"
        >
          <img src="../../assets/drafts.svg"/>
          <span>Drafts</span>
        </button>
        <button @click="currentPage = 'presets'">
          <img src="../../assets/configPresets.svg"/>
          <span>Presets</span>
        </button>
      </nav>
    </section>
    <section id="dashboardPage">
      <notification :text="submitNotif.text" :desirablityStyle="submitNotif.style"/>
      <profileEditor v-show="currentPage === 'profile'"
        @newState="updateChangesByNewState"
      />
      <draftsEditor v-show="currentPage === 'drafts'"
        @newState="updateChangesByNewState"
      />
      <presetsEditor v-show="currentPage === 'presets'"
        @newState="updateChangesByNewState"
      />
    </section>
  </section>
</template>

<script setup lang="ts">
  import {ref, reactive} from "vue";
  import {useUser} from "../../stores/user";
  import {jsonFetch} from "../../helpers/jsonFetch";
  import {UserPatchRequest} from "../../../../shared/objects";
  import {deepCloneFromReactive} from "../../helpers/deepCloneFromReactive";
  import notification from "../notification.vue";
  import profileEditor from "./dashboardSections/profileEditor.vue";
  import draftsEditor from "./dashboardSections/draftsEditor.vue";
  import presetsEditor from "./dashboardSections/configPresetsEditor.vue";
  const user = useUser();

  type pageName = "profile"|"drafts"|"presets";
  const currentPage = ref<pageName>("profile");

  const changes = ref<UserPatchRequest[]>([]);
  const submitNotif = reactive({text: "", style: undefined as boolean|undefined});

  function updateChangesByNewState(newStates:UserPatchRequest[]) {
    newStates.forEach((state) => {
      const existingChangeIndex = changes.value.findIndex((change) => {return change.dataName === state.dataName});

      const prevChangeExists = existingChangeIndex === -1 ? false : true;
      const inputMatchesUserData = typeof state.newValue === "object" && state.newValue !== null
        ? JSON.stringify(state.newValue) === JSON.stringify(user.data[state.dataName]) // flawed (as it depends on the contents of both to be in the same sequence), but it's *good enough* as of the current stage of dev (june 2022)
        : state.newValue === user.data[state.dataName]
      ;

      if (!prevChangeExists && inputMatchesUserData) {
        return;
      };

      if (!prevChangeExists) {
        changes.value.push(state);
        return;
      };

      inputMatchesUserData
        ? changes.value.splice(existingChangeIndex, 1)
        : changes.value[existingChangeIndex].newValue = state.newValue
    });
  };

  async function submitAllChanges() {
    submitNotif.text = "Submitting changes...";
    submitNotif.style = undefined;

    const changesResponse = await jsonFetch("PATCH", "/user/me",
      changes.value,
      user.data.authKey
    );

    if (changesResponse.error) {
      submitNotif.text = changesResponse.error.message;
      submitNotif.style = false;
    };

    submitNotif.text = "Changes saved!";
    submitNotif.style = true;
    changes.value.forEach((change) => {
      (user.data[change.dataName] as any) = deepCloneFromReactive(change).newValue; // considering the circumstances, i dont think coercing an "any" here is actually harmful
    });
    changes.value = [];
  };
</script>

<style scoped>
  #dashboardContainer {
    display: grid;
    font-size: clamp(1.1em, 2.25vw, 1.5em);
    grid-template-columns: 1fr 3.5fr;
    grid-template-areas: "sidebar page";
    gap: 0.75em;
  }

  #dashboardSidebar {
    grid-area: sidebar;
    height: 100%;
    white-space: nowrap;
  }

  #dashboardSidebar button {
    width: 100%;
    font-size: inherit;
    font-weight: bold;
    padding: 0.4em;
  }

  #dashboardSubmit img {filter: var(--filterToBackgroundColor)}
  #dashboardSubmit + nav {margin-top: 0.25em}
  
  img {
    height: 1.2em;
    vertical-align: bottom;
  }
  img + span {
    display: none;
    margin-left: 0.25em;
  }
  

  nav button {
    display: block;
    color: var(--textColor);
    background-color: transparent;
  }

  #dashboardPage {grid-area: page}

  @media (min-width: 30em) {
    img + span {display: inline}
  }
</style>