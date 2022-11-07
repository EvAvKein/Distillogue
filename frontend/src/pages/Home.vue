<template>
  <main>
    <h1>Distillogue</h1>
    <img src="../assets/logo.svg" alt="Distillogue's Logo: A chemistry flask, with bubbling liquids, hung on a stand"/>

    <section>
      <notification
        :text="`DISCLAIMER: THIS SITE IS A DEMO
          This project is in very early development, and currently hosted only for my programming portfolio.
          Any data you submit here is public (no proper authentication yet, only usernames) and very temporary (for rapid development's sake, all user-generated data is deleted on every update)`"
        :desirablityStyle="false"
        :customDuration="null"
      />
    </section>
  </main>
</template>

<script setup lang="ts">
  import notification from "../components/notification.vue";
</script>

<style scoped>
  main {
    font-size: clamp(0.7em, 2vw, 1em);
    max-width: 60em;
    margin-inline: auto;
    padding: 0 0.75em 0.75em;
  }

  h1 {
    font-size: 5em;
    text-align: center;
  }

  img {
    height: 12.5em;
    display: block;
    margin-inline: auto;
  }

  section {
    font-size: 1.25em;
  }
</style>