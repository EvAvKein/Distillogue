import {createRouter, createWebHistory} from 'vue-router';

import home from './pages/Home.vue';
import browse from './pages/Browse.vue';
import dashboard from './pages/Dashboard.vue';
import join from './pages/join.vue';
import notFound from "./pages/NotFound.vue";

const routes = [
  {path: '/',
   component: home},
  {path: '/browse',
   component: browse},
  {path: '/dashboard',
   component: dashboard},
  {path: '/join',
   component: join},
  {path: '/:pathMatch(.*)*',
   component: notFound}
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

export default router;