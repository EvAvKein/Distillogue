<template>
	<article>
		<router-link :to="{name: 'viewPost', params: {postId: summary.id}}">
			<section class="topSection">
				<h4>{{ summary.title }}</h4>
				<img v-if="'public' in summary.access" src="../../../assets/megaphone.svg" alt="Megaphone icon" />
			</section>
			<section class="timestamps">
				<div>Posted: <timestamp :pastUnix="summary.stats.posted" /></div>
				<div v-if="summary.stats.interacted">Interacted: <timestamp :pastUnix="summary.stats.interacted" /></div>
			</section>
		</router-link>
	</article>
</template>

<script setup lang="ts">
	import {PostSummary} from "../../../../../shared/objects/post";
	import timestamp from "../../timestamp.vue";

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

	.timestamps {
		margin-top: 0.45em;
		font-size: 0.95em;
		display: flex;
		flex-direction: row;
		text-align: center;
		gap: 1.5em;
	}

	.timestamps:has(div:nth-child(2)) {
		justify-content: space-between;
	}
</style>
