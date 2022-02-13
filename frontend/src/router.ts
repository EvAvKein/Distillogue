import {createRouter, createWebHistory} from 'vue-router';
import {useUser} from './stores/user';

import home from './pages/Home.vue';
import browse from './pages/Browse.vue';
import dashboard from './pages/Dashboard.vue';
import join from './pages/join.vue';
import notFound from "./pages/NotFound.vue";

const routes = [
  {
    path: '/',
    component: home,
  },
  {
    path: '/browse',
    component: browse,
    meta: {
      accountRequired: true,
    },
  },
  {
    path: '/dashboard',
    component: dashboard,
    meta: {
      accountRequired: true,
    },
  },
  {
    path: '/join',
    component: join,
  },
  {
    path: '/:pathMatch(.*)*',
    component: notFound,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  const accountRequired = to.matched.some(record => record.meta.accountRequired);
  if (!accountRequired) {
    next();
    return;
  };

  const user = useUser();
  if (!user.registered) {
    next({path: '/join'});
    return;
  };

  next();
});

export default router;