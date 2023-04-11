import {test, expect, type Page} from "@playwright/test";
import {signUp} from "../helpers/requestsByApi.js";
import {randomAlphanumString} from "../helpers/randomAlphanumString.js";

const dashboard = {
	nameInput: "#newContactName",
	idInput: "#newContactId",
	creationButton: "#newContactButton",
	selectionButtons: "li section > button",
	deletionButton: ".deleteContactButton",
} as const;

type contactsList = {name: string; id: string}[];

test.describe("Contacts manipulation in dashboard", () => {
	const {nameInput, idInput, creationButton, selectionButtons, deletionButton} = dashboard;

	test.beforeEach(async ({page, request}) => {
		await signUp(request, page);
		await page.goto("/dashboard/contacts");
	});

	async function saveContact(page: Page, name: string, id: string) {
		await page.locator(nameInput).fill(name);
		await page.locator(idInput).fill(id);
		await page.locator(creationButton).click();
	}

	async function saveContacts(page: Page, count: number) {
		const contacts: contactsList = [];

		for (let slot = 1; slot <= count; slot++) {
			const name = randomAlphanumString();
			const id = randomAlphanumString();
			contacts.unshift({name, id});
			await saveContact(page, name, id);
		}

		return contacts;
	}

	async function validateContacts(page: Page, contacts: contactsList) {
		for (const [index, contactItem] of (await page.locator("li").all()).entries()) {
			const contact = contacts[index];
			await expect(contactItem.locator(selectionButtons.replace("li ", ""))).toHaveText(contact.name);
			(await contactItem.getByText(contact.id).isVisible()) ||
				(await contactItem.locator(selectionButtons.replace("li ", "")).click());
			await expect(contactItem.locator("div")).toHaveText(contact.id);
		}
	}

	test("Validate initial state", async ({page}) => {
		for (const element of [nameInput, idInput, creationButton]) {
			await expect(page.locator(element)).toBeVisible();
		}

		for (const element of [selectionButtons, deletionButton]) {
			await expect(page.locator(element)).not.toBeVisible();
		}
	});

	test("Create contacts", async ({page}) => {
		const contacts = await saveContacts(page, 3);
		await validateContacts(page, contacts);
		await page.reload();
		await validateContacts(page, contacts);
	});

	test("Delete contact", async ({page}) => {
		await saveContact(page, randomAlphanumString(), randomAlphanumString());
		await page.locator(selectionButtons).click();
		await page.locator(deletionButton).click();
		await expect(page.locator(selectionButtons)).not.toBeVisible();
		await page.reload();
		await expect(page.locator(selectionButtons)).not.toBeVisible();
	});

	test("Delete non-first contact", async ({page}) => {
		const contacts = await saveContacts(page, 3);

		for (let slot = 2; slot <= 3; slot++) {
			contacts.splice(slot - 1, 1);
			await page.locator(selectionButtons).nth(1).click();
			await page.locator(deletionButton).nth(1).click();
			await new Promise((resolve) => setTimeout(resolve, 500)); // because vue momentarily duplicates a transition item that's taking the spot of a deleted one, which causes playwright to find two elements when not waiting for the transition to end
			await validateContacts(page, contacts);
			await page.reload();
			await validateContacts(page, contacts);
		}
	});
});
