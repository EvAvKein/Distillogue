import {expect, type Page, type APIRequestContext} from "@playwright/test";
import {randomUsername, randomNodeTitle, randomNodeBody} from "./randomAlphanumString.js";
import {NodeCreationRequest, PostCreationRequest} from "../../shared/objects/api.js";
import {type PostAccess, type PostConfig, type Post} from "../../shared/objects/post.js";
import {type FetchResponse} from "../../shared/objects/api.js";
import * as api from "./requestsByApi.js";

export async function signUp(page: Page, name?: string) {
	await page.goto("/join");

	await expect(page.getByText("Sign Up")).toBeVisible();
	await page.locator("input").fill(name ?? randomUsername());
	await page.getByRole("button", {name: "Continue"}).click();

	await expect(page).toHaveURL(/.*browse/);
}

export async function signIn(page: Page, name: string) {
	await page.goto("/join");
	await page.getByRole("button", {name: "Switch to sign-in"}).click();

	await expect(page.getByText("Sign In")).toBeVisible();
	await page.locator("input").fill(name);
	await page.getByRole("button", {name: "Continue"}).click();

	await expect(page).toHaveURL(/.*browse/);
}

export async function signOut(page: Page) {
	await page.locator("header").getByText("Logout").click();
}

export async function createPost(
	page: Page,
	title: string,
	body: string,
	extraConfiguration?: (page: Page) => Promise<void>
) {
	await page.goto("/post/create");

	await page.getByLabel("Title").fill(title);
	await page.getByLabel("Body").fill(body);
	if (extraConfiguration) await extraConfiguration(page);

	await page.getByRole("button", {name: "Post"}).click();
	await expect(page).toHaveURL(/post\/.*/);
	await expect(page.locator(".notification.negative")).not.toBeVisible();
}

export async function createReply(page: Page, nodeTitlesPath: string[], replyTitle?: string, replyBody?: string) {
	await expandNodePath(page, nodeTitlesPath);

	const parentNode = page.locator(".node", {has: page.getByText(nodeTitlesPath[nodeTitlesPath.length - 1])});
	await parentNode.locator(".replyButton").click();

	const replyForm = page.locator("dialog");
	await replyForm.getByLabel("Title").fill(replyTitle || randomNodeTitle());
	await replyForm.getByLabel("Body").fill(replyBody || randomNodeBody());
	await replyForm.getByRole("button", {name: "Reply"}).click();
}

export async function expandConfigCategories(page: Page) {
	for (const category of await page.locator("#editConfig .category").all()) {
		if ((await category.getAttribute("aria-expanded")) === "false") {
			await category.locator("> button").click();
		}
	}
}

export async function expandNodePath(page: Page, nodeTitlesPath: string[]) {
	for (const replyTitle of nodeTitlesPath.slice(1)) {
		const node = page.locator(".node", {has: page.locator(`text="${replyTitle}"`)});
		if ((await node.getAttribute("id")) === "central") continue;
		const nodeExpanded = await node.locator(".body").isVisible();
		if (!nodeExpanded) await node.getByText(replyTitle).click();
	}
}

export async function setupUserWithPostAndOpen(
	page: Page,
	request: APIRequestContext,
	postConfig?: PostConfig,
	postAccess?: PostAccess
) {
	const user = await api.signUp(request, page);

	const post: Post = (
		await (
			await api.createPost(
				request,
				user.sessionKey,
				new PostCreationRequest(
					new NodeCreationRequest(randomNodeTitle(), randomNodeBody()),
					postConfig ?? {},
					postAccess ?? {users: [{name: user.data.name, id: user.data.id, roles: []}]}
				)
			)
		).json()
	).data;

	await page.goto("/post/" + post.thread.id);

	return {user, post};
}

export function idOfPostByPage(page: Page) {
	return page.url().replace(/^(.*)posts\//, "");
}
