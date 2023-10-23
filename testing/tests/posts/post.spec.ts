import {test, expect} from "@playwright/test";
import * as api from "../../helpers/requestsByApi.js";
import * as ui from "../../helpers/requestsByUi.js";
import {randomNodeBody, randomNodeTitle} from "../../helpers/randomAlphanumString.js";
import {setScreenSize} from "../../helpers/setScreenSize.js";

test("Basic post interface", async ({request, page}) => {
	const user = (await api.signUp(request, page))!;

	await setScreenSize(page, "desktop");
	const title = randomNodeTitle();
	const body = randomNodeBody();
	const postCreationRequest = page.waitForResponse(/api\/posts/);
	await ui.createPost(page, title, body);
	await postCreationRequest;

	const node = page.locator(".node");
	await expect(node.locator(".title")).toHaveText(title);
	await expect(node.locator(".body p")).toHaveText(body);
	await expect(node.locator(".timestamps")).toHaveText("Posted: Now");
	await expect(node.locator(".interactable .replyButton")).toBeVisible();

	const info = page.locator("#postInfo");
	await expect(info).not.toBeInViewport();
	await page.locator("#postInfoWrapperButton").click();
	await expect(info).toBeInViewport();
	await expect(info.locator("h1")).toHaveText(title);

	const userElem = page.locator("#postUsers li");
	const userIdElem = userElem.locator(".userId");
	await expect(userIdElem).not.toBeVisible();
	await userElem.locator("button", {hasText: user.data.name}).click();
	await expect(userIdElem).toBeVisible();
	await expect(userIdElem).toHaveText(user.data.id);
});
