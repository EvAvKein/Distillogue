describe("Profile editing", () => {
  const username = "profileEditing";

  const editIcon = "✎";
  const confirmIcon = "✔";
  const cancelIcon = "✘";

  it("Sign up & enter Dashboard", () => {
    cy.visit("/");

    cy.contains("Join").click();
    cy.url().should("include", "/join");

    cy.contains("Sign Up");
    cy.contains("Username").type(username);
    cy.contains("Continue").click();

    cy.contains("Dashboard").click();
    cy.url().should("include", "/dashboard");
  });
  
  it("Start name editing & cancel", () => {
    cy.contains("Name").closest("section").as("nameEditor");

    cy.get("@nameEditor").contains(editIcon).click();
    cy.get("@nameEditor").find("input").clear().type("ki23rgd7u32qtgri32grt9i");
    cy.contains("Name").closest("section").contains(cancelIcon).click();
    cy.get("@nameEditor").find("input").should("have.value", username);
  })

  const newUsername = "nameChangedByCypress";
  it("Submit name change", () => {
    cy.contains("Name").closest("section").as("nameEditor");

    cy.get("@nameEditor").contains(editIcon).click();
    cy.get("@nameEditor").find("input").clear().type(newUsername);
    cy.get("@nameEditor").contains(confirmIcon).click();
    cy.get("@nameEditor").find("input").should("have.value", newUsername);
    cy.get("@nameEditor").find(".notification.positive");
  });
  
  const newAbout = "This 'About' was added by Cypress!";
  it('Submit "About" change', () => {
    cy.contains("About").closest("section").as("aboutEditor");

    cy.get("@aboutEditor").contains(editIcon).click();
    cy.get("@aboutEditor").find("textarea").clear().type(newAbout);
    cy.get("@aboutEditor").contains(confirmIcon).click();
    cy.get("@aboutEditor").find("textarea").should("have.value", newAbout);
    cy.get("@aboutEditor").find(".notification.positive");
  });

  it("Relog and verify changes", () => {
    cy.contains("Logout").click();
    cy.contains("Sign Up");
    cy.contains("Switch to sign-in").click();
    cy.contains("Username").type(newUsername);
    cy.contains("Continue").click();

    cy.contains("Dashboard").click();

    cy.contains("Name").closest("section").find("input").should("have.value", newUsername);
    cy.contains("About").closest("section").find("textarea").should("have.value", newAbout);
  });
});