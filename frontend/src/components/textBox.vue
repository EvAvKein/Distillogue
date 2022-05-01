<template>
  <section>
    <div v-if="title || content.editable" class="titleBox">
      <component v-if="title"
        :is="'h' + (title?.headingRank || 4)"
        class="title"
      >
        {{props.title?.text}}
      </component>
      <div v-if="content.editable" class="buttonBox">
        <button v-show="!editMode"
          @click="enterEditMode"
          class="globalStyle_textButton"
        >✎</button>
        <button v-show="editMode"
          @click="submitEdit"
          class="globalStyle_textButton"
        >✔</button>
        <button v-show="editMode"
          @click="exitEditMode"
          class="globalStyle_textButton"
        >✘</button>
      </div>
      
    </div>
    
    <input v-if="content.singleLine" 
      type="text"
      :readonly="!editMode"
      v-model="currentContentText"
    />
    <textarea v-else-if="content.editable"
      :readonly="!editMode"
      v-model="currentContentText"
    >
    </textarea>
    <editNotification v-if="content.editable"
      :text="notification.text"
      :desirablityStyle="notification.desirabilityStyle"
      class="notification"
    />
    <p v-else>{{content.text}}</p>
  </section>
</template>

<script setup lang="ts">
  import {ref} from "vue";
  import {useUser} from "../stores/user";
  import {jsonFetch} from "../helpers/jsonFetch";
  import editNotification from "./notification.vue";
  const user = useUser();

  const props = defineProps<{
    title?: {
      text:string,
      headingRank?:1|2|3|4|5|6,
      emSize?:number,
    },
    content: {
      text:string,
      singleLine?: true,
      editable?: {
        editAuthAddress:string,
        dataName:string,
        minCharacters?:number,
        maxCharacters?:number,
        minHeightInLines?:number,
        maxHeightInLines?:number,
      },
      emSize?:number,
    },
  }>();

  const currentContentText = ref<string>(props.content.text);
  const editMode = ref<boolean>(false);
  const notification = ref<{text:string, desirabilityStyle?:boolean}>({
    text: "", desirabilityStyle: undefined,
  });

  function enterEditMode() {
    notification.value.text = "";
    notification.value.desirabilityStyle = undefined;

    editMode.value = true;
  };

  async function submitEdit() {
    if (currentContentText.value === props.content.text) {
      editMode.value = false;
      return;
    };

    notification.value.text = "Submitting edit request...";
    notification.value.desirabilityStyle = undefined;
    const editResponse = await jsonFetch(props.content.editable!.editAuthAddress, {
      userId: user.data.id,
      dataName: props.content.editable!.dataName,
      newValue: currentContentText.value,
    });

    if (editResponse.error) {
      notification.value.text = editResponse.error.message;
      notification.value.desirabilityStyle = false;
      return;
    };

    props.content.text = currentContentText.value;
    user.data[props.content.editable!.dataName as "name"] = props.content.text;
    notification.value.text = `"${props.title?.text || "Text"}" edited successfully!`;
    notification.value.desirabilityStyle = true;
    editMode.value = false;
  };

  function exitEditMode() {
    notification.value.text = "";
    notification.value.desirabilityStyle = undefined;

    currentContentText.value = props.content.text;

    editMode.value = false;
  };
  
</script>

<style scoped>
  section {
    border: 0.15em solid var(--textColor);
    border-radius: 1.25em;
    overflow: hidden;
  }

  .titleBox {
    color: var(--backgroundColor);
    background-color: var(--textColor);
    font-size: v-bind("(props.title?.emSize || 1.25) + 'em'");
    padding: 0.25em 0.5em;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .titleBox * {margin: 0}

  .buttonBox {margin-left: auto}
  .buttonBox button {
    font-size: 0.85em;
    padding: 0.25em 0.5em;
  }

  input, textarea, p {
    color: var(--textColor);
    background-color: var(--backgroundColor);
    font-family: inherit;
    resize: vertical;
    font-size: v-bind("(props.content?.emSize || 1) + 'em'");
    width: calc(100% - 1.1em); /* 1em should be the correct value considering the margins... but evidently, for whatever reason, it isnt */
    margin: 0.5em;
    border: 0;
    outline: none;
    min-height: v-bind("content.editable?.minHeightInLines || 1.1 + 'em'");
    max-height: v-bind("content.editable?.maxHeightInLines || 25 + 'em'");
  }

  textarea::shadow div {
    height: 1em;
  }

  .notification {margin-top: 0}
</style>