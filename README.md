# Distillogue

A tool (and might be a forum) for conducting multi-faceted dialogue in a distilled format; Currently in very early development.

---

## Table of Contents
* [Background](#background)
* [Dependencies](#dependencies)
* [Execution](#execution)
* [Contributing](#contributing)
* [Maintainers](#maintainers)
* [License](#license)

---

## Background

My motives for working on this project are:

* Developing and refining this brainchild into a highly customizable tool (with common-use presets), built to guide and nurture productive conversations.

* Familiarizing myself with my tech stack of choice and being able to display that familiarity when applying for my first junior developer job.  
The project's stack is currently MEVN + TypeScript, but I'm planning on migrating substantially from MongoDB to PostgreSQL way before the first production build.

---

## Dependencies

* Node.js
* MongoDB
* Vite ("`npm install -g vite@latest`")
* Windows (at least for the `start mongo` command in the backend's `npm run serve` command)

---

## Execution

### Prerequisites

1. Install the dependencies mentioned above
2. Clone project to your computer
3. Run `npm install` on both "backend" and "frontend" folders

### Build
1. `cd backend` (from project's root folder) 
2. `npm run build`
3. visit `localhost:3030` in browser

### Serve
(Build, then launch server & database)
1. `cd backend` (from project's root folder) 
2. `npm run serve`
3. visit `localhost:3030` in browser

### Preview
(Host a frontend-only version. Hot Module Replacement available)
1. `cd frontend` (from project's root folder) 
2. `npm run preview`
3. visit `localhost:3030` in browser  

---

## Contributing

To contribute to the project, please open a new issue at the project's [GitHub repo](https://github.com/EvAvKein/Distillogue) with a summary of the contribution you have in mind.  

If I'm in favor of said contribution, I'll give you to go-ahead to submit a pull request.

---

## Maintainers

Eve Aviv Keinan  
Twitter: [@EvAvKein](https://twitter.com/evavkein)  
GitHub: [github.com/evavkein](https://github.com/EvAvKein)  
Email:  contact@evavkein.com

---

## License
This project is under the MIT License - see the LICENSE.md file for details.