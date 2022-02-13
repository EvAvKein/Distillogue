<template>
  <header>
    <section id="leftSection">
      <nav>
        <router-link
          to="/"
          class="logo"
        >
          <img id="distillogo" src="../assets/placeholderLogo.svg"/>
        </router-link>
        <router-link v-if="user.registered"
          to="/browse"
          class="ofButtonStyling"
        >
          Browse
        </router-link>
        <router-link v-if="user.registered"
          to="/dashboard"
          class="ofButtonStyling"
        >
          Dashboard
        </router-link>
      </nav>
    </section>
    
    <section id="rightSection">
      <nav>
        <button v-if="user.registered" @click="logOut">Logout</button>
        <router-link v-else
          to="/join"
          class="ofButtonStyling"
        >
          Join
        </router-link>
      </nav>
    </section>  
  </header>
</template>

<script setup lang="ts">
  import {useRouter} from "vue-router";
  import {useUser} from "../stores/user";
  const user = useUser();
  const router = useRouter();

  function logOut() {
    user.$reset();
    router.push({path: "/join"});
  };
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
    display: flex;
    justify-content: space-between;
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
  nav a:not(.logo) {
    padding: 0.5em;
    border-radius: 0.5em;
    text-decoration: none;
  }
</style>