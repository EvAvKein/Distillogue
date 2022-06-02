<template>
  <section aria-label="Vote interactions">
    <button v-if="voters?.up"
      aria-label="Upvote"
      :class="'globalStyle_imageButton' + (currentVote === 'up' ? ' voted' : '')"
      @click="vote('up', !upvoters?.includes(user.data.id))"
    >
      <img src="../../../../../assets/upArrow.svg">
    </button>

    <span
      aria-label="Votes status"
      :title="title"
      :class="title.length > 0 ? 'hasDetails' : ''"
    >
      {{totalVotes}}
    </span>

    <button v-if="voters?.down"
      aria-label="Downvote"
      :class="'globalStyle_imageButton' + (currentVote === 'down' ? ' voted' : '')"
      @click="vote('down', !downvoters?.includes(user.data.id))"
    >
      <img src="../../../../../assets/upArrow.svg" style="transform: rotate(180deg);">
    </button>
  </section>
</template>

<script setup lang="ts">
  import {ref, computed} from "vue";
  import {Node, NodeInteractionRequest, NodeStats} from "../../../../../../../backend/src/objects";
  import {jsonFetch} from "../../../../../helpers/jsonFetch";
  import {useUser} from "../../../../../stores/user";
  const user = useUser();

  const props = defineProps<{
    voters:NodeStats["votes"];
    interactionPath:Node["id"][];
  }>();
  const emit = defineEmits(["interactionError"]);

  const upvoters = ref(props.voters?.up);
  const downvoters = ref(props.voters?.down);
  const totalVotes = computed(() => {
    return (upvoters.value?.length ?? 0) - (downvoters.value?.length ?? 0);
  });
  
  const title = computed(() => {
    let titleVar = "";

    const anyUpvotes = upvoters.value && upvoters.value.length > 0;
    const anyDownvotes = downvoters.value && downvoters.value.length > 0;

    if (anyUpvotes) {titleVar += `Upvotes: ${upvoters.value!.length}`};
    if (anyUpvotes && anyDownvotes) {titleVar += "\n"};
    if (anyDownvotes) {titleVar += `Downvotes: ${downvoters.value!.length}`};
    return titleVar;
  });

  type voteDirection = "up"|"down";
  const currentVote = computed<voteDirection|null>(() => {
    if (upvoters.value && upvoters.value.includes(user.data.id)) return "up";
    if (downvoters.value && downvoters.value.includes(user.data.id)) return "down";
    return null;
  });

  async function vote(voteDirection:voteDirection, newVoteStatus:boolean) {
    if (!user.data.id) {
      emit("interactionError", "Must be logged in to vote");
      return;
    };

    const response = await jsonFetch("/nodeInteraction", new NodeInteractionRequest(
      user.data.id,
      props.interactionPath,
      "vote",
      {voteDirection, newVoteStatus}
    ));

    if (response.error) {
      emit("interactionError", response.error.message)
      return;
    };
      
    adjustLocalVoteArrays(voteDirection, newVoteStatus);
  };

  function adjustLocalVoteArrays(voteDirection:voteDirection, newVoteStatus:boolean) {
    const array = voteDirection === "up"
      ? {subject: upvoters, opposite: downvoters}
      : {subject: downvoters, opposite: upvoters};

    if (!newVoteStatus) {
      array.subject.value!.splice(array.subject.value!.indexOf(user.data.id) , 1);
      return;
    };

    array.subject.value!.push(user.data.id);
    if (array.opposite.value && array.opposite.value.includes(user.data.id)) {
      array.opposite.value.splice(array.opposite.value.indexOf(user.data.id), 1);
    };
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
  .voted:hover {
    filter: var(--filterToHighlightSubColor)
  }

  img {height: inherit}

  span.hasDetails {cursor: help}
  span:not(.hasDetails) {cursor: default}
</style>