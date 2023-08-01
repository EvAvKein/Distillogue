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
- Node.js (development only, dependency intellisense)

### Prerequisites

1. Clone this project via Git/download  
   (If using intellisense, run `npm run installAll` in project's root)
2. Launch Docker

### Commands

- Serve (build & host): `docker-compose up`
- Serve in dev mode: `docker-compose -f compose.yaml -f compose.devOverride.yaml up`
- Run automated tests: `docker-compose -f compose.test.yaml up`
- Run code styler: `docker-compose -f compose.style.yaml up`

(When switching between serve dev modes or rewriting tests, append ` --build --force-recreate` to the command)

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
