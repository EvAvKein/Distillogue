import {createRouter, createWebHistory} from "vue-router";
import {useUser} from "./stores/user";
import {apiFetch} from "./helpers/apiFetch";
import {UserData} from "../../shared/objects/user";

import notFound from "./pages/NotFound.vue";
import home from "./pages/Home.vue";
import about from "./pages/About.vue";
import terms from "./pages/Terms.vue";
import join from "./pages/User/Join.vue";
import browse from "./pages/Post/Browse.vue";
import createPost from "./pages/Post/Create.vue";
import viewPost from "./pages/Post/View.vue";
import dashboard from "./pages/User/Dashboard.vue";
import dashboard_profile from "./pages/User/dashboardSections/Profile.vue";
import dashboard_drafts from "./pages/User/dashboardSections/Drafts.vue";
import dashboard_presets from "./pages/User/dashboardSections/Presets.vue";
import dashboard_contacts from "./pages/User/dashboardSections/Contacts.vue";
import admin from "./pages/Admin/Admin.vue";
import admin_feeds from "./pages/Admin/adminSections/Feeds.vue";

const router = createRouter({
	history: createWebHistory(process.env.BASE_URL),
	routes: [
		{
			name: "home",
			path: "/",
			component: home,
			beforeEnter(to, from, next) {
				const user = useUser();
				user.data ? next({name: "browse"}) : next();
			},
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
			name: "admin",
			path: "/admin",
			component: admin,
			redirect: "/admin/feeds",
			children: [
				{
					name: "admin_feeds",
					path: "feeds",
					component: admin_feeds,
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
		await apiFetch("GET", "/users").then(({error, data: body, status}) => {
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
		sessionStorage.setItem("witheldForSession", to.fullPath);
		next({path: "/join"});
		return;
	}

	if (from.name === "join" && user.data) {
		const withheldPage = sessionStorage.getItem("witheldForSession");
		if (withheldPage) {
			sessionStorage.removeItem("witheldForSession");
			next({path: withheldPage});
			return;
		}
	}

	next();
});

export default router;
