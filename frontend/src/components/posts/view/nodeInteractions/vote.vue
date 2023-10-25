<template>
	<section aria-label="Vote interactions">
		<button
			v-if="voters.up"
			aria-label="Upvote"
			:class="'core_contentButton' + (currentVote === 'up' ? ' voted' : '')"
			@click="vote('up')"
		>
			<img src="../../../../assets/upArrow.svg" alt="Upwards arrow icon" />
		</button>

		<span aria-label="Votes status" :title="title" :class="title.length > 0 ? 'hasDetails' : ''">
			{{ totalVotes }}
		</span>

		<button
			v-if="voters.down"
			aria-label="Downvote"
			:class="'core_contentButton' + (currentVote === 'down' ? ' voted' : '')"
			@click="vote('down')"
		>
			<img style="transform: rotate(180deg)" src="../../../../assets/upArrow.svg" alt="Downwards arrow icon" />
		</button>
	</section>
</template>

<script setup lang="ts">
	import {ref, computed} from "vue";
	import {NodeInteractionRequest} from "../../../../../../shared/objects/api";
	import {Node, NodeStats} from "../../../../../../shared/objects/post";
	import {apiFetch} from "../../../../helpers/apiFetch";
	import {useUser} from "../../../../stores/user";
	import {useNotifications} from "../../../../stores/notifications";
	const user = useUser();
	const notifs = useNotifications();

	const props = defineProps<{
		voters: NonNullable<NodeStats["votes"]>;
		interactionPath: Node["id"][];
	}>();

	const upvoters = ref(props.voters.up);
	const downvoters = ref(props.voters.down);
	const totalVotes = computed(() => (upvoters.value?.length ?? 0) - (downvoters.value?.length ?? 0));

	const title = computed(() => {
		let titleVar = "";

		const anyUpvotes = upvoters.value && upvoters.value.length > 0;
		const anyDownvotes = downvoters.value && downvoters.value.length > 0;

		if (anyUpvotes) {
			titleVar += `Upvotes: ${upvoters.value!.length}`;
		}
		if (anyUpvotes && anyDownvotes) {
			titleVar += "\n";
		}
		if (anyDownvotes) {
			titleVar += `Downvotes: ${downvoters.value!.length}`;
		}
		return titleVar;
	});

	type voteDirection = "up" | "down";
	const currentVote = computed<voteDirection | null>(() => {
		if (!user.data) return null;
		if (upvoters.value && upvoters.value.includes(user.data.id)) return "up";
		if (downvoters.value && downvoters.value.includes(user.data.id)) return "down";
		return null;
	});

	async function vote(voteDirection: voteDirection) {
		if (!user.data) {
			notifs.create("Must be logged in to vote", false);
			return;
		}

		const voters = voteDirection === "up" ? upvoters.value : downvoters.value;
		const newVoteStatus = !voters?.includes(user.data.id);

		const response = await apiFetch(
			"POST",
			"/posts/interactions",
			new NodeInteractionRequest(props.interactionPath, "vote", {voteDirection, newVoteStatus})
		);

		if (response.error) {
			notifs.create(response.error.message, false);
			return;
		}

		adjustLocalVoteArrays(voteDirection, newVoteStatus);
	}

	function adjustLocalVoteArrays(voteDirection: voteDirection, newVoteStatus: boolean) {
		const array =
			voteDirection === "up" ? {subject: upvoters, opposite: downvoters} : {subject: downvoters, opposite: upvoters};

		if (!newVoteStatus) {
			array.subject.value!.splice(array.subject.value!.indexOf(user.data!.id), 1);
			return;
		}

		array.subject.value!.push(user.data!.id);
		if (array.opposite.value && array.opposite.value.includes(user.data!.id)) {
			array.opposite.value.splice(array.opposite.value.indexOf(user.data!.id), 1);
		}
	}
</script>

<style scoped>
	section {
		font-size: 1.15em;
		width: max-content;
		text-align: center;
	}

	button {
		display: block;
		margin: auto;
		height: 1em;
	}

	.voted {
		filter: var(--filterToHighlightColor);
	}
	.voted:hover {
		filter: var(--filterToHighlightSubColor);
	}

	img {
		height: inherit;
	}

	span.hasDetails {
		cursor: help;
	}
	span:not(.hasDetails) {
		cursor: default;
	}
</style>
