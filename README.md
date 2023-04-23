# Distillogue

The configurable discussion platform; currently in very early development, with a demo hosted at https://distillogue.com

---

## Table of Contents

- [Execution](#execution)
- [Contributing](#contributing)
- [Maintainers](#maintainers)
- [License](#license)

---

## Execution

### Software Requirements

- Docker  
  -- OR --
- Node.js
- MongoDB [(Instructions for enabling "mongo" command on Windows 10)](https://stackoverflow.com/a/41507803)
- Windows, for `start` in some of the `npm run` commands: If not using Windows, replace with your equivalent for execution in new/background terminal

### Prerequisites

1. Clone this project via Git/download

#### With Docker

2. Install & launch Docker

#### With Node

2. Install the above dependencies (excluding Docker of course)
3. Run `npm run installAll`

### Commands

| Outcome              | With Docker                                                                                      | With Node            |
| -------------------- | ------------------------------------------------------------------------------------------------ | -------------------- |
| Serve (Build & Host) | `docker-compose up`                                                                              | `npm run serve`      |
| Serve Dev Mode       | `docker-compose -f compose.yaml -f compose.devOverride.yaml up` <br> OR <br> `npm run dockerDev` | `npm run serveDev`   |
| Launch Playwright    | `docker-compose -f compose.tests.yaml up` <br> OR <br> `npm run dockerPlaywright`                | `npm run playwright` |
| Serve & Playwright   | `docker-compose -f compose.yaml -f compose.tests.yaml up` <br> OR <br> `npm run dockerTest`      | `npm run test`       |

(For more discrete Node commands, see `package.json` and its counterparts in the `frontend` and `backend` folders)

## Contributing

Contributions are very welcome! See the [TODO.md](todo.md) file or GitHub issues.

For any questions, comment under a relevant issue or create a new issue.

---

## Maintainers

Eve Aviv Keinan  
GitHub: [github.com/evavkein](https://github.com/EvAvKein)  
Email: evavkein@gmail.com

---

## License

This project is under the MIT License - see the LICENSE.md file for details.
