import type {PlaywrightTestConfig} from "@playwright/test";
import {devices} from "@playwright/test";

const config: PlaywrightTestConfig = {
	testDir: "./tests",

	expect: {timeout: 5 * 1000},

	use: {
		baseURL: "http://localhost:80",
		trace: "on",
		// launchOptions: {slowMo: 500},
	},

	reporter: [[process.env.CI ? "github" : "list"], ["html", {open: "never"}]],

	retries: process.env.CI ? 2 : 0, // i suspect the flakiness that's making this necessary is due to node and/or vue, a single retry might be sufficient after migrating to deno and/or nuxt/sveltekit

	projects: [
		{
			name: "chromium",
			use: {
				...devices["Desktop Chrome"],
			},
		},

		// { // commented-out to reduce test execution time (TODO: uncomment when nearing release-worthy state)
		// 	name: "firefox",
		// 	use: {
		// 		...devices["Desktop Firefox"],
		// 	},
		// },

		// { // commented-out due to an error, at least when testing on windows
		// 	name: "webkit",
		// 	use: {
		// 		...devices["Desktop Safari"],
		// 	},
		// },
	],

	outputDir: "test-results/",
};

export default config;
