import {type Page} from "@playwright/test";

export async function getSessionKey(page: Page) {
	return (await page.evaluate('window.localStorage.getItem("sessionKey")')) as string | null;
}

export async function setSessionKey(page: Page, key: string) {
	await page.evaluate(`window.localStorage.setItem("sessionKey", "${key}")`);
}
