import {waitingTimes} from "../helpers/waitingTimes";
import {randomUsername, randomNodeTitle, randomNodeBody} from "../helpers/randomAlphanumString";

let title = "Draft " + randomNodeTitle();
let body = randomNodeBody();

describe("Drafts manipulation in dashboard", () => {
  it("Setup (sign-up)", () => {
    cy.signUp("drafter" + randomUsername())
  });

  it("Enter Drafts subpage", () => {
    cy.contains("a", "Dashboard").click();
    cy.contains("button", "Drafts").click();

    cy.get("main")
      .should("not.contain.text", "Title")
      .should("not.contain.text", "Body")
      .should("not.contain.text", "Delete");
    cy.contains("button", "Save").should("not.be.visible");
  });

  function createAndValidateDraft(title:string, body:string) {
    cy.contains("button", "New draft").click();
    cy.contains("button", "[No Title]").should("contain.text", "Edited: Now");
    cy.contains("button", "Delete");
    cy.contains("button", "Save");

    cy.contains("label", "Title").type(title);
    cy.contains("button", title);
    cy.contains("label", "Body").type(body);
    cy.get("main").contains("Save").click();
    cy.wait(waitingTimes.httpRequest);
    cy.get(".notification.positive").should("contain.text", "Changes saved!");

    cy.reload();
    cy.wait(waitingTimes.pageColdLoad);
    cy.contains("button", "Drafts").click();
    cy.contains("button", title).click();
    cy.contains("label", "Title").click().focused().should("have.value", title);
    cy.contains("label", "Body").click().focused().should("have.value", body);
  };

  it("Create, write, and save draft", () => {
    createAndValidateDraft(title, body);
  });

  it("Edit existing draft", () => {
    title = "Different " + title;
    body = "Different " + body;

    cy.contains("label", "Title").click().focused().clear().type(title);
    cy.contains("button", title);
    cy.contains("button", "Save");

    cy.contains("label", "Body").click().focused().clear().type(body);
    cy.contains("button", "Save").click();
    cy.wait(waitingTimes.httpRequest);
    cy.get(".notification.positive").should("contain.text", "Changes saved!");

    cy.reload();
    cy.wait(waitingTimes.pageColdLoad);
    cy.contains("button", "Drafts").click();
    cy.contains("button", title).click();
    cy.contains("label", "Title").click().focused().should("have.value", title);
    cy.contains("label", "Body").click().focused().should("have.value", body);
  });

  it("Create drafts to capacity", () => {
    createAndValidateDraft("Second " + title, "Second " + body);
    createAndValidateDraft("Third " + title, "Third " + body);
    cy.get("main").should("not.contain.text", "New draft");
    cy.get(".notification").should("contain.text", "Drafts at capacity, consider triage");
  });

  it("Delete drafts", () => {
    cy.contains("button", "Second " + title).click();
    cy.contains("button", "Delete").click();
    cy.get("main").should("not.contain.text", "Second " + title);
    cy.contains("button", "Save").click();
    cy.wait(waitingTimes.httpRequest);
    cy.get(".notification.positive").should("contain.text", "Changes saved!");

    cy.reload();
    cy.wait(waitingTimes.pageColdLoad);
    cy.contains("button", "Drafts").click();
    cy.contains("button", title);
    cy.get("main").should("not.contain.text", "Second " + title);
    cy.contains("button", "Third " + title);

    cy.contains("button", "Third " + title).click();
    cy.contains("button", "Delete").click();
    cy.get("main").should("not.contain.text", "Third " + title);
    cy.contains("button", title).click();
    cy.contains("Delete").click();
    cy.get("main").should("not.contain.text", title);
    cy.contains("button", "Save").click();
    cy.wait(waitingTimes.httpRequest);
    cy.get(".notification.positive").should("contain.text", "Changes saved!");

    cy.reload();
    cy.wait(waitingTimes.pageColdLoad);
    cy.contains("button", "Drafts").click();
    cy.get("main").should("not.contain.text", title);
  });
});

function saveDraft(title:string, body:string) {
  cy.contains("label", "Title").click().focused().clear().type(title);
  cy.contains("label", "Body").click().focused().clear().type(body);
  cy.contains("button", "Save draft").click();
  cy.contains("button", "Drafts")
    .parent().contains("button", title);
};

function testDraftsFunctionalities(submitName:"Post"|"Reply", recoverFromRefresh:() => any, recoverFromSubmit:() => any) {
  it("Save draft", () => {
    recoverFromRefresh();
    cy.get("body").should("not.contain.text", "Drafts");

    saveDraft("First " + title, "First " + body);

    cy.reload();
    recoverFromRefresh();
    cy.contains("button", "Drafts")
      .parent().contains("button", "First " + title);
  });

  it("Select and preserve saved draft", () => {
    cy.contains("button", "Drafts").click()
      .parent().contains("button", "First " + title).click();

    cy.contains("label", "Title").click().focused().should("have.value", "First " + title);
    cy.contains("label", "Body").click().focused().should("have.value", "First " + body);
    cy.contains("button", submitName).should("have.text", submitName + " (& delete draft 1)");
    cy.contains("button", "Drafts")
      .parent().contains("button", "Preserve chosen draft").click();

    cy.contains("button", "Drafts")
      .parent().contains("button", "First " + title)
      .parent().parent().should("not.contain.text", "Preserve chosen draft");
    cy.contains("label", "Title").click().focused().should("have.value", "First " + title);
    cy.contains("label", "Body").click().focused().should("have.value", "First " + body);
    cy.contains("button", submitName).should("have.text", submitName);
  });

  it("Save drafts to capacity", () => {
    saveDraft("Second " + title, "Second " + body);
    saveDraft("Third " + title, "Third " + body);

    cy.get("main").should("not.contain.text", "Save draft");
    cy.contains("button", "Drafts at capacity").should("have.attr", "disabled");

    cy.reload();
    recoverFromRefresh();
    cy.get("main").should("not.contain.text", "Save draft");
    cy.contains("button", "Drafts at capacity").should("have.attr", "disabled");
  });

  it("Post and destroy draft", () => {
    cy.contains("button", "Drafts").click()
      .parent().contains("button", "Second " + title).click();
    cy.get("form").contains("button", submitName + " (& delete draft 2)").click();

    recoverFromSubmit();
    cy.get("form").contains("button", "Drafts").parent().should("not.contain.text", "Second " + title);
  });

  it("Post and preserve draft", () => {
    cy.contains("button", "Drafts").click()
      .parent().contains("button", "Third " + title).click()
      .parent().parent().contains("button", "Preserve chosen draft").click();
    cy.get("form").contains("button", submitName).click();

    recoverFromSubmit();
    cy.contains("button", "Drafts").parent().contains("button", "Third " + title);
  });

  it("Modify, post, and destroy draft", () => {
    cy.contains("button", "Drafts").click()
      .parent().contains("button", "First " + title).click();
    cy.get("form").contains("button", submitName + " (& delete draft 1)").click();

    recoverFromSubmit();
    cy.get("form").contains("button", "Drafts").parent().should("not.contain.text", "First " + title);
  });
};

describe("Drafts manipulation in posting page", () => {
  it("Navigate to posting page", () => {
    cy.contains("a", "Post").click();
    cy.wait(waitingTimes.pageTransition);
  });
  
  testDraftsFunctionalities("Post",
    () => {cy.wait(waitingTimes.pageColdLoad)},
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

    cy.submitPost(
      replyDraftTitle,
      randomNodeBody()
    );
    cy.contains("a", replyDraftTitle).click();
  });
  
  testDraftsFunctionalities("Reply",
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