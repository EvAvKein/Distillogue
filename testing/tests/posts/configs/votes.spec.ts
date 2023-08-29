import {test, expect, type Page, APIRequestContext} from "@playwright/test";
import * as api from "../../../helpers/requestsByApi.js";
import * as ui from "../../../helpers/requestsByUi.js";
import {UserPayload} from "../../../../shared/objects/user.js";
import {NodeCreationRequest, NodeInteractionRequest, PostCreationRequest} from "../../../../shared/objects/api.js";
import {randomNodeBody, randomNodeTitle} from "../../../helpers/randomAlphanumString.js";
import {Post, redactedVoteString} from "../../../../shared/objects/post.js";
import {setSessionKey} from "../../../helpers/sessionKey.js";

const selector = {
	upvote: 'button[aria-label="Upvote"]',
	voteNumb: 'span[aria-label="Votes status"]',
	downvote: 'button[aria-label="Downvote"]',
};

async function validateVotesUI(
	page: Page,
	votes: {enabled: "up" | "down" | "both"; voted: "up" | "down" | "none"; up: number; down: number}
) {
	const elems = {
		up: page.locator(selector.upvote),
		count: page.locator(selector.voteNumb),
		down: page.locator(selector.downvote),
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
	test.describe("Off", () => {
		async function apiVoteAttempt(
			request: APIRequestContext,
			authKey: string,
			nodePath: string[],
			direction: "up" | "down"
		) {
			return api.nodeInteraction(
				request,
				authKey,
				new NodeInteractionRequest(nodePath, "vote", {voteDirection: direction, newVoteStatus: true})
			);
		}

		test("No votes enabled", async ({page, request}) => {
			const {user, post} = await ui.setupUserWithPostAndOpen(page, request);
			expect(post.thread.stats.votes).toBeUndefined();
			for (const elem in selector) {
				await expect(page.locator(elem)).not.toBeVisible();
			}
			for (const interaction of [
				await apiVoteAttempt(request, user.sessionKey, [post.thread.title], "up"),
				await apiVoteAttempt(request, user.sessionKey, [post.thread.title], "down"),
			]) {
				expect(interaction.error).toBeTruthy();
			}
		});

		test("Votes without up", async ({page, request}) => {
			const {user, post} = await ui.setupUserWithPostAndOpen(page, request, {votes: {down: true, anon: true}});
			await expect(page.locator(selector.upvote)).not.toBeVisible();
			await expect(page.locator(selector.voteNumb)).toBeVisible();
			await expect(page.locator(selector.downvote)).toBeVisible();
			expect((await apiVoteAttempt(request, user.sessionKey, [post.thread.title], "up")).error).toBeTruthy();
		});

		test("Votes without down", async ({page, request}) => {
			const {user, post} = await ui.setupUserWithPostAndOpen(page, request, {votes: {up: true, anon: true}});
			await expect(page.locator(selector.upvote)).toBeVisible();
			await expect(page.locator(selector.voteNumb)).toBeVisible();
			await expect(page.locator(selector.downvote)).not.toBeVisible();
			expect((await apiVoteAttempt(request, user.sessionKey, [post.thread.title], "down")).error).toBeTruthy();
		});
	});

	test.beforeEach(async ({page, request}, test) => {
		if (test.title.includes("cumulative")) return; // because that one needs a post for 3 users
		await ui.setupUserWithPostAndOpen(page, request, {votes: {up: true, down: true}});
		await validateVotesUI(page, {enabled: "both", voted: "none", up: 0, down: 0});
	});

	test("Vote", async ({page}) => {
		await page.locator(selector.upvote).click();
		await validateVotesUI(page, {enabled: "both", voted: "up", up: 1, down: 0});
		await page.reload();
		await validateVotesUI(page, {enabled: "both", voted: "up", up: 1, down: 0});
	});

	test("Override vote with opposite", async ({page}) => {
		await page.locator(selector.upvote).click();
		await page.locator(selector.downvote).click();
		await validateVotesUI(page, {enabled: "both", voted: "down", up: 0, down: 1});
		await page.reload();
		await validateVotesUI(page, {enabled: "both", voted: "down", up: 0, down: 1});
	});

	test("Cancel vote", async ({page}) => {
		await page.locator(selector.downvote).click();
		await page.locator(selector.downvote).click();
		await validateVotesUI(page, {enabled: "both", voted: "none", up: 0, down: 0});
		await page.reload();
		await validateVotesUI(page, {enabled: "both", voted: "none", up: 0, down: 0});
	});

	test("Calculate cumulative votes", async ({page, request}) => {
		// beforeEach skipped via conditional

		const users: UserPayload[] = [];
		for (let i = 0; i < 3; i++) {
			users.push((await api.createUser(request)).data!);
		}

		const operationsByUserIndex = [
			async (page: Page) => {
				await page.locator(selector.downvote).click();
				await validateVotesUI(page, {enabled: "both", voted: "down", up: 0, down: 1});
			},
			async (page: Page) => {
				await page.locator(selector.downvote).click();
				await validateVotesUI(page, {enabled: "both", voted: "down", up: 0, down: 2});
			},
			async (page: Page) => {
				await page.locator(selector.upvote).click();
				await validateVotesUI(page, {enabled: "both", voted: "up", up: 1, down: 2});
			},
		];

		if (operationsByUserIndex.length !== users.length) {
			throw `Mismatch between user and operations quantities (users: ${users.length}, operations: ${operationsByUserIndex.length})`;
		}

		const post = (
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
		).data!;

		await page.goto("/");
		for (const [index, userSteps] of operationsByUserIndex.entries()) {
			await setSessionKey(page, users[index].sessionKey);
			await page.goto("/post/" + post.thread.id);
			await userSteps(page);
		}
	});
});

test.describe("Voting: Anonymous", async () => {
	test("Off", async ({page, request}) => {
		const user = (await api.createUser(request)).data!;
		const otherUser = (await api.createUser(request)).data!;

		const post = (
			await api.createPost(
				request,
				user.sessionKey,
				new PostCreationRequest(
					new NodeCreationRequest(randomNodeTitle(), randomNodeBody()),
					{votes: {up: true, down: true}},
					{
						users: [
							{name: user.data.name, id: user.data.id, roles: []},
							{name: otherUser.data.name, id: otherUser.data.id, roles: []},
						],
					}
				)
			)
		).data!;

		await api.nodeInteraction(
			request,
			user.sessionKey,
			new NodeInteractionRequest([post.thread.id], "vote", {voteDirection: "up", newVoteStatus: true})
		);
		expect(
			(await api.getPost(request, otherUser.sessionKey, post.thread.id)).data!.thread.stats.votes!.up
		).toStrictEqual([user.data.id]);

		await api.nodeInteraction(
			request,
			otherUser.sessionKey,
			new NodeInteractionRequest([post.thread.id], "vote", {voteDirection: "up", newVoteStatus: true})
		);
		expect((await api.getPost(request, user.sessionKey, post.thread.id)).data!.thread.stats.votes!.up).toStrictEqual([
			user.data.id,
			otherUser.data.id,
		]);
	});

	test("Self not anonymous", async ({page, request}) => {
		const {user, post} = await ui.setupUserWithPostAndOpen(page, request, {
			votes: {up: true, down: true, anon: true},
		});

		await page.locator(selector.upvote).click();

		const postObject = page.waitForResponse(new RegExp("/posts/" + post.thread.id));
		await page.reload();
		const postAfterVotes: Post = (await (await postObject).json()).data;
		const upvotes = postAfterVotes.thread.stats.votes!.up!;

		expect(upvotes.length).toBe(1);
		expect(upvotes[0]).toBe(user.data.id);
	});

	test("Anon: Up (config: both directions)", async ({page, request}) => {
		const poster = (await api.createUser(request)).data!;
		const voter = (await api.createUser(request)).data!;

		const post = (
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
		).data!;

		await ui.signIn(page, voter.data.name);
		await page.goto("/post/" + post.thread.id);
		await page.locator(selector.upvote).click();
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
		const poster = (await api.createUser(request)).data!;
		const voter = (await api.createUser(request)).data!;

		const post = (
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
		).data!;

		await ui.signIn(page, voter.data.name);
		await page.goto("/post/" + post.thread.id);
		await page.locator(selector.downvote).click();
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
