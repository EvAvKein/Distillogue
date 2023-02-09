import {test, expect, type Page} from "@playwright/test";
import {signUp, createPost, createReply, expandNodePath, expandConfigCategories} from "../helpers/requestsByUi.js";
import {randomUsername, randomNodeTitle, randomNodeBody} from "../helpers/randomAlphanumString.js";

const postTitle = randomNodeTitle();
const postBody = randomNodeBody();
let privatePostUrl = "";

test.describe.fixme("Create access & interactions test posts", () => {
	test("Setup (sign-up)", async ({page}) => {
		await signUp(page, randomUsername());
	});

	async function checkAllConfigsAndValidate(page: Page) {
		await expandConfigCategories(page);
		for (let checkbox of await page.locator('section[aria-label="Opened category"] input[type="checkbox"]').all()) {
			await expect(checkbox).toBeChecked();
		}
	}

	test("Create interactions-testing & access-testing posts", async ({page}) => {
		await createPost(page, postTitle, postBody, async (page) => {
			await page.getByRole("button", {name: "Everything"}).click();
			await page.getByLabel("Public").click();

			await checkAllConfigsAndValidate(page);
		});

		await createPost(page, "[NON-PUBLIC] " + postTitle, "[NON-PUBLIC] " + postBody, async (page) => {
			await page.getByRole("button", {name: "Everything"}).click();

			await checkAllConfigsAndValidate(page);
		});
	});

	test("Enter access-testing post & copy URL", async ({page}) => {
		await expect(page).toHaveURL(/.*browse/);

		await page.getByText("[NON-PUBLIC] " + postTitle).click();
		await page.waitForURL(/.*post\/.*/);
		privatePostUrl = page.url();
	});
});

test.describe.fixme("Access", () => {
	test("Create account", async ({page}) => {
		await signUp(page, randomUsername());
	});

	test("Fail to find inaccessible post through browsing", async ({page}) => {
		await page.locator("header").getByText("Browse").click();
		await expect(page.locator("ol")).not.toContainText("[NON-PUBLIC] " + postTitle);
	});

	test("Fail to visit inaccessible post through URL", async ({page}) => {
		await page.goto(privatePostUrl);

		await expect(page.locator(".notification.negative")).toBeVisible();
		await expect(page.locator("body")).not.toContainText("[NON-PUBLIC] " + postTitle);
		await expect(page.locator("body")).not.toContainText("[NON-PUBLIC] " + postBody);
	});
});

test.describe.fixme("Setup for interactions (switch user & open post)", () => {
	test("Switch account", async ({page}) => {
		await page.locator("header").getByText("Logout").click();
		await signUp(page, "Interactor" + randomUsername());
	});

	test("Open test post", async ({page}) => {
		await page.getByText(postTitle).click();
		await page.waitForURL(/.*post\/.*/);
	});
});

test.describe.fixme("Replies & deep interaction", () => {
	// testing deep-interactions with a single interaction is sufficient, as this test is meant to validate the deep-node paths' construction and translation in their round trips across the app; individual node interactions are functionally depth/path-agnostic (exceptions, e.g branch-locking, will/should test for depths/paths within their sections)

	async function replyAndValidateNode(
		page: Page,
		repliedNodeByTitlesPath: string[],
		replyTitle: string,
		replyBody: string
	) {
		await createReply(page, repliedNodeByTitlesPath, replyTitle, replyBody);

		await expandNodePath(page, [...repliedNodeByTitlesPath, replyTitle]);

		const parentNodeTitle = repliedNodeByTitlesPath[repliedNodeByTitlesPath.length - 1];
		const newReplyNode = page
			.locator(".nodeBranch", {has: page.getByText(parentNodeTitle)})
			.locator(".replies")
			.locator(".node", {has: page.getByText(replyTitle)});
		await expect(newReplyNode).toContainText(replyBody);
	}

	test("Reply to central node", async ({page}) => {
		replyAndValidateNode(page, [postTitle], "1st Reply to Central", randomNodeBody());
	});

	test("Another reply to central node", async ({page}) => {
		replyAndValidateNode(page, [postTitle], "2nd Reply to Central", randomNodeBody());
	});

	test("Reply to reply", async ({page}) => {
		replyAndValidateNode(
			page,
			[postTitle, "1st Reply to Central"],
			"1st Reply to 1st Reply to Central",
			randomNodeBody()
		);
	});

	test("Reply to reply to reply", async ({page}) => {
		replyAndValidateNode(
			page,
			[postTitle, "1st Reply to Central", "1st Reply to 1st Reply to Central"],
			"1st Reply to 1st Reply to 1st Reply to central",
			randomNodeBody()
		);
	});

	test("Another reply to reply", async ({page}) => {
		replyAndValidateNode(
			page,
			[postTitle, "2nd Reply to Central"],
			"1st Reply to 2nd Reply to Central",
			randomNodeBody()
		);
	});

	/*-SEQUENCE-VISUAL-AID-
					CENTRAL
					|-1-3-4
					|-2-5
  ---------------------*/
});

// describe.fixme("Timestamps (TODO, figure out how to test)", () => {});

test.describe.fixme("Voting", () => {
	const upvoteSelector = 'button[aria-label="Upvote"]';
	const voteNumbSelector = 'span[aria-label="Votes status"]';
	const downvoteSelector = 'button[aria-label="Downvote"]';
	async function validateVoteInterface(page: Page, userVote: "up" | "down" | "none", voteCount: number) {
		const upvoteElem = page.locator(upvoteSelector);
		const countElem = page.locator(voteNumbSelector);
		const downvoteElem = page.locator(downvoteSelector);

		// if there's some way to just make the "not" bit optional, that'd be great
		userVote === "up"
			? await expect(upvoteElem).toHaveClass("voted")
			: await expect(upvoteElem).not.toHaveClass("voted");
		userVote === "down"
			? await expect(downvoteElem).toHaveClass("voted")
			: await expect(downvoteElem).not.toHaveClass("voted");
		await expect(countElem).toHaveText(String(voteCount));
	}

	test("Validate initial state", async ({page}) => {
		await validateVoteInterface(page, "none", 0);
	});

	test("Vote (up)", async ({page}) => {
		await page.locator(upvoteSelector).click();
		await validateVoteInterface(page, "up", 1);
		await page.reload();
		await validateVoteInterface(page, "up", 1);
	});

	test("Override with opposite vote (down)", async ({page}) => {
		await page.locator(downvoteSelector).click();
		await validateVoteInterface(page, "down", -1);
		await page.reload();
		await validateVoteInterface(page, "down", -1);
	});

	test("Cancel vote (down)", async ({page}) => {
		await page.locator(downvoteSelector).click();
		await validateVoteInterface(page, "none", 0);
		await page.reload();
		await validateVoteInterface(page, "none", 0);
	});
});
