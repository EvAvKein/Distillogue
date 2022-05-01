<template>
  <section>
    <details>
    <summary>Voting</summary>
      <div>
        Upvotes:
        <input type="checkbox"
          @change="(event) => {editConfig(event, 'votes', 'up')}"
        />
      </div>
      <div>
        Downvotes:
        <input type="checkbox"
          @change="(event) => {editConfig(event, 'votes', 'down')}"
        />
      </div>
      <div>
        Anonymous:
        <input type="checkbox"
          @change="(event) => {editConfig(event, 'votes', 'anon')}"
        />
      </div>
    </details>
    <details>
    <summary>Activity</summary>
      <div>
        Last Active:
        <input type="checkbox"
          @change="(event) => {editConfig(event, 'lastActive')}"
        />
      </div>
    </details>
    <details>
    <summary>Visibility</summary>
      <div>
        Public:
        <input type="checkbox"
          @change="(event) => {editConfig(event, 'public')}"
        />
      </div>
    </details>
  </section>
</template>

<script setup lang="ts">
  // import {ref, computed} from "vue";
  // import {useRouter} from "vue-router";
  // import {useUser} from "../stores/user";
  import {PostConfig} from "../../../../../../backend/src/objects";

  const props = defineProps<{
    config:PostConfig;
  }>();

  const emit = defineEmits(["update:config"]);
  function editConfig(event:Event, property:keyof PostConfig, subproperty?:"up"|"down"|"anon") { // for some reason typing subproperty as 'keyof PostConfig["votes"]' just ends up as undefined (and this project's lookupInOptional helper doesn't correct that)
    const newValue = (event.currentTarget as HTMLInputElement).checked || undefined;

    if (subproperty && !props.config[property]) {
      props.config[property as "votes"] = {};
    };

    if (subproperty) {
      props.config[property as "votes"]![subproperty] = newValue;
    } else {
      props.config[property] = newValue;
    };

    emit("update:config", props.config);
  };
</script>

<style scoped>
  
</style>