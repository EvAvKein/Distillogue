import {test, expect, type Page} from "@playwright/test";
import {createPost, createUser, setAdmin} from "../../helpers/requestsByApi.js";
import {NodeCreationRequest, PostCreationRequest} from "../../../shared/objects/api.js";
import {randomNodeBody, randomNodeTitle} from "../../helpers/randomAlphanumString.js";
import {setSessionKey} from "../../helpers/sessionKey.js";

test.describe("Posts feed", async () => {
	test("See non-invited post", async ({request, page}) => {
		const privateUserPayload = (await createUser(request)).data!;

		const postText = {title: randomNodeTitle(), body: randomNodeBody()};

		await createPost(
			request,
			privateUserPayload.sessionKey,
			new PostCreationRequest(
				new NodeCreationRequest(postText.title, postText.body),
				{},
				{users: [{id: privateUserPayload.data.id, name: privateUserPayload.data.name, roles: []}]}
			)
		);

		const adminUserPayload = (await createUser(request)).data!;

		await expect(await setAdmin(request, adminUserPayload.sessionKey, true)).toBeOK();

		await page.goto("/");
		await setSessionKey(page, adminUserPayload.sessionKey);

		await page.goto("/admin");
		await page.locator("ol").getByText(postText.title).click();

		await expect(page.locator(".node")).toContainText(postText.body);
	});
});
