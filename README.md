# Distillogue

A tool for conducting dialogue in the distilled format of your choice; currently in very early development.

---

## Table of Contents
* [Tech Stack & Dependencies](#tech-stack--dependencies)
* [Execution](#execution)
* [Contributing](#contributing)
* [Maintainers](#maintainers)
* [License](#license)

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
* Windows, for `start` in some of the `npm run` commands: If not using Windows, replace with your OS's equivalent for execution in new/background terminal
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
  <details><summary>Wondering why tests aren't dockerized?</summary>
    Running tests, i.e Cypress, in interactive mode (which in my opinion is worth much more than console), through a Docker container, seems to be a whole mess that requires a local dependency and then some setup. Wasn't worth it for me to try implementing. 
  
    ...But if I'm wrong about the dependency and it's actually possible with just dockerfile/docker-compose and maybe a command, then a pull request would be genuinely appreciated (once the project actually has a Docker dev setup, see: https://github.com/EvAvKein/Distillogue/issues/1).
  </details>
&nbsp; <!-- nbsp for spacing i couldn't get with pure markdown (without ruining the above list's spacing) -->

#### Without Docker
1. `npm run build`: Construct files for frontend & backend  
2. `npm run host`: Launch server (and database) on localhost:3000
3. `npm run cypress`: Launch Cypress for end-to-end testing

(There's also `npm run serve` which executes 1 & 2, and `npm run test` which executes all 3)

* With `build`, `host`, and `serve`, you for append (no space) `Dev` for modes that watch for file changes and live-reload (frontend changes require refreshing)

---

## Contributing

Contributions are very welcome! See the TODO.md file or GitHub issues.

For any questions, comment under a relevant issue or create a new discussion.

---

## Maintainers

Eve Aviv Keinan  
Mastodon: [mstdn.social/@evavkein](https://mstdn.social/@EvAvKein)  
GitHub: [github.com/evavkein](https://github.com/EvAvKein)  
Email:  contact@evavkein.com

---

## License
This project is under the MIT License - see the LICENSE.md file for details.
