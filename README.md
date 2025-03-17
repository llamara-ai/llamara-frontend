# ENV

Create an .env file with VITE_APP_REST_URL as the backend URL (used by vite for the proxy)

# TODO

- Implement caching, some api calls will done more than once.
- Store api call values

---

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Setting up development environment

You need NodeJS 22.13.0 or later installed.
When using a Node version manager, run `nvm use` to switch to the correct version.

Run the following commands to install the dependencies:

```shell script
npm install
```

## Running the development server

To start the development server, run:

```shell script
npm run dev
```

## Linting

This project uses ESLint as linter.

To lint the code, run:

```shell script
npm run lint
```

To fix automatically fixable issues, run:

```shell script
npm run lint:fix
```

## Formatting

This project uses Prettier for formatting.

To format the code, run:

```shell script
npm run format
```
