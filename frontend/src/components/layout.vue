<template>
  <header>
    <section id="leftSection">
      <nav>
        <div v-if="user.data.id">
          <router-link v-if="user.data.id"
            :to="{name: 'browse'}"
            class="core_backgroundButton"
          >
            <img src="../assets/browse.svg"/>
            <span>Browse</span>
          </router-link>
          <router-link
            :to="{name: 'createPost'}"
            class="core_backgroundButton"
          >
            <img src="../assets/post.svg"/>
            <span>Post</span>
          </router-link>
        </div>
        <router-link v-else
          :to="{name: 'home'}"
          aria-label="Front page"
          id="logoLink"
        >
          <img src="../assets/logo.svg"/>
        </router-link>
      </nav>
    </section>
    
    <section id="rightSection">
      <nav>
        <div v-if="user.data.id">
          <router-link 
            :to="{name: 'dashboard'}"
            class="core_backgroundButton"
          >
            <img src="../assets/dashboard.svg"/>
            <span>Dashboard</span>
          </router-link>
          <button @click="logOut"
            class="core_backgroundButton"
          >
            <img src="../assets/leave.svg"/>
            <span>Logout</span>
          </button>
        </div>
        <router-link v-else
          :to="{name: 'join'}"
          class="core_backgroundButton"
        >
          <img src="../assets/userWithoutPfp.svg"/>
          <span>Join</span>
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
    localStorage.removeItem("authKey");
    router.push({name: "join"});
  };
</script>

<style scoped>
  header {
    position: sticky;
    top: 0;
    left: 0;
    width: 100%;
    height: 4em;
    z-index: 900;
    white-space: nowrap;
    background-color: var(--backgroundColor);
    display: flex;
    justify-content: space-between;
  }

  #logoLink {height: 2.75em} /* without explictly declaring this, the button is annoying higher (not taller) than its box-shadow (at least on chrome 99) */ 
  #logoLink img {height: 2.75em}
  #logoLink:focus, #logoLink:hover {
    outline: none;
    border-radius: 10em;
    box-shadow: 0em 0em 0.35em 0.35em var(--highlightSubColor);
  }
  #logoLink:active {box-shadow: 0em 0em 0.35em 0.35em var(--highlightColor)}

  nav, nav > div {
    height: 3em;
    margin: 0.5em;
    width: fit-content;
    display: flex;
    align-items: center;
    gap: 0.5em;
  }

  .core_backgroundButton {font-size: 0.9em}

  img:not(#logoLink img) {
    height: 1.25em;
    vertical-align: middle;
    filter: var(--filterToBackgroundColor);
  }

  span {
    font-size: 1.1em;
    vertical-align: top;
    margin-left: 0.25em;
    display: none;
  }

  @media (min-width: 32rem) {
    span {display: inline}
  }
</style>