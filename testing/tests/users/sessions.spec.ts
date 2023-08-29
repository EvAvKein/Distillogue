import {test, expect} from "@playwright/test";
import * as api from "../../helpers/requestsByApi.js";
import * as ui from "../../helpers/requestsByUi.js";
import {getSessionKey, setSessionKey} from "../../helpers/sessionKey.js";
import {randomAlphanumString} from "../../helpers/randomAlphanumString.js";
import {UserSession} from "../../../shared/objects/user.js";

test.describe("User sessions - UI", async () => {
	test("Delete session on logout", async ({page, request}) => {
		await api.signUp(request, page);
		await page.reload();
		const sessionKey = (await getSessionKey(page))!;
		expect(typeof sessionKey).toBe("string");

		await page.locator("header").getByText("Logout").click();
		await page.waitForURL(/join/);
		const logoutSessionKey = await getSessionKey(page);
		expect(logoutSessionKey).toBe(null);

		await setSessionKey(page, sessionKey);
		await page.goto("/post/create");
		await expect(page).toHaveURL(/join/);
	});

	test.describe("Dashboard", () => {
		const selector = {
			sList: "#sessions",
			sItem: "#sessions li",
			sName: ".sessionName",
			sLatest: ".latestUsed",
			sDeletionButton: ".deleteSession",
			sCurrentIcon: "#currentSession",
		};

		test("List all sessions", async ({page, request, context}) => {
			const user = (await api.signUp(request, page))!;
			const sessionsResponse = page.waitForResponse("/api/sessions");
			await page.goto("/dashboard/sessions");
			const sessions: UserSession[] = (await (await sessionsResponse).json()).data;

			expect(sessions).toHaveLength(1);
			await expect(page.locator(selector.sName)).toHaveValue(sessions[0].name);
			await expect(page.locator(selector.sLatest)).toHaveText("Now");
			await expect(page.locator(selector.sCurrentIcon)).toBeVisible();
			await expect(page.locator(selector.sDeletionButton)).not.toBeVisible();

			const page2 = await context.newPage();
			await ui.signIn(page2, user.data.name);
			const sessionsResponse2 = page2.waitForResponse("/api/sessions");
			await page2.goto("/dashboard/sessions");
			const sessions2: UserSession[] = (await (await sessionsResponse2).json()).data;

			expect(sessions2).toHaveLength(2);
			await expect(page2.locator("li:nth-child(1) " + selector.sName)).toHaveValue(sessions2[0].name);
			await expect(page2.locator("li:nth-child(1) " + selector.sLatest)).toHaveText("Now");
			await expect(page2.locator("li:nth-child(1) " + selector.sCurrentIcon)).not.toBeVisible();
			await expect(page2.locator("li:nth-child(1) " + selector.sDeletionButton)).toBeVisible();
			await expect(page2.locator("li:nth-child(2) " + selector.sName)).toHaveValue(sessions2[1].name);
			await expect(page2.locator("li:nth-child(2) " + selector.sLatest)).toHaveText("Now");
			await expect(page2.locator("li:nth-child(2) " + selector.sCurrentIcon)).toBeVisible();
			await expect(page2.locator("li:nth-child(2) " + selector.sDeletionButton)).not.toBeVisible();
		});

		test("Delete session", async ({page, request, browser}) => {
			const user = (await api.signUp(request, page))!;
			await page.goto("/dashboard/sessions");

			const page2 = await (await browser.newContext()).newPage();

			await ui.signIn(page2, user.data.name);
			await page2.goto("/dashboard/sessions");
			await page2.locator(selector.sDeletionButton).click();
			await expect(page2.locator(selector.sItem)).toHaveCount(1);
			await page.reload();
			await expect(page).toHaveURL(/join/);
		});

		test("Rename session", async ({page, request}) => {
			await api.signUp(request, page);
			const getSessions = page.waitForResponse("/api/sessions"); // otherwise the next waitForResponse waits for this request instead (which makes it not wait long enough for the edit request)
			await page.goto("/dashboard/sessions");
			await getSessions;

			const newSessionName = randomAlphanumString();
			const patchSessions = page.waitForResponse("/api/sessions");
			await page.locator(selector.sName).fill(newSessionName);
			await patchSessions;
			await expect(page.locator(".notification.negative")).not.toBeVisible();

			await page.reload();
			await expect(page.locator(selector.sName)).toHaveValue(newSessionName);
		});

		// TODO: consider adding a "rename non-first session" test
	});
});

test.describe("User sessions - API", async () => {
	test("Fail to reuse key after session deletion", async ({request}) => {
		const {sessionKey} = (await api.createUser(request)).data!;

		await api.deleteSession(request, sessionKey);

		const failedAuthRequest = await api.getUserData(request, sessionKey);
		expect(failedAuthRequest.error).toBeTruthy();
	});

	test("Obtain different key for new session by same user", async ({request}) => {
		const {
			data: {name},
			sessionKey: firstKey,
		} = (await api.createUser(request)).data!;

		await api.deleteSession(request, firstKey);

		const secondKey = (await api.createSession(request, name)).data?.sessionKey;
		expect(typeof secondKey).toBe("string");
		expect(secondKey).not.toEqual(firstKey);
	});

	test("Update session timestamp", async ({request}) => {
		const {sessionKey} = (await api.createUser(request)).data!;

		const initialStamp = (await api.getSessions(request, sessionKey)).data![0].latestUsed;
		await api.getUserData(request, sessionKey); // TODO: consider testing all endpoints
		const updatedStamp = (await api.getSessions(request, sessionKey)).data![0].latestUsed;
		expect(updatedStamp).toBeGreaterThan(initialStamp);
	});
});
