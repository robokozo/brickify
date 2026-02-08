# Boolean Checks and Naming

- Do not allow truthy/falsy checks (e.g., if (value)). All checks must be explicit (e.g., if (value !== null), if (value === true), if (value.length > 0)).
- If a variable represents a boolean value, its name should be prefixed with `is` or `has` (e.g., `isActive`, `hasChildren`).

# Interfaces vs Types

- Strictly prefer `interface` for defining object shapes (data models, props, state) due to better performance and clearer error messages.
- Use `type` only for unions, primitives, or utility types where interfaces cannot be used.

---

# Compiler-Only Features (No Transformations)

- Strictly prohibit TypeScript features that emit runtime code or require compilation/transformation.
- **Prohibited Features:** Enums, namespace merging, decorators, and constructor parameter properties (shorthand class props).
- **Reasoning:** Code must be compatible with Node.js `--experimental-strip-types` and standard JavaScript runtimes. TypeScript should be treated as type-strippable syntax only.

---

# Null vs Undefined

- Prefer `null` over `undefined` for optional values or missing data.
- **Reasoning:** `null` is valid JSON and standard in databases, reducing the need for conversion at API boundaries.

---

# Async Patterns

- Prefer async/await for all asynchronous code for readability, maintainability, and easier error handling. Avoid raw Promises or .then/.catch chaining to keep code consistent and debuggable.

---

# Error Messaging

- No strict convention for error messages. If surfacing messages to users (e.g., via toast), avoid technical language and use user-friendly messages.
- For developer-facing errors, include enough context for debugging. If possible, include a code or type property for programmatic handling.

---

# File Naming and Organization

- Vue Single-File Components (`.vue`) must use PascalCase (e.g., `UserCard.vue`).
- General files (e.g., utils, hooks) must use camelCase (e.g., `useFetch.ts`).
- Exception: Follow framework-specific conventions (e.g., Nuxt pages/layouts) where strict naming is required by the framework.
- Organize code using feature folders for scalability and easier onboarding. Each feature should have its own folder with a structure similar to the app-wide organization. The following is just an example structure—adapt as needed for your project:

```
lib/
api/
db/
components/
utils/
features/
  featureA/
    lib/
    api/
    db/
    components/
    utils/
```

---

# Preferred Libraries

- Prefer zod for validation, es-toolkit for utilities, the Vite ecosystem (rolldown, oxfmt, oxlint) for build and tooling, date-fns for date handling, and Vitest as the preferred testing library.
- Avoid introducing libraries that overlap with these unless there is a clear benefit.

---

# Accessibility

- Accessibility (a11y) is generally not a priority unless otherwise specified. However, avoid introducing barriers for users, and consider a11y for public-facing features.

---

# Code Review, PRs, and Documentation

- STRICT: All commit messages must follow the Conventional Commits format: `<type>(<scope>): <subject>`.
  - Standard types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`.
- No strict requirements for code review, PR descriptions, or documentation format.
- Clear PR descriptions are encouraged for future maintainability.

---

# Immutability

- Prefer immutability in shared or global state for predictability and safety. Mutation is acceptable in local, isolated contexts for performance or simplicity.

---

# Environment Variables and Secrets

- No strict rules for handling environment variables or secrets. However, never hardcode secrets in the codebase and consider using environment variable management tools.

---

# Deprecation and Removal

- Deprecated code can generally be removed immediately unless there is a specific reason to keep it. Document breaking changes in a CHANGELOG or similar if relevant.

---

# Dependency Injection (DI)

- Prefer dependency injection (DI) where it makes sense, especially in backend code, to improve testability and modularity.
- Use factory functions and object parameters for DI instead of classes, to keep code self-documenting and flexible.

**Example:**

```ts
function createLogger() {
  return {
    log({ message }: { message: string }) {
      console.log(message);
    },
  };
}

function createUserService({
  logger,
}: {
  logger: { log: (payload: { message: string }) => void };
}) {
  return {
    createUser(name: string) {
      logger.log({ message: `User created: ${name}` });
      // ...other logic
    },
  };
}

const userService = createUserService({ logger: createLogger() });
userService.createUser("Alice");
```

---

# Import Style

- Prefer global (absolute) imports for most modules for clarity and easier refactoring. Exceptions can be made for files that logically belong together (e.g., sibling components).
- Group and order imports for readability (e.g., external libraries, internal modules, styles).
- Strictly disable/avoid Nuxt auto-imports.
- All imports (Vue primitives like `ref`, `computed`, and Nuxt composables) must be explicitly imported at the top of the file.
- **Reasoning:** To ensure code clarity, better IDE support, and easier refactoring.

---

# Export Style

- Never use default exports. Always use named exports for clarity, discoverability, and safer refactoring.

---

# Comparison and Optional Features

- Use optional chaining and nullish coalescing only when needed, guided by TypeScript. Avoid overusing them to keep code explicit.
- Always use `===` for comparisons, except when explicitly checking for null or undefined, where `==` is allowed (unless a distinction is needed).

---

# Destructuring and Module Pattern

- Prefer destructuring for function parameters and variables to improve clarity and reduce repetition. Avoid repetitive property access like `params.x`, `params.y`.
- Prefer the revealing module pattern for code with state instead of classes, to keep state encapsulated and avoid using `this.x`, `this.y`, etc.

---

# Vue API Preference

- Prefer the Composition API for Vue components for scalability and code reuse.
- Explicitly prefer `defineProps` and `defineModel` using runtime-free type-only syntax (generics) to stay as close to pure TypeScript as possible.
- Example: `defineProps<{ id: string }>()` instead of `defineProps({ id: String })`.

---

# State Management

- Pinia is the preferred state management library for its modern API and type safety.

---

# Error Handling

- Only catch errors when there is a way to gracefully resolve the problem. Let unhandled errors propagate to global handlers/loggers. Avoid unnecessary try/catch blocks.

---

# CSS/Styling

- Tailwind CSS is preferred for styling. Use utility classes to enforce consistency, but compose them for readability in complex components.

---

# Magic Numbers/Strings

- Magic numbers and strings should generally be defined as constants to improve maintainability and reduce errors from typos.

---

# Type Assertion Best Practices

- Using `as const` is encouraged to ensure literal types and immutability where appropriate.
- Using `satisfies` is encouraged to validate that objects conform to specific types without changing their inferred type.

**Examples:**

```ts
// Good: as const for literal types
const directions = ["up", "down", "left", "right"] as const;

// Good: satisfies for type validation
const config = {
  port: 8080,
  debug: true,
} satisfies AppConfig;
```

---

# Type Safety Rules

- Using `any` is strictly prohibited. Always use specific, safe types to maximize TypeScript's safety guarantees.
- Using `as` casting is discouraged. Prefer proper type inference or safe type guards instead.

**Example:**

```ts
// Not allowed
let value: any;

// Discouraged
const foo = bar as string;

// Preferred
function handle(input: string | number) {
  if (typeof input === "string") {
    // ...
  }
}
```

---

# Vue Component Structure

- In Vue single-file components (`.vue`), always order sections as follows for consistency and easier navigation:
  1.  `<script>`
  2.  `<template>`
  3.  `<style>`

**Example:**

```vue
<script setup lang="ts">
// ...
</script>

<template>
  <!-- ... -->
</template>

<style>
/* ... */
</style>
```

---

# Function References in Callbacks

- Avoid passing function references directly into other functions (e.g., `array.map(doStuff)`).
- Instead, use an inline arrow function to ensure type safety and accurate parameter mapping. This helps TypeScript catch errors if the function signature changes, even if callback signatures overlap.

**Example:**

```ts
// Not preferred
array.map(doStuff);

// Preferred
array.map((x) => doStuff({ name: x }));
```

---

# Regular Expressions

- When using regular expressions, always provide comments with example matching strings. This helps clarify the intent and usage of the regex for future readers and maintainers.

**Example:**

```ts
// Matches: "user@example.com", "test123@domain.org"
const emailRegex = /[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}/;
```

---

# Code Documentation and Comments

- Code should be self-documenting. Avoid comments that explain what the code is doing; instead, write clear code. Comments should generally explain why something is done, not what is happening.
- Exceptions can be made for logic-heavy or complex code, where brief explanations of what is happening are acceptable.

---

# Function Parameter Style

- Prefer functions that take a single object as a parameter. This makes function calls self-documenting and easier to maintain, and makes it easier to extend parameters in the future.
- This rule also applies to callback parameters (e.g., event handlers, array methods), and to function payloads (e.g., logging, actions).

**Example:**

```ts
// Preferred
function createUser({ name, age }: { name: string; age: number }) {}

function log({ message }: { message: string }) {}

// Not preferred
function createUser(name: string, age: number) {}
function log(message: string) {}
```

---

# Function Declaration Style

- Prefer using the `function` keyword for function declarations for hoisting and readability.
- Use arrow functions (`const fn = () => {}`) only for quick, inline callbacks (e.g., with `array.map`, event handlers, etc.).

**Example:**

```ts
// Preferred for declarations
function increment() {
  // ...
}

// Preferred for callbacks
numbers.map((n) => n + 1);
```

---

# TypeScript Array Type Preference

**Always use `Array<T>` instead of `T[]` for array types.**

This is more explicit and consistent, especially in generic contexts and when working with utility types.

**Example:**

```ts
// Preferred
const numbers: Array<number> = [1, 2, 3];

// Not preferred
const numbers: number[] = [1, 2, 3];
```
