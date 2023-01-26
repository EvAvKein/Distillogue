import {test, expect, type Page} from "@playwright/test";
import {signUp, createPost, createReply, expandConfigCategories} from "../helpers/shortcuts.js";
import {randomUsername, randomNodeTitle, randomNodeBody} from "../helpers/randomAlphanumString.js";

interface configByUiText {
	Access?: {
		Public?: true;
	};
	Timestamps?: {
		Interacted?: true;
	};
	Voting?: {
		Upvotes?: true;
		Downvotes?: true;
		Anonymous?: true;
	};
}

async function forEachConfigExceptAccess(
	page: Page,
	callback: (category: string, config: string, checked: boolean) => Promise<void>
) {
	await expandConfigCategories(page);

	const categories = await page.locator(".configCategory").all();

	categories.forEach(async (categoryElem) => {
		const category = await categoryElem.locator("button").innerText();
		if (category === "Access") return;

		for (let labelElem of await categoryElem.locator("div > label").all()) {
			const config = (await labelElem.innerText()).replace(":", "");
			const checked = await labelElem.locator("checkbox").isChecked();

			await callback(category, config, checked);
		}
	});
}

async function setConfig(page: Page, targetConfig: configByUiText) {
	await forEachConfigExceptAccess(page, async (category, config, checked) => {
		if (checked !== Boolean(targetConfig[category][config])) {
			page.getByText("config").click();
		}
	});
}

async function validateConfig(page: Page, targetConfig: configByUiText) {
	await forEachConfigExceptAccess(page, async (category, config, checked) => {
		expect(Boolean(targetConfig[category][config])).toBe(checked);
	});
}

test.describe.fixme("Presets manipulation in dashboard", () => {
	test("Setup (sign up & navigate to page)", async ({page}) => {
		await signUp(page, "Drafter" + randomUsername());
		await page.goto("/dashboard");
		await page.getByText("Presets").click();
	});

	test("Save preset", async ({page}) => {
		const presetName = "Preset 1";
		const config: configByUiText = {Timestamps: {Interacted: true}, Voting: {Upvotes: true}};

		await page.getByText("New preset").click();
		await expect(page.getByRole("button", {name: "Save"})).toBeVisible();
		await expect(page.getByRole("button", {name: "[No Title]"})).toBeVisible();
		expect(await page.getByText("Access").count()).toBeFalsy();

		await page.getByLabel("Name").fill(presetName);
		await setConfig(page, config);
		await page.getByText("Save").click();
		await expect(page.locator(".notification.positive")).toBeVisible();

		await page.reload();
		await page.getByText("Presets").click();
		await page.getByText(presetName).click();
		await expect(page.getByLabel("Name")).toHaveValue(presetName);
		await validateConfig(page, config);
	});

	test("Save presets to capacity", async ({page}) => {
		[
			{name: "Preset 2", config: {Voting: {Downvotes: true, Anonymous: true}} as configByUiText},
			{name: "Preset 3", config: {Voting: {Upvotes: true, Anonymous: true}} as configByUiText},
		].forEach(async (preset, index) => {
			await page.getByText("New preset").click();
			const presetButtons = await page.locator(".presetButton").all();
			expect(presetButtons).toHaveLength(index + 2);
			if (presetButtons.length === 3) {
				expect(await page.getByText("New preset").count()).toBeFalsy();
				await expect(page.locator(".notification", {hasText: "at capacity"})).toBeVisible();
			}
			await page.getByLabel("Name").fill(preset.name);
			await expect(page.getByRole("button", {name: preset.name})).toBeVisible();
			await setConfig(page, preset.config);
			await page.getByText("Save").click();
			await expect(page.locator(".notification.positive")).toBeVisible();

			await page.reload();
			await page.getByText("Presets").click();
			expect(page.getByText(".presetButton").all()).toHaveLength(index + 2);
			await page.getByText(preset.name).click();
			await validateConfig(page, preset.config);
		});
	});

	test("Edit preset", async ({page}) => {
		const oldName = "Preset 2";
		const newName = "Edited Preset";
		const newConfig: configByUiText = {Timestamps: {Interacted: true}, Voting: {Downvotes: true}};
		await page.reload();
		await page.getByText("Presets").click();

		await page.getByText(oldName).click();
		await page.getByLabel("Name").fill(newName);
		await expect(page.getByRole("button", {name: newName})).toBeVisible();
		expect(await page.getByText(oldName).count()).toBeFalsy();
		await setConfig(page, newConfig);
		await page.getByText("Save").click();
		await expect(page.locator(".notification.positive")).toBeVisible();

		await page.reload();
		await page.getByText("Presets").click();
		expect(await page.getByText(oldName).count()).toBeFalsy();
		await page.getByText(newName).click();
		await validateConfig(page, newConfig);
	});

	test("Delete preset", async ({page}) => {
		const deletedName = "Preset 1";

		await page.getByText(deletedName).click();
		await page.getByText("Delete").click();
		await page.getByText("Save").click();
		await expect(page.locator(".notification.positive")).toBeVisible();
		expect(await page.locator(".presetButton").all()).toHaveLength(2);

		await page.reload();
		await page.getByText("Presets").click();
		expect(await page.locator(".presetButton").all()).toHaveLength(2);
		expect(await page.getByText(deletedName).count()).toBeFalsy();
	});
});

test.describe.fixme("Preset manipulation in posting page", () => {
	async function validateCustomPresetCount(page: Page, customPresetCount: number) {
		expect(await page.locator('[data-testClass="customPresetButton"]').all()).toHaveLength(customPresetCount);
	}

	test("Setup (sign up & navigate to page)", async ({page}) => {
		await page.locator("header").getByText("Post").click();
	});

	test("Create a new preset (to capacity)", async ({page}) => {
		const newConfig: configByUiText = {
			Access: {Public: true},
			Timestamps: {Interacted: true},
			Voting: {Downvotes: true, Anonymous: true},
		};

		await validateCustomPresetCount(page, 2);
		await setConfig(page, newConfig);
		await page.getByText("Save preset").click();
		await expect(page.locator(".notification.positive")).toBeVisible();
		await validateCustomPresetCount(page, 3);
		expect(await page.getByText("Save preset").count()).toBeFalsy();
		await expect(page.getByText("Presets at capacity")).toHaveAttribute("inert", "true");

		await page.reload();
		await validateCustomPresetCount(page, 3);
		expect(page.getByText("Save preset").count()).toBeFalsy();
		await expect(page.getByText("Presets at capacity")).toHaveAttribute("inert", "true");
		await page.locator('[data-testClass="customPresetButton"]').last().click();
		await validateConfig(page, newConfig);
	});

	test("Post with dashboard preset", async ({page}) => {
		const postTitle = "Custom Preset " + randomNodeTitle();

		await createPost(page, postTitle, randomNodeBody(), async () => {
			await page.getByText("Edited Preset").click();
		});
		await page.getByText(postTitle).click();

		expect(await page.locator('[aria-label="Upvote"]').count()).toBeFalsy();
		expect(page.locator('[aria-label="Downvote"]')).toBeVisible();

		await createReply(page, [postTitle], randomNodeTitle(), randomNodeBody());
		await expect(page.locator(".interacted")).toBeVisible();
	});
});
