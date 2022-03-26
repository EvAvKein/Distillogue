<template>
  <section>
    <button v-if="props.upvoters"
      :class="'globalStyle_imageButton' + (currentVote === true ? ' voted' : '')"
      @click="toggleVote(true)"
    >
      <img src="../../assets/upArrow.svg">
    </button>

    <span
      :title="title"
      :class="title.length > 0 ? 'hasDetails' : ''"
    >
      {{totalVotes}}
    </span>

    <button v-if="props.downvoters"
      :class="'globalStyle_imageButton' + (currentVote === false ? ' voted' : '')"
      @click="toggleVote(false)"
    >
      <img src="../../assets/upArrow.svg" style="transform: rotate(180deg);">
    </button>
  </section>
</template>

<script setup lang="ts">
  import {ref, computed, inject} from "vue";
  import {NodeStats} from "../../../../backend/src/objects";
  import {jsonFetch} from "../../helpers/jsonFetch";
  import {useUser} from '../../stores/user';
  const user = useUser();

  const props = defineProps<{
    upvoters?:NodeStats["upvoters"];
    downvoters?:NodeStats["downvoters"];
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

  function clientsideToggleVote(voteUpOrDown:boolean) {
    const subjectArray = voteUpOrDown ? upvoters : downvoters;
    const oppositeArray = voteUpOrDown ? downvoters : upvoters;

    if (subjectArray.value.includes(user.data.id)) {
      subjectArray.value.splice(subjectArray.value.indexOf(user.data.id), 1);
      return;
    };
    subjectArray.value.push(user.data.id);

    if (oppositeArray.value.includes(user.data.id)) {
      oppositeArray.value.splice(oppositeArray.value.indexOf(user.data.id), 1);
    };
  };

  async function toggleVote(voteUpOrDown:boolean) {
    if (!user.data.id) {
      emit("componentError", "Must be logged in to vote");
      return;
    };

    // const response = await jsonFetch("/nodeToggleVote", {
    //   userId: user.data.id,
    //   postId: inject("postId"),
    //   nodeId: inject("nodeId"),
    //   voteUpOrDown: voteUpOrDown,
    // });

    // if (response.error) {
    //   emit("componentError", response.error.message);
    //   return;
    // };

    clientsideToggleVote(voteUpOrDown);
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