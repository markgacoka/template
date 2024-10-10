# Fullstack Next.js Template with Convex, Prisma, and NextAuth

## Overview

This template provides a robust foundation for building fullstack applications using Next.js and Convex. It’s designed to accelerate development by providing a pre-configured environment with a clean, scalable architecture.

## Technologies

-   **Next.js**: React framework for server-side rendering and building static websites.
-   **Convex**: Backend as a Service (BaaS) for building web apps.
-   **NextAuth.js**: Authentication for Next.js applications with built-in support for multiple providers.
-   **TypeScript**: Static type checking for JavaScript.
-   **TailwindCSS**: Utility-first CSS framework for styling.

## Installation
### Clone the repository:

```
git clone git@github.com:markgacoka/template.git
cd template
```

### Set up the environment variables:

-   Create a .env file in the root directory.
-   Add your environment variables (refer to .env.example).

### Running the Project

Development (Runs the app in development mode with hot-reloading at http://localhost:3000):

```
npm install
npm run deploy
```

Production (Builds the app for production and serves it at the domain name given):

```
docker compose up --build -d
```

# TODO:
---

-   [ ] Implement an example with search e.g. Algolia, Pinecone or something else
-   [ ] Logging and website analytics
-   [ ] Add SEO improvements
-   [ ] Fix performance and loading text when website is started
-   [ ] Implement themeing i.e. light/dark mode (button on header), inbuilt and custom fonts
-   [ ] Dev/prod feature flags
