# LLAMARA Frontend - Development

LLAMARA Frontend is built with [React](https://reactjs.org/), [TypeScript](https://www.typescriptlang.org/) and [Vite](https://vitejs.dev/).

It is using the [shadcn/ui](https://ui.shadcn.com/) component library together with [Tailwind CSS](https://tailwindcss.com/).

## Setting up the development environment

You need NodeJS according to the version specified in the [`.nvmrc`](.nvmrc) file.
We recommend to use a Node Version Manager like [nvm](https://github.com/nvm-sh/nvm), so you can easily switch between different Node versions.

Install the correct NodeJS version:

```shell
nvm install
```

Use the correct NodeJS version:

```shell
nvm use
```

Install dependencies:

```shell
npm install
```

You need a instance of [LLAMARA Backend](https://github.com/llamara-ai/llamara-backend) available to connect to.
Create an `.env` file in the root of the project and set the `VITE_APP_REST_URL` variable to the URL of your LLAMARA Backend instance, e.g.:

```dotenv
VITE_APP_REST_URL=http://localhost:8080
```

## Running the development server

To start the development server, run:

```shell
npm run dev
```

## Linting & Codestyle

We use ESLint and Prettier to enforce a consistent code style:

- Run ESLint: `npm run lint`
- Fix auto-fixable ESLint issues: `npm run lint:fix`
- Run Prettier: `npm run format:check`
- Auto-format all files: `npm run format`

## Tests

We use [Vitest](https://vitest.dev/) for testing.
Run the tests with:

```shell
npm run test
```

## API Client

Our API client is generated with [Hey API](https://heyapi.dev/) based on the OpenAPI specification of the LLAMARA Backend.
To update the API client, place the latest `openapi.json` in the docs folder and run `npm run generate:api`.
