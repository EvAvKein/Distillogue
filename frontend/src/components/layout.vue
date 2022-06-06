<template>
  <header>
    <section id="leftSection">
      <nav>
        <router-link
          :to="{name: 'home'}"
          id="logoLink"
        >
          <img src="../assets/logo.svg"/>
        </router-link>
        <router-link v-if="user.data.id"
          :to="{name: 'browse'}"
          class="globalStyle_textButton"
        >
          Browse
        </router-link>
        <router-link v-if="user.data.id"
          :to="{name: 'createPost'}"
          class="globalStyle_textButton"
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
            class="globalStyle_textButton"
          >
            Dashboard
          </router-link>
          <button @click="logOut"
            class="globalStyle_textButton"
          >
            Logout
          </button>
        </div>
        <router-link v-else
          :to="{name: 'join'}"
          class="globalStyle_textButton"
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
    background-color: var(--backgroundColor);
    display: flex;
    justify-content: space-between;
  }

  #logoLink {height: 2.75em} /* without explictly declaring this, the button's height is annoying taller than its content for some unknown reason (at least on chrome 99) */ 
  #logoLink:focus, #logoLink:hover {
    outline: none;
    border-radius: 10em;
    box-shadow: 0em 0em 0.35em 0.35em var(--highlightSubColor);
  }
  #logoLink:active {box-shadow: 0em 0em 0.35em 0.35em var(--highlightColor);}
  #logoLink img {height: 2.75em}

  nav, nav > div {
    height: 3em;
    margin: 0.5em;
    width: fit-content;
    display: flex;
    align-items: center;
    gap: 0.5em
  }
</style>