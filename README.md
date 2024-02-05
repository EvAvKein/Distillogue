# Distillogue

A configurable discussion platform whose development has been discontinued.

---

## Table of Contents

- [Execution](#execution)
- [Retrospective](#retrospective)
- [License](#license)

---

## Execution

### Software Requirements

- Docker
- Node.js - dev only (dependency intellisense, live test runner, convenience script aliases for docker commands)

### Commands

- Serve (build & host): `docker-compose up`
- Serve in dev mode: `docker-compose -f compose.yaml -f compose.devOverride.yaml up`
- Run automated tests: `docker-compose -f compose.test.yaml up`
- Run code styler: `docker-compose -f compose.style.yaml up`

(When relaunching the basic serve mode or rewriting tests, append ` --build --force-recreate`)

---

## Retrospective

### App Concept

The core concept is a forum platform with high configurability (e.g. interaction types, permissions, moderation paradigms).
For more details about what the app was going to become, see the About page (./frontend/src/pages/About.vue).

<ul>
   <li>I created this because I wanted to work on a novel product (to be a full-stack project in my programming portfolio) and this is the only novel concept that came to mind. I was later exposed to the software design concept of "convention over configuration", which I concluded is also true enough in UX matters to make this product's gimmick a bad idea.</li>
   <li>The concept would appeal to the niche of relatively opinionated/particular communicators. Such people are more liable to request changes/additions to configurability which would cumulatively significantly extend development time, but (regardless of their proportionate willingness to be monetized/paying for it) this is not a desire I'd be too eager to indulge long-term.</li>
   <li>Not long after starting work on the project I came to the realization it'd be best to make posts invite-only; to minimize angst/antagonism between strangers regarding the chosen configuration, to make relying on user-on-user moderation more viable, to alleviate the platform's cold-start situation by removing the expectation for public posts, etc.</li>
</ul>

### Tech Stack

Main technologies: Vue 3, TypeScript, Express, MongoDB, Playwright, Docker.
The website was previously hosted on a DigitalOcean Droplet.

<ul>
   <li>My decision to use Vue was due to my previous experience with raw HTML-CSS-JS: Vue's Composition API had the familiar splitting of those aspects which was easy to transition to (as distinct from React's JSX, with HTML-in-JS and potentially CSS-in-JS), and getting into Vue was further eased by the lack of initial setup (as distinct from React, which felt too unopinionated when I found out about the multitude of ways/libraries to even just handle CSS).
   Since discontinuing this project I've been working on a React project (for the sake of my portfolio), and in hindsight I regret not making the initial effort to use React (again, for the sake of my portfolio) since, initial setup and framework performance aside, I actually prefer React now.</li>
   <li>I also chose the easier learning curve when I chose MongoDB over an SQL database for this project... but I also had another reason for this decision which is more important (which I still stand by):
   This project's configurability gimmick (which results in tons of optional/conditional properties) and the forum-esque structure are a better fit for a document database in my opinion; one query can return the entire post instead of needing to piece the post together from reply rows (and avoiding that by storing replies in a JSON property would be just a roundabout document DB), easier querying by configuration (which is possible in some SQL DBs, but that's also a roundabout document DB usage), and discourages creating features which present replies/interactions out of context (which'd be very easy to query as distinct rows).</li>
   <li>I was initially testing with Cypress, but I migrated to Playwright after stumbling into a variety of Cypress quirks (e.g. JS execution outside of test scopes). Suffice it to say I'm glad I made that migration.</li>
   <li>The project would've also eventually used Kubernetes and/or an infrastructure-as-code solution, but I first wanted to have a decent variety of configurations and while developing those was when I decided to discontinue the project.</li>
   <li>I'd've likely eventually migrated from Vue to Nuxt, from Node to Deno, and from Docker to Podman. See TODO.md's final section for details.</li>
</ul>

---

## License

This project is under the MIT License - see the LICENSE.md file for details
