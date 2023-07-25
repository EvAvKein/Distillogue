import {test, expect, type Page} from "@playwright/test";
import * as api from "../../helpers/requestsByApi.js";
import {randomNodeTitle, randomNodeBody, randomUsername} from "../../helpers/randomAlphanumString.js";
import {FetchResponse, NodeCreationRequest, PostCreationRequest} from "../../../shared/objects/api.js";
import {PostSummary} from "../../../shared/objects/post.js";

test.describe("Post summaries sequence", async () => {
	// to be renamed and expanded upon when sorting/filtering functionalities get added

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
	// title already tested during above sequence tests

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
