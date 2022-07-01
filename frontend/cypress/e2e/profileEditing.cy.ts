describe("Profile editing", () => {
  let username = "profileEditing";
  let about = "Hello, I haven't wrote my About yet!";

  it("Sign up & enter Dashboard", () => {
    cy.visit("/");
    cy.signOn(username);

    cy.contains("Dashboard").click();
    cy.url().should("include", "/dashboard");
    
    cy.get("#dashboardSubmit").should("not.be.visible");
    validateProfileData();
  });

  function validateProfileData() {
    cy.contains("Name").parent().find("input").should("have.value", username);
    cy.contains("About").parent().find("textarea").should("have.value", about);
  };
  
  it("Edit and refresh to cancel", () => {
    validateProfileData();

    cy.contains("Name").parent().find("input").clear().type("Temporary change!");
    cy.get("#dashboardSubmit").should("be.visible");

    cy.reload();
    validateProfileData();
    cy.get("#dashboardSubmit").should("not.be.visible");
  });

  it("Edit and undo to cancel", () => {
    validateProfileData();

    cy.contains("Name").parent().find("input").type("ExtraText");
    cy.get("#dashboardSubmit").should("be.visible");

    cy.contains("Name").parent().find("input").clear().type(username);
    cy.get("#dashboardSubmit").should("not.be.visible");
  });

  it("Edit and save single (Name)", () => {
    validateProfileData();

    username = "NameChangedByCypress!";
    cy.contains("Name").parent().find("input").clear().type(username);
    cy.get("#dashboardSubmit").click();

    cy.wait(250);

    cy.contains("Name").parent().find("input").should("have.value", username);
    cy.get("#dashboardSubmit").should("not.be.visible");
    cy.get(".notification.positive").should("have.text", "Changes saved!");

    cy.reload();
    validateProfileData();
  });

  it("Edit and save multiple (Name & About)", () => {
    username = "NameChangedAgainByCypress!";
    cy.contains("Name").parent().find("input").clear().type(username);
    about = "This about was changed by Cypress!";
    cy.contains("About").parent().find("textarea").clear().type(about);
    cy.get("#dashboardSubmit").click();

    cy.wait(250);

    validateProfileData();
    cy.get("#dashboardSubmit").should("not.be.visible");
    cy.get(".notification.positive").should("have.text", "Changes saved!");

    cy.reload();
    validateProfileData();
  });
});

describe("Drafts editing", () => {
  it("Switch to Drafts subpage", () => {
    cy.contains("button", "Drafts").click();

    cy.should("not.contain.text", "Title");
    cy.should("not.contain.text", "Body");
    cy.should("not.contain.text", "Save");
    cy.should("not.contain.text", "Delete");
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
    cy.wait(250);
    cy.get(".notification.positive").should("contain.text", "Changes saved!");

    cy.reload();
    cy.contains("button", "Drafts").click();
    cy.contains("button", title).click();
    cy.contains("label", "Title").click().focused().should("have.value", title);
    cy.contains("label", "Body").click().focused().should("have.value", body);
  };

  let title = "Draft Title By Cypress!";
  let body = "Draft Body By Cypress!\n\nThis is a bit of filler text because the body is supposed to be longer :P";
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
    cy.wait(250);
    cy.get(".notification.positive").should("contain.text", "Changes saved!");

    cy.reload();
    cy.contains("button", "Drafts").click();
    cy.contains("button", title).click();
    cy.contains("label", "Title").click().focused().should("have.value", title);
    cy.contains("label", "Body").click().focused().should("have.value", body);
  });

  it("Create drafts to capacity", () => {
    createAndValidateDraft("Second " + title, "Second " + body);
    createAndValidateDraft("Third " + title, "Third " + body);
    cy.should("not.contain.text", "New draft");
    cy.get(".notification").should("contain.text", "Drafts at capacity, consider triage");
  });

  it("Delete drafts", () => {
    cy.contains("button", "Second " + title).click();
    cy.contains("button", "Delete").click();
    cy.get("main").should("not.contain.text", "Second " + title);
    cy.contains("button", "Save").click();
    cy.wait(250);
    cy.get(".notification.positive").should("contain.text", "Changes saved!");

    cy.reload();
    cy.contains("button", "Drafts").click();
    cy.contains("button", title);
    cy.should("not.contain.text", "Second " + title);
    cy.contains("button", "Third " + title);

    cy.contains("button", "Third " + title).click();
    cy.contains("button", "Delete").click();
    cy.get("main").should("not.contain.text", "Third " + title);
    cy.contains("button", title).click();
    cy.contains("Delete").click();
    cy.get("main").should("not.contain.text", title);
    cy.contains("button", "Save").click();
    cy.wait(250);
    cy.get(".notification.positive").should("contain.text", "Changes saved!");

    cy.reload();
    cy.contains("button", "Drafts").click();
    cy.should("not.contain.text", title);
  });
});