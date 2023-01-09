const httpRequest = 250;
const pageTransition = 250;

const waitingTimes = {
	httpRequest: httpRequest,
	pageColdLoad: httpRequest + pageTransition,
	pageTransition: pageTransition * 1.5 + httpRequest, // no need to wait for the entirety of the incoming page's transition, cypress can interact before it's done
};

export {waitingTimes};

// sidenote: using cy.wait for element loading is officially an anti-pattern... but cypress' (current, as of 15.8.22) official alternative is lengthier, less readable, and (seemingly) doesn't account well for clientside-routing delays
