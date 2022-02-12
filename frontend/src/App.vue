<template>
  <layout/>
  <router-view/>
  <noscriptWarn/>
</template>

<script setup lang="ts">
  import noscriptWarn from "./components/noscript.vue";
  import layout from "./components/layout.vue";
</script>

<style>
:root {
  --textColor: #ffffff;
  --textSubColor: #b3b3b3;
  --backgroundColor: #020c14;
  --backgroundSubColor: #031b25;
  --highlightColor: #ECB365;
}

/* .lightMode {
  --textColor: #000000;
  --textSubColor: #000000;
  --backgroundColor: #000000;
  --backgroundSubColor: #000000;
  --highlightColor: #000000;
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

button,
.ofButtonStyling {
  cursor: pointer;
  border: none;
  color: var(--backgroundColor);
  background-color: var(--textColor);
  border-radius: 0.2em;
}
button:focus, button:hover
.ofButtonStyling:focus, .ofButtonStyling:hover{
  background-color: var(--highlightColor);
  outline: none;
}
</style>
