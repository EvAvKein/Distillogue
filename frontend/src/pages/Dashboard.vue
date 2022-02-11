<template>
  <main>
    <textBox
      :title="{
        text: 'Name',
        headingRank: 4,
        emSize: 1
      }"
      :content="{
        text: user.data.name,
        singleLine: true,
        editable: {
          editAuthAddress: '/editProfileInfo',
          dataName: 'name',
        },
        emSize: 1.5
      }"
    />
    <textBox
      :title="{
        text: 'About',
        headingRank: 4,
        emSize: 1
      }"
      :content="{
        text: user.data.about || '',
        editable: {
          editAuthAddress: '/editProfileInfo',
          dataName: 'about',
        },
        emSize: 1.5
      }"
    />
  </main>
</template>

<script setup lang="ts">
  import {useUser} from "../stores/user";
  import textBox from '../components/textBox.vue';
  const user = useUser();
</script>

<style scoped>
  main {
    padding: 1em;
    display: flex;
    flex-flow: column nowrap;
    gap: 1em;
  }

  main > * {
    width: clamp(15em, 90vw, 90em);
  }
</style>