describe("Post Interaction", () => {
  const postTitle = "Title of Test Post";
  const postBody = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Nibh sit amet commodo nulla facilisi nullam vehicula. Mauris vitae ultricies leo integer malesuada nunc. Libero id faucibus nisl tincidunt eget nullam non.\n\nIpsum a arcu cursus vitae congue mauris rhoncus. Sed turpis tincidunt id aliquet risus feugiat in ante. Nam aliquam sem et tortor consequat id porta. Nibh venenatis cras sed felis eget. Sed tempus urna et pharetra pharetra massa massa ultricies.";

  it("Sign on & create post (config checkbox assertions broken, see code comment)", () => {
    cy.signOn("postCreator");

    cy.get("header").contains("Post").click();

    cy.submitPost(
      postTitle,
      postBody,
      () => {
        cy.get("button").contains("Test Everything").click();
        cy.get("form #config").contains("Access").parent().contains("Public").click();
        
        cy.get('form #config details:not([open]) summary').click({multiple: true});
        cy.get('form #config input[type="checkbox"]').should("be.checked"); // this doesn't actually work, uncomment the above line which checks the "public" checkbox for evidence. i tried changing this assert in multiple ways but nothing worked
      }
    );

    cy.url().should("include", "/browse");
  });

  it("Switch to interaction account & open post", () => {
    cy.get("header").contains("Logout").click();

    cy.signOn("interactor");

    cy.url().should("include", "/browse");

    cy.get("article").first().click();

    cy.get("article#central").should("contain", postTitle)
      .should("contain", postBody)
      .find("#interactions")
      .as("centralNodeInteractions");

    cy.get("@centralNodeInteractions").contains("Latest Interaction: Now");
    cy.get("@centralNodeInteractions").find('[aria-label="Vote interactions"]');
    cy.get("@centralNodeInteractions").find('button[aria-label="Reply"]');
  });

  it("Test votes", () => {
    const upvoteSelector = 'button[aria-label="Upvote"]';
    const voteNumbSelector = 'span[aria-label="Votes status"]';
    const downvoteSelector = 'button[aria-label="Downvote"]';
    function validateVoteInterface(userVote:"up"|"down"|"none", voteCount:number) { // could've removed the voteCount parameter and instead let it be based on the userVote, but this separation supports testing with multiple voters (which doesnt seem necessary but i might in future switch to)
      cy.get(upvoteSelector).should(userVote === "up" ? "have.class" : "not.have.class", "voted");
      cy.get(voteNumbSelector).should("have.text", voteCount);
      cy.get(downvoteSelector).should(userVote === "down" ? "have.class" : "not.have.class", "voted");
    };

    validateVoteInterface("none", 0);
    cy.get(upvoteSelector).click();
    cy.reload();
    validateVoteInterface("up", 1);

    cy.get(downvoteSelector).click();
    validateVoteInterface("down", -1);
    cy.reload();
    validateVoteInterface("down", -1);

    cy.get(downvoteSelector).click();
    validateVoteInterface("none", 0);
    cy.reload();
    validateVoteInterface("none", 0);
  });

  it("Test reply", () => {
    const replyTitle = "Title of Main Reply";
    const replyBody = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, faucibus turpis in eu menenatis tellus in metus vulputate eu. Purus sit amet volutpat consequat mauris nunc congue nisi. Facilisi etiam dignissim diam quis enim lobortis scelerisque fermentum.\n\nEgestas purus viverra accumsan in nisl. Tortor pretium viverra suspendisse potenti nullam ac tortor vitae purus. Velit laoreet id donec ultrices tincidunt arcu non sodales. Arcu dictum varius duis at consectetur lorem donec massa sapien. In dictum non consectetur a erat nam at. Ut eu sem integer vitae justo eget magna.";

    cy.get("#replyButton").click();

    cy.get("body").should("have.css", "overflow", "hidden");
    cy.get("body").get("#backdrop").should("have.css", "backdrop-filter");
    
    cy.get("#backdrop form").as("replyForm");
    cy.get("@replyForm").contains("Title").type(replyTitle);
    cy.get("@replyForm").contains("Body").type(replyBody, {delay: 5});
    cy.get("@replyForm").contains("Reply").click();

    cy.wait(500); // otherwise the cy.get below executes before the reply's page refresh

    cy.get("article#central").parent().find("section article").as("replyToCentral");

    cy.get("@replyToCentral")
      .should("contain", replyTitle)
      .should("contain", replyBody)
      .find("#interactions")
      .as("replyInteractions");

    cy.get("@replyInteractions").contains("Latest Interaction: Now");
    cy.get("@replyInteractions").find('[aria-label="Vote interactions"]');
    cy.get("@replyInteractions").find('button[aria-label="Reply"]');
  });
});