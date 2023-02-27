import type {PlaywrightTestConfig} from "@playwright/test";
import {devices} from "@playwright/test";

const config: PlaywrightTestConfig = {
	testDir: "./tests",

	expect: {timeout: 5 * 1000},

	use: {
		baseURL: `http://${process.env.DOCKERIZED ? "backend" : "localhost"}:3000`,
		trace: "on",
		// launchOptions: {slowMo: 500},
	},

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
