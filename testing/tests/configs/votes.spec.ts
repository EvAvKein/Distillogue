import {test, expect, type Page} from "@playwright/test";
import {setupUserWithPostAndOpen} from "../../helpers/requestsByUi.js";

test.describe("Votes", async () => {
	const upvoteSelector = 'button[aria-label="Upvote"]';
	const voteNumbSelector = 'span[aria-label="Votes status"]';
	const downvoteSelector = 'button[aria-label="Downvote"]';

	async function validateVoteInterface(page: Page, userVote: "up" | "down" | "none", voteCount: number) {
		const upvoteElem = page.locator(upvoteSelector);
		const countElem = page.locator(voteNumbSelector);
		const downvoteElem = page.locator(downvoteSelector);

		// if there's some way to just make the "not" bit conditional, that'd be great
		userVote === "up"
			? await expect(upvoteElem).toHaveClass(/voted/)
			: await expect(upvoteElem).not.toHaveClass(/voted/);
		userVote === "down"
			? await expect(downvoteElem).toHaveClass(/voted/)
			: await expect(downvoteElem).not.toHaveClass(/voted/);
		await expect(countElem).toHaveText(String(voteCount));
	}

	test.beforeEach(async ({page, request}) => {
		setupUserWithPostAndOpen(page, request, {
			votes: {up: true, down: true, anon: true},
		});
		await validateVoteInterface(page, "none", 0);
	});

	test("Vote", async ({page}) => {
		await page.locator(upvoteSelector).click();
		await validateVoteInterface(page, "up", 1);
		await page.reload();
		await validateVoteInterface(page, "up", 1);
	});

	test("Override vote with opposite", async ({page}) => {
		await page.locator(upvoteSelector).click();
		await page.locator(downvoteSelector).click();
		await validateVoteInterface(page, "down", -1);
		await page.reload();
		await validateVoteInterface(page, "down", -1);
	});

	test("Cancel vote", async ({page}) => {
		await page.locator(downvoteSelector).click();
		await page.locator(downvoteSelector).click();
		await validateVoteInterface(page, "none", 0);
		await page.reload();
		await validateVoteInterface(page, "none", 0);
	});
});
