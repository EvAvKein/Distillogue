# Distillogue

A tool for conducting dialogue in the distilled format of your choice; currently in very early development.

---

## Table of Contents
* [Motives](#motives)
* [Tech Stack & Dependencies](#tech-stack--dependencies)
* [Execution](#execution)
* [Contributing](#contributing)
* [Maintainers](#maintainers)
* [License](#license)

---

## Motives

### My motives with this project ARE:

* Developing and refining this brainchild into a highly customizable tool (with general-purpose & custom presets); built to enable, guide, and nurture productive conversations

* Familiarizing myself with my tech stack of choice and being able to display that familiarity (e.g when applying for my first dev job)

### My motives with this project ARE NOT:

* Creating a new social media platform   
...There's more than enough of those already, managing their social aspects and PR is a headache, etc. *If* this project takes off, I'd want it to be an invite-based social tool (e.g Zoom, Trello, etc), or at most be social-media-adjacent (e.g Curious Cat, Linktree, etc). I want it to be topic-centric rather than user-centric

* Advertising an idea to be bought or to attract investors  
I want to make this thing to express my skills/ideals, and it would be neat if it ends up being useful to other people too. Work on this is finite, and I want to see it through without a bottomless profit motive spoiling it like it did many other things

---

## Tech Stack & Dependencies

### Stack
  * Frontend: Vue.js + TypeScript
  * Server: Node.js + Express.js + TypeScript
  * Database: MongoDB
  * Testing: Cypress

### Dependencies

* Node.js
* MongoDB [(Instructions for enabling "start" command with Mongo on Windows 10)](https://stackoverflow.com/a/41507803)
* Vite ("`npm install -g vite@latest`")

#### CLI-induced dependencies
* Windows, `start` command in backend's `npm run host`: If not using Windows, replace with your OS's equivalent for execution in new window
* Google Chrome, `--browser chrome` flag in frontend's `npm run cypress`: Solely added for my personal ease of use. If you don't have/use Chrome, you can safely remove it or replace `chrome` with your browser of choice as per the Cypress docs for this flag.

---

## Execution

### Prerequisites

1. Install the dependencies mentioned above
2. Clone the project to your computer via download/Git
3. Run `npm run install`

### Commands
1. `npm run build`: Construct files for frontend & backend  
2. `npm run host`: Launch server (and database) on localhost:3000
3. `npm run cypress`: Launch Cypress for end-to-end testing

(There's also `npm run serve` which executes 1 & 2, and `npm run test` which executes all 3)

---

## Contributing

This project is currently closed for contributions.  

Contributions will open (and will be very welcome!) in future, once I feel the project is sufficiently fleshed-out.

<!-- To contribute to the project, please open a new issue at the project's [GitHub repo](https://github.com/EvAvKein/Distillogue) with a summary of the contribution you have in mind.  

If I'm in favor of said contribution, I'll give you to go-ahead to submit a pull request. -->

---

## Maintainers

Eve Aviv Keinan  
Mastodon: [@EvAvKein@mstdn.social](https://mstdn.social/@EvAvKein)  
GitHub: [github.com/evavkein](https://github.com/EvAvKein)  
Email:  contact@evavkein.com

---

## License
This project is under the MIT License - see the LICENSE.md file for details.
