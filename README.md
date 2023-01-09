# Distillogue

A tool for conducting dialogue in the distilled format of your choice; currently in very early development, with a demo hosted at http://distillogue.com

---

## Table of Contents

- [Tech Stack & Dependencies](#tech-stack--dependencies)
- [Execution](#execution)
- [Contributing](#contributing)
- [Maintainers](#maintainers)
- [License](#license)

---

## Tech Stack & Dependencies

### Stack

- Frontend: Vue.js + TypeScript
- Server: Node.js + Express.js + TypeScript
- Database: MongoDB
- Testing: Cypress
- Packaging: Docker

### Dependencies

- Docker  
  -- OR --
- Node.js
- MongoDB [(Instructions for enabling "mongo" command on Windows 10)](https://stackoverflow.com/a/41507803)
- Windows, for `start` in some of the `npm run` commands: If not using Windows, replace with your OS's equivalent for execution in new/background terminal
- Nodemon (`npm install -g nodemon`), for `npm run serverDev` in backend and dependent commands: Restarts the server whenever server code changes. If you'd rather avoid the dependency, replace `nodemon` with `node` in the backend's `package.json` commands.

---

## Execution

### Prerequisites

#### With Docker

1. Install & open Docker

#### With Node

1. Install the above dependencies (excluding Docker of course) & clone this project via download/Git
2. Run `npm run install`

### Commands

| Outcome              | With Docker                                                                                               | With Node                                               |
| -------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| Serve (Build & Host) | `docker-compose up`                                                                                       | `npm run serve`                                         |
| Serve Dev Mode       | [Unavailable, contribution is welcome](https://github.com/EvAvKein/Distillogue/issues/1)                  | `npm run serveDev`                                      |
| Launch Cypress       | `docker-compose -f docker-compose.tests.yaml up` <br> OR <br> `npm run dockerCypress`                     | `npm run cypress` <br> OR <br> `npm run cypressBrowser` |
| Serve & Cypress      | `docker-compose -f docker-compose.yaml -f docker-compose.tests.yaml up` <br> OR <br> `npm run dockerTest` | `npm run test` <br> OR <br> `npm run testBrowser`       |

(For more discrete Node commands, see `package.json` and its counterparts in the `frontend` and `backend` folders)

## Contributing

Contributions are very welcome! See the TODO.md file or GitHub issues.

For any questions, comment under a relevant issue or create a new issue.

---

## Maintainers

Eve Aviv Keinan  
GitHub: [github.com/evavkein](https://github.com/EvAvKein)  
Email: evavkein@gmail.com

---

## License

This project is under the MIT License - see the LICENSE.md file for details.
