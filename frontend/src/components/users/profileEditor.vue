<template>
  <section>
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
          editAuthAddress: '/user/me',
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
          editAuthAddress: '/user/me',
          dataName: 'about',
        },
        emSize: 1.5
      }"
    />
  </section>
</template>

<script setup lang="ts">
  import {useUser} from "../../stores/user";
  import textBox from '../../components/textBox.vue';
  const user = useUser();
</script>

<style scoped>
  * + * {margin-top: 1em;}
</style>