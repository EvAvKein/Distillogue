import type {PlaywrightTestConfig} from "@playwright/test";
import {devices} from "@playwright/test";

const config: PlaywrightTestConfig = {
	testDir: "./tests",

	timeout: 60 * 1000,
	expect: {timeout: 5 * 1000},

	reporter: process.env.CI ? "line" : "html",
	use: {
		baseURL: "http://localhost:3000",
		trace: "on",
	},

	projects: [
		{
			name: "chromium",
			use: {
				...devices["Desktop Chrome"],
			},
		},

		// { // commented-out to reduce text execution time
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
