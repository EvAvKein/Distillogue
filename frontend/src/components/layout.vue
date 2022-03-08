<template>
  <header>
    <section id="leftSection">
      <nav>
        <router-link
          :to="{name: 'home'}"
          class="logo"
        >
          <img id="distillogo" src="../assets/logo.svg"/>
        </router-link>
        <router-link v-if="user.data.id"
          :to="{name: 'browse'}"
          class="ofButtonStyling"
        >
          Browse
        </router-link>
        <router-link v-if="user.data.id"
          :to="{name: 'createPost'}"
          class="ofButtonStyling"
        >
          Post
        </router-link>
      </nav>
    </section>
    
    <section id="rightSection">
      <nav>
        <div v-if="user.data.id">
          <router-link 
            :to="{name: 'dashboard'}"
            class="ofButtonStyling"
          >
            Dashboard
          </router-link>
          <button @click="logOut"
            class="ofButtonStyling"
          >
            Logout
          </button>
        </div>
        <router-link v-else
          :to="{name: 'join'}"
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
    router.push({name: "join"});
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

  nav, nav > div {
    height: 3rem;
    margin: 0.5rem;
    width: fit-content;
    display: flex;
    align-items: center;
    gap: 0.5rem
  }
  nav img {height: 2.75rem}
</style>