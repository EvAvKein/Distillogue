import {createRouter, createWebHistory} from "vue-router";
import {useUser} from "./stores/user";
import {apiFetch} from "./helpers/apiFetch";
import {UserData} from "../../shared/objects/user";

import home from "./pages/Home.vue";
import about from "./pages/About.vue";
import terms from "./pages/Terms.vue";
import browse from "./pages/Browse.vue";
import createPost from "./pages/CreatePost.vue";
import viewPost from "./pages/ViewPost.vue";
import dashboard from "./pages/Dashboard.vue";
import join from "./pages/Join.vue";
import notFound from "./pages/NotFound.vue";

const routes = [
	{
		name: "home",
		path: "/",
		component: home,
	},
	{
		name: "about",
		path: "/about",
		component: about,
	},
	{
		name: "terms",
		path: "/terms",
		component: terms,
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
		name: "createPost",
		path: "/post/create",
		component: createPost,
		meta: {
			accountRequired: true,
		},
	},
	{
		name: "viewPost",
		path: "/post/:postId",
		component: viewPost,
		props: true,
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

router.beforeEach(async (to, from, next) => {
	const user = useUser();
	const sessionKey = localStorage.getItem("sessionKey");

	if (sessionKey && !user.data) {
		await apiFetch("GET", "/sessions").then((response) => {
			if (!response.error) {
				user.data = response.data as UserData;
			}
		});
	}

	const accountRequired = to.matched.some((record) => record.meta.accountRequired);
	if (!accountRequired) {
		next();
		return;
	}

	if (!user.data) {
		next({path: "/join"});
		return;
	}

	next();
});

export default router;
