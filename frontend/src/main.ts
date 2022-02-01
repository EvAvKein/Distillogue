import {createApp} from 'vue';
import App from "./App.vue";
import Router from './router';
import {createPinia} from "pinia";

createApp(App)
  .use(createPinia())
  .use(Router)
.mount('body');