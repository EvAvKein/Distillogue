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
  * Packaging: Docker

### Dependencies
* Docker  
-- OR --
* Node.js
* MongoDB [(Instructions for enabling "mongo" command on Windows 10)](https://stackoverflow.com/a/41507803)
* Windows, for `start` in some of the `npm run` commands: If not using Windows, replace with your OS's equivalent for execution in new window
* Nodemon (`npm install -g nodemon`), for `npm run serverDev` in backend and dependent commands: Restarts the server whenever server code changes. If you'd rather avoid the dependency, replace `nodemon` with `node` in the backend's `package.json`.

---

## Execution

### Prerequisites
#### With Docker
1. Install & open Docker    

#### Without Docker
1. Install the above dependencies (excluding Docker of course) & clone this project via download/Git
2. Run `npm run install`

### Commands
#### With Docker
1. `docker-compose up`: Build & host project on localhost:3000   

To run tests, i.e Cypress, you'll need to:
  * Install Node.js
  * Run `npm install` in the "testing" folder
  * Run `npm run cypress`    
  
...Because running tests, i.e Cypress, in interactive mode (which in my opinion is worth much more than console) is a whole mess that seems to require another dependency and then some more setup. Wasn't worth it for me to try implementing (but if I'm wrong about the extra dependency and it's actually possible with dockerfile/docker-compose and a command, then a pull request would be genuinely appreciated).

#### Without Docker
1. `npm run build`: Construct files for frontend & backend  
2. `npm run host`: Launch server (and database) on localhost:3000
3. `npm run cypress`: Launch Cypress for end-to-end testing

(There's also `npm run serve` which executes 1 & 2, and `npm run test` which executes all 3)

* With `build`, `host`, and `serve`, you for append (no space) `Dev` for modes that watch for file changes and live-reload (frontend changes require refreshing)

---

## Contributing

This project is currently closed for contributions.  

Contributions will open (and will be very welcome!) in future, once I feel the project is sufficiently fleshed-out.

---

## Maintainers

Eve Aviv Keinan  
Mastodon: [mstdn.social/@evavkein](https://mstdn.social/@EvAvKein)  
GitHub: [github.com/evavkein](https://github.com/EvAvKein)  
Email:  contact@evavkein.com

---

## License
This project is under the MIT License - see the LICENSE.md file for details.
