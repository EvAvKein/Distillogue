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

import {waitingTimes} from "../helpers/waitingTimes";

let LOCAL_STORAGE_MEMORY = {};

Cypress.Commands.overwrite(
	"type",
	(
		originalFn: (subject: string, text: Partial<Cypress.TypeOptions>, options: object) => any,
		subject,
		text,
		options = {}
	) => {
		// overriding originalFn's type because the original is blatantly incorrect (i.e results in runtime errors)
		options.delay = 0;

		return originalFn(subject, text, options);
	}
);

Cypress.Commands.addAll({
	signUp(name: string) {
		cy.visit("/join");

		cy.get("form").should("contain.text", "Sign Up");
		cy.get("input").type(name);
		cy.contains("Continue").click();

		cy.wait(waitingTimes.pageTransition);
		cy.url().should("include", "/browse");
	},

	signIn(name: string) {
		cy.visit("/join");

		cy.contains("Switch to sign-in").click();
		cy.get("form").should("contain.text", "Sign In");
		cy.get("input").type(name);
		cy.contains("Continue").click();

		cy.wait(waitingTimes.pageTransition);
		cy.url().should("include", "/browse");
	},

	submitPost(title: string, body: string, callbackAffectingConfig?: () => void) {
		cy.visit("/post/create");
		cy.wait(waitingTimes.pageColdLoad);

		cy.get("form").contains("label", "Title").click().focused().type(title);
		cy.get("form").contains("label", "Body").click().focused().type(body);
		if (callbackAffectingConfig) {
			callbackAffectingConfig();
		}

		cy.get("form").contains("button", "Post").click();
		cy.wait(waitingTimes.pageTransition);
		cy.url().should("include", "/browse");
		cy.get("main").contains("li", title);
	},

	expandNodePathAndAliasFinal(repliedNodeByTitlesPath: string[]) {
		cy.get("h2").parent().as("node");
		repliedNodeByTitlesPath.slice(1).forEach((title) => {
			// this requires the central node's title despite ignoring it entirely, but requesting the entire path is more readable (in variable names) and familiar (to node paths in the project itself)
			cy.get("@node").parent().find(".replies").contains("h3", title).click().parent().parent().as("node");
		});
	},

	submitReply(repliedNodeByTitlesPath: string[], title: string, body: string) {
		cy.expandNodePathAndAliasFinal(repliedNodeByTitlesPath);

		cy.get("@node").find('.interactions button[aria-label="Reply"]').click();

		cy.get("#backdrop form").as("replyForm");
		cy.get("@replyForm").contains("Title").type(title);
		cy.get("@replyForm").contains("Body").type(body);
		cy.get("@replyForm").contains("Reply").click();
		cy.wait(waitingTimes.pageColdLoad);
	},

	saveLocalStorage() {
		Object.keys(localStorage).forEach((key) => {
			LOCAL_STORAGE_MEMORY[key] = localStorage[key];
		});
	},
	restoreLocalStorage() {
		Object.keys(LOCAL_STORAGE_MEMORY).forEach((key) => {
			localStorage.setItem(key, LOCAL_STORAGE_MEMORY[key]);
		});
	},
});
