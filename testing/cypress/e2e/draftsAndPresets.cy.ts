import {waitingTimes} from "../helpers/waitingTimes";

let title = "Draft Title By Cypress! " + Math.random();
let body = "Draft Body By Cypress!\n\nThis is a bit of filler text because the body is supposed to be longer :P " + Math.random();

describe("Drafts manipulation in dashboard", () => {
  it("Enter Drafts subpage", () => {
    cy.visit("/");
    cy.wait(waitingTimes.pageColdLoad);
    cy.signOn("draftsTester" + Math.random());
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
    
    cy.contains("button", "Drafts").click();

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

function testDraftsFunctionalities(submitName:"Post"|"Reply", returnFromRefresh:() => any, returnFromSubmit:() => any) {
  it("Save draft", () => {
    returnFromRefresh();
    cy.get("body").should("not.contain.text", "Drafts");

    saveDraft("First " + title, "First " + body);

    cy.reload();
    cy.wait(waitingTimes.pageColdLoad);
    returnFromRefresh();
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
    cy.wait(waitingTimes.pageColdLoad);
    returnFromRefresh();
    cy.get("main").should("not.contain.text", "Save draft");
    cy.contains("button", "Drafts at capacity").should("have.attr", "disabled");
  });

  it("Post and destroy draft", () => {
    cy.contains("button", "Drafts").click()
      .parent().contains("button", "Second " + title).click();
    cy.get("form").contains("button", submitName + " (& delete draft 2)").click();
    cy.wait(waitingTimes.pageTransition);

    returnFromSubmit();
    cy.get("form").contains("button", "Drafts").parent().should("not.contain.text", "Second " + title);
  });

  it("Post and preserve draft", () => {
    cy.contains("button", "Drafts").click()
      .parent().contains("button", "Third " + title).click()
      .parent().parent().contains("button", "Preserve chosen draft").click();
    cy.get("form").contains("button", submitName).click();

    returnFromSubmit();
    cy.contains("button", "Drafts").parent().contains("button", "Third " + title);
  });

  it("Modify, post, and destroy draft", () => {
    cy.contains("button", "Drafts").click()
      .parent().contains("button", "First " + title).click();
    cy.get("form").contains("button", submitName + " (& delete draft 1)").click();

    returnFromSubmit();
    cy.get("form").contains("button", "Drafts").parent().should("not.contain.text", "First " + title);
  });
};

describe("Drafts manipulation in posting page", () => {
  it("Navigate to posting page", () => {
    cy.contains("a", "Post").click();
  });
  
  testDraftsFunctionalities("Post",
    () => {},
    () => {
      cy.go(-1);
      cy.wait(waitingTimes.pageTransition);
    }
  );
});

describe("Drafts manipulation in replying modal", () => {
  it("Setup (new user, submit new post, enter, open reply modal)", () => {
    cy.contains("Logout").click();
    cy.signOn("otherDraftsTester" + Math.random());

    cy.submitPost(
      "Title of Post for Testing Draft Functionality in Replies" + Math.random(),
      "The Draft body is supposed to be longer than the title, so here are some extra words to to pad the rest of this sentence. Nonsense 'Lorem ipsum'-esque text got boring :P " + Math.random()
    );
    cy.contains("a", "Title of Post for Testing Draft Functionality in Replies").click();
  });
  
  testDraftsFunctionalities("Reply",
    () => {cy.get("button[aria-label='Reply']").click()},
    () => {cy.get("button[aria-label='Reply']").first().click()}
  );
});