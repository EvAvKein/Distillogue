<template>
	<div>
		<textarea
			v-if="type === 'textarea'"
			:value="modelValue ?? ''"
			:id="inputId"
			:minLength="minLength"
			:maxlength="maxLength"
			:required="required"
			placeholder=" "
			@input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
		></textarea>
		<input
			v-else
			:type="type"
			:value="modelValue ?? ''"
			:id="inputId"
			:minLength="minLength"
			:maxLength="maxLength"
			:required="required"
			placeholder=" "
			@input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
		/>
		<label :for="inputId">{{ label || type }}</label>
		<notification :text="error" :desirablityStyle="false" />
	</div>
</template>

<script setup lang="ts">
	import notification from "./notification.vue";
	defineProps<{
		inputId: string;
		type: string;
		modelValue: string | number;
		label?: string;
		required?: boolean;
		minLength?: number;
		maxLength?: number;
		minLineHeight?: number;
		error?: string;
	}>();

	const emit = defineEmits(["update:modelValue"]);
</script>

<style scoped>
	* {
		font-size: inherit;
	}
	div {
		position: relative;
	}

	label {
		position: absolute;
		top: 1.35em;
		left: 0;
		color: var(--textSubColor);
		margin-left: 0.5em;
		cursor: text;
		transition: transform 250ms;
	}

	input,
	textarea {
		background-color: var(--backgroundColor);
		color: var(--textColor);
		margin-top: 1.3em;
		box-sizing: border-box;
		padding-left: 0.2em;
		width: 100%;
		border: none;
		border-left: 0.225em solid var(--textSubColor);
		min-height: v-bind("(minLineHeight || 1) * 1.15 + 'em'");
	}
	textarea {
		resize: vertical;
	}

	input:focus + label,
	textarea:focus + label {
		color: var(--highlightColor);
	}
	input:focus,
	textarea:focus {
		border-color: var(--highlightColor);
		outline: none;
	}

	label::first-letter {
		text-transform: capitalize;
	}
	input:focus + label,
	input:not(:placeholder-shown) + label,
	textarea:focus + label,
	textarea:not(:placeholder-shown) + label {
		cursor: default;
		text-decoration: underline;
		transform: translateY(-1.2em);
		transition: transform 150ms;
	}
	.notification {
		font-size: 0.65em;
	}
</style>
