<template>
  <form @submit.prevent>
    <section id="content">
      <labelledInput id="contentTitle"
        :label="'Title'"
        :type="'text'"
        :required="true"
        :inputId="'postTitle'"
        v-model="postTitle"
      />
      <labelledInput
        :label="'Body'"
        :type="'textarea'"
        :minLineHeight="15"
        :required="true"
        :inputId="'postBody'"
        v-model="postBody"
      />
    </section>
    <section id="configDrawer" :class="configDrawerOpen ? 'open' : ''">
      <button id="drawerToggler"
        type="button"
        @click="() => {configDrawerOpen = !configDrawerOpen}"
      >
        <img src="../../../assets/fileConfig.svg" alt="File with cogwheel"/>
      </button>
      <section id="config" :inert="configDrawerExists && !configDrawerOpen">
        <configPresets v-model:chosenPreset="configOverridingPreset"/>
        <editConfig v-model:config="postConfig" 
          :presetOverride="configOverridingPreset"
          id="editConfig"
        />
      </section>
    </section>
    <section id="confirmation">
      <notification :text="notifText" :desirablityStyle="notifDesirability"/>
      <button id="submitButton"
        type="button"
        class="globalStyle_textButton"
        @click="submitPost"
      >Post</button>
    </section>
  </form>
</template>

<script setup lang="ts">
  import {ref} from "vue";
  import {Node, PostConfig, NodeCreationRequest, UserData} from "../../../../../shared/objects";
  import {jsonFetch} from "../../../helpers/jsonFetch";
  import {useUser} from "../../../stores/user";
  import {useRouter} from "vue-router";
  import labelledInput from "../../labelledInput.vue";
  import configPresets from "./config/configPresets.vue";
  import editConfig from "./config/editConfig.vue";
  import notification from "../../notification.vue";
  const user = useUser();
  const router = useRouter();

  const configDrawerExists = ref<boolean|undefined>();
  const configDrawerOpen = ref<boolean>(false);

  const body = document.getElementsByTagName("body")[0];
  function toggleConfigInertValidatorByScreenWidth() {
    const fontSize = Number(window.getComputedStyle(body).fontSize.replace("px", ""));

    body.clientWidth < (fontSize * 45)
      ? configDrawerExists.value = true
      : configDrawerExists.value = false
  };
  
  toggleConfigInertValidatorByScreenWidth();
  window.addEventListener("resize", toggleConfigInertValidatorByScreenWidth);

  const invitedOwners = ref<UserData["id"][]>([]);
  const postTitle = ref<Node["title"]>("");
  const postBody = ref<Node["body"]>("");
  const postConfig = ref<PostConfig>({});
  const configOverridingPreset = ref<PostConfig|undefined>(undefined);
 
  const notifText = ref<string>("");
  const notifDesirability = ref<boolean>(true);

  async function submitPost() {
    notifText.value = "";

    const response = await jsonFetch("POST", "/post",
      new NodeCreationRequest(
        invitedOwners.value,
        postTitle.value,
        postBody.value,
        postConfig.value,
      ),
      user.data.authKey
    );

    if (response.error) {
      notifText.value = response.error.message;
      notifDesirability.value = false;
      return;
    };

    router.push("/browse"); // should redirect to created post instead, change to that once post URLs are properly implemented
  };
</script>

<style scoped>
  form {
    position: relative;
    width: min(100%, 70em);
    overflow: hidden;
    display: grid;
    gap: 0 0.5em;
    grid-template-columns: calc(100% - 3em) 0;
    grid-template-areas: 
      "content config"
      "confirmation confirmation";
  }

  #content {font-size: clamp(1.25em, 2.25vw, 1.5em)}
  #contentTitle {font-size: 1.15em}

  #configDrawer {
    position: absolute;
    height: 100%;
    border-radius: 1em 0 0 1em;
    width: max-content;
    right: -17.5em;
    transition: right .5s;
  }
  #configDrawer.open {right: -2.5em}

  #config {
    display: inline-block;
    box-sizing: border-box;
    scrollbar-gutter: stable;
    height: 100%;
    padding: 0.5em;
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
    height: inherit;
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
    cursor: pointer;
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

  #submitButton {
    display: block;
    margin: 0.5em auto 0;
    width: calc(100% - 2em);
  }

  #content {grid-area: content}
  #configDrawer {grid-area: config}
  #confirmation {grid-area: confirmation}

  @media (min-width: 45rem) {
    #configDrawer {position: initial}
    #drawerToggler {display: none}
    #config {
      display: block;
      height: initial;
      margin-top: 0.5em;
      padding: 0;
      border: none;
      border-radius: 0;
      scrollbar-gutter: auto;
    }
    
    form {
      overflow: initial;
      margin: auto;
      width: min(95%, 70em);
      display: grid;
      grid-template-columns: 4fr 1fr;
      grid-template-areas: 
        "content config"
        "confirmation config";
    }
  }
</style>