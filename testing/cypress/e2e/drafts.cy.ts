import {waitingTimes} from "../helpers/waitingTimes";
import {randomUsername, randomNodeTitle, randomNodeBody} from "../helpers/randomAlphanumString";

let draftTitle = "Draft " + randomNodeTitle();
let draftBody = randomNodeBody();

describe("Drafts manipulation in dashboard", () => {
	it("Setup (sign-up)", () => {
		cy.signUp("drafter" + randomUsername());
	});

	it("Enter Drafts subpage", () => {
		cy.contains("Dashboard").click();
		cy.contains("Drafts").click();
		cy.wait(waitingTimes.pageTransition);

		cy.get("main")
			.should("not.contain.text", "Title")
			.should("not.contain.text", "Body")
			.should("not.contain.text", "Delete");
		cy.contains("Save").should("not.be.visible");
	});

	function createAndValidateDraft(title: string, body: string) {
		cy.contains("New draft").click();
		cy.contains("[No Title]").should("contain.text", "Edited: Now");
		cy.contains("Delete");
		cy.contains("Save");

		cy.contains("label", "Title").type(title);
		cy.contains(title);
		cy.contains("Body").type(body);
		cy.get("main").contains("Save").click();
		cy.wait(waitingTimes.httpRequest);
		cy.get(".notification.positive").should("contain.text", "Changes saved!");

		cy.reload();
		cy.wait(waitingTimes.pageColdLoad);
		cy.contains("Drafts").click();
		cy.contains(title).click();
		cy.contains("label", "Title").click().focused().should("have.value", title);
		cy.contains("Body").click().focused().should("have.value", body);
	}

	it("Create, write, and save draft", () => {
		createAndValidateDraft(draftTitle, draftBody);
	});

	it("Edit existing draft", () => {
		draftTitle = "Different " + draftTitle;
		draftBody = "Different " + draftBody;

		cy.contains("label", "Title").click().focused().clear().type(draftTitle);
		cy.contains(draftTitle);
		cy.contains("Save");

		cy.contains("Body").click().focused().clear().type(draftBody);
		cy.contains("Save").click();
		cy.wait(waitingTimes.httpRequest);
		cy.get(".notification.positive").should("contain.text", "Changes saved!");

		cy.reload();
		cy.wait(waitingTimes.pageColdLoad);
		cy.contains("Drafts").click();
		cy.contains(draftTitle).click();
		cy.contains("label", "Title").click().focused().should("have.value", draftTitle);
		cy.contains("Body").click().focused().should("have.value", draftBody);
	});

	it("Create drafts to capacity", () => {
		createAndValidateDraft("Second " + draftTitle, "Second " + draftBody);
		createAndValidateDraft("Third " + draftTitle, "Third " + draftBody);
		cy.get("main").should("not.contain.text", "New draft");
		cy.get(".notification").should("contain.text", "Drafts at capacity, consider triage");
	});

	it("Delete drafts", () => {
		cy.contains("Second " + draftTitle).click();
		cy.contains("Delete").click();
		cy.get("main").should("not.contain.text", "Second " + draftTitle);
		cy.contains("Save").click();
		cy.wait(waitingTimes.httpRequest);
		cy.get(".notification.positive").should("contain.text", "Changes saved!");

		cy.reload();
		cy.wait(waitingTimes.pageColdLoad);
		cy.contains("Drafts").click();
		cy.contains(draftTitle);
		cy.get("main").should("not.contain.text", "Second " + draftTitle);
		cy.contains("Third " + draftTitle);

		cy.contains("Third " + draftTitle).click();
		cy.contains("Delete").click();
		cy.get("main").should("not.contain.text", "Third " + draftTitle);
		cy.contains(draftTitle).click();
		cy.contains("Delete").click();
		cy.get("main").should("not.contain.text", draftTitle);
		cy.contains("Save").click();
		cy.wait(waitingTimes.httpRequest);
		cy.get(".notification.positive").should("contain.text", "Changes saved!");

		cy.reload();
		cy.wait(waitingTimes.pageColdLoad);
		cy.contains("Drafts").click();
		cy.get("main").should("not.contain.text", draftTitle);
	});
});

function saveDraft(title: string, body: string) {
	cy.contains("label", "Title").click().focused().clear().type(title);
	cy.contains("Body").click().focused().clear().type(body);
	cy.contains("Save draft").click();
	cy.contains("Drafts").parent().contains(title);
}

function testDraftsFunctionalities(
	submitName: "Post" | "Reply",
	recoverFromRefresh: () => any,
	recoverFromSubmit: () => any
) {
	it("Save draft", () => {
		recoverFromRefresh();
		cy.get("body").should("not.contain.text", "Drafts");

		saveDraft("First " + draftTitle, "First " + draftBody);

		cy.reload();
		recoverFromRefresh();
		cy.contains("Drafts")
			.parent()
			.contains("First " + draftTitle);
	});

	it("Select and preserve saved draft", () => {
		cy.contains("Drafts")
			.click()
			.parent()
			.contains("First " + draftTitle)
			.click();

		cy.contains("label", "Title")
			.click()
			.focused()
			.should("have.value", "First " + draftTitle);
		cy.contains("Body")
			.click()
			.focused()
			.should("have.value", "First " + draftBody);
		cy.contains("button", submitName).should("have.text", submitName + " (& delete draft 1)");
		cy.contains("Drafts").parent().contains("Preserve chosen draft").click();

		cy.contains("Drafts")
			.parent()
			.contains("First " + draftTitle)
			.parent()
			.parent()
			.should("not.contain.text", "Preserve chosen draft");
		cy.contains("label", "Title")
			.click()
			.focused()
			.should("have.value", "First " + draftTitle);
		cy.contains("Body")
			.click()
			.focused()
			.should("have.value", "First " + draftBody);
		cy.contains("button", submitName).should("have.text", submitName);
	});

	it("Save drafts to capacity", () => {
		saveDraft("Second " + draftTitle, "Second " + draftBody);
		saveDraft("Third " + draftTitle, "Third " + draftBody);

		cy.get("main").should("not.contain.text", "Save draft");
		cy.contains("Drafts at capacity").should("have.attr", "inert");

		cy.reload();
		recoverFromRefresh();
		cy.get("main").should("not.contain.text", "Save draft");
		cy.contains("Drafts at capacity").should("have.attr", "inert");
	});

	it("Post and destroy draft", () => {
		cy.contains("Drafts")
			.click()
			.parent()
			.contains("Second " + draftTitle)
			.click();
		cy.get("form")
			.contains(submitName + " (& delete draft 2)")
			.click();

		recoverFromSubmit();
		cy.get("form")
			.contains("Drafts")
			.parent()
			.should("not.contain.text", "Second " + draftTitle);
	});

	it("Post and preserve draft", () => {
		cy.contains("Drafts")
			.click()
			.parent()
			.contains("Third " + draftTitle)
			.click()
			.parent()
			.parent()
			.contains("Preserve chosen draft")
			.click();
		cy.get("form").contains(submitName).click();

		recoverFromSubmit();
		cy.contains("Drafts")
			.parent()
			.contains("Third " + draftTitle);
	});

	it("Modify, post, and destroy draft", () => {
		cy.contains("Drafts")
			.click()
			.parent()
			.contains("First " + draftTitle)
			.click();
		cy.get("form")
			.contains(submitName + " (& delete draft 1)")
			.click();

		recoverFromSubmit();
		cy.get("form")
			.contains("Drafts")
			.parent()
			.should("not.contain.text", "First " + draftTitle);
	});
}

describe("Drafts manipulation in posting page", () => {
	it("Navigate to posting page", () => {
		cy.contains("Post").click();
		cy.wait(waitingTimes.pageTransition);
	});

	testDraftsFunctionalities(
		"Post",
		() => {
			cy.wait(waitingTimes.pageColdLoad);
		},
		() => {
			cy.wait(waitingTimes.pageTransition);
			cy.go(-1);
			cy.wait(waitingTimes.pageColdLoad);
		}
	);
});

describe("Drafts manipulation in replying modal", () => {
	let replyDraftTitle = "Reply Draft" + randomNodeTitle();

	it("Setup (new user, submit new post, enter, open reply modal)", () => {
		cy.contains("Logout").click();
		cy.signUp("Other" + randomUsername());

		cy.submitPost(replyDraftTitle, randomNodeBody());
		cy.contains(replyDraftTitle).click();
	});

	testDraftsFunctionalities(
		"Reply",
		() => {
			cy.wait(waitingTimes.pageColdLoad);
			cy.get("button[aria-label='Reply']").first().click();
		},
		() => {
			cy.wait(waitingTimes.pageColdLoad);
			cy.get("button[aria-label='Reply']").first().click();
		}
	);
});
