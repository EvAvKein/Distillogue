import {test, expect} from "@playwright/test";
import * as ui from "../../../helpers/requestsByUi.js";
import * as api from "../../../helpers/requestsByApi.js";
import {getSessionKey} from "../../../helpers/sessionKey.js";
import {randomNodeTitle, randomNodeBody} from "../../../helpers/randomAlphanumString.js";
import {NodeCreationRequest, PostCreationRequest} from "../../../../shared/objects/api.js";

// currently doesn't include tests for allowing authorized access to private posts, because:
// 1. it gets tested during other tests (e.g configs)
// 2. i'm was unable to conceive of a way to mess with applicable code in a way that would:
//  	- pass the aforementioned tests but not allow non-creator users to access the post
//		- not be immediately & glaringly obvious upon even an inattentive review of the prospective changes

test.describe("Prevent unauthorized access to private posts", () => {
	test("Fail to find inaccessible post through browsing", async ({page, request}) => {
		const {name, id} = (await api.signUp(request, page))!.data;

		const postTitle = randomNodeTitle();

		await api.createPost(
			request,
			(await getSessionKey(page))!,
			new PostCreationRequest(
				new NodeCreationRequest(postTitle, randomNodeBody()),
				{},
				{users: [{name, id, roles: []}]}
			)
		);

		await api.deleteSession(request, (await getSessionKey(page))!);
		await api.signUp(request, page);
		await page.goto("/browse");
		await expect(page.locator("ol")).not.toContainText(postTitle);
	});

	test("Fail to visit inaccessible post through URL", async ({page, request}) => {
		const {name, id} = (await api.signUp(request, page))!.data;

		const postTitle = randomNodeTitle();
		const postBody = randomNodeBody();

		await api.createPost(
			request,
			(await getSessionKey(page))!,
			new PostCreationRequest(new NodeCreationRequest(postTitle, postBody), {}, {users: [{name, id, roles: []}]})
		);
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
