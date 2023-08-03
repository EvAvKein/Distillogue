import {test, expect} from "@playwright/test";
import {createSession, getUserData, deleteSession, createUser} from "../../helpers/requestsByApi.js";
import {getSessionKey, setSessionKey} from "../../helpers/sessionKey.js";
import {signUp} from "../../helpers/requestsByUi.js";

test.describe("User sessions - API", async () => {
	test("Fail to reuse key after session deletion", async ({request}) => {
		const {sessionKey} = (await createUser(request)).data!;

		await expect(await deleteSession(request, sessionKey)).toBeOK();

		const failedAuthRequest = await getUserData(request, sessionKey);
		expect(failedAuthRequest.error).toBeTruthy();
	});

	test("Obtain different key for new session by same user", async ({request}) => {
		const {
			data: {name},
			sessionKey: firstKey,
		} = (await createUser(request)).data!;

		await expect(await deleteSession(request, firstKey)).toBeOK();

		const secondKey = (await createSession(request, name)).data?.sessionKey;
		expect(typeof secondKey).toBe("string");
		expect(secondKey).not.toEqual(firstKey);
	});

	// test("get sessions list & update (TODO pending endpoint, which is pending dashboard section)", async () => {});
});

test.describe("User sessions - UI", async () => {
	test("Delete session key on logout", async ({page}) => {
		await signUp(page);
		expect(typeof (await getSessionKey(page))).toBe("string");

		await page.locator("header").getByText("Logout").click();
		expect(await getSessionKey(page)).toBeNull();
	});

	const sessionRequiredPage: string[] = ["/dashboard", "/post/create"];

	test("Fail to navigate to any session-required page while not signed in", async ({page}) => {
		for (const pageURL of sessionRequiredPage) {
			await page.goto(pageURL);
			await expect(page).toHaveURL(/.*join/);
		}
	});
	test("Navigate to all session-required pages while signed in", async ({page}) => {
		await signUp(page);
		for (const pageURL of sessionRequiredPage) {
			await page.goto(pageURL);
			expect(page.url().includes(pageURL)).toBe(true);
		}
	});

	test("Fail to reuse session key after logout", async ({page}) => {
		await signUp(page);
		const sessionKey = await getSessionKey(page);
		expect(typeof sessionKey).toBe("string");

		await page.locator("header").getByText("Logout").click();
		await setSessionKey(page, sessionKey as string);
		await page.goto("/post/create");
		await expect(page).toHaveURL(/.*join/);
	});

	// test("View & update session in dashboard (TODO pending dashboard section)", async () => {});
});
