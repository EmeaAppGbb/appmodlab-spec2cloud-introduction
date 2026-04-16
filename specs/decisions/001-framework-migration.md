# ADR-001: Migrate from Express to Fastify

## Status

Proposed

## Date

2026-04-16

## Context

The OpenShelf Library application currently uses **Express 4.x** as its web framework. Express has served the project well for its initial development, but as we modernize for cloud deployment we need to evaluate whether it remains the best choice.

Key observations about the current Express setup:

- Routes are defined with classic Express patterns (`app.use`, `router.get/post`)
- Middleware is used for body parsing (`body-parser`), static file serving, and EJS view rendering
- The application is a monolith with server-rendered HTML — no formal REST/JSON API layer
- There is no input validation, schema enforcement, or OpenAPI documentation
- Express 4.x relies on callback-style middleware; modern async/await patterns require careful error handling

The modernized application will expose a structured JSON API, require request/response validation, and target cloud-native deployment on Azure App Service.

## Decision

We recommend migrating from **Express** to **Fastify** as the web framework for the modernized OpenShelf Library.

## Pros

- **Performance:** Fastify is significantly faster than Express in benchmarks, with lower latency and higher throughput due to its optimized routing and serialization engine.
- **Built-in JSON Schema validation:** Fastify natively supports request and response schema validation using JSON Schema, enabling contract-first API development without additional middleware.
- **Automatic serialization:** Fastify uses `fast-json-stringify` for response serialization, which is faster than `JSON.stringify` and enforces response contracts.
- **First-class async/await support:** Fastify handlers are async by default with proper error propagation, eliminating the need for `express-async-errors` or manual try/catch wrappers.
- **Plugin architecture:** Fastify's encapsulated plugin system promotes modular code organization and supports dependency injection, improving testability.
- **Built-in logging:** Fastify integrates with Pino for structured, high-performance JSON logging out of the box — essential for cloud-native observability.
- **OpenAPI/Swagger integration:** The `@fastify/swagger` plugin can auto-generate OpenAPI documentation from route schemas, aligning with our spec-driven approach.
- **TypeScript support:** Fastify has strong TypeScript typings, providing better developer experience if we adopt TypeScript in the modern stack.
- **Active maintenance:** Fastify has an active core team and a growing ecosystem of official plugins.

## Cons

- **Learning curve:** Developers familiar with Express must learn Fastify's plugin model, lifecycle hooks, and decorator patterns.
- **Ecosystem size:** While growing, Fastify's middleware and plugin ecosystem is smaller than Express's. Some Express middleware may need to be replaced or rewritten.
- **EJS template rendering:** Fastify supports template engines via `@fastify/view`, but the ecosystem is more oriented toward JSON APIs. Server-rendered views require additional setup compared to Express.
- **Migration effort:** Existing Express route handlers, middleware, and `app.locals` patterns cannot be directly ported — they need to be restructured to fit Fastify's plugin-based architecture.
- **Community resources:** Express has significantly more tutorials, Stack Overflow answers, and community examples, making troubleshooting easier for less experienced developers.

## Consequences

- **Positive:** The modernized API will benefit from built-in schema validation and automatic OpenAPI documentation, supporting the Spec2Cloud methodology.
- **Positive:** Performance improvements align with cloud deployment goals, reducing compute costs on Azure App Service.
- **Positive:** Structured logging with Pino integrates well with Azure Monitor and Application Insights.
- **Negative:** The migration is not a drop-in replacement; all route handlers and middleware must be rewritten using Fastify conventions.
- **Negative:** Team members will need time to become proficient with Fastify's patterns and plugin system.

## References

- [Fastify Documentation](https://fastify.dev/)
- [Fastify vs Express Benchmarks](https://fastify.dev/benchmarks/)
- [ADR-001: Spec-Driven Modernization](./adr-001-spec-driven-modernization.md)
