<template>
	<transition name="notification">
		<p v-if="text" :class="'notification ' + styleClass" role="alert">
			<!--
				TODO - resolve accessibility issue: according to MDN, aria-live (which is implicit in role="alert") doesn't trigger when the element is added to the DOM.
				the solution that immediately came to mind was v-show, but that results in unintuitive test results (e.g. playwright counts the element as visible even when v-show makes them not, attempting to find and read a single notif results in the test failing due to locating multiple elements due to unshown ones)
			-->
			{{ text }}
		</p>
	</transition>
</template>

<script setup lang="ts">
	import {watch, computed} from "vue";
	import {debounce} from "../helpers/debounce";

	const props = defineProps<{
		text: string;
		desirablityStyle: boolean | null;
		customDuration?: number | null;
	}>();

	const emit = defineEmits(["update:text"]);

	watch(
		() => props.text,
		(newText) => {
			if (newText && props.customDuration !== null) {
				debounce(props.customDuration || 3000 + newText.length * 150, () => emit("update:text", ""));
			}
		}
	);

	const styleClass = computed(() => {
		if (props.desirablityStyle === true) return "positive";
		if (props.desirablityStyle === false) return "negative";
		return "";
	});
</script>

<style scoped>
	.notification {
		width: fit-content;
		height: fit-content;
		text-align: center;
		font-size: 1em;
		padding: 0.3em;
		color: var(--textColor);
		background-color: #666666;
		border-inline: 0.2em solid #888888;
		margin: 0.75em auto 0.75em;
	}
	.notification.negative {
		border-color: #ff0000;
		background-color: #880000;
	}
	.notification.positive {
		border-color: #00ff00;
		background-color: #008800;
	}

	.notification-enter-from {
		max-height: 0em;
		opacity: 0;
	}
	.notification-enter-to {
		max-height: 15em;
		opacity: 1;
	}
	.notification-enter-active {
		transition: all 300ms ease-in;
	}
	/* no leave transition because when the text is removed the element instantly snaps to its minimum size, and any transition after that only gives the user more time to notice what remains after the snapping. a fix to prevent/minimize the snapping would be much appreciated */
</style>
