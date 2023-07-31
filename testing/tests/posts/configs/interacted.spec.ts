import {test, expect, type Page} from "@playwright/test";
import * as api from "../../../helpers/requestsByApi.js";
import * as ui from "../../../helpers/requestsByUi.js";
import {randomNodeTitle} from "../../../helpers/randomAlphanumString.js";
import {NodeInteractionRequest} from "../../../../shared/objects/api.js";

const interactedText = "Interacted: Now";

test.describe("Interacted", async () => {
	// testing with every single possible interaction would create inordinate maintainability costs long-term, seems best to test using using two interaction types and trust that this means the interactions are being applied regardless of interaction type

	test("No interaction timestamps until interaction (Reply)", async ({request, page}) => {
		const {user, post} = await ui.setupUserWithPostAndOpen(page, request, {timestamps: {interacted: true}});
		expect(post.stats.interacted).toBeUndefined();
		expect(post.thread.stats.timestamps.interacted).toBeUndefined();
		await expect(page.locator(".node#central")).not.toContainText(interactedText);

		const replyTitle = randomNodeTitle();
		await ui.createReply(page, [post.thread.title], replyTitle);
		const postAfterReply = (await api.getPost(request, user.sessionKey, post.thread.id)).data!;

		await expect(page.locator(".node#central")).toContainText(interactedText);
		expect(typeof postAfterReply.stats.interacted).toBe("number");
		expect(typeof postAfterReply.thread.stats.timestamps.interacted).toBe("number");

		await ui.expandNodePath(page, [post.thread.title, replyTitle]);
		await expect(page.locator(".node:not(#central)")).not.toContainText(interactedText);
		expect(postAfterReply.thread.replies[0].stats.timestamps.interacted).toBeUndefined();
	});

	test("Timestamp Upon different interaction (Vote)", async ({request, page}) => {
		await ui.setupUserWithPostAndOpen(page, request, {
			timestamps: {interacted: true},
			votes: {up: true},
		});
		await page.getByLabel("Upvote").click();
		await page.reload();
		await expect(page.locator(".node")).toContainText(interactedText);
	});

	test("Update both post and node timestamps", async ({request, page}) => {
		const {user, post} = await ui.setupUserWithPostAndOpen(page, request, {
			timestamps: {interacted: true},
			votes: {up: true},
		});

		await api.nodeInteraction(
			request,
			user.sessionKey,
			new NodeInteractionRequest([post.thread.id], "vote", {voteDirection: "up", newVoteStatus: true})
		)
		const postAfter1st = (await api.getPost(request, user.sessionKey, post.thread.id)).data!;

		await ui.createReply(page, [post.thread.title], randomNodeTitle());
		const postAfter2nd = (await api.getPost(request, user.sessionKey, post.thread.id)).data!;

		expect(postAfter1st.stats.interacted).not.toEqual(postAfter2nd.stats.interacted);
		expect(postAfter1st.thread.stats.timestamps.interacted).not.toEqual(postAfter2nd.thread.stats.timestamps.interacted);
	});
});