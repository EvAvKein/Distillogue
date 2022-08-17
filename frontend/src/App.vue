<template>
  <layout/>
  <noscriptWarn/>
  <router-view v-slot="{Component}">
    <transition name="swap" mode="out-in">
      <component :is="Component"/>
    </Transition>
  </router-view>
</template>

<script setup lang="ts">
  import noscriptWarn from "./components/noscript.vue";
  import layout from "./components/layout.vue";
</script>

<style>
  /* foundational */
  :root {
    --textColor: #ffffff;
    --filterToTextColor: brightness(0) invert(1);
    --textSubColor: #b3b3b3;
    --filterToTextSubColor: brightness(0) saturate(100%) invert(74%) sepia(0%) saturate(4%) hue-rotate(273deg) brightness(98%) contrast(91%); /* created via https://codepen.io/sosuke/pen/Pjoqqp */
    --backgroundColor: #020c14;
    --filterToBackgroundColor: brightness(0) saturate(100%) invert(4%) sepia(6%) saturate(6548%) hue-rotate(166deg) brightness(100%) contrast(101%); /* created via https://codepen.io/sosuke/pen/Pjoqqp */
    --backgroundSubColor: #042b43;
    --filterToBackgroundSubColor: invert(13%) sepia(71%) saturate(783%) hue-rotate(165deg) brightness(92%) contrast(101%); /* created via https://codepen.io/sosuke/pen/Pjoqqp */
    --highlightColor: #ECB365;
    --filterToHighlightColor: brightness(0) saturate(100%) invert(90%) sepia(71%) saturate(5554%) hue-rotate(308deg) brightness(95%) contrast(94%); /* created via https://codepen.io/sosuke/pen/Pjoqqp */
    --highlightSubColor: #c29454;
    --filterToHighlightSubColor: brightness(0) saturate(100%) invert(65%) sepia(16%) saturate(1265%) hue-rotate(355deg) brightness(92%) contrast(85%); /* created via https://codepen.io/sosuke/pen/Pjoqqp */
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

  img {pointer-events: none}

  button {font-size: inherit}

  button, a, summary {
    cursor: pointer;
    border: none;
    outline: none;
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
    background-color: var(--backgroundColor)
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
    background-color: var(--textColor);
    border-radius: 0.2em;
    text-decoration: none;
    padding: 0.5em;
    border-radius: 0.5em;
  }
  .core_backgroundButton:focus, .core_backgroundButton:hover {
    background-color: var(--highlightSubColor);
  }
  .core_backgroundButton:active {
    background-color: var(--highlightColor);
  }

  .core_contentButton {
    color: inherit;
    background-color: transparent;
    padding: 0;
  }
  .core_contentButton img {
    height: inherit;
    filter: var(--filterToTextColor);
  }
  .core_contentButton:focus, .core_contentButton:hover {
    color: var(--highlightSubColor);
  }
  .core_contentButton:active {
    color: var(--highlightColor);
  }
  .core_contentButton:focus img, .core_contentButton:hover img {
    filter: var(--filterToHighlightSubColor);
  }
  .core_contentButton:active img {
    filter: var(--filterToHighlightColor);
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

  .collapse-enter-from, .collapse-leave-to {
    max-height: 0em;
    opacity: 0;
  }
  .collapse-leave-from, .collapse-enter-to {
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
