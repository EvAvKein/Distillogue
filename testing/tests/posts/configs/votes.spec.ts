import {test, expect, type Page} from "@playwright/test";
import {setupUserWithPostAndOpen} from "../../../helpers/requestsByUi.js";

const upvoteSelector = 'button[aria-label="Upvote"]';
const voteNumbSelector = 'span[aria-label="Votes status"]';
const downvoteSelector = 'button[aria-label="Downvote"]';

async function validateVotesUI(
	page: Page,
	vote: {enabled: "up" | "down" | "both"; voted: "up" | "down" | "none"},
	voteCount: number
) {
	const elems = {
		up: page.locator(upvoteSelector),
		count: page.locator(voteNumbSelector),
		down: page.locator(downvoteSelector),
	} as const;

	await expect(elems.count).toHaveText(String(voteCount));

	for (const voteDirection of ["up", "down"] as const) {
		if (vote.enabled !== "both" && vote.enabled !== voteDirection) {
			await expect(elems[voteDirection]).not.toBeVisible();
		}

		voteDirection === vote.voted
			? await expect(elems[voteDirection]).toHaveClass(/voted/)
			: await expect(elems[voteDirection]).not.toHaveClass(/voted/);
		// if there's some way to just make the "not" bit conditional (without eval), that'd be nice
	}
}

test.describe("Votes", async () => {
	test.beforeEach(async ({page, request}) => {
		await setupUserWithPostAndOpen(page, request, {
			votes: {up: true, down: true},
		});
		await validateVotesUI(page, {enabled: "both", voted: "none"}, 0);
	});

	test("Vote", async ({page}) => {
		await page.locator(upvoteSelector).click();
		await validateVotesUI(page, {enabled: "both", voted: "up"}, 1);
		await page.reload();
		await validateVotesUI(page, {enabled: "both", voted: "up"}, 1);
	});

	test("Override vote with opposite", async ({page}) => {
		await page.locator(upvoteSelector).click();
		await page.locator(downvoteSelector).click();
		await validateVotesUI(page, {enabled: "both", voted: "down"}, -1);
		await page.reload();
		await validateVotesUI(page, {enabled: "both", voted: "down"}, -1);
	});

	test("Cancel vote", async ({page}) => {
		await page.locator(downvoteSelector).click();
		await page.locator(downvoteSelector).click();
		await validateVotesUI(page, {enabled: "both", voted: "none"}, 0);
		await page.reload();
		await validateVotesUI(page, {enabled: "both", voted: "none"}, 0);
	});
});
