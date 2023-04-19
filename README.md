# Distillogue

A tool for conducting dialogue in the distilled format of your choice; currently in very early development, with a demo hosted at https://distillogue.com

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

### Steps

1. Clone this project via Git/download

#### With Docker

2. Install & launch Docker
3. Run `docker-compose -f docker-compose.dev.yaml up` (relaunch with `--build --force-recreate` flags after modifying files outside `src`/`shared`)
4. Test by running `docker-compose -f docker-compose.tests.yaml up` (relaunch with above flags after test edits)

#### With Node

2. Install above software dependencies (excluding Docker of course)
3. Run `npm run installAll`
4. Run `npm run serveDev`
5. Test by running `npm run playwright`

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
