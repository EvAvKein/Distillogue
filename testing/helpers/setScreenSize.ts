import {type Page} from "@playwright/test";

export async function setScreenSize(page: Page, size: "desktop") {
	const resolution = {width: 0, height: 0};

	switch (size) {
		case "desktop": {
			resolution.width = 1920;
			resolution.height = 1080;
			break;
		}
	}

	await page.setViewportSize(resolution);
}
