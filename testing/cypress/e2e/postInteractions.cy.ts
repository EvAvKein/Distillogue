const postTitle = "Title of Test Post " + Math.random();
const postBody = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Mauris vitae ultricies leo integer malesuada nunc.\n\nIpsum a arcu cursus vitae congue mauris rhoncus. Sed turpis tincidunt id aliquet risus feugiat in ante. Sed tempus urna et pharetra pharetra massa massa ultricies. "  + Math.random();
let postUrl = "";
describe("Create access & interactions test posts", () => {
  
  it("Sign up & nav to posting page", () => {
    cy.visit("/");
    cy.signOn("postCreator");
  });

  it("Create interactions-testings & access-testing posts", () => {
    cy.submitPost(
      postTitle,
      postBody,
      () => {
        cy.get("button").contains("Everything").click();
        cy.get("form #config").contains("Access").parent().contains("Public").click();
        
        cy.get('form #config details:not([open]) summary').click({multiple: true});
        cy.get('form #config input[type="checkbox"]').should("be.checked"); // this doesn't actually work, uncomment the above line which checks the "public" checkbox for evidence. i tried changing this assert in multiple ways but nothing worked
      }
    );

    cy.submitPost(
      "[NON-PUBLIC] " + postTitle,
      "[NON-PUBLIC] " + postBody,
      () => {
        cy.get("button").contains("Everything").click();

        cy.get('form #config details:not([open]) summary').click({multiple: true});
        cy.get('form #config input[type="checkbox"]').should("be.checked");
      }
    );
  });

  it("Enter access-testing post & copy URL", () => {
    cy.url().should("include", "/browse");
    cy.get("ol").contains("li", "[NON-PUBLIC] " + postTitle).click();
    cy.wait(250);
    cy.url().then((url) => {postUrl = url});
  });
});

describe("Access", () => {
  it("Create account", () => {
    cy.signOn("accessTester");
  });

  it("Fail to find inaccessible post through browsing", () => {
    cy.get("header").contains("a", "Browse").click();
    cy.wait(250);
    cy.get("ol").should("not.contain.text", "[NON-PUBLIC] " + postTitle);
  });

  it("Fail to visit inaccessible post with a URL", () => {
    cy.visit(postUrl);
    cy.wait(250);
    cy.get("main").find(".notification.negative");
    cy.get("main")
      .should("not.contain.text", "[NON-PUBLIC] " + postTitle)
      .should("not.contain.text", "[NON-PUBLIC] " + postBody);
  });
});

describe("Setup for interactions (switch user & open post)", () => {
  it("Switch account", () => {
    cy.get("header").contains("Logout").click();
    cy.signOn("interactor");
  });

  it("Open test post", () => {
    cy.get("main").contains("article", postTitle).click();
    cy.url().should("include", "/post");
  });
});

describe("Replies & deep interaction", () => { // testing deep-interactions with a single interaction is sufficient, as this test is meant to validate the deep-node paths' construction and translation in their round trips across the app; individual node interactions are functionally depth/path-agnostic (exceptions, e.g branch-locking, will/should test for depths/paths within their sections)
  function replyAndValidateNode(repliedNodeByTitlesPath:string[], replyTitle:string, replyBody:string) {
    cy.submitReply(repliedNodeByTitlesPath, replyTitle, replyBody);

    cy.expandNodePathAndAliasFinal(repliedNodeByTitlesPath);

    cy.get("@node").parent().find(".replies")
      .contains("h3", replyTitle)
      .parent().parent().contains("p", replyBody)
    ;

    cy.reload();
    cy.wait(500);
  };

  it("Reply to central node", () => {
    replyAndValidateNode(
      [postTitle],
      "1st Reply to Central",
      "filler text"
    );
  });
  it("Another reply to central node", () => {
    replyAndValidateNode(
      [postTitle],
      "2nd Reply to Central",
      "filler text"
    );
  });
  it("Reply to reply", () => {
    replyAndValidateNode(
      [postTitle, "1st Reply to Central"],
      "1st Reply to 1st Reply to Central",
      "filler text"
    );
  });
  it("Reply to reply to reply", () => {
    replyAndValidateNode(
      [postTitle, "1st Reply to Central", "1st Reply to 1st Reply to Central"],
      "1st Reply to 1st Reply to 1st Reply to central",
      "filler text"
    );
  });
  it("Another reply to reply", () => {
    replyAndValidateNode(
      [postTitle, "2nd Reply to Central"],
      "1st Reply to 2nd Reply to Central",
      "filler text"
    );
  });

  /*--SEQUENCE-VISUAL-AID--

  POST
  |\          
  | 1-3-4
  |\ 
  | 2-5
  
  -----------------------*/
});

describe("Timestamps (TODO)", () => {});

describe("Voting", () => {
  const upvoteSelector = 'button[aria-label="Upvote"]';
  const voteNumbSelector = 'span[aria-label="Votes status"]';
  const downvoteSelector = 'button[aria-label="Downvote"]';
  function validateVoteInterface(userVote:"up"|"down"|"none", voteCount:number) { // could've removed the voteCount parameter and instead let it be based on the userVote, but this separation supports testing with multiple voters (which doesnt currently seem necessary but i might in future switch to)
    cy.get(upvoteSelector).first().should(userVote === "up" ? "have.class" : "not.have.class", "voted");
    cy.get(voteNumbSelector).first().should("have.text", voteCount);
    cy.get(downvoteSelector).first().should(userVote === "down" ? "have.class" : "not.have.class", "voted");
  };

  it("Validate initial state", () => {
    validateVoteInterface("none", 0);
  });

  it("Vote (up)", () => {
    cy.get(upvoteSelector).first().click();
    cy.reload();
    validateVoteInterface("up", 1);
  });

  it("Override with opposite vote (down)", () => {
    cy.get(downvoteSelector).first().click();
    validateVoteInterface("down", -1);
    cy.reload();
    validateVoteInterface("down", -1);
  });

  it("Cancel vote (down", () => {
    cy.get(downvoteSelector).first().click();
    validateVoteInterface("none", 0);
    cy.reload();
    validateVoteInterface("none", 0);
  });
});