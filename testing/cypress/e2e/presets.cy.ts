import {waitingTimes} from "../helpers/waitingTimes";
import {randomUsername, randomNodeTitle, randomNodeBody} from "../helpers/randomAlphanumString";

interface configByUiText {
	Access?: {
		Public?: true;
	};
	Timestamps?: {
		Interacted?: true;
	};
	Voting?: {
		Upvotes?: true;
		Downvotes?: true;
		Anonymous?: true;
	};
}

function expandAllConfigCategories() {
	cy.get("#editConfig").as("configCategory").find(".category button").click({multiple: true});
}

function editConfig(config: configByUiText) {
	expandAllConfigCategories();

	cy.get("@configCategory")
		.children()
		.each((categoryElem) => {
			const category = categoryElem.children("button")[0].innerText;
			if (category === "Access") return;

			categoryElem.find("div > label").each((index, settingElem) => {
				const setting = settingElem.innerText.replace(": ", "");
				const checked = (settingElem.querySelector("input") as HTMLInputElement).checked;

				if (config[category] && checked != Boolean(config[category][setting])) {
					console.log(checked != config[category][setting]);
					console.log("clicked " + setting);
					cy.get("@configCategory").contains(setting, {matchCase: false}).click();
				}
			});
		});
}
// TODO: extract code from above and below functions into one function which accepts a callback for each's distinguishing final action (TL;DR postponed because typescript)
function validateConfig(config: configByUiText) {
	expandAllConfigCategories();

	cy.get("@configCategory")
		.children()
		.each((categoryElem) => {
			const category = categoryElem.children("button")[0].innerText;
			if (category === "Access") return;

			categoryElem.find("div > label").each((index, settingElem) => {
				const setting = settingElem.innerText.replace(": ", "");
				const checked = (settingElem.querySelector("input") as HTMLInputElement).checked;

				expect(checked, setting).to.equal(Boolean(config[category] && config[category][setting]));
			});
		});
}

describe("Presets manipulation in dashboard", () => {
	it("Setup (navigate to page)", () => {
		cy.signUp("drafter" + randomUsername());
		cy.visit("/dashboard");
		cy.contains("Presets").click();
		cy.wait(waitingTimes.pageTransition);
	});

	it("Save preset", () => {
		const presetName = "Preset 1 ";
		const config: configByUiText = {Timestamps: {Interacted: true}, Voting: {Upvotes: true}};

		cy.contains("New preset").click();
		cy.contains("Save");
		cy.contains("[No Title]");
		cy.should("not.contain.text", "Access");

		cy.contains("Name").type(presetName);
		editConfig(config);
		cy.contains("Save").click();
		cy.wait(waitingTimes.httpRequest);
		cy.get(".notification.positive");

		cy.reload();
		cy.wait(waitingTimes.pageColdLoad);
		cy.contains("Presets").click();
		cy.contains(presetName).click();
		cy.contains("Name").click().focused().should("have.value", presetName);
		validateConfig(config);
	});

	it("Save presets to capacity", () => {
		[
			{name: "Preset 2", config: {Voting: {Downvotes: true, Anonymous: true}} as configByUiText},
			{name: "Preset 3", config: {Voting: {Upvotes: true, Anonymous: true}} as configByUiText},
		].forEach((preset, index) => {
			cy.contains("New preset").click();
			cy.get(".presetButton")
				.should("have.length", index + 2)
				.then((buttons) => {
					if (buttons.length === 3) {
						cy.get("body").should("not.contain.text", "New preset");
						cy.get(".notification").contains("at capacity");
					}
				});
			cy.contains("Name").click().type(preset.name);
			cy.contains(preset.name);
			editConfig(preset.config);
			cy.contains("Save").click();
			cy.wait(waitingTimes.httpRequest);
			cy.get(".notification.positive");

			cy.reload();
			cy.wait(waitingTimes.pageColdLoad);
			cy.contains("Presets").click();
			cy.get(".presetButton").should("have.length", index + 2);
			cy.contains(preset.name).click();
			validateConfig(preset.config);
		});
	});

	it("Edit preset", () => {
		const oldName = "Preset 2";
		const newName = "Edited Preset";
		const newConfig: configByUiText = {Timestamps: {Interacted: true}, Voting: {Downvotes: true}};
		cy.reload();
		cy.wait(waitingTimes.pageColdLoad);
		cy.contains("Presets").click();

		cy.contains(oldName).click();
		cy.contains("Name").click().focused().clear().type(newName);
		cy.contains(newName);
		cy.should("not.contain.text", oldName);
		editConfig(newConfig);
		cy.contains("Save").click();
		cy.wait(waitingTimes.httpRequest);
		cy.get(".notification.positive");

		cy.reload();
		cy.wait(waitingTimes.pageColdLoad);
		cy.contains("Presets").click();
		cy.should("not.contain.text", oldName);
		cy.contains(newName).click();
		validateConfig(newConfig);
	});

	it("Delete preset", () => {
		const deletedName = "Preset 1";

		cy.contains(deletedName).click();
		cy.contains("Delete").click();
		cy.contains("Save").click();
		cy.wait(waitingTimes.httpRequest);
		cy.get(".notification.positive");
		cy.get(".presetButton").should("have.length", 2);

		cy.reload();
		cy.wait(waitingTimes.pageColdLoad);
		cy.contains("Presets").click();
		cy.get(".presetButton").should("have.length", 2);
		cy.should("not.contain.text", deletedName);
	});
});

describe("Preset manipulation in posting page", () => {
	function validateCustomPresetCount(count: number) {
		cy.get('[data-testClass="customPresetButton"]').should("have.length", count);
	}

	it("Setup (navigate to page)", () => {
		cy.get("header").contains("Post").click();
		cy.wait(waitingTimes.pageTransition);
	});

	it("Create a new preset (to capacity)", () => {
		const newConfig: configByUiText = {
			Access: {Public: true},
			Timestamps: {Interacted: true},
			Voting: {Downvotes: true, Anonymous: true},
		};

		validateCustomPresetCount(2);
		editConfig(newConfig);
		cy.contains("Save preset").click();
		cy.wait(waitingTimes.httpRequest);
		cy.get(".notification.positive");
		validateCustomPresetCount(3);
		cy.get("body").should("not.contain.text", "Save preset");
		cy.contains("Presets at capacity").should("have.attr", "inert");

		cy.reload();
		validateCustomPresetCount(3);
		cy.get("body").should("not.contain.text", "Save preset");
		cy.contains("Presets at capacity").should("have.attr", "inert");
		cy.get('[data-testClass="customPresetButton"]').last().click();
		validateConfig(newConfig);
	});

	it("Post with dashboard preset", () => {
		const postTitle = "Custom Preset " + randomNodeTitle();

		cy.submitPost(postTitle, randomNodeBody(), () => {
			cy.contains("Edited Preset").click();
		});
		cy.contains(postTitle).click();
		cy.wait(waitingTimes.pageTransition);

		cy.get('[aria-label="Upvote"]').should("not.exist");
		cy.get('[aria-label="Downvote"]').should("exist");

		cy.submitReply([postTitle], randomNodeTitle(), randomNodeBody());
		cy.get(".interacted").should("exist");
	});
});
