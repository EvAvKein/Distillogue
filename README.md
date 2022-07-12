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

* Developing and refining it into a highly customizable tool (with general-purpose & custom presets) for productive conversations

* Familiarizing myself with my professional tech-stack of choice and displaying that familiarity (e.g when applying for my first dev job)

### My motives with this project ARE NOT:

* Creating the next big social-media space:  

  * Plainly put, I'm creating a thing I'd like and I've yet to see. There might be some audience for it, but I haven't done market research and I'm not desperate to find people for which to compromise/mold it (especially this early in development)   

  * I'm deliberately avoiding making yet another social feed: This will first and foremost be an invite-based subject-centric tool, and if any public posting/feed remains by 1.0 it'd be very specialized/particular (TBA, I have a few ideas)   

* Advertising an idea/brand to be bought or to attract investors:   

  * Work on this project is finite (and will likely become irregular and it becomes complete), the profit motive isn't, and I care about this project enough to avoid any chance it gets spoiled/coerced

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
