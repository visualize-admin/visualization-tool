# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

## Common Development Commands

### Setup & Development

- `yarn setup:dev` - Complete development environment setup (installs deps,
  compiles locales, runs DB migrations)
- `yarn dev` - Start development server (with debugging enabled)
- `yarn dev:ssl` - Start development server with HTTPS (required for
  authentication flows)
- `yarn dev:rollup` - Build embed script during development (when changing
  embed/index.ts)

### Building & Testing

- `yarn build` - Full production build (includes GraphQL codegen, locale
  compilation, rollup, storybook, JSON schema generation, and Next.js build)
- `yarn typecheck` - Run TypeScript type checking for both app and embed
- `yarn lint` - Run ESLint on the app directory
- `yarn test` - Run unit tests with Vitest
- `yarn test <file-pattern>` - Run specific test files (e.g.,
  `yarn test interactive-filters-config-state.spec.tsx`)
- `yarn test:watch` - Run unit tests in watch mode

### End-to-End Testing

- `yarn e2e:dev` - Run Playwright tests against local development server
- `yarn e2e:ui` - Run Playwright tests with interactive UI
- `yarn e2e:dev:ssl` - Run Playwright tests against HTTPS development server

### Database & Migrations

- `yarn db:migrate:dev` - Run database migrations for development (manual in
  dev, automatic in production)
- `yarn db:migrate` - Run database migrations (production)

### Localization

- `yarn locales:extract` - Extract translatable strings from code to generate
  message files
- `yarn locales:compile` - Compile translation files
- `yarn locales:sync` - Sync translations with Accent (translation service)

### GraphQL & Code Generation

- `yarn graphql:codegen` - Generate TypeScript types from GraphQL schema
- `yarn graphql:codegen:dev` - Watch mode for GraphQL code generation

## Architecture Overview

This is a Next.js-based data visualization platform that allows users to create
interactive charts from RDF/SPARQL data sources.

### Key Technologies

- **Next.js 14** - React framework with SSR/SSG
- **TypeScript** - Type-safe development
- **GraphQL** - API layer with Apollo Server
- **URQL** - GraphQL client
- **Prisma** - Database ORM with PostgreSQL
- **D3.js** - Data visualization library
- **Material-UI (MUI)** - UI component library
- **Vitest** - Unit testing framework
- **Playwright** - End-to-end testing

### Core Directory Structure

- `/app` - Main application code (Next.js app directory)
  - `/charts` - Chart rendering components (area, bar, line, map, pie,
    scatterplot, table)
  - `/configurator` - Chart configuration UI and state management
  - `/components` - Reusable UI components
  - `/pages` - Next.js pages and API routes
  - `/rdf` - RDF/SPARQL data fetching and parsing logic
  - `/graphql` - GraphQL schema, resolvers, and client setup
  - `/locales` - Internationalization files (en, de, fr, it)
  - `/prisma` - Database schema and migrations
- `/embed` - Embeddable chart widget
- `/e2e` - Playwright end-to-end tests
- `/k6` - Performance and load tests

### Data Flow

1. **Data Sources**: RDF/SPARQL endpoints provide cube data
2. **GraphQL Layer**: Resolvers query RDF data and transform it
3. **Chart Configurator**: UI for selecting datasets and configuring
   visualizations
4. **Chart Rendering**: D3.js-based components render interactive charts
5. **Persistence**: Chart configurations stored in PostgreSQL via Prisma

### Chart Types Supported

- Area charts (single and stacked)
- Bar charts (grouped and stacked, horizontal and vertical)
- Line charts (single and multiple)
- Combo charts (line+column, dual-axis, multi-line)
- Maps (with symbols and areas)
- Pie charts
- Scatterplots
- Tables

### State Management

- Chart configuration state managed through React context and reducers
- Interactive filters synchronized across charts
- Local storage for persistence of user preferences

### Authentication

- Next-auth with ADFS provider for Swiss federal authentication
- Test credentials provider for development/preview environments
- User-specific chart configurations and custom color palettes

### Development Notes

- Docker Compose setup for PostgreSQL database
- Comprehensive visual regression testing with screenshot comparison
- Internationalization support for 4 languages
- Embed functionality for including charts in external websites
- Performance monitoring with k6 and Grafana integration
- Storybook for component documentation and testing

### Testing Strategy

- Unit tests with Vitest and React Testing Library
- E2E tests with Playwright for critical user flows
- Visual regression tests for chart rendering
- Performance tests for GraphQL queries and data loading
- Load testing for API endpoints

### Deployment

- Designed for Vercel and Docker deployments
- Database migrations run automatically on production builds
- Environment-specific configuration through environment variables
