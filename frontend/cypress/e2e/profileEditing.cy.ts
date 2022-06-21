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