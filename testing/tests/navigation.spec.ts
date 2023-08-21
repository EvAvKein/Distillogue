import {test, expect} from "@playwright/test";
import {signUp} from "../helpers/requestsByUi.js";

const sessionRequiredPage: string[] = ["/dashboard", "/post/create"];

test("Fail to navigate to any user-required page while not signed in", async ({page}) => {
	for (const pageURL of sessionRequiredPage) {
		await page.goto(pageURL);
		await expect(page).toHaveURL(/.*join/);
	}
});
test("Navigate to all user-required pages while signed in", async ({page}) => {
	await signUp(page);
	for (const pageURL of sessionRequiredPage) {
		await page.goto(pageURL);
		expect(page.url().includes(pageURL)).toBe(true);
	}
});
