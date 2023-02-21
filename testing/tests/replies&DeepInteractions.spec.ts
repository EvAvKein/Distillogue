import {test, expect, type Page} from "@playwright/test";
import * as ui from "../helpers/requestsByUi.js";
import {randomNodeTitle, randomNodeBody} from "../helpers/randomAlphanumString.js";
import {setupUserWithPostAndOpen} from "../helpers/requestsByUi.js";

test.describe("Replies & deep interaction", () => {
	// testing deep interactions through one interaction is enough, as it's a test for the deep-node paths' construction and translation back and forth across the app; individual interactions are functionally depth/path-agnostic in implementation (and exceptions, e.g branch-locking, will/should be tested accordingly)
	async function replyAndValidateNode(page: Page, repliedNodeByTitlesPath: string[], replyTitle: string) {
		const replyBody = randomNodeBody();
		await ui.createReply(page, repliedNodeByTitlesPath, replyTitle, replyBody);

		await ui.expandNodePath(page, [...repliedNodeByTitlesPath, replyTitle]);

		const parentNodeTitle = repliedNodeByTitlesPath[repliedNodeByTitlesPath.length - 1];
		const newReplyNode = page
			.locator(".nodeBranch", {has: page.getByText(parentNodeTitle)})
			.locator(".replies")
			.locator(".node", {has: page.getByText(replyTitle)});
		await expect(newReplyNode).toContainText(replyBody);
	}

	test("Reply to central node", async ({page, request}) => {
		const {postTitle} = await setupUserWithPostAndOpen(page, request);
		await replyAndValidateNode(page, [postTitle], "Reply to central");
	});

	test("Reply to central node twice", async ({page, request}) => {
		const {postTitle} = await setupUserWithPostAndOpen(page, request);
		await ui.createReply(page, [postTitle], "1st reply to central");
		await replyAndValidateNode(page, [postTitle], "2nd reply to central");
	});

	test("Reply to reply", async ({page, request}) => {
		const {postTitle} = await setupUserWithPostAndOpen(page, request);
		const replyTitle = "Reply to central";
		await ui.createReply(page, [postTitle], replyTitle);
		await replyAndValidateNode(page, [postTitle, replyTitle], "Reply to 1st reply of central");
	});

	test("Reply to second reply", async ({page, request}) => {
		const {postTitle} = await setupUserWithPostAndOpen(page, request);
		await ui.createReply(page, [postTitle], randomNodeTitle());
		const replyTitle = "2nd reply to central";
		await ui.createReply(page, [postTitle], replyTitle);
		await replyAndValidateNode(page, [postTitle, replyTitle], "Reply to 2nd reply of central");
	});

	test("Reply to reply of reply", async ({page, request}) => {
		const {postTitle} = await setupUserWithPostAndOpen(page, request);
		await ui.createReply(page, [postTitle], randomNodeTitle());
		const replyTitle = "Reply to central";
		await ui.createReply(page, [postTitle], replyTitle);
		const replyOfReplyTitle = "Reply to reply of central";
		await ui.createReply(page, [postTitle, replyTitle], replyOfReplyTitle);
		const replyOfReplyOfReplyTitle = "Reply to reply of reply of central";
		await replyAndValidateNode(page, [postTitle, replyTitle, replyOfReplyTitle], replyOfReplyOfReplyTitle);
	});

	test("Reply to second reply of reply", async ({page, request}) => {
		const {postTitle} = await setupUserWithPostAndOpen(page, request);
		await ui.createReply(page, [postTitle], randomNodeTitle());
		const replyTitle = "Reply to central";
		await ui.createReply(page, [postTitle], replyTitle);
		const replyOfReplyTitle = "Reply to reply of central";
		await ui.createReply(page, [postTitle, replyTitle], replyOfReplyTitle);
		const secondReplyOfReplyTitle = "second reply to reply of central";
		await ui.createReply(page, [postTitle, replyTitle], secondReplyOfReplyTitle);
		const replyToSecondReplyOfReplyTitle = "Reply to second reply of reply of central";
		await replyAndValidateNode(page, [postTitle, replyTitle, secondReplyOfReplyTitle], replyToSecondReplyOfReplyTitle);
	});
});
