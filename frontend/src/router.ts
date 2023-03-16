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
import dashboard_profile from "./components/users/dashboardSections/profileEditor.vue";
import dashboard_drafts from "./components/users/dashboardSections/draftsEditor.vue";
import dashboard_presets from "./components/users/dashboardSections/presetsEditor.vue";
import dashboard_contacts from "./components/users/dashboardSections/contactsEditor.vue";

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
			path: "/post",
			redirect: {name: "createPost"},
			children: [
				{
					name: "createPost",
					path: "create",
					component: createPost,
					meta: {
						accountRequired: true,
					},
				},
				{
					name: "viewPost",
					path: ":postId",
					component: viewPost,
					props: true,
				},
			],
		},
		{
			name: "dashboard",
			path: "/dashboard",
			component: dashboard,
			redirect: "/dashboard/profile",
			meta: {
				accountRequired: true,
			},
			children: [
				{
					name: "dashboard_profile",
					path: "profile",
					component: dashboard_profile,
				},
				{
					name: "dashboard_drafts",
					path: "drafts",
					component: dashboard_drafts,
				},
				{
					name: "dashboard_presets",
					path: "presets",
					component: dashboard_presets,
				},
				{
					name: "dashboard_contacts",
					path: "contacts",
					component: dashboard_contacts,
				},
			],
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
