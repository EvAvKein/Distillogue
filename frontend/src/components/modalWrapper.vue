<template>
	<Teleport :to="'body'">
		<transition name="modal">
			<div v-show="activeByTruthiness" aria-live="assertive" id="backdrop" @mousedown="emitDeactivateIfClicked">
				<dialog open>
					<slot></slot>
				</dialog>
			</div>
		</transition>
	</Teleport>
</template>

<script setup lang="ts">
	import {toRef, watch, onUnmounted} from "vue";

	const props = defineProps<{
		activeByTruthiness: any;
	}>();

	const emit = defineEmits(["deactivate"]); // emitting a deactivation request, as opposed to deactivating within this component, allows the parent component to set the variable used for activeByTruthiness to whichever falsey is appropriate for its type

	function emitDeactivateIfClicked(event: Event) {
		if (event.target === event.currentTarget) {
			emit("deactivate");
		}
	}

	function deactivateIfActive(event: KeyboardEvent) {
		if (props.activeByTruthiness && ["Esc", "Escape"].includes(event.key)) {
			emit("deactivate");
		}
	}

	document.addEventListener("keydown", deactivateIfActive);
	onUnmounted(() => {
		document.removeEventListener("keydown", deactivateIfActive);
	});

	const modalTruthiness = toRef(props, "activeByTruthiness");

	const header = document.querySelector("header")!;
	const main = document.querySelector("main")!;

	watch(modalTruthiness, (newTruthiness) => {
		main.style.overflow = newTruthiness ? "hidden" : "initial";

		[header, main].forEach((element) => {
			element.inert = Boolean(props.activeByTruthiness);
		});
	});
</script>

<style scoped>
	#backdrop {
		z-index: 950;
		position: fixed;
		top: 0;
		left: 0;
		height: 100%;
		width: 100%;
		background-color: #00000044;
		backdrop-filter: blur(1.75rem);
		display: flex;
		justify-content: center;
		overflow: auto;
	}

	dialog {
		position: relative;
		margin: auto;
		padding: 0;
		background-color: transparent;
		border: none;
	}

	.modal-enter-from,
	.modal-leave-to {
		opacity: 0;
	}

	.modal-enter-active,
	.modal-leave-active {
		transition: opacity 200ms;
	}
</style>
