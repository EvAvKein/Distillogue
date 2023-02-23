import {createRouter, createWebHistory} from "vue-router";
import {useUser} from "./stores/user";
import {apiFetch} from "./helpers/apiFetch";
import {UserData} from "../../shared/objects/user";

import notFound from "./pages/NotFound.vue";
import home from "./pages/Home.vue";
import about from "./pages/About.vue";
import terms from "./pages/Terms.vue";
import join from "./pages/Join.vue";
import browse from "./pages/Browse.vue";
import createPost from "./pages/CreatePost.vue";
import viewPost from "./pages/ViewPost.vue";
import dashboard from "./pages/Dashboard.vue";

const router = createRouter({
	history: createWebHistory(process.env.BASE_URL),
	routes: [
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
			name: "join",
			path: "/join",
			component: join,
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
			path: "/:pathMatch(.*)*",
			component: notFound,
		},
	],
});

router.beforeEach(async (to, from, next) => {
	const user = useUser();
	const sessionKey = localStorage.getItem("sessionKey");

	if (sessionKey && !user.data) {
		await apiFetch("GET", "/sessions").then(({error, data: body, status}) => {
			if (!error) {
				user.data = body as UserData;
				return;
			}

			if (status && status >= 400 && status < 500) {
				localStorage.removeItem("sessionKey");
				user.$reset();
			}
		});
	}

	const accountRequired = to.matched.some((record) => record.meta.accountRequired);
	if (accountRequired && !user.data) {
		next({path: "/join"});
		return;
	}

	next();
});

export default router;
