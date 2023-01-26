import {test, expect} from "@playwright/test";
import {signIn, signUp} from "../helpers/shortcuts.js";
import {randomUsername} from "../helpers/randomAlphanumString.js";

test.describe.fixme("User session CRUD", () => {
	let username = "Session" + randomUsername();
	let sessionKey: string;

	test("Sign up & navigate to session-required page", async ({page}) => {
		await signUp(page, username);
		sessionKey = window.localStorage.getItem("sessionKey") || "";

		await page.locator("header").getByText("Post").click();

		await expect(page).toHaveURL(/.*post\/create/);
	});

	test("Sign out & fail to access session-required page", async ({page}) => {
		await page.locator("header").getByText("Logout").click();
		await expect(page).toHaveURL(/.*join/);
		expect(window.localStorage.getItem("sessionKey")).toBeFalsy();

		await page.goto("/post/create");
		await expect(page).not.toHaveURL(/.*post\/create/);
		await expect(page).toHaveURL(/.*join/);
	});

	test("Fail to reuse deleted session by inserting key to localStorage", async ({page}) => {
		window.localStorage.setItem("sessionKey", sessionKey || "");

		await page.goto("/post/create");
		await expect(page).not.toHaveURL(/.*post\/create/);
		await expect(page).toHaveURL(/.*join/);
	});

	test("Sign in & obtain new session key", async ({page}) => {
		await signIn(page, username);

		const newKey = window.localStorage.getItem("sessionKey");
		expect(newKey).toBeTruthy();
		expect(newKey).not.toEqual(sessionKey);
	});

	// test("View & update session in dashboard (TODO pending dashboard section)", async () => {});
});
