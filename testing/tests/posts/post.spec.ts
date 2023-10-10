import {test, expect} from "@playwright/test";
import * as api from "../../helpers/requestsByApi.js";
import * as ui from "../../helpers/requestsByUi.js";
import {randomNodeBody, randomNodeTitle} from "../../helpers/randomAlphanumString.js";
import {setScreenSize} from "../../helpers/setScreenSize.js";

test("Post interface basics", async ({request, page}) => {
	await api.signUp(request, page);

	await setScreenSize(page, "desktop");
	const title = randomNodeTitle();
	const body = randomNodeBody();
	await ui.createPost(page, title, body);

	await expect(page.locator(".node .title")).toHaveText(title);
	await expect(page.locator(".node .body p")).toHaveText(body);
	await expect(page.locator(".node .timestamps")).toHaveText("Posted: Now");
	await expect(page.locator(".node .interactable .replyButton")).toBeVisible();
});
