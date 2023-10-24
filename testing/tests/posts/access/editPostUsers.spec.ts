import {test, expect, type Page, APIRequestContext} from "@playwright/test";
import * as api from "../../../helpers/requestsByApi.js";
import {
	randomAlphanumString,
	randomNodeBody,
	randomNodeTitle,
	randomUsername,
} from "../../../helpers/randomAlphanumString.js";
import {
	FetchResponse,
	NodeCreationRequest,
	PostCreationRequest,
	UserPatchRequest,
} from "../../../../shared/objects/api.js";
import {Post} from "../../../../shared/objects/post.js";
import {setScreenSize} from "../../../helpers/setScreenSize.js";
import {PostUserEntry, UserPayload} from "../../../../shared/objects/user.js";

const access = {
	wrapper: "#access",
	nameInput: "#userAdditionName",
	idInput: "#userAdditionId",
	contactSelect: "#userAdditionContact",
	userAdditionButton: "#userAdditionConfirm",
	userInfoCollapsible: ".userInfoCollapsible",
	userModCheckbox: ".userModCheckbox",
	userDeletionButton: ".userDeletionButton",
} as const;

async function addUser(page: Page, name: string, id: string) {
	await page.locator(access.nameInput).fill(name);
	await page.locator(access.idInput).fill(id);
	await page.locator(access.userAdditionButton).click();
}

async function expandAllUserInfos(page: Page) {
	for (const collapsible of await page.locator(access.userInfoCollapsible).all()) {
		await collapsible.locator("button").click();
	}
}

async function postAndValidate(page: Page, validation: (post: Post) => Promise<void>) {
	await page.getByLabel("Title").fill(randomNodeTitle());
	await page.getByLabel("Body").fill(randomNodeBody());

	const newPost = page.waitForResponse(/api\/posts\/*/);
	await page.locator("button", {hasText: "Post"}).click();

	const post = ((await (await newPost).json()) as FetchResponse<Post>).data!;
	await validation(post);
}

// test.describe("Post creation", async () => {
// 	test.beforeEach(async ({page}) => {
// 		await setScreenSize(page, "desktop");
// 	});

// 	test("Validate initial state", async ({request, page}) => {
// 		const ownUser = (await api.signUp(request, page))!.data;
// 		await page.goto("/post/create");

// 		for (const element of [access.nameInput, access.idInput, access.userAdditionButton, "tbody tr"]) {
// 			await expect(page.locator(element)).toBeVisible();
// 		}

// 		for (const element of [access.contactSelect, access.userDeletionButton]) {
// 			await expect(page.locator(element)).not.toBeVisible();
// 		}

// 		expect(await page.locator(access.userModCheckbox).isChecked()).toBeFalsy();

// 		await page.goto("/post/create");
// 		await expandAllUserInfos(page);
// 		await expect(page.locator(access.userInfoCollapsible)).toContainText(ownUser.name + ownUser.id);

// 		await postAndValidate(page, async (post: Post) => {
// 			expect(post.access.users).toEqual([{id: ownUser.id, name: ownUser.name, roles: []}]);
// 		});
// 	});

// 	test("Add user", async ({request, page}) => {
// 		const ownUser = (await api.signUp(request, page))!.data;
// 		await page.goto("/post/create");

// 		const newUserName = randomUsername();
// 		const newUserId = randomAlphanumString();
// 		await addUser(page, newUserName, newUserId);

// 		const newUserRow = page.locator("tbody tr").nth(1);
// 		await expandAllUserInfos(page);
// 		await expect(newUserRow.locator(access.userInfoCollapsible)).toHaveText(newUserName + newUserId);
// 		await expect(newUserRow.locator(access.userModCheckbox)).toBeVisible();
// 		await expect(newUserRow.locator(access.userDeletionButton)).toBeVisible();

// 		await postAndValidate(page, async (post: Post) => {
// 			expect(post.access.users).toEqual([
// 				{id: ownUser.id, name: ownUser.name, roles: []},
// 				{id: newUserId, name: newUserName, roles: []},
// 			]);
// 		});
// 	});

// 	test.describe("Add with contacts", () => {
// 		async function addContact(page: Page, name: string, id: string) {
// 			await page.getByLabel("Name").fill(name);
// 			await page.getByLabel("ID").fill(id);
// 			await page.getByText("New contact").click();
// 		}

// 		test("Add user by contact", async ({request, page}) => {
// 			const ownUser = (await api.signUp(request, page))!.data;
// 			await page.goto("/dashboard/contacts");

// 			const contactName = randomUsername();
// 			const contactId = randomAlphanumString();
// 			await addContact(page, contactName, contactId);

// 			await page.goto("/post/create");

// 			await page.locator(access.contactSelect).selectOption(contactName + ` (${contactId})`);
// 			await expect(page.locator(access.nameInput)).toHaveValue(contactName);
// 			await expect(page.locator(access.idInput)).toHaveValue(contactId);
// 			await page.locator(access.userAdditionButton).click();

// 			await expandAllUserInfos(page);
// 			await expect(page.locator("tbody tr:nth-child(2) td:nth-child(1)")).toHaveText(contactName + contactId);

// 			await postAndValidate(page, async (post: Post) => {
// 				expect(post.access.users).toEqual([
// 					{id: ownUser.id, name: ownUser.name, roles: []},
// 					{id: contactId, name: contactName, roles: []},
// 				]);
// 			});
// 		});

// 		test("Add user by non-first contact", async ({request, page}) => {
// 			const ownUser = (await api.signUp(request, page))!.data;
// 			await page.goto("/dashboard/contacts");

// 			const firstContactName = randomUsername();
// 			const firstContactId = randomAlphanumString();
// 			await addContact(page, firstContactName, firstContactId);
// 			const secondContactName = randomUsername();
// 			const secondContactId = randomAlphanumString();
// 			await addContact(page, secondContactName, secondContactId);

// 			await page.goto("/post/create");

// 			await page.locator(access.contactSelect).selectOption(secondContactName + ` (${secondContactId})`);
// 			await expect(page.locator(access.nameInput)).toHaveValue(secondContactName);
// 			await expect(page.locator(access.idInput)).toHaveValue(secondContactId);
// 			await page.locator(access.userAdditionButton).click();

// 			await expandAllUserInfos(page);
// 			await expect(page.locator("tbody tr:nth-child(2) td:nth-child(1)")).toHaveText(
// 				secondContactName + secondContactId
// 			);

// 			await postAndValidate(page, async (post: Post) => {
// 				expect(post.access.users).toEqual([
// 					{id: ownUser.id, name: ownUser.name, roles: []},
// 					{id: secondContactId, name: secondContactName, roles: []},
// 				]);
// 			});
// 		});

// 		test("Add user by contact & add another by typing", async ({request, page}) => {
// 			const ownUser = (await api.signUp(request, page))!.data;
// 			await page.goto("/dashboard/contacts");

// 			const contactName = randomUsername();
// 			const contactId = randomAlphanumString();
// 			await addContact(page, contactName, contactId);

// 			await page.goto("/post/create");

// 			await page.locator(access.contactSelect).selectOption(contactName + ` (${contactId})`);
// 			await page.locator(access.userAdditionButton).click();

// 			const manualName = randomUsername();
// 			const manualId = randomAlphanumString();
// 			await addUser(page, manualName, manualId);

// 			const userRows = page.locator("tbody tr td:nth-child(1)");
// 			await expandAllUserInfos(page);
// 			await expect(userRows.nth(1)).toHaveText(contactName + contactId);
// 			await expect(userRows.nth(2)).toHaveText(manualName + manualId);

// 			await postAndValidate(page, async (post: Post) => {
// 				expect(post.access.users).toEqual([
// 					{id: ownUser.id, name: ownUser.name, roles: []},
// 					{id: contactId, name: contactName, roles: []},
// 					{id: manualId, name: manualName, roles: []},
// 				]);
// 			});
// 		});
// 	});

// 	test.describe("Moderator role", () => {
// 		test("Mod user", async ({request, page}) => {
// 			const ownUser = (await api.signUp(request, page))!.data;
// 			await page.goto("/post/create");

// 			const modUserName = "modUser";
// 			const modUserId = randomAlphanumString();
// 			await addUser(page, modUserName, modUserId);

// 			await page.locator(access.userModCheckbox).nth(1).click();

// 			await postAndValidate(page, async (post: Post) => {
// 				expect(post.access.users).toEqual([
// 					{id: ownUser.id, name: ownUser.name, roles: []},
// 					{id: modUserId, name: modUserName, roles: ["Moderator"]},
// 				]);
// 			});
// 		});

// 		test("Unmod user", async ({request, page}) => {
// 			const ownUser = (await api.signUp(request, page))!.data;
// 			await page.goto("/post/create");

// 			const unmodUserName = "modUser";
// 			const unmodUserId = randomAlphanumString();
// 			await addUser(page, unmodUserName, unmodUserId);

// 			await page.locator(access.userModCheckbox).nth(1).dblclick({delay: 500});

// 			await postAndValidate(page, async (post: Post) => {
// 				expect(post.access.users).toEqual([
// 					{id: ownUser.id, name: ownUser.name, roles: []},
// 					{id: unmodUserId, name: unmodUserName, roles: []},
// 				]);
// 			});
// 		});
// 	});

// 	test.describe("Same-ID replacement", () => {
// 		test("Auto-replace added user with duplicate ID", async ({request, page}) => {
// 			const ownUser = (await api.signUp(request, page))!.data;
// 			await page.goto("/post/create");

// 			const tempUserName = "temporary";
// 			const newUserId = randomAlphanumString();
// 			await addUser(page, tempUserName, newUserId);

// 			const otherUserName = "other";
// 			const otherUserId = randomAlphanumString();
// 			await addUser(page, otherUserName, otherUserId);

// 			const differentUserName = randomUsername();
// 			await addUser(page, differentUserName, newUserId);

// 			const userRows = page.locator("tbody tr td:nth-child(1)");
// 			await expect(userRows.nth(0)).toHaveText(ownUser.name + ownUser.id);
// 			await expect(userRows.nth(1)).toHaveText(otherUserName + otherUserId);
// 			await expect(userRows.nth(2)).toHaveText(differentUserName + newUserId);

// 			await postAndValidate(page, async (post: Post) => {
// 				expect(post.access.users).toEqual([
// 					{id: ownUser.id, name: ownUser.name, roles: []},
// 					{id: otherUserId, name: otherUserName, roles: []},
// 					{id: newUserId, name: differentUserName, roles: []},
// 				]);
// 			});
// 		});

// 		test("Auto-replace added user with own ID", async ({request, page}) => {
// 			const ownUser = (await api.signUp(request, page))!.data;
// 			await page.goto("/post/create");

// 			const otherUserName = "other";
// 			const otherUserId = randomAlphanumString();
// 			await addUser(page, otherUserName, otherUserId);

// 			const newName = "me :)";
// 			await addUser(page, newName, ownUser.id);

// 			const userRows = page.locator("tbody tr");
// 			await expect(userRows.nth(0).locator(access.userDeletionButton)).toBeVisible();
// 			await expect(userRows.nth(1).locator(access.userDeletionButton)).not.toBeVisible();

// 			await expandAllUserInfos(page);
// 			const userRowInfos = userRows.locator("td:nth-child(1)");
// 			await expect(userRowInfos.nth(0)).toHaveText(otherUserName + otherUserId);
// 			await expect(userRowInfos.nth(1)).toHaveText(newName + ownUser.id);

// 			await postAndValidate(page, async (post: Post) => {
// 				expect(post.access.users).toEqual([
// 					{id: otherUserId, name: otherUserName, roles: []},
// 					{id: ownUser.id, name: newName, roles: []},
// 				]);
// 			});
// 		});
// 	});

// 	test.describe("User removal", () => {
// 		test("Delete user", async ({request, page}) => {
// 			const ownUser = (await api.signUp(request, page))!.data;
// 			await page.goto("/post/create");

// 			const deletionUserName = "toBeDeleted";
// 			const deletionUserId = randomAlphanumString();
// 			await addUser(page, deletionUserName, deletionUserId);

// 			const rolesUserName = "roles";
// 			const rolesUserId = randomAlphanumString();
// 			await addUser(page, rolesUserName, rolesUserId);

// 			await page.locator(access.userModCheckbox).last().click();
// 			await page.locator(access.userDeletionButton).first().click();

// 			const userRows = page.locator("tbody tr");
// 			await expect(userRows.nth(1)).toContainText(rolesUserName);
// 			await expect(userRows.nth(1).locator(access.userModCheckbox)).toBeChecked();

// 			await postAndValidate(page, async (post: Post) => {
// 				expect(post.access.users).toEqual([
// 					{id: ownUser.id, name: ownUser.name, roles: []},
// 					{id: rolesUserId, name: rolesUserName, roles: ["Moderator"]},
// 				]);
// 			});
// 		});

// 		test("Delete first user after owner same-ID replacement", async ({request, page}) => {
// 			const ownUser = (await api.signUp(request, page))!.data;
// 			await page.goto("/post/create");

// 			const otherUserName = "other";
// 			const otherUserId = randomAlphanumString();
// 			await addUser(page, otherUserName, otherUserId);

// 			const newName = "me :)";
// 			await addUser(page, newName, ownUser.id);

// 			const userRows = page.locator("tbody tr");
// 			await userRows.nth(0).locator(access.userDeletionButton).click();

// 			await expandAllUserInfos(page);
// 			await expect(userRows.locator("td:nth-child(1)")).toHaveText(newName + ownUser.id);

// 			await postAndValidate(page, async (post: Post) => {
// 				expect(post.access.users).toEqual([{id: ownUser.id, name: newName, roles: []}]);
// 			});
// 		});

// 		test("Perserve roles on deletion (and checkboxes on list re-render)", async ({request, page}) => {
// 			const ownUser = (await api.signUp(request, page))!.data;
// 			await page.goto("/post/create");

// 			const deletionUserName = "toBeDeleted";
// 			const deletionUserId = randomAlphanumString();
// 			await addUser(page, deletionUserName, deletionUserId);

// 			const rolesUserName = "roles";
// 			const rolesUserId = randomAlphanumString();
// 			await addUser(page, rolesUserName, rolesUserId);

// 			await page.locator(access.userModCheckbox).last().click();
// 			await page.locator(access.userDeletionButton).first().click();

// 			const userRows = page.locator("tbody tr");
// 			await expect(userRows.nth(1)).toContainText(rolesUserName);
// 			await expect(userRows.nth(1).locator(access.userModCheckbox)).toBeChecked();

// 			await postAndValidate(page, async (post: Post) => {
// 				expect(post.access.users).toEqual([
// 					{id: ownUser.id, name: ownUser.name, roles: []},
// 					{id: rolesUserId, name: rolesUserName, roles: ["Moderator"]},
// 				]);
// 			});
// 		});
// 	});
// });

const uInfo = {
	infoExpandButton: "#postInfoWrapperButton",
	users: "#postUsers",
	userAddition: {
		nameInput: "#extraUserName",
		idInput: "#extraUserId",
		contactSelect: "#contactSelect",
		submit: "#userAddition button",
	},
	userRoles: ".userRoles",
	roleSelect: ".roleSelect",
	roleRemoval: ".roleRemoval",
	userRemoval: ".userRemoval",
} as const;
async function createPostWithUsers(request: APIRequestContext, userKey: string, users: PostUserEntry[]) {
	return (
		await api.createPost(
			request,
			userKey,
			new PostCreationRequest(new NodeCreationRequest(randomNodeTitle(), randomNodeBody()), {}, {users})
		)
	).data!;
}
async function expandInfo(page: Page) {
	await page.locator(uInfo.infoExpandButton).click();
}
test.describe("In-post", async () => {
	test("Non-moderators not allowed to edit post", async ({request, page}) => {
		const user1 = (await api.signUp(request, page))!;
		const userMod = (await api.createUser(request)).data!;
		const post = await createPostWithUsers(request, userMod.sessionKey, [
			{id: user1.data.id, name: user1.data.name, roles: []},
			{id: userMod.data.id, name: userMod.data.name, roles: ["Moderator"]},
		]);
		await page.goto("/post/" + post.thread.id);
		await expandInfo(page);

		for (const selector of [
			uInfo.userAddition.nameInput,
			uInfo.userAddition.idInput,
			uInfo.userAddition.contactSelect,
			uInfo.userAddition.submit,
			uInfo.userRemoval,
			uInfo.roleSelect,
			uInfo.roleRemoval,
		]) {
			await expect(page.locator(selector)).toHaveCount(0);
		}

		const modifiedAccess = {...post.access};
		modifiedAccess.users = [
			{id: user1.data.id, name: user1.data.name, roles: ["Moderator"]},
			{id: userMod.data.id, name: userMod.data.name, roles: []},
		];
		const modlessPatchAttempt = (await (
			await request.patch("/api/posts/" + post.thread.id, {
				data: {access: modifiedAccess},
				headers: {authorization: "Bearer " + user1.sessionKey},
			})
		).json()) as FetchResponse<Post>;

		expect(modlessPatchAttempt.error).toBeTruthy();
		const postAfterModlessPatchAttempt = await api.getPost(request, user1.sessionKey, post.thread.id);
		expect(postAfterModlessPatchAttempt.data!.access).toEqual(post.access);
	});

	test.describe("User addition", () => {
		test("Add user", async ({request, page}) => {
			const user = (await api.signUp(request, page))!;
			const post = await createPostWithUsers(request, user.sessionKey, [
				{id: user.data.id, name: user.data.name, roles: ["Moderator"]},
			]);
			await page.goto("/post/" + post.thread.id);
			await expandInfo(page);

			const user2 = {id: randomAlphanumString(), name: randomUsername()};
			await page.locator(uInfo.userAddition.nameInput).fill(user2.name);
			await page.locator(uInfo.userAddition.idInput).fill(user2.id);
			const userAdditionResponse = page.waitForResponse(/api\/posts\/*/);
			await page.locator(uInfo.userAddition.submit).click();
			await userAdditionResponse;

			const usersAfterAddition = (await api.getPost(request, user.sessionKey, post.thread.id)).data!.access.users;
			expect(usersAfterAddition).toHaveLength(2);
			expect(usersAfterAddition[0]).toEqual({name: user.data.name, id: user.data.id, roles: ["Moderator"]});
			expect(usersAfterAddition[1]).toEqual({name: user2.name, id: user2.id, roles: []});
		});

		test("Add user by contact", async ({request, page}) => {
			const user = (await api.signUp(request, page))!;
			const user2 = {id: randomAlphanumString(), name: randomUsername()};
			await request.patch("/api/users", {
				headers: {authorization: "Bearer " + user.sessionKey},
				data: [new UserPatchRequest("contacts", [user2])],
			});
			const post = await createPostWithUsers(request, user.sessionKey, [
				{id: user.data.id, name: user.data.name, roles: ["Moderator"]},
			]);
			await page.goto("/post/" + post.thread.id);
			await expandInfo(page);

			await page.locator(uInfo.userAddition.contactSelect).selectOption(user2.name);
			const userAdditionResponse = page.waitForResponse(/api\/posts\/*/);
			await page.locator(uInfo.userAddition.submit).click();
			await userAdditionResponse;

			const usersAfterAddition = (await api.getPost(request, user.sessionKey, post.thread.id)).data!.access.users;
			expect(usersAfterAddition).toHaveLength(2);
			expect(usersAfterAddition[0]).toEqual({name: user.data.name, id: user.data.id, roles: ["Moderator"]});
			expect(usersAfterAddition[1]).toEqual({name: user2.name, id: user2.id, roles: []});
		});
	});

	test.describe("Roles", () => {
		test("Initial roles & default absence thereof", async ({request, page}) => {
			const user = (await api.signUp(request, page))!;
			const user2 = {id: randomAlphanumString(), name: randomUsername()};
			const post = await createPostWithUsers(request, user.sessionKey, [
				{id: user.data.id, name: user.data.name, roles: []},
				{id: user2.id, name: user2.name, roles: ["Moderator"]},
			]);
			await page.goto("/post/" + post.thread.id);
			await expandInfo(page);

			await expect(
				page
					.locator(uInfo.users + " li")
					.nth(0)
					.locator(uInfo.userRoles)
			).toBeEmpty();
			await expect(
				page
					.locator(uInfo.users + " li")
					.nth(1)
					.locator(uInfo.userRoles)
			).toHaveText("Moderator");
		});

		test("Role addition & removal", async ({request, page}) => {
			const user = (await api.signUp(request, page))!;
			const post = await createPostWithUsers(request, user.sessionKey, [
				{id: user.data.id, name: user.data.name, roles: ["Moderator"]},
				{id: randomAlphanumString(), name: randomUsername(), roles: []},
			]);
			await page.goto("/post/" + post.thread.id);
			await expandInfo(page);

			const roleAdditionRequest = page.waitForResponse(/api\/posts\/*/);
			await page.locator(uInfo.roleSelect).nth(1).selectOption("Spectator");
			await roleAdditionRequest;
			await expect(page.locator(uInfo.userRoles + " li.pill span").nth(1)).toHaveText("Spectator");

			const roleRemovalRequest = page.waitForResponse(/api\/posts\/*/);
			await page.locator(uInfo.roleRemoval).nth(0).click();
			await roleRemovalRequest;
			await expect(page.locator(uInfo.userRoles + " li.pill span").nth(0)).not.toHaveText("Moderator");
		});
	});

	test("User removal", async ({request, page}) => {
		const removedUser = randomUsername();
		const user = (await api.signUp(request, page))!;
		const post = await createPostWithUsers(request, user.sessionKey, [
			{id: user.data.id, name: user.data.name, roles: ["Moderator"]},
			{id: randomAlphanumString(), name: removedUser, roles: []},
		]);
		await page.goto("/post/" + post.thread.id);
		await expandInfo(page);

		await page.locator(uInfo.users + " li:nth-child(2) section[aria-expanded] > button").dispatchEvent("click");
		const roleRemovalRequest = page.waitForResponse(/api\/posts\/*/);
		await page
			.locator(uInfo.users + " li:nth-child(2)")
			.locator(uInfo.userRemoval)
			.dispatchEvent("click");
		await roleRemovalRequest;
		await page.goto("/post/" + post.thread.id);
		await expect(page.locator(uInfo.users)).not.toContainText(removedUser);
	});
});
