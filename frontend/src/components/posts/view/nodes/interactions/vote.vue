<template>
  <section>
    <button v-if="props.upvoters"
      :class="'globalStyle_imageButton' + (currentVote === true ? ' voted' : '')"
      @click="toggleVote('up')"
    >
      <img src="../../../../../assets/upArrow.svg">
    </button>

    <span
      :title="title"
      :class="title.length > 0 ? 'hasDetails' : ''"
    >
      {{totalVotes}}
    </span>

    <button v-if="props.downvoters"
      :class="'globalStyle_imageButton' + (currentVote === false ? ' voted' : '')"
      @click="toggleVote('down')"
    >
      <img src="../../../../../assets/upArrow.svg" style="transform: rotate(180deg);">
    </button>
  </section>
</template>

<script setup lang="ts">
  import {ref, computed, inject} from "vue";
  import {NodeInteractionRequest, NodeStats} from "../../../../../../../backend/src/objects";
  import {lookupInOptional} from "../../../../../../../backend/src/helpers/lookupInOptional";
  import {jsonFetch} from "../../../../../helpers/jsonFetch";
  import {useUser} from "../../../../../stores/user";
  const user = useUser();

  const props = defineProps<{
    upvoters?:lookupInOptional<NodeStats["votes"],"up">;
    downvoters?:lookupInOptional<NodeStats["votes"],"down">;
  }>();
  const emit = defineEmits(["componentError"]);

  const upvoters = ref(props.upvoters || []);
  const downvoters = ref(props.downvoters || []);

  const totalVotes = computed(() => {
    return upvoters.value.length - downvoters.value.length;
  });
  
  const title = computed(() => {
    return props.downvoters && props.upvoters ? `Upvotes: ${upvoters.value.length}\nDownvotes: ${downvoters.value.length}` : "";
  });

  const currentVote = computed(() => {
    if (upvoters.value.includes(user.data.id)) return true;
    if (downvoters.value.includes(user.data.id)) return false;
    return null;
  });
  
  type voteDirection = "up"|"down";
  function clientsideToggleVote(voteDirection:voteDirection) {
    const subjectArray = voteDirection === "up" ? upvoters : downvoters;
    const oppositeArray = voteDirection === "up" ? downvoters : upvoters;

    if (subjectArray.value.includes(user.data.id)) {
      subjectArray.value.splice(subjectArray.value.indexOf(user.data.id), 1);
      return;
    };
    subjectArray.value.push(user.data.id);

    if (oppositeArray.value.includes(user.data.id)) {
      oppositeArray.value.splice(oppositeArray.value.indexOf(user.data.id), 1);
    };
  };

  async function toggleVote(voteDirection:voteDirection) {
    if (!user.data.id) {
      emit("componentError", "Must be logged in to vote");
      return;
    };

    clientsideToggleVote(voteDirection);
  };
</script>

<style scoped>
  section {
    font-size: 1.25em;
    width: max-content;
    text-align: center;
  }

  button {
    display: block;
    margin: auto;
    height: 1.25em;
  }

  .voted {
    filter: var(--filterToHighlightColor)
  }

  img {height: inherit}

  span.hasDetails {cursor: help}
  span:not(.hasDetails) {cursor: default}
</style>