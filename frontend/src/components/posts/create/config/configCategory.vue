<template>
	<customDetails :openByDefault="openByDefault" class="configCategory">
		<template v-slot:summary>
			<span>{{ title }}</span>
		</template>

		<template #content>
			<div>
				<slot></slot>
			</div>
		</template>
	</customDetails>
</template>

<script setup lang="ts">
	import customDetails from "../../../animatedDetails.vue";

	defineProps<{
		title: string;
		openByDefault?: true;
	}>();
</script>

<style scoped>
	.configCategory {
		height: fit-content;
		width: 100%;
		white-space: nowrap;
		background-color: var(--backgroundSubColor);
		border-radius: 0.5em;
	}

	span {
		display: block;
		text-align: center;
		font-size: 1.5em;
		padding: 0.25em 0.5em;
	}

	div {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 0.5em 1em;
		gap: 0.5em 1.25em;
		border-top: 0.15em solid var(--textSubColor);
	}
</style>
