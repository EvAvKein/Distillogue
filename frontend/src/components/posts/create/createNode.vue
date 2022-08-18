<template>
  <form @submit.prevent :id="nodeIsPost ? 'postMode' : 'replyMode'">
    <section id="writeAndConfirmWrapper">
      <section id="textsBox">
        <!-- checking drafts is truthy to prevent console error when logging out while this component is mounted -->
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
        <draftOrPresetSaveButton
          :type="'draft'"
          :data="{title: nodeTitle, body: nodeBody}"
          @error="(text:string) => {notifText = text; notifDesirability = false}"
        />
        <button id="submitButton"
          type="button"
          class="core_backgroundButton"
          @click="submitNode"
        >{{nodeIsPost ? 'Post' : 'Reply'}}{{typeof currentDraftIndex === "number" ? ` (& delete draft ${currentDraftIndex + 1})` : ""}}</button>
      </section>
    </section>

    <section v-if="nodeIsPost"
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
        <draftOrPresetSaveButton
          :type="'preset'"
          :data="{name: '', config: (postConfig as PostConfig)}"
        />
      </section>
    </section>
  </form>
</template>

<script setup lang="ts">
  import {ref, computed, onMounted, onUnmounted} from "vue";
  import {Node, PostConfig, NodeCreationRequest, NodeInteractionRequest, UserData} from "../../../../../shared/objects";
  import {jsonFetch} from "../../../helpers/jsonFetch";
  import {useUser} from "../../../stores/user";
  import {useRouter} from "vue-router";
  import labelledInput from "../../labelledInput.vue";
  import draftOrPresetSaveButton from "../draftOrPresetSaveButton.vue";
  import draftsSelection from "../draftSelectionCollapsible.vue";
  import configPresets from "./config/configPresets.vue";
  import editConfig from "./config/editConfig.vue";
  import notification from "../../notification.vue";
  const user = useUser();
  const router = useRouter();

  const props = defineProps<{
    replyNodePath?:Node["id"][]|null;
  }>();

  const nodeTitle = ref<Node["title"]>("");
  const nodeBody = ref<Node["body"]>("");
  const currentDraftIndex = ref<number|undefined>();
 
  const notifText = ref<string>("");
  const notifDesirability = ref<boolean>(true);

  const nodeIsPost =  computed(() => !props.replyNodePath);

  const postConfig = ref<PostConfig|undefined>(nodeIsPost.value ? {} : undefined);
  const postInvitedOwners = ref<UserData["id"][]|undefined>(nodeIsPost.value ? [] : undefined);
  const configOverridingPreset = ref<UserData["configPresets"][number]|undefined>(undefined);
    
  const configDrawerExists = ref<boolean|undefined>(undefined);
  const configDrawerOpen = ref<boolean|undefined>(nodeIsPost.value ? false : undefined);

  if (nodeIsPost.value) {
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

  async function submitNode() {
    notifText.value = "";
    const newDraftsState = user.data.drafts.filter((draft, index) => index !== currentDraftIndex.value); // suboptimal, it would be better to intead use a deletedDraftIndex (number|null)... but that requires (TODO) updating 1. the drafts component 2. this component 3. NodeCreationRequest, 4. the backend stuff

    const sumbitRequest = nodeIsPost.value
      ? () => {
          return jsonFetch("POST", "/post",
            new NodeCreationRequest(
              postInvitedOwners!.value,
              nodeTitle.value,
              nodeBody.value,
              newDraftsState,
              postConfig!.value,
            ),
            user.data.authKey
          );
        }
      : () => {
          return jsonFetch("PATCH", "/interaction",
            new NodeInteractionRequest(
              props.replyNodePath!,
              "reply",
              {nodeReplyRequest: new NodeCreationRequest(
                [user.data.id],
                nodeTitle.value,
                nodeBody.value,
                newDraftsState,
                undefined,
                props.replyNodePath!,
              )}
            ),
            user.data.authKey
          );
        }
    ;

    const response = await sumbitRequest();

    if (response.error) {
      notifText.value = response.error.message;
      notifDesirability.value = false;
      return;
    };

    user.data.drafts = newDraftsState;

    nodeIsPost.value
      ? router.push("/browse") // should redirect to created post instead, change to that once post URLs are properly implemented
      : window.location.reload()
    ;
  };
</script>

<style scoped>
  form {
    display: block;
    position: relative;
    margin: auto;
    width: min(calc(100% - 1em), 75em);
    padding: 0 0.5em 0.5em;
    overflow: hidden;
  }

  form#postMode #writeAndConfirmWrapper {
    width: calc(100% - 3.25em);
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
  
  #drawerToggler:hover, #drawerToggler:focus {
    outline: none;
    background-color: var(--highlightSubColor)
  }
  #drawerToggler:hover img, #drawerToggler:focus img {
    background-color: var(--filterToHighlightSubColor)
  }
  #drawerToggler:hover + #config, #drawerToggler:focus + #config {
    border-color: var(--highlightSubColor)
  }
  #drawerToggler:active {
    background-color: var(--highlightColor)
  }
  #drawerToggler:active img {
    background-color: var(--filterToHighlightColor)
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