<template>
  <header>
    <section id="leftSection">
      <nav>
        <router-link to="/">
          <img id="distillogo" src="../assets/placeholderLogo.svg"/>
        </router-link>
        <router-link to="/browse">Browse</router-link>
        <router-link to="/dashboard">Dashboard</router-link>
        <router-link to="/join">Join</router-link>
      </nav>
    </section>
    
    <section id="rightSection">

    </section>
  </header>
</template>

<script setup lang="ts">
</script>

<style scoped>
  header {
    position: sticky;
    top: 0;
    left: 0;
    width: 100%;
    height: 4rem;
    z-index: 900;
    background-color: var(--backgroundColor);
  }

  nav {
    height: 3rem;
    margin: 0.5rem;
    width: fit-content;
    display: flex;
    align-items: center;
    gap: 0.5rem
  }
  nav img {height: 2.75rem}
  nav a:not(:first-child) {
    background-color: var(--textColor);
    color: var(--backgroundColor);
    padding: 0.5em;
    border-radius: 0.5em;
    text-decoration: none;
  }
  nav a:not(:first-child):hover {
    background-color: var(--highlightColor);
  }
  
</style>