import {test, expect, type Page} from "@playwright/test";
import {signUp, createPost} from "../helpers/shortcuts.js";
import {randomUsername, randomNodeTitle, randomNodeBody} from "../helpers/randomAlphanumString.js";

let draftTitle = "Draft " + randomNodeTitle();
let draftBody = randomNodeBody();

test.describe.fixme("Drafts manipulation in dashboard", () => {
	test("Setup (sign-up & enter drafts page)", async ({page}) => {
		await signUp(page, "Drafter" + randomUsername());
		await page.locator("header").getByText("Dashboard").click();
		await page.getByText("Drafts").click();

		expect(await page.getByLabel("Title").count()).toBeFalsy();
		expect(await page.getByLabel("Body").count()).toBeFalsy();
		expect(await page.getByText("Delete").count()).toBeFalsy();
		await expect(page.getByText("Save")).not.toBeVisible();
	});

	async function createAndValidateDraft(page: Page, title: string, body: string) {
		await page.getByText("New draft").click();
		await expect(page.getByText("[No Title]")).toContainText("Edited: Now");
		await expect(page.getByText("Delete")).toBeVisible();
		await expect(page.getByText("Save")).toBeVisible();

		await page.getByLabel("Title").fill(title);
		await expect(page.getByText(title)).toBeVisible();
		await page.getByLabel("Body").fill(body);
		await page.getByText("Save").click();
		await expect(page.locator(".notification.positive")).toBeVisible();

		await page.reload();
		await page.getByText("Drafts").click();
		await page.getByText(title).click();
		await expect(page.getByLabel("Title")).toHaveValue(title);
		await expect(page.getByLabel("Body")).toHaveValue(body);
	}

	test("Create, write, and save draft", async ({page}) => {
		await createAndValidateDraft(page, draftTitle, draftBody);
	});

	test("Edit existing draft", async ({page}) => {
		draftTitle = "Different " + draftTitle;
		draftBody = "Different " + draftBody;

		await page.getByLabel("Title").fill(draftTitle);
		await expect(page.getByText(draftTitle)).toBeVisible();
		await expect(page.getByText("Save")).toBeVisible();

		await page.getByLabel("Body").fill(draftBody);
		await page.getByText("Save").click();
		await expect(page.locator(".notification.positive")).toBeVisible();

		await page.reload();
		await page.getByText("Drafts").click();
		await page.getByText(draftTitle).click();
		await expect(page.getByLabel("Title")).toHaveValue(draftTitle);
		await expect(page.getByLabel("Body")).toHaveValue(draftBody);
	});

	test("Create drafts to capacity", async ({page}) => {
		await createAndValidateDraft(page, "Second " + draftTitle, "Second " + draftBody);
		await createAndValidateDraft(page, "Third " + draftTitle, "Third " + draftBody);
		expect(page.getByText("New draft").count()).toBeFalsy();
		await expect(page.locator(".notification")).toHaveText("Drafts at capacity, consider triage");
	});

	test("Delete drafts", async ({page}) => {
		await page.getByText("Second " + draftTitle).click();
		await page.getByText("Delete").click();
		expect(await page.getByText("Second " + draftTitle).count()).toBeFalsy();
		await page.getByText("Save").click();
		await expect(page.locator(".notification.positive")).toBeVisible();

		await page.reload();
		await page.getByText("Drafts").click();
		await expect(page.getByText(draftTitle)).toBeVisible();
		expect(await page.getByText("Second " + draftTitle).count()).toBeFalsy();

		await page.getByText("Third " + draftTitle).click();
		await page.getByText("Delete").click();
		expect(await page.getByText("Third " + draftTitle).count()).toBeFalsy();
		await page.getByText(draftTitle).click();
		await page.getByText("Delete").click();
		expect(await page.getByText(draftTitle).count()).toBeFalsy();
		await page.getByText("Save").click();
		await expect(page.locator(".notification.positive")).toBeVisible();

		await page.reload();
		await page.getByText("Drafts").click();
		expect(await page.getByText(draftTitle).count()).toBeFalsy();
	});
});

async function saveDraft(page: Page, title: string, body: string) {
	await page.getByLabel("Title").fill(title);
	await page.getByLabel("Body").fill(body);
	await page.getByText("Save draft").click();
	expect(page.locator("#draftsSelection")).toHaveText(title);
}

async function testDraftsFunctionalities(
	submitName: "Post" | "Reply",
	recoverFromRefresh: (page: Page) => Promise<void>,
	recoverFromSubmit: (page: Page) => Promise<void>
) {
	test("Save draft", async ({page}) => {
		await recoverFromRefresh(page);
		expect(await page.getByText("Drafts").count()).toBeFalsy();

		await saveDraft(page, "First " + draftTitle, "First " + draftBody);

		await page.reload();
		await recoverFromRefresh(page);
		await page.getByText("Drafts").click();
		await expect(page.getByText("First " + draftTitle)).toBeVisible();
	});

	test("Select and preserve saved draft", async ({page}) => {
		await page.getByText("Drafts").click();
		await page.getByText("First " + draftTitle).click();

		await expect(page.getByLabel("Title")).toHaveValue("First " + draftTitle);
		await expect(page.getByLabel("Body")).toHaveValue("First " + draftBody);
		await expect(page.getByRole("button", {name: submitName})).toHaveText(submitName + " (& delete draft 1)");
		await page.getByText("Preserve chosen draft").click();

		expect(await page.getByText("Preserve chosen draft").count()).toBeFalsy();
		await expect(page.getByLabel("Title")).toHaveValue("First " + draftTitle);
		await expect(page.getByLabel("Body")).toHaveValue("First " + draftBody);
		await expect(page.getByRole("button", {name: submitName})).toHaveText(submitName);
	});

	test("Save drafts to capacity", async ({page}) => {
		await saveDraft(page, "Second " + draftTitle, "Second " + draftBody);
		await saveDraft(page, "Third " + draftTitle, "Third " + draftBody);

		expect(await page.getByText("Save draft").count()).toBeFalsy();
		await expect(page.getByText("Drafts at capacity")).toHaveAttribute("inert", "true");

		await page.reload();
		await recoverFromRefresh(page);
		expect(await page.getByText("Save draft").count()).toBeFalsy();
		await expect(page.getByText("Drafts at capacity")).toHaveAttribute("inert", "true");
	});

	test("Post and destroy draft", async ({page}) => {
		await page.getByText("Second " + draftTitle).click();
		await page.getByText(submitName + " (& delete draft 2)").click();

		await recoverFromSubmit(page);
		expect(await page.getByText("Second " + draftTitle).count()).toBeFalsy();
	});

	test("Post and preserve draft", async ({page}) => {
		await page.getByText("Third" + draftTitle).click();
		await page.getByText("Preserve chosen draft").click();
		await page.getByRole("button", {name: submitName}).click();

		await recoverFromSubmit(page);
		await expect(page.getByText("Third " + draftTitle)).toBeVisible();
	});

	test("Modify, post, and destroy draft", async ({page}) => {
		await page.getByText("First " + draftTitle).click();
		await page.getByLabel("Title").fill(randomNodeTitle());
		await page.getByLabel("Body").fill(randomNodeBody());
		await page.getByText(submitName + " (& delete draft 1)").click();

		await recoverFromSubmit(page);
		expect(await page.getByText("First " + draftTitle).count()).toBeFalsy();
	});
}

test.describe.fixme("Drafts manipulation in posting page", async () => {
	test("Navigate to posting page", async ({page}) => {
		await page.locator("header").getByText("Post").click();
	});

	await testDraftsFunctionalities(
		"Post",
		async () => {},
		async (page) => {
			await page.goBack();
		}
	);
});

test.describe.fixme("Drafts manipulation in replying modal", async () => {
	let replyDraftTitle = "Reply Draft" + randomNodeTitle();

	test("Setup (new user, submit new post, enter, open reply modal)", async ({page}) => {
		await page.locator("header").getByText("Logout").click();
		await signUp(page, "Other" + randomUsername());

		await createPost(page, replyDraftTitle, randomNodeBody());
		await page.getByText(replyDraftTitle).click();
	});

	await testDraftsFunctionalities(
		"Reply",
		async (page: Page) => {
			await page.locator("button[aria-label='Reply']").first().click();
		},
		async (page: Page) => {
			await page.locator("button[aria-label='Reply']").first().click();
		}
	);
});
