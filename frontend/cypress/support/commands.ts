// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

import {randomAlphanumString} from "../helpers/randomAlphanumString";

let LOCAL_STORAGE_MEMORY = {};

Cypress.Commands.addAll({
  randomAlphanumString,
  signOn(name:string, randomSuffix?:true) {
    const username = name + (randomSuffix ? "_" + randomAlphanumString() : "");

    cy.visit("/join");

    cy.get("form").should("contain.text", "Sign Up");
    cy.get("input").type(username);
    cy.contains("Continue").click();

    cy.wait(500); // without this, when first running the test cypress sometimes doesn't wait long enough for the server to respond, causing the conditional below to be evaluated too early and miss its condition
    cy.get("body").then(($body) => {
      if ($body.get()[0].querySelector("form .notification.negative")) {
        cy.contains("Switch to sign-in").click();
        cy.contains("Continue").click();
      };
    });
  },
  submitPost(title:string, body:string, callbackAffectingConfig?:() => void) {
    cy.visit("/post/create");

    cy.get("form").contains("Title").type(title);
    cy.get("form").contains("Body").type(body, {delay: 5});

    callbackAffectingConfig();
    
    cy.get("form button").contains("Post").click();
  },
  submitReply(nodeSelector:string, title:string, body:string) {
    cy.get(nodeSelector).find('.interactions button[aria-label="Reply"]').click();

    cy.get("#backdrop form").as("replyForm");
    cy.get("@replyForm").contains("Title").type(title);
    cy.get("@replyForm").contains("Body").type(body, {delay: 5});
    cy.get("@replyForm").contains("Reply").click();

    cy.wait(500); // otherwise the following instruction usually executes before the reply's page refresh
  },
  saveLocalStorage() {
    Object.keys(localStorage).forEach(key => {
      LOCAL_STORAGE_MEMORY[key] = localStorage[key];
    });
  },
  restoreLocalStorage() {
    Object.keys(LOCAL_STORAGE_MEMORY).forEach(key => {
      localStorage.setItem(key, LOCAL_STORAGE_MEMORY[key]);
    });
  },
});