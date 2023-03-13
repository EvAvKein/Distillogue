import {test, expect, type Page} from "@playwright/test";
import * as api from "../helpers/requestsByApi.js";
import * as ui from "../helpers/requestsByUi.js";
import {user} from "../../shared/objects/validationUnits.js";
import {Node} from "../../shared/objects/post.js";
import {FetchResponse} from "../../shared/objects/api.js";
import {randomAlphanumString, randomNodeBody, randomNodeTitle} from "../helpers/randomAlphanumString.js";

interface presettableConfigByUiText {
	Timestamps?: {
		Interacted?: true;
	};
	Voting?: {
		Upvotes?: true;
		Downvotes?: true;
		Anonymous?: true;
	};
}

async function forPresettableConfigs(
	page: Page,
	callback: (category: string, config: string, checked: boolean) => Promise<void>
) {
	await ui.expandConfigCategories(page);

	for (const categoryElem of await page.locator(".configCategory").all()) {
		const categoryName = await categoryElem.locator("button").innerText();
		if (categoryName === "Access") continue;

		for (let labelElem of await categoryElem.locator("label").all()) {
			const configName = (await labelElem.innerText()).replace(": ", "");
			const checked = await labelElem.locator("input[type=checkbox]").isChecked();

			await callback(categoryName, configName, checked);
		}
	}
}

async function setConfig(page: Page, targetConfig: presettableConfigByUiText) {
	await forPresettableConfigs(page, async (category, config, checked) => {
		if (checked !== Boolean(targetConfig[category] && targetConfig[category][config])) {
			await page.getByLabel(config).click();
		}
	});
}

async function validateConfig(page: Page, targetConfig: presettableConfigByUiText) {
	await forPresettableConfigs(page, async (category, config, checked) => {
		expect(Boolean(targetConfig[category] && targetConfig[category][config])).toBe(checked);
	});
}

const editConfig = "#editConfig";

const dashboard = {
	selectionButtons: "ol button",
	creationButton: "ol + button",
	nameInput: "#editPresetName",
	deletionButton: "#deletionButton",
} as const;

const postingPage = {
	titleInput: "#nodeTitle",
	bodyInput: "#nodeBody",
	presetButtons: ".presetButton",
	savePresetButton: "#savePresetButton",
	submitPostButton: "#submitButton",
} as const;

test.describe("Presets in dashboard page", () => {
	const {selectionButtons, creationButton, nameInput, deletionButton} = dashboard;

	test.beforeEach(async ({page, request}) => {
		await api.signUp(request, page);
		await page.goto("/dashboard/presets");
	});

	test("Validate initial state", async ({page}) => {
		expect((await page.locator(selectionButtons).all()).length).toBeFalsy();
		await expect(page.locator(creationButton)).toHaveText("New preset");
		await expect(page.locator(".notification")).not.toBeVisible();
		for (const selector of [nameInput, editConfig, deletionButton]) {
			await expect(page.locator(selector)).not.toBeVisible();
		}
	});

	test("Create presets to capacity", async ({page}) => {
		const presetSlots = [];
		presetSlots.length = user.presets.max;
		for (const [index] of presetSlots.entries()) {
			await page.locator(creationButton).click();
			const expectedLength = index + 1;

			expect(await page.locator(selectionButtons).all()).toHaveLength(expectedLength);
			if (expectedLength === user.presets.max) {
				await expect(page.locator(creationButton)).not.toBeVisible();
				await expect(page.locator(".notification:not(.positive, .negative)")).toBeVisible();
			}

			await page.reload();
			expect(await page.locator(selectionButtons).all()).toHaveLength(expectedLength);
			if (expectedLength === user.presets.max) {
				await expect(page.locator(creationButton)).not.toBeVisible();
				await expect(page.locator(".notification:not(.positive, .negative)")).toBeVisible();
			}
		}
	});

	async function editAndValidateName(page: Page, presetSlot: number, newName: string) {
		await (await page.locator(selectionButtons).all())[presetSlot - 1].click();
		const editRequest = page.waitForResponse("/api/users");
		await page.locator(nameInput).fill(newName);
		await editRequest;
		await page.locator(selectionButtons, {hasText: newName}).click();
		await expect(page.locator(nameInput)).toHaveValue(newName);

		await page.reload();
		await page.locator(selectionButtons, {hasText: newName}).click();
		await expect(page.locator(nameInput)).toHaveValue(newName);
	}

	test("Edit preset name", async ({page}) => {
		await page.locator(creationButton).click();
		await editAndValidateName(page, 1, randomAlphanumString());
	});

	async function editAndValidateConfig(page: Page, presetSlot: number, config: presettableConfigByUiText) {
		await (await page.locator(selectionButtons).all())[presetSlot - 1].click();
		const editRequest = page.waitForResponse("/api/users");
		await setConfig(page, config);
		await editRequest;

		await page.reload();
		await (await page.locator(selectionButtons).all())[presetSlot - 1].click();
		await validateConfig(page, config);
	}

	test("Edit preset config", async ({page}) => {
		await page.locator(creationButton).click();
		await editAndValidateConfig(page, 1, {Voting: {Upvotes: true}, Timestamps: {Interacted: true}});
	});

	test("Edit presets in non-first slots", async ({page}) => {
		for (let slot = 0; slot < 3; slot++) {
			const creationRequest = page.waitForResponse("/api/users");
			await page.locator(creationButton).click();
			await creationRequest;
		}
		await editAndValidateConfig(page, 3, {Voting: {Downvotes: true}});
		await editAndValidateName(page, 2, randomAlphanumString());
	});

	test("Delete presets", async ({page}) => {
		const {creationButton, selectionButtons, nameInput, deletionButton} = dashboard;

		const presets = [randomAlphanumString(), randomAlphanumString(), randomAlphanumString()];
		for (const name of presets) {
			const creationRequest = page.waitForResponse("/api/users");
			await page.locator(creationButton).click();
			await creationRequest;

			const namingRequest = page.waitForResponse("/api/users");
			await page.locator(nameInput).fill(name);
			await namingRequest;
		}

		await page.getByText(presets[1]).click();
		const deletionRequest1 = page.waitForResponse("/api/users");
		await page.locator(deletionButton).click();
		await deletionRequest1;
		await new Promise((resolve) => setTimeout(resolve, 500)); // because vue momentarily duplicates a transition item that's taking the spot of a deleted one, which causes playwright to find two elements when not waiting for the transition to end
		await expect(page.getByText(presets[1])).not.toBeVisible();
		await expect(page.getByText(presets[2])).toBeVisible();
		await expect(page.getByText(presets[0])).toBeVisible();
		await page.reload();
		await expect(page.getByText(presets[1])).not.toBeVisible();
		await expect(page.getByText(presets[2])).toBeVisible();
		await expect(page.getByText(presets[0])).toBeVisible();

		await page.getByText(presets[2]).click();
		const deletionRequest2 = page.waitForResponse("/api/users");
		await page.locator(deletionButton).click();
		await deletionRequest2;
		await page.getByText(presets[0]).click();
		const deletionRequest3 = page.waitForResponse("/api/users");
		await page.locator(deletionButton).click();
		await deletionRequest3;
		await new Promise((resolve) => setTimeout(resolve, 500)); // because vue momentarily duplicates a transition item that's taking the spot of a deleted one, which causes playwright to find two elements when not waiting for the transition to end
		await expect(page.locator(selectionButtons)).not.toBeVisible();
		await page.reload();
		await expect(page.locator(selectionButtons)).not.toBeVisible();
	});
});

test.describe("Presets in posting page", () => {
	let defaultPresetsCount: number;

	test.beforeEach(async ({page, request}) => {
		await api.signUp(request, page);
		await page.goto("/post/create");

		defaultPresetsCount = (await page.locator(postingPage.presetButtons).all()).length;
	});

	test("Save presets to capacity", async ({page}) => {
		const presets: presettableConfigByUiText[] = [
			{Timestamps: {Interacted: true}},
			{Voting: {Upvotes: true, Anonymous: true}},
			{Timestamps: {Interacted: true}, Voting: {Downvotes: true}},
		];

		if (presets.length !== user.presets.max) throw "presets array doesn't match capacity";

		for (const preset of presets) {
			await setConfig(page, preset);
			const creationRequest = page.waitForResponse("/api/users");
			await page.locator(postingPage.savePresetButton).click();
			await creationRequest;
		}
		const presetButtons = await page.locator(postingPage.presetButtons).all();

		async function validatePresets() {
			const savePresetButton = page.locator(postingPage.savePresetButton);
			await expect(savePresetButton).toHaveAttribute("inert", "");
			await expect(savePresetButton).toHaveText("Presets at capacity");
			for (const [index, preset] of presets.entries()) {
				await presetButtons[defaultPresetsCount + index].click();
				await validateConfig(page, preset);
			}
		}
		await validatePresets();
		await page.reload();
		await validatePresets();
	});

	test("Reselect preset after editing", async ({page}) => {
		const preset: presettableConfigByUiText = {
			Timestamps: {Interacted: true},
			Voting: {Downvotes: true, Anonymous: true},
		};

		await setConfig(page, preset);
		const creationRequest = page.waitForResponse("/api/users");
		await page.locator(postingPage.savePresetButton).click();
		await creationRequest;

		await setConfig(page, {Voting: {Upvotes: true, Anonymous: true}});
		const presetButtons = await page.locator(postingPage.presetButtons).all();
		await presetButtons[presetButtons.length - 1].click();
		await validateConfig(page, preset);
	});

	test("Post with preset saved in posting page", async ({page}) => {
		const preset: presettableConfigByUiText = {
			Voting: {Upvotes: true, Downvotes: true},
		};

		await setConfig(page, preset);
		const creationRequest = page.waitForResponse("/api/users");
		await page.locator(postingPage.savePresetButton).click();
		await creationRequest;
		await page.reload();

		const presetButtons = await page.locator(postingPage.presetButtons).all();
		await presetButtons[defaultPresetsCount].click();
		await validateConfig(page, preset);

		await page.locator(postingPage.titleInput).fill(randomNodeTitle());
		await page.locator(postingPage.bodyInput).fill(randomNodeBody());
		const postRequest = page.waitForResponse("/api/posts");
		await page.locator(postingPage.submitPostButton).click();
		const postCreated = await postRequest;

		const postStats = ((await postCreated.json()) as FetchResponse<Node>).data!.stats;

		expect(postStats.votes).toEqual({up: [], down: []});
	});
});

test.describe("Presets across dashboard and posting page", () => {
	test.beforeEach(async ({page, request}) => {
		await api.signUp(request, page);
	});

	test("Edit posting page preset in dashboard", async ({page}) => {
		await page.goto("/post/create");
		let presetConfig: presettableConfigByUiText = {
			Voting: {Downvotes: true, Upvotes: true},
		};
		await setConfig(page, presetConfig);
		const creationRequest = page.waitForResponse("/api/users");
		await page.locator(postingPage.savePresetButton).click();
		await creationRequest;

		await page.goto("/dashboard/presets");
		await page.locator(dashboard.selectionButtons).click();
		await validateConfig(page, presetConfig);
		const presetName = randomAlphanumString();
		await page.locator(dashboard.nameInput).fill(presetName);
		presetConfig = {Timestamps: {Interacted: true}, Voting: {Downvotes: true}};
		const renameRequest = page.waitForResponse("/api/users");
		await setConfig(page, presetConfig);
		await renameRequest;

		await page.goto("/post/create");
		await page.getByText(presetName).click();
		await validateConfig(page, presetConfig);
	});

	test("View and post with preset created at dashboard", async ({page}) => {
		await page.goto("/dashboard/presets");
		const presetName = randomAlphanumString();
		const presetConfig: presettableConfigByUiText = {
			Timestamps: {Interacted: true},
			Voting: {Downvotes: true},
		};
		await page.locator(dashboard.creationButton).click();
		const renameRequest = page.waitForResponse("/api/users");
		await page.locator(dashboard.nameInput).fill(presetName);
		await renameRequest;
		const presetEditRequest = page.waitForResponse("/api/users");
		await setConfig(page, presetConfig);
		await presetEditRequest;

		await page.goto("/post/create");
		const postCreationRequest = page.waitForResponse("/api/posts");
		await ui.createPost(page, randomNodeTitle(), randomNodeBody(), async () => {
			await page.getByText(presetName).click();
			await validateConfig(page, presetConfig);
		});
		const postCreated = await postCreationRequest;

		const postStats = ((await postCreated.json()) as FetchResponse<Node>).data!.stats;

		expect(postStats.votes).toEqual({down: []});
	});
});
