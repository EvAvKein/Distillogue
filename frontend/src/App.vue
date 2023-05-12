<template>
	<layout />
	<router-view v-slot="{Component}">
		<transition name="swap" mode="out-in">
			<component :is="Component" />
		</transition>
	</router-view>
</template>

<script setup lang="ts">
	import layout from "./components/layout.vue";
</script>

<style>
	:root {
		/* filters generated via https://evavkein.com/toolbox/cssFilterGenerator */
		--textColor: #ffffff;
		--filterToTextColor: brightness(0) invert(1);
		--textSubColor: #b3b3b3;
		--filterToTextSubColor: brightness(0) saturate(100%) invert(74%) sepia(0%) saturate(4%) hue-rotate(273deg)
			brightness(98%) contrast(91%);
		--backgroundColor: #020c14;
		--filterToBackgroundColor: brightness(0) saturate(100%) invert(4%) sepia(6%) saturate(6548%) hue-rotate(166deg)
			brightness(100%) contrast(101%);
		--backgroundSubColor: #042b43;
		--filterToBackgroundSubColor: invert(13%) sepia(71%) saturate(783%) hue-rotate(165deg) brightness(92%)
			contrast(101%);
		--highlightColor: #f5cb32;
		--filterToHighlightColor: brightness(0) saturate(100%) invert(91%) sepia(83%) saturate(7499%) hue-rotate(325deg)
			brightness(101%) contrast(98%);
		--highlightSubColor: #d8b434;
		--filterToHighlightSubColor: brightness(0) saturate(100%) invert(62%) sepia(76%) saturate(412%) hue-rotate(9deg)
			brightness(102%) contrast(84%);
	}

	/* .lightMode {
    --textColor: #000000;
    --textSubColor: #000000;
    --backgroundColor: #000000;
    --backgroundSubColor: #000000;
    --highlightColor: #000000;
    --highlightSubColor: #000000;
  } */

	body {
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		font-family: sans-serif;
		letter-spacing: 0.03em;
		text-underline-offset: 0.05em;
		box-sizing: border-box;
		margin: 0;
		color: var(--textColor);
		background-color: var(--backgroundColor);
	}

	:focus {
		outline: none;
	}

	img {
		pointer-events: none;
		user-select: none;
	}

	h1,
	h2,
	h3,
	h4,
	h5,
	h6,
	p {
		margin: 0;
	}

	button,
	a,
	summary,
	input[type="checkbox"],
	select {
		cursor: pointer;
	}
	button,
	a,
	summary,
	input,
	textarea {
		font-size: inherit;
		font-family: inherit;
		border: none;
	}

	ol,
	ul {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	::-webkit-scrollbar {
		width: 1rem;
		height: 1rem;
	}
	::-webkit-scrollbar-track {
		background-color: var(--backgroundColor);
		margin: 0.2rem;
	}
	::-webkit-scrollbar-corner {
		background-color: var(--backgroundColor);
	}
	::-webkit-scrollbar-thumb {
		background-color: var(--textColor);
		border: 0.25rem solid var(--backgroundColor);
		border-radius: 3rem;
	}
	::-webkit-scrollbar-thumb:hover {
		background-color: var(--textSubColor);
	}

	/* core styling classes */
	.core_backgroundButton {
		color: var(--backgroundColor);
		text-align: center;
		background-color: var(--textColor);
		border-radius: 0.2em;
		text-decoration: none;
		padding: 0.5em;
		border-radius: 0.5em;
		transition: background-color 300ms;
	}
	.core_backgroundButton:focus,
	.core_backgroundButton:hover {
		background-color: var(--highlightSubColor);
	}
	.core_backgroundButton:active {
		background-color: var(--highlightColor);
	}
	.core_backgroundButton[inert] {
		background-color: var(--textSubColor);
	}

	.core_borderButton {
		background-color: transparent;
		color: var(--textColor);
		border: 0.15em solid var(--textColor);
		text-align: center;
		border-radius: 0.2em;
		text-decoration: none;
		padding: 0.5em;
		border-radius: 0.5em;
		transition: color 300ms, border-color 300ms;
	}
	.core_borderButton:focus,
	.core_borderButton:hover {
		color: var(--highlightSubColor);
		border-color: var(--highlightSubColor);
	}
	.core_borderButton:active {
		color: var(--highlightColor);
		border-color: var(--highlightColor);
	}
	.core_borderButton[inert] {
		color: var(--textSubColor);
		border-color: var(--textSubColor);
	}

	.core_contentButton {
		color: inherit;
		text-decoration: none;
		background-color: transparent;
		padding: 0;
	}
	.core_contentButton img {
		height: inherit;
		filter: var(--filterToTextColor);
	}
	.core_contentButton:focus,
	.core_contentButton:hover {
		color: var(--highlightSubColor);
	}
	.core_contentButton:active {
		color: var(--highlightColor);
	}
	.core_contentButton:focus img,
	.core_contentButton:hover img {
		filter: var(--filterToHighlightSubColor);
	}
	.core_contentButton:active img {
		filter: var(--filterToHighlightColor);
	}
	.core_contentButton[inert] {
		color: var(--textSubColor);
	}
	.core_contentButton[inert] img {
		filter: var(--filterToTextSubColor);
	}

	.core_crudeInput {
		outline: none;
		accent-color: var(--highlightColor);
	}
	.core_crudeInput:focus,
	.core_crudeInput:hover {
		box-shadow: 0 0 0.25em 0.25em var(--highlightSubColor);
	}

	/* core transitions */
	.swap-enter-from {
		opacity: 0;
		transform: translateY(-5em);
	}
	.swap-leave-to {
		opacity: 0;
		transform: translateY(-5em);
	}
	.swap-enter-active {
		transition: opacity 200ms ease-out, transform 250ms ease-out;
	}
	.swap-leave-active {
		transition: opacity 200ms ease-in, transform 250ms ease-in;
	}

	.collapse-enter-from,
	.collapse-leave-to {
		max-height: 0em;
		opacity: 0;
	}
	.collapse-leave-from,
	.collapse-enter-to {
		max-height: 99em;
		opacity: 1;
	}
	.collapse-enter-active {
		transition: opacity 300ms ease-out, max-height 350ms ease-in;
	}
	.collapse-leave-active {
		transition: opacity 250ms ease-in, max-height 300ms ease-out;
	}
</style>
