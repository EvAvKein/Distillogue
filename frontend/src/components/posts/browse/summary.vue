<template>
	<article>
		<router-link :to="{name: 'viewPost', params: {postId: summary.id}}">
			<section class="topSection">
				<h4>{{ summary.title }}</h4>
				<img v-if="summary.access?.public" src="../../../assets/megaphone.svg" alt="Megaphone icon" />
			</section>
			<timestamps :timestamps="summary.stats.timestamps" :inPostSummary="true" class="timestampSection" />
		</router-link>
	</article>
</template>

<script setup lang="ts">
	import {PostSummary} from "../../../../../shared/objects/post";
	import timestamps from "../view/nodeInteractions/timestamps.vue";
	defineProps<{
		summary: PostSummary;
	}>();
</script>

<style scoped>
	a {
		display: block;
		text-decoration: none;
		color: var(--textColor);
		padding: 1em 0.5em;
		min-width: 15em;
	}

	.topSection {
		width: 100%;
		display: flex;
		justify-content: space-between;
	}

	h4 {
		margin: 0;
		font-size: 1.2em;
	}

	img {
		height: 1.5em;
		filter: var(--filterToTextColor);
		margin-left: 0.4em;
	}

	.timestampSection {
		margin-top: 0.45em;
		font-size: 0.95em;
	}
</style>
