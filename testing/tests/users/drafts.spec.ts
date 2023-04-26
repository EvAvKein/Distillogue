import {test, expect, type Page} from "@playwright/test";
import * as api from "../../helpers/requestsByApi.js";
import {randomNodeTitle, randomNodeBody} from "../../helpers/randomAlphanumString.js";
import {FetchResponse, NodeCreationRequest, PostCreationRequest} from "../../../shared/objects/api.js";
import {Post} from "../../../shared/objects/post.js";
import {user} from "../../../shared/objects/validationUnits.js";

const titlePlaceholder = "[No Title]";

const dashboard = {
	selectionButtons: "ol button",
	creationButton: "ol + button",
	titleInput: "#editDraftTitle",
	bodyInput: "#editDraftBody",
	deletionButton: "#deletionButton",
} as const;

const postingMode = {
	titleInput: "#nodeTitle",
	bodyInput: "#nodeBody",
	selectButtons: ".draftButton",
	preserveButton: "#preserveDraftButton",
	saveButton: "#saveDraft",
	postButton: "#submitButton",
} as const;

test.describe("Drafts manipulation in dashboard", () => {
	const {selectionButtons, creationButton, titleInput, bodyInput, deletionButton} = dashboard;

	test.beforeEach(async ({page, request}) => {
		await api.signUp(request, page);
		await page.goto("/dashboard/drafts");
	});

	test("Validate initial state", async ({page}) => {
		await expect(page.locator(creationButton)).toBeVisible();
		for (const element of [selectionButtons, titleInput, bodyInput, deletionButton, ".notification"]) {
			await expect(page.locator(element)).not.toBeVisible();
		}
	});

	test("Create drafts to capacity", async ({page}) => {
		for (let slot = 1; slot <= user.drafts.max; slot++) {
			await page.locator(creationButton).click();
			const draftButtons = await page.locator(selectionButtons).all();
			expect(draftButtons.length).toBe(slot);
			const latestDraftButton = draftButtons[draftButtons.length - 1];
			await expect(latestDraftButton).toContainText(titlePlaceholder);
			await expect(latestDraftButton).toContainText("Edited: Now");
		}
		await expect(page.locator(creationButton)).not.toBeVisible();
		await expect(page.locator(".notification:not(.positive, .negative)")).toContainText("Drafts at capacity");

		await page.reload();
		await expect(page.locator(selectionButtons)).toHaveCount(user.drafts.max);
		await expect(page.locator(creationButton)).not.toBeVisible();
		await expect(page.locator(".notification:not(.positive, .negative)")).toContainText("Drafts at capacity");
	});

	test("Edit draft title", async ({page}) => {
		const title = randomNodeTitle();

		await page.locator(creationButton).click();
		await page.locator(titleInput).fill(title);
		const draftButton = page.locator(selectionButtons);
		await expect(draftButton).toContainText(title);
		await expect(draftButton).not.toContainText(titlePlaceholder);

		await page.reload();
		await page.getByText(title).click();
		await expect(page.locator(titleInput)).toHaveValue(title);
	});

	test("Edit draft body", async ({page}) => {
		const body = randomNodeBody();

		await page.locator(creationButton).click();
		const editRequest = page.waitForResponse("api/users");
		await page.locator(bodyInput).fill(body);
		await editRequest;
		await expect(page.locator(".notification")).not.toBeVisible();

		await page.reload();
		await page.locator(selectionButtons).click();
		await expect(page.locator(bodyInput)).toHaveValue(body);
	});

	test("Edit drafts in non-first slots", async ({page}) => {
		for (let slot = 1; slot <= 3; slot++) {
			await page.locator(creationButton).click();
		}

		const newTitle = randomNodeTitle();
		await (await page.locator(selectionButtons).all())[1].click();
		const titleEditRequest = page.waitForResponse("/api/users");
		await page.locator(titleInput).fill(newTitle);
		await titleEditRequest;

		const newBody = randomNodeBody();
		await (await page.locator(selectionButtons).all())[2].click();
		const bodyEditRequest = page.waitForResponse("/api/users");
		await page.locator(bodyInput).fill(newBody);
		await bodyEditRequest;

		await page.reload();
		await page.locator(selectionButtons, {hasText: newTitle}).click();
		await expect(page.locator(bodyInput)).toHaveValue("");

		await (await page.locator(selectionButtons).all())[2].click();
		await expect(page.locator(bodyInput)).toHaveValue(newBody);
	});

	test("Delete drafts", async ({page}) => {
		const titles = [randomNodeTitle(), randomNodeTitle(), randomNodeTitle()];
		for (const title of titles) {
			const creationRequest = page.waitForResponse("/api/users");
			await page.locator(creationButton).click();
			await creationRequest;
			const renameRequest = page.waitForResponse("/api/users");
			await page.locator(titleInput).fill(title);
			await renameRequest;
		}

		await page.getByText(titles[1]).click();
		await page.locator(deletionButton).click();
		for (const element of [titleInput, bodyInput, deletionButton, ".notification"]) {
			await expect(page.locator(element)).not.toBeVisible();
		}
		expect(await page.locator(selectionButtons).all()).toHaveLength(2);

		await page.reload();
		expect(await page.locator(selectionButtons).all()).toHaveLength(2);

		for (const title of [titles[0], titles[2]]) {
			await page.getByText(title).click();
			const deletionRequest = page.waitForResponse("/api/users");
			await page.locator(deletionButton).click();
			await deletionRequest;
			await new Promise((resolve) => setTimeout(resolve, 500)); // because vue momentarily duplicates a transition item that's taking the spot of a deleted one, which causes playwright to find two elements when not waiting for the transition to end
		}
		expect(page.locator(selectionButtons)).not.toBeVisible();

		await page.reload();
		expect(page.locator(selectionButtons)).not.toBeVisible();
	});
});

async function postRefreshRecovery(page: Page) {}
async function postSubmitRecovery(page: Page) {
	await page.goto("/post/create");
}

async function replyRefreshRecovery(page: Page) {
	await page.locator(".replyButton").click();
}
async function replySubmitRecovery(page: Page) {
	await page.locator(".replyButton").first().click();
}

async function testDraftsInPostingMode(
	submitName: "Post" | "Reply",
	recoverFromRefresh: (page: Page) => Promise<void>,
	recoverFromSubmit: (page: Page) => Promise<void>
) {
	const {titleInput, bodyInput, selectButtons, preserveButton, saveButton, postButton} = postingMode;

	async function saveDraft(page: Page, title: string, body: string) {
		await page.getByLabel("Title").fill(title);
		await page.getByLabel("Body").fill(body);
		const saveRequest = page.waitForResponse("/api/users");
		await page.getByText("Save draft").click();
		await saveRequest;
	}

	test("Validate initial state", async ({page}) => {
		for (const element of [selectButtons, preserveButton]) {
			expect(page.locator(element)).not.toBeVisible();
		}

		const draftSaveButton = page.locator(saveButton);
		await expect(draftSaveButton).toHaveText("Save draft");
		await expect(draftSaveButton).not.toHaveAttribute("inert", "true");
		await expect(page.locator(postButton)).not.toContainText(["preserve", "draft"]);
	});

	test("Save drafts to capacity", async ({page}) => {
		const drafts: {title: string; body: string}[] = [];

		for (let slot = 1; slot <= user.drafts.max; slot++) {
			const title = randomNodeTitle();
			const body = randomNodeBody();
			drafts.push({title, body});
			await saveDraft(page, title, body);
		}

		for (const [index, draft] of drafts.entries()) {
			// doing this after all drafts are created to verify new saves don't override prior
			const newDraftButton = (await page.locator(selectButtons).all())[index];
			await expect(newDraftButton).toHaveText(draft.title);
		}

		const draftSaveButton = page.locator(saveButton);
		await expect(draftSaveButton).toHaveText("Drafts at capacity");
		await expect(draftSaveButton).toHaveAttribute("inert", "");

		await page.reload();
		await recoverFromRefresh(page);
		await expect(draftSaveButton).toHaveText("Drafts at capacity");
		await expect(draftSaveButton).toHaveAttribute("inert", "");
	});

	test("Select drafts", async ({page}) => {
		for (let slot = 2; slot >= 1; slot--) {
			await saveDraft(page, randomNodeTitle(), randomNodeBody());
		}

		for (const [index, draftButton] of (await page.locator(selectButtons).all()).entries()) {
			await draftButton.click();
			await expect(page.locator(postButton)).toHaveText(submitName + ` (& delete draft ${index + 1})`);
			await expect(page.locator(preserveButton)).toHaveText(`Preserve draft ${index + 1}`);
		}
	});

	test("Select and preserve", async ({page}) => {
		await saveDraft(page, randomNodeTitle(), randomNodeBody());

		await page.locator(selectButtons).click();
		await page.locator(preserveButton).click();
		await expect(page.locator(preserveButton)).not.toBeVisible();
		await expect(page.locator(postButton)).toHaveText(submitName);
	});

	test("Select and edit without affecting saved", async ({page}) => {
		const title = randomNodeTitle();
		const body = randomNodeBody();
		await saveDraft(page, title, body);

		const selectButtonElems = page.locator(selectButtons, {hasText: title});

		await selectButtonElems.click();
		const titleInputElem = page.locator(titleInput);
		const bodyInputElem = page.locator(bodyInput);

		await expect(titleInputElem).toHaveValue(title);
		await expect(bodyInputElem).toHaveValue(body);
		await titleInputElem.fill(randomNodeTitle());
		await bodyInputElem.fill(randomNodeBody());
		await expect(selectButtonElems).toHaveText(title);

		await page.reload();
		await recoverFromRefresh(page);
		await selectButtonElems.click();
		await expect(titleInputElem).toHaveValue(title);
		await expect(bodyInputElem).toHaveValue(body);
	});

	test("Post and destroy draft", async ({page}) => {
		const title = randomNodeTitle();
		const body = randomNodeBody();
		await saveDraft(page, title, body);
		await page.locator(selectButtons).click();
		await page.locator(postButton).click();

		await expect(page.locator(".node", {hasText: title + body})).toBeVisible();

		await recoverFromSubmit(page);
		await expect(page.locator(selectButtons)).not.toBeVisible();
	});

	test("Post but preserve draft", async ({page}) => {
		const title = randomNodeTitle();
		const body = randomNodeBody();
		await saveDraft(page, title, body);
		await page.locator(selectButtons).click();
		await page.locator(preserveButton).click();
		await page.locator(postButton).click();

		await expect(page.locator(".node", {hasText: title + body})).toBeVisible();

		await recoverFromSubmit(page);
		await expect(page.locator(selectButtons)).toBeVisible();
	});

	test("Post with draft after edits", async ({page}) => {
		await saveDraft(page, randomNodeTitle(), randomNodeBody());
		await page.locator(selectButtons).click();
		const newTitle = randomNodeTitle();
		const newBody = randomNodeBody();
		await page.locator(titleInput).fill(newTitle);
		await page.locator(bodyInput).fill(newBody);
		await page.locator(postButton).click();

		await expect(page.locator(".node", {hasText: newTitle + newBody})).toBeVisible();

		await recoverFromSubmit(page);
		await expect(page.locator(selectButtons)).not.toBeVisible();
	});

	test("Post with preserved draft after edits", async ({page}) => {
		await saveDraft(page, randomNodeTitle(), randomNodeBody());
		await page.locator(selectButtons).click();
		const newTitle = randomNodeTitle();
		const newBody = randomNodeBody();
		await page.locator(titleInput).fill(newTitle);
		await page.locator(bodyInput).fill(newBody);
		await page.locator(preserveButton).click();
		await page.locator(postButton).click();

		await expect(page.locator(".node", {hasText: newTitle + newBody})).toBeVisible();

		await recoverFromSubmit(page);
		await expect(page.locator(selectButtons)).toBeVisible();
	});
}

test.describe("Drafts manipulation in posting page", async () => {
	test.beforeEach(async ({page, request}) => {
		await api.signUp(request, page);
		await page.goto("/post/create");
	});

	await testDraftsInPostingMode("Post", postRefreshRecovery, postSubmitRecovery);
});

test.describe("Drafts manipulation in reply modal", async () => {
	test.beforeEach(async ({page, request}) => {
		const {
			sessionKey,
			data: {name, id},
		} = await api.signUp(request, page);

		const responseBody: FetchResponse<Post> = await (
			await api.createPost(
				request,
				sessionKey,
				new PostCreationRequest(new NodeCreationRequest(randomNodeTitle(), randomNodeBody()), {}, {users: [{name, id}]})
			)
		).json();
		await page.goto("/post/" + responseBody.data!.thread.id);

		await page.locator(".replyButton").click();
	});

	await testDraftsInPostingMode("Reply", replyRefreshRecovery, replySubmitRecovery);
});
