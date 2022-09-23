<template>
  <form @submit.prevent :id="reply ? 'replyMode' : 'postMode'">
    <section id="writeAndConfirmWrapper">
      <section id="textsBox">
        <!-- unmounting when drafts isn't truthy to prevent a console error when logging out while it's mounted -->
        <draftsSelection v-if="user.data.drafts && user.data.drafts.length > 0"
          id="draftsSelection"
          @draftSelected="draftSelected"
        />
        <labelledInput id="title"
          :label="'Title'"
          :type="'text'"
          :required="true"
          :inputId="'nodeTitle'"
          v-model="nodeTitle"
        />
        <labelledInput
          :label="'Body'"
          :type="'textarea'"
          :minLineHeight="15"
          :required="true"
          :inputId="'nodeBody'"
          v-model="nodeBody"
        />
      </section>

      <section id="confirmation">
        <notification :text="notifText" :desirablityStyle="notifDesirability"/>
        <button @click="saveDraft"
          type="button"
          class="core_backgroundButton"
          :disabled="draftsAtCapacity ? true : false"
        >
          {{draftsAtCapacity ? "Drafts at capacity" : "Save draft"}}
        </button>
        <button id="submitButton"
          type="button"
          class="core_backgroundButton"
          @click="submitNode"
        >{{reply ? 'Reply' : 'Post'}}{{typeof currentDraftIndex === "number" ? ` (& delete draft ${currentDraftIndex + 1})` : ""}}</button>
      </section>
    </section>

    <section v-if="!reply"
      id="configDrawer"
      :class="configDrawerOpen ? 'open' : ''"
    >
      <button id="drawerToggler"
        type="button"
        @click="() => {configDrawerOpen = !configDrawerOpen}"
      >
        <img src="../../../assets/fileConfig.svg" alt="Icon of file with cogwheel"/>
      </button>
      <section id="config" :inert="configDrawerExists && !configDrawerOpen">
        <configPresets v-model:chosenPreset="configOverridingPreset"/>
        <editConfig v-model:config="(postConfig as PostConfig)" 
          :presetOverride="configOverridingPreset?.config"
          id="editConfig"
        />
        <button @click="savePreset"
          type="button"
          class="core_backgroundButton"
          :disabled="presetsAtCapacity ? true : false"
        >
          {{presetsAtCapacity ? "Presets at capacity" : "Save preset"}}
        </button>
      </section>
    </section>
  </form>
</template>

<script setup lang="ts">
  import {ref, computed, ComputedRef, onMounted, onUnmounted} from "vue";
  import {UserData} from "../../../../../shared/objects/user";
  import {Node, PostConfig} from "../../../../../shared/objects/post";
  import {NodeCreationRequest, NodeInteractionRequest, UserPatchRequest} from "../../../../../shared/objects/api";
  import {unix} from "../../../../../shared/helpers/timestamps";
  import {filterByIndex} from "../../../../../shared/helpers/filterByIndexes";
  import {jsonFetch} from "../../../helpers/jsonFetch";
  import {useUser} from "../../../stores/user";
  import {useRouter} from "vue-router";
  import labelledInput from "../../labelledInput.vue";
  import {deepCloneFromReactive} from "../../../helpers/deepCloneFromReactive";
  import draftsSelection from "../draftSelectionCollapsible.vue";
  import configPresets from "./config/configPresets.vue";
  import editConfig from "./config/editConfig.vue";
  import notification from "../../notification.vue";
  const user = useUser();
  const router = useRouter();

  const props = defineProps<{
    reply?:{nodePath:Node["id"][]|null};
  }>();

  const nodeTitle = ref<Node["title"]>("");
  const nodeBody = ref<Node["body"]>("");
  const currentDraftIndex = ref<number|undefined>();
 
  const notifText = ref<string>("");
  const notifDesirability = ref<boolean>(true);

  const postConfig = ref<PostConfig|undefined>(props.reply ? undefined : {});
  const postInvitedOwners = ref<UserData["id"][]|undefined>(props.reply ? undefined : []);
  const configOverridingPreset = ref<UserData["configPresets"][number]|undefined>(undefined);
    
  const configDrawerExists = ref<boolean|undefined>(undefined);
  const configDrawerOpen = ref<boolean|null>(props.reply ? null : false);

  let presetsAtCapacity:ComputedRef<boolean>;
  let savePreset:() => void;
  if (!props.reply) {
    presetsAtCapacity = computed(() => user.data.configPresets?.length >= 3);
    savePreset = async () => {  
      if (presetsAtCapacity.value) return;

      const newPresetsState = [...user.data.configPresets, {name: "", config: postConfig.value!}];

      const response = await jsonFetch("PATCH", "/users/me",
        [new UserPatchRequest("configPresets", newPresetsState)],
        user.data.authKey
      );

      if (response.error) {
        notifText.value = response.error.message;
        notifDesirability.value = false;
        return;
      };

      user.data.configPresets = newPresetsState;
    };

    const body = document.getElementsByTagName("body")[0];
    function configInertByScreenWidth() {
      const pxFontSize = Number.parseInt(window.getComputedStyle(body).fontSize);
      configDrawerExists.value = body.clientWidth < (pxFontSize * 55);
    };
    onMounted(() => {
      configInertByScreenWidth();
      const bodyObserver = new ResizeObserver(configInertByScreenWidth);
      bodyObserver.observe(body);
      onUnmounted(() => {bodyObserver.disconnect()});
    });
  };

  function draftSelected(data:{draft:UserData["drafts"][number], index:number}|null) {
    if (!data) {
      currentDraftIndex.value = undefined;
      return;
    };

    nodeTitle.value = data.draft.title;
    nodeBody.value = data.draft.body;
    currentDraftIndex.value = data.index;
  };

  const draftsAtCapacity = computed(() => user.data.drafts?.length >= 3);
  async function saveDraft() {
      if (draftsAtCapacity.value) return;

      const newDraftsState = [...deepCloneFromReactive(user.data.drafts), {title: nodeTitle.value, body: nodeBody.value, lastEdited: unix()}];

      const response = await jsonFetch("PATCH", "/users/me",
        [new UserPatchRequest("drafts", newDraftsState)],
        user.data.authKey
      );

      if (response.error) {
        notifText.value = response.error.message;
        notifDesirability.value = false;
        return;
      };

      user.data.drafts = newDraftsState;
  };

  async function submitNode() {
    notifText.value = "";

    const apiRequest = props.reply
      ? () => {
          return jsonFetch("POST", "/posts/interactions",
            new NodeInteractionRequest(
              props.reply!.nodePath!,
              "reply",
              new NodeCreationRequest(
                [user.data.id],
                nodeTitle.value,
                nodeBody.value,
                currentDraftIndex.value,
                undefined,
                props.reply!.nodePath!,
              )
            ),
            user.data.authKey
          );
        }
      : () => {
          return jsonFetch("POST", "/posts",
            new NodeCreationRequest(
              postInvitedOwners!.value,
              nodeTitle.value,
              nodeBody.value,
              currentDraftIndex.value,
              postConfig!.value,
            ),
            user.data.authKey
          );
        }
      ;
    const response = await apiRequest();

    if (response.error) {
      notifText.value = response.error.message;
      notifDesirability.value = false;
      return;
    };

    if (typeof currentDraftIndex.value === "number") {
      const newDraftsState = filterByIndex(deepCloneFromReactive(user.data.drafts), currentDraftIndex.value);
      user.data.drafts = newDraftsState;
    };

    props.reply
      ? window.location.reload()
      : router.push("/browse") // should redirect to created post instead, change to that once post URLs are properly implemented 
    ;
  };
</script>

<style scoped>
  form {
    display: block;
    position: relative;
    margin: auto;
    width: min(calc(100% - 1.5em), 75em);
    padding: 0 0.75em 0.5em;
    overflow: hidden;
  }

  form#postMode #writeAndConfirmWrapper {
    width: calc(100% - 3em);
  }

  #textsBox {font-size: clamp(1.25em, 2.25vw, 1.5em)}
  #textsBox #title {font-size: 1.15em}

  #postMode #draftsSelection {background-color: var(--backgroundSubColor)}
  #replyMode #draftsSelection {background-color: var(--backgroundColor)}

  #confirmation {
    display: flex;
    flex-wrap: nowrap;
    gap: 0.5em;
    height: min-content;
  }
  #submitButton {flex-grow: 1}

  #configDrawer {
    position: absolute;
    height: 90%;
    top: 0;
    right: -17em;
    width: max-content;
    border-radius: 1em 0 0 1em;
    transition: right .5s;
  }
  #configDrawer.open {right: 0}

  #config {
    display: inline-block;
    height: 100%;
    width: 17em;
    padding: 0.5em;
    box-sizing: border-box;
    scrollbar-gutter: stable;
    padding-right: 0.25em;
    border-width: 0.25em 0;
    border-style: solid;
    border-color: var(--textColor);
    overflow: auto;
    background-color: var(--backgroundColor);
  }
  #config > * + * {margin-top: 0.5em}
  
  #config button {
    display: block;
    margin: 0.5em auto;
  }

  #drawerToggler {
    background-color: var(--textColor);
    height: 100%;
    width: 3.25em;
    padding: 0;
    margin-right: 0;
    border-radius: 1em 0 0 1em;
    vertical-align: top;
  }
  #drawerToggler img { 
    width: 2.75em;
    filter: var(--filterToBackgroundColor);
  }

  #drawerToggler, #config {transition: all 300ms}
  #drawerToggler:hover, #drawerToggler:focus {
    outline: none;
    background-color: var(--highlightSubColor)
  }
  #drawerToggler:hover + #config, #drawerToggler:focus + #config {
    border-color: var(--highlightSubColor)
  }
  #drawerToggler:active {
    background-color: var(--highlightColor)
  }
  #drawerToggler:active + #config {
    border-color: var(--highlightColor)
  }

  @media (min-width: 55rem) {
    #postMode {
      display: flex;
      gap: 0.5em;
    }

    #configDrawer {position: initial}
    #drawerToggler {display: none}
    #config {
      padding: 0;
      border: none;
      overflow: visible;
    }
  }
</style>