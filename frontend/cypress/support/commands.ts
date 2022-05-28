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

import {randomAlphanumString} from "../helpers/randomAlphanumString"

let LOCAL_STORAGE_MEMORY = {};

Cypress.Commands.addAll({
  signOn(name:string, randomSuffix?:true) {
    const username = name + (randomSuffix ? "_" + randomAlphanumString() : "");

    cy.visit("/join");

    cy.get("form").should("contain.text", "Sign Up");
    cy.get("input").type(username);
    cy.contains("Continue").click();

    cy.get("body").then(($body) => {
      if ($body.get()[0].querySelector("form .notification.negative")) {
        cy.contains("Switch to sign-in").click();
        cy.contains("Continue").click();
      };
    });
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