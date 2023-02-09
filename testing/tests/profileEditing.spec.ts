import {test, expect} from "@playwright/test";
import {signUp} from "../helpers/requestsByUi.js";
import {randomUsername} from "../helpers/randomAlphanumString.js";

test.describe.fixme("Profile editing", () => {
	let username = "User" + randomUsername();

	test("Setup (sign-up & go to Dashboard)", async ({page}) => {
		await signUp(page, username);
		await page.locator("header").getByText("Dashboard").click();

		await expect(page.getByLabel("Name")).toHaveValue(username);
		expect(await page.locator("#dashboardSubmit").count()).toBeFalsy();
	});

	test("Edit and refresh to cancel", async ({page}) => {
		await page.getByLabel("Name").fill("Temporary");
		await expect(page.locator("#dashboardSubmit")).toBeVisible();

		await page.reload();
		await expect(page.getByLabel("Name")).toHaveValue(username);
		expect(await page.locator("#dashboardSubmit").count()).toBeFalsy();
	});

	test("Edit and restore to cancel", async ({page}) => {
		await page.getByLabel("Name").fill("Temporary2");
		await expect(page.locator("#dashboardSubmit")).toBeVisible();

		await page.getByLabel("Name").fill(username);
		expect(await page.locator("#dashboardSubmit").count()).toBeFalsy();
	});

	test("Edit and save", async ({page}) => {
		const newUsername = "User2" + randomUsername();

		await page.getByLabel("Name").fill(newUsername);
		await page.locator("#dashboardSubmit").click();

		await expect(page.locator(".notification.positive")).toBeVisible();
		expect(await page.locator("#dashboardSubmit").count()).toBeFalsy();
		await page.getByLabel("Name").fill(newUsername);

		await page.reload();
		await expect(page.getByLabel("Name")).toHaveValue(newUsername);
	});
});
