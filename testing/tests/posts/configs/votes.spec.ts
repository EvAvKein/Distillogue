import {test, expect, type Page} from "@playwright/test";
import * as api from "../../../helpers/requestsByApi.js";
import * as ui from "../../../helpers/requestsByUi.js";
import {UserPayload} from "../../../../shared/objects/user.js";
import {NodeCreationRequest, PostCreationRequest} from "../../../../shared/objects/api.js";
import {randomNodeBody, randomNodeTitle} from "../../../helpers/randomAlphanumString.js";
import {Post, redactedVoteString} from "../../../../shared/objects/post.js";
import {setSessionKey} from "../../../helpers/sessionKey.js";

const upvoteSelector = 'button[aria-label="Upvote"]';
const voteNumbSelector = 'span[aria-label="Votes status"]';
const downvoteSelector = 'button[aria-label="Downvote"]';

async function validateVotesUI(
	page: Page,
	votes: {enabled: "up" | "down" | "both"; voted: "up" | "down" | "none"; up: number; down: number}
) {
	const elems = {
		up: page.locator(upvoteSelector),
		count: page.locator(voteNumbSelector),
		down: page.locator(downvoteSelector),
	} as const;

	await expect(elems.count).toHaveText(String(votes.up - votes.down));
	await expect(elems.count).toHaveAttribute(
		"title",
		(votes.up ? `Upvotes: ${votes.up}` : "") +
			(votes.up && votes.down ? "\n" : "") +
			(votes.down ? `Downvotes: ${votes.down}` : "")
	);

	for (const voteDirection of ["up", "down"] as const) {
		if (votes.enabled !== "both" && votes.enabled !== voteDirection) {
			await expect(elems[voteDirection]).not.toBeVisible();
		}

		voteDirection === votes.voted
			? await expect(elems[voteDirection]).toHaveClass(/voted/)
			: await expect(elems[voteDirection]).not.toHaveClass(/voted/);
		// if there's some way to just make the "not" bit conditional (without eval), that'd be nice
	}
}

test.describe("Voting: Up & Down", async () => {
	test.beforeEach(async ({page, request}, test) => {
		if (test.title.includes("cumulative")) return; // because that one needs a post for 3 users
		await ui.setupUserWithPostAndOpen(page, request, {votes: {up: true, down: true}});
		await validateVotesUI(page, {enabled: "both", voted: "none", up: 0, down: 0});
	});

	test("Vote", async ({page}) => {
		await page.locator(upvoteSelector).click();
		await validateVotesUI(page, {enabled: "both", voted: "up", up: 1, down: 0});
		await page.reload();
		await validateVotesUI(page, {enabled: "both", voted: "up", up: 1, down: 0});
	});

	test("Override vote with opposite", async ({page}) => {
		await page.locator(upvoteSelector).click();
		await page.locator(downvoteSelector).click();
		await validateVotesUI(page, {enabled: "both", voted: "down", up: 0, down: 1});
		await page.reload();
		await validateVotesUI(page, {enabled: "both", voted: "down", up: 0, down: 1});
	});

	test("Cancel vote", async ({page}) => {
		await page.locator(downvoteSelector).click();
		await page.locator(downvoteSelector).click();
		await validateVotesUI(page, {enabled: "both", voted: "none", up: 0, down: 0});
		await page.reload();
		await validateVotesUI(page, {enabled: "both", voted: "none", up: 0, down: 0});
	});

	test("Calculate cumulative votes", async ({page, request}) => {
		// beforeEach skipped via conditional

		const users: UserPayload[] = [];
		for (let i = 0; i < 3; i++) {
			users.push(await api.createUserAndSession(request));
		}

		const operationsByUserIndex = [
			async (page: Page) => {
				await page.locator(downvoteSelector).click();
				await validateVotesUI(page, {enabled: "both", voted: "down", up: 0, down: 1});
			},
			async (page: Page) => {
				await page.locator(downvoteSelector).click();
				await validateVotesUI(page, {enabled: "both", voted: "down", up: 0, down: 2});
			},
			async (page: Page) => {
				await page.locator(upvoteSelector).click();
				await validateVotesUI(page, {enabled: "both", voted: "up", up: 1, down: 2});
			},
		];

		if (operationsByUserIndex.length !== users.length) {
			throw `Mismatch between user and operations quantities (users: ${users.length}, operations: ${operationsByUserIndex.length})`;
		}

		const post: Post = (
			await (
				await api.createPost(
					request,
					users[0].sessionKey,
					new PostCreationRequest(
						new NodeCreationRequest(randomNodeTitle(), randomNodeBody()),
						{votes: {up: true, down: true}},
						{
							users: users.map((user) => {
								return {name: user.data.name, id: user.data.id, roles: []};
							}),
						}
					)
				)
			).json()
		).data;

		await page.goto("/");
		for (const [index, userSteps] of operationsByUserIndex.entries()) {
			await setSessionKey(page, users[index].sessionKey);
			await page.goto("/post/" + post.thread.id);
			await userSteps(page);
		}
	});
});

test.describe("Voting: Anonymous", async () => {
	test("Self not anonymous", async ({page, request}) => {
		await ui.setupUserWithPostAndOpen(page, request, {
			votes: {up: true, down: true, anon: true},
		});

		const ownId = (await api.getUserData(request, page)).data!.id;
		await page.locator(upvoteSelector).click();

		const postObject = page.waitForResponse(/posts\/*/);
		await page.reload();
		const post: Post = (await (await postObject).json()).data;
		const upvotes = post.thread.stats.votes!.up!;

		expect(upvotes.length).toBe(1);
		expect(upvotes[0]).toBe(ownId);
	});

	test("Anon: Up (config: both directions)", async ({page, request}) => {
		const poster = await api.createUserAndSession(request);
		const voter = await api.createUserAndSession(request);

		const post: Post = (
			await (
				await api.createPost(
					request,
					poster.sessionKey,
					new PostCreationRequest(
						{title: randomNodeTitle(), body: randomNodeBody()},
						{votes: {up: true, down: true, anon: true}},
						{
							users: [
								{name: poster.data.name, id: poster.data.id, roles: []},
								{name: voter.data.id, id: voter.data.id, roles: []},
							],
						}
					)
				)
			).json()
		).data;

		await ui.signIn(page, voter.data.name);
		await page.goto("/post/" + post.thread.id);
		await page.locator(upvoteSelector).click();
		await page.getByRole("button", {name: "Logout"}).click();

		await ui.signIn(page, poster.data.name);
		const postObject = page.waitForResponse(/posts\/*/);
		await page.goto("/post/" + post.thread.id);
		const postWithVote: Post = (await (await postObject).json()).data;

		const upvotes = postWithVote.thread.stats.votes!.up!;
		expect(upvotes.length).toBe(1);
		expect(upvotes[0]).toBe(redactedVoteString);
	});

	test("Anon: Down (config: single direction)", async ({page, request}) => {
		const poster = await api.createUserAndSession(request);
		const voter = await api.createUserAndSession(request);

		const post: Post = (
			await (
				await api.createPost(
					request,
					poster.sessionKey,
					new PostCreationRequest(
						{title: randomNodeTitle(), body: randomNodeBody()},
						{votes: {down: true, anon: true}},
						{
							users: [
								{name: poster.data.name, id: poster.data.id, roles: []},
								{name: voter.data.id, id: voter.data.id, roles: []},
							],
						}
					)
				)
			).json()
		).data;

		await ui.signIn(page, voter.data.name);
		await page.goto("/post/" + post.thread.id);
		await page.locator(downvoteSelector).click();
		await page.getByRole("button", {name: "Logout"}).click();

		await ui.signIn(page, poster.data.name);
		const postObject = page.waitForResponse(/posts\/*/);
		await page.goto("/post/" + post.thread.id);
		const postWithVote: Post = (await (await postObject).json()).data;

		const downvotes = postWithVote.thread.stats.votes!.down!;
		expect(downvotes.length).toBe(1);
		expect(downvotes[0]).toBe(redactedVoteString);
	});
});
