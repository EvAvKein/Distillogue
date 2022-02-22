import {createRouter, createWebHistory} from "vue-router";
import {useUser} from "./stores/user";

import home from "./pages/Home.vue";
import browse from "./pages/Browse.vue";
import createPost from "./pages/CreatePost.vue";
import dashboard from "./pages/Dashboard.vue";
import join from "./pages/join.vue";
import notFound from "./pages/NotFound.vue";

const routes = [
  {
    name: "home",
    path: "/",
    component: home,
  },
  {
    name: "browse",
    path: "/browse",
    component: browse,
    meta: {
      accountRequired: true,
    },
  },
  {
    name: "viewPost",
    path: "/post/:postId",
    component: createPost,
    meta: {
      accountRequired: true,
    },
  },
  {
    name: "dashboard",
    path: "/dashboard",
    component: dashboard,
    meta: {
      accountRequired: true,
    },
  },
  {
    name: "join",
    path: "/join",
    component: join,
  },
  {
    path: "/:pathMatch(.*)*",
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
  if (!user.data.id) {
    next({path: "/join"});
    return;
  };

  next();
});

export default router;