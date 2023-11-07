# Distillogue

The configurable discussion platform. Development currently shelved, demo hosted at https://distillogue.com

---

## Table of Contents

- [Status](#status)
- [Execution](#execution)
- [Contributing](#contributing)
- [Maintainers](#maintainers)
- [License](#license)

---

## Status

This project is no longer in development: Shelved indefinitely, after coming up with a more worthwhile project (both for my portfolio and as a product), [Dialplan](https://github.com/EvAvKein/Dialplan).

See the [Contributing](#contributing) section if you'd like to revive this project!

---

## Execution

### Software Requirements

- Docker
- Node.js - optional (dependency intellisense, live test runner, package.json script aliases for docker commands below)

### Prerequisites

1. Clone this project via Git/download  
   (If browsing code, run `npm run installAll` in project's root for intellisense)
2. Launch Docker

### Commands

- Serve (build & host): `docker-compose up`
- Serve in dev mode: `docker-compose -f compose.yaml -f compose.devOverride.yaml up`
- Run automated tests: `docker-compose -f compose.test.yaml up`
- Run code styler: `docker-compose -f compose.style.yaml up`

(When relaunching the basic serve mode or rewriting tests, append ` --build --force-recreate`)

---

## Contributing

If you're interested in becoming an active contributer, fork the repository and let me know!
I'm happy to handle merges and assign co-maintainers, and might return as an active contributor if there's interest in the project.

See [the to-do file](TODO.md) for tasks & ideas, see [the About page](frontend/src/pages/About.vue) (also hosted at [distillogue.com/about](https://distillogue.com/about)) for long-term concepts/priorities.

---

## Maintainers

Eve Aviv Keinan  
GitHub: [github.com/evavkein](https://github.com/EvAvKein)

---

## License

This project is under the MIT License - see the LICENSE.md file for details
