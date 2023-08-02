import {test, expect, type Page} from "@playwright/test";
import * as api from "../../helpers/requestsByApi.js";
import {
	randomNodeTitle,
	randomNodeBody,
	randomUsername,
	randomAlphanumString,
} from "../../helpers/randomAlphanumString.js";
import {FetchResponse, NodeCreationRequest, PostCreationRequest} from "../../../shared/objects/api.js";
import {PostSummary} from "../../../shared/objects/post.js";

const selectors = {
	searchInput: "input[type=search]",
	searchDesc: "#summariesSearch p",
};

test.describe("URL query", () => {
	test("Initial search by query in URL", async ({request, page}) => {
		await api.signUp(request, page);

		const searchValue = randomAlphanumString();
		const pagePathWithSearch = "/browse?search=" + searchValue;
		await page.goto(pagePathWithSearch);
		await expect(page.locator(selectors.searchInput)).toHaveValue(searchValue);
		await expect(page.locator(selectors.searchDesc)).toContainText(`results for "${searchValue}"`);
		await expect(page).toHaveURL(pagePathWithSearch);
	});

	test("URL query updated by search input", async ({request, page}) => {
		await api.signUp(request, page);

		const searchValue = randomAlphanumString();
		const pagePathWithSearch = "/browse?search=" + searchValue;
		await page.goto(pagePathWithSearch);
		page.locator(selectors.searchInput).fill(searchValue);
		await expect(page.locator(selectors.searchDesc)).toContainText(`results for "${searchValue}"`);
		await expect(page).toHaveURL(pagePathWithSearch);
	});

	test("Graceful handling of multiple queries in URL", async ({request, page}) => {
		await api.signUp(request, page);

		const firstSearchValue = randomAlphanumString();
		const pagePathWithSearches = `/browse?search=${firstSearchValue}&search=${randomAlphanumString()}`;
		await page.goto(pagePathWithSearches);
		await expect(page.locator(selectors.searchInput)).toHaveValue(firstSearchValue);
		await expect(page.locator(selectors.searchDesc)).toContainText(`results for "${firstSearchValue}"`);
	});
});

test.describe("Posts sorting", () => {
	test("Ordered by newest on default", async ({request, page}) => {
		const {sessionKey, data} = (await api.signUp(request, page))!;

		const postTitles: string[] = [];
		for (let i = 0; i === 5; i++) {
			postTitles.push(randomNodeTitle());
		}

		for (const postTitle of postTitles) {
			await api.createPost(
				request,
				sessionKey,
				new PostCreationRequest(
					new NodeCreationRequest(postTitle, randomNodeBody()),
					{},
					{users: [{name: randomUsername(), id: data.id, roles: []}]}
				)
			);
		}

		const postsRequest = page.waitForResponse("api/posts?search=");
		await page.goto("/browse");
		const postsResponse: FetchResponse<PostSummary[]> = await (await postsRequest).json();

		const postsAsTitles = postsResponse.data!.map((summary) => summary.title);
		expect(postTitles).toEqual(postsAsTitles);

		const summaryTitles = page.locator("article h4");
		expect(await summaryTitles.count()).toBe(postTitles.length);
		for (const [index, postTitle] of postTitles.entries()) {
			expect(await summaryTitles.nth(index).innerText()).toBe(postTitle);
		}
	});
});

test.describe("Post summary contents", async () => {
	// titles already tested during post sequence tests

	test('"Posted" timestamp', async ({request, page}) => {
		// TODO: testing non-"Now" text of timestamps would be best done using a component test. leaving this as a to-do in hopes playwright component testing leaves experimental by the time this project goes through the pre-1.0 to-do cleanup

		const {sessionKey, data} = (await api.signUp(request, page))!;

		await api.createPost(
			request,
			sessionKey,
			new PostCreationRequest(
				new NodeCreationRequest(randomNodeTitle(), randomNodeBody()),
				{},
				{users: [{name: randomUsername(), id: data.id, roles: []}]}
			)
		);

		await page.goto("/browse");
		await page.waitForSelector("article"); // added because CI perf otherwise causes subsequent check to timeout
		expect(page.locator("article .timestamps")).toHaveText("Posted: Now");
	});
});
