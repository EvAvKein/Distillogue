import {expect, type Page} from "@playwright/test";

async function signUp(page: Page, name: string) {
	await page.goto("/join");

	await expect(page.getByText("Sign Up")).toBeVisible();
	await page.locator("input").fill(name);
	await page.getByRole("button", {name: "Continue"}).click();

	await expect(page).toHaveURL(/.*browse/);
}

async function signIn(page: Page, name: string) {
	await page.goto("/join");
	await page.getByRole("button", {name: "Switch to sign-in"}).click();

	await expect(page.getByText("Sign In")).toBeVisible();
	await page.locator("input").fill(name);
	await page.getByRole("button", {name: "Continue"}).click();

	await expect(page).toHaveURL(/.*browse/);
}

async function createPost(page: Page, title: string, body: string, extraConfiguration?: (page: Page) => Promise<void>) {
	await page.goto("/post/create");

	await page.getByLabel("Title").fill(title);
	await page.getByLabel("Body").fill(body);
	if (extraConfiguration) await extraConfiguration(page);

	await page.getByRole("button", {name: "Post"}).click();

	await expect(page).toHaveURL(/.*browse/);
	await expect(page.locator("li").first()).toContainText(title);
}

async function createReply(page: Page, nodeTitlesPath: string[], replyTitle: string, replyBody: string) {
	await expandNodePath(page, nodeTitlesPath);

	const parentNode = page.locator(".node", {has: page.getByText(nodeTitlesPath[nodeTitlesPath.length - 1])});
	await parentNode.locator(".replyButton").click();

	const replyForm = page.locator("dialog");
	await replyForm.getByLabel("Title").fill(replyTitle);
	await replyForm.getByLabel("Body").fill(replyBody);
	await replyForm.getByRole("button", {name: "Reply"}).click();
}

async function expandConfigCategories(page: Page) {
	const closedCategories = await page.locator('.configCategory[aria-label="Closed category"] > button').all();
	closedCategories.forEach(async (category) => await category.click());
}

async function expandNodePath(page: Page, nodeTitlesPath: string[]) {
	nodeTitlesPath.slice(1).forEach(async (replyTitle) => {
		const node = page.locator(".node:not(#central)", {has: page.locator(`text="${replyTitle}"`)});
		const nodeExpanded = await node.locator(".body").isVisible();
		if (!nodeExpanded) node.getByText(replyTitle).click();
	});
}

export {signUp, signIn, createPost, createReply, expandConfigCategories, expandNodePath};
