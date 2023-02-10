import {type Page} from "@playwright/test";

async function getSessionKey(page: Page) {
	return (await page.evaluate('window.localStorage.getItem("sessionKey")')) as string | null;
}

async function setSessionKey(page: Page, key: string) {
	await page.evaluate(`window.localStorage.setItem("sessionKey", "${key}")`);
}

export {getSessionKey, setSessionKey};
