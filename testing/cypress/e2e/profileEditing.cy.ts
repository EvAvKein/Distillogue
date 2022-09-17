import {waitingTimes} from "../helpers/waitingTimes";
import {randomUsername} from "../helpers/randomAlphanumString";

describe("Profile editing", () => {
  let username = "Profile" + randomUsername();

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
  };
  
  it("Edit and refresh to cancel", () => {
    validateProfileData();

    cy.contains("Name").parent().find("input").clear().type("Temporary change!");
    cy.get("#dashboardSubmit").should("be.visible");

    cy.reload();
    cy.wait(waitingTimes.pageColdLoad);
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

  it("Edit and save", () => {
    validateProfileData();

    username = "Changed" + randomUsername();
    cy.contains("Name").parent().find("input").clear().type(username);
    cy.get("#dashboardSubmit").click();

    cy.wait(waitingTimes.httpRequest);

    cy.contains("Name").parent().find("input").should("have.value", username);
    cy.get("#dashboardSubmit").should("not.be.visible");
    cy.get(".notification.positive").should("have.text", "Changes saved!");

    cy.reload();
    cy.wait(waitingTimes.pageColdLoad);
    validateProfileData();
  });
});

// drafts & presets sections are skipped as they're best covered as their own spec (draftsAndPresets.cy.ts)
