import {test, expect} from "@playwright/test";
import {createUser} from "../../helpers/requestsByApi.js";
import {setSessionKey} from "../../helpers/sessionKey.js";
import {randomUsername} from "../../helpers/randomAlphanumString.js";
import {user} from "../../../shared/objects/validationUnits.js";

test.describe("Profile editing - UI", () => {
	test("Change name", async ({page, request}) => {
		let {
			sessionKey,
			data: {name},
		} = (await createUser(request)).data!;
		await page.goto("/");
		await setSessionKey(page, sessionKey);
		await page.goto("/dashboard/profile");
		const nameInput = page.getByLabel("Name");
		await expect(nameInput).toHaveValue(name);

		name = "new" + randomUsername();
		nameInput.fill(name);
		expect(await page.locator(".notification.negative").count()).toBeFalsy();

		await page.reload();
		await expect(page.getByLabel("Name")).toHaveValue(name);
	});

	test("Fail to change name outside character limits", async ({page, request}) => {
		const {sessionKey} = (await createUser(request)).data!;
		await page.goto("/");
		await setSessionKey(page, sessionKey);
		await page.goto("/dashboard/profile");

		const namesOutsideLimits = ["A".repeat(user.name.min - 1), "A".repeat(user.name.max + 1)];
		for (const invalidName of namesOutsideLimits) {
			await page.getByLabel("Name").fill(invalidName);
			await expect(page.locator(".notification.negative")).toBeVisible();
			await page.reload();
			await expect(page.getByLabel("Name")).not.toHaveValue(invalidName);
		}
	});
});
