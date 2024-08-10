# Fullstack Next.js Template with tRPC, Prisma, and NextAuth

## Overview

This template provides a robust foundation for building fullstack applications using Next.js in conjunction with tRPC for type-safe APIs, Prisma for database ORM, and NextAuth.js for authentication. It’s designed to accelerate development by providing a pre-configured environment with a clean, scalable architecture.

## Technologies

-   **Next.js**: React framework for server-side rendering and building static websites.
-   **tRPC**: Type-safe APIs with automatic type inference between the client and server.
-   **Prisma**: Database ORM for type-safe database queries.
-   **NextAuth.js**: Authentication for Next.js applications with built-in support for multiple providers.
-   **TypeScript**: Static type checking for JavaScript.
-   **TailwindCSS**: Utility-first CSS framework for styling.

## Features

-   **Type-Safe Endpoints**: Use tRPC to define and consume APIs with complete type safety.
-   **Authentication**: NextAuth.js with credential provider for custom authentication logic.
-   **CRUD Operations**: Example CRUD implementation using Prisma.
-   **Client-Side & Server-Side Rendering**: Fully compatible with both CSR and SSR.
-   **Utility-First Styling**: Integrated TailwindCSS for rapid UI development.

## Folder Structure

```
├── prisma/                # Prisma schema and migrations
├── src/
│   ├── components/        # React components
│   ├── app/               # Next.js app router
│   ├── server/
│   │   ├── api/
│   │   │   ├── routers/   # tRPC routers for API endpoints
│   │   │   ├── trpc.ts    # tRPC context and initialization
│   │   ├── auth.ts        # NextAuth configuration
│   │   ├── db.ts          # Prisma client instance
│   ├── styles/            # Global styles (TailwindCSS)
│   ├── trpc/              # tRPC client setup and hooks
├── .env                   # Environment variables
├── next.config.js         # Next.js configuration
├── tsconfig.json          # TypeScript configuration
├── package.json           # Project dependencies and scripts
```

## Installation

### Clone the repository:

```
git clone git@github.com:markgacoka/template.git
cd template
```

### Install dependencies:

```
npm install
```

### Set up the environment variables:

-   Create a .env file in the root directory.
-   Add your environment variables (refer to .env.example).

### Run Prisma migrations and generate Prisma client:

```
npx prisma migrate dev --name init
npx prisma generate
```

### Running the Project

Development:

```
npm run dev
```

-   Runs the app in development mode with hot-reloading at http://localhost:3000.

Production:

```
npm run build
npm start
```

-   Builds the app for production and serves it.

## Considerations

-   **Security**: Ensure to handle secrets and sensitive data securely in environment variables.
-   **Performance**: Make use of caching strategies with React Query and leverage SSR where applicable.
-   **Scalability**: Follow best practices for file structure and component design to maintain scalability as the project grows.

## Extending the Template

-   **Adding New Routes**: Define new routes in the `routers/` folder and extend the `appRouter` in `root.ts`.
-   **Customizing Authentication**: Modify the `auth.ts` file to add new authentication strategies or providers.
-   **Styling**: Leverage TailwindCSS to quickly style components, or add custom CSS as needed.

# TODO:

---

-   [ ] Implement shadcn components and styling in demo
-   [ ] Implement an example with sockets
-   [ ] Implement an example with search e.g. Algolia, Pinecone or something else
-   [ ] Logging and website analytics
-   [ ] Deployment script
-   [ ] Add SEO improvements
-   [ ] Fix performance and loading text when website is started
-   [ ] Implement themeing i.e. light/dark mode (button on header), inbuilt and custom fonts
-   [x] Add JWT token limit for auth
-   [ ] Demo a few components e.g. toast/sonner, dialog, tooltip, sidecar and dropdown menu - main view split into grids
