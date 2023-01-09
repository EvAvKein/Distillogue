import {waitingTimes} from "../helpers/waitingTimes";
import {randomUsername} from "../helpers/randomAlphanumString";

describe("User session CRUD", () => {
	let username = "Session" + randomUsername();
	let sessionKey: string;

	it("Sign up & navigate to session-required page", () => {
		cy.signUp(username);

		cy.get("header").contains("Post").click();
		cy.wait(waitingTimes.pageTransition);

		cy.url()
			.should("include", "/post/create")
			.then(() => {
				sessionKey = localStorage.getItem("sessionKey");
				expect(sessionKey).to.be.a("string");
			});
	});

	it("Sign out & fail to access session-required page", () => {
		cy.get("header").contains("Logout").click();
		cy.wait(waitingTimes.pageTransition);
		cy.url().should("include", "/join");

		cy.visit("/post/create");
		cy.wait(waitingTimes.pageColdLoad);
		cy.url().should("not.include", "/post/create");
		cy.url().should("include", "/join");
	});

	it("Fail to reuse deleted session by inserting key to localStorage", () => {
		cy.then(() => localStorage.setItem("sessionKey", sessionKey));

		cy.visit("/post/create");
		cy.wait(waitingTimes.pageColdLoad);
		cy.url().should("not.include", "/post/create");
		cy.url().should("include", "/join");
	});

	it("Sign in & obtain new session key", () => {
		cy.signIn(username).then(() => {
			expect(localStorage.getItem("sessionKey")).to.exist.to.not.equal(sessionKey);
		});
	});

	it("View & update session in dashboard (TODO pending dashboard section)", () => {});
});
