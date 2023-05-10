import {test, expect} from "@playwright/test";
import * as ui from "../../../helpers/requestsByUi.js";
import * as api from "../../../helpers/requestsByApi.js";
import {getSessionKey} from "../../../helpers/sessionKey.js";
import {randomNodeTitle, randomNodeBody} from "../../../helpers/randomAlphanumString.js";
import {NodeCreationRequest, PostCreationRequest} from "../../../../shared/objects/api.js";

test.describe("Access", () => {
	test.beforeEach(async ({request, page}) => {
		await api.signUp(request, page);
	});

	test("Fail to find inaccessible post through browsing", async ({page, request}) => {
		const postTitle = randomNodeTitle();

		const {name, id} = (await api.getUserData(request, page)).data!;

		await expect(
			await api.createPost(
				request,
				(await getSessionKey(page))!,
				new PostCreationRequest(new NodeCreationRequest(postTitle, randomNodeBody()), {}, {users: [{name, id}]})
			)
		).toBeOK();

		await api.deleteSession(request, (await getSessionKey(page))!);
		await api.signUp(request, page);
		await page.goto("/browse");
		await expect(page.locator("ol")).not.toContainText(postTitle);
	});

	test("Fail to visit inaccessible post through URL", async ({page, request}) => {
		const postTitle = randomNodeTitle();
		const postBody = randomNodeBody();

		const {name, id} = (await api.getUserData(request, page)).data!;
		await expect(
			await api.createPost(
				request,
				(await getSessionKey(page))!,
				new PostCreationRequest(new NodeCreationRequest(postTitle, postBody), {}, {users: [{name, id}]})
			)
		).toBeOK();
		await page.goto("/browse");
		await page.getByText(postTitle).click();
		await page.waitForURL(/post\/.*/);
		const url = page.url();
		await ui.signOut(page);

		async function failToVisitPost() {
			await page.goto(url);
			await expect(page.locator(".notification.negative")).toBeVisible();
			await expect(page.locator("body")).not.toContainText(postTitle);
			await expect(page.locator("body")).not.toContainText(postBody);
		}

		await page.goto(url);
		await failToVisitPost();

		await api.signUp(request, page);
		await failToVisitPost();
	});
});
