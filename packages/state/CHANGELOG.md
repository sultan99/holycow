## v1.2.0
**Features**

🗃️ Context state

## v1.1.2

**Bug fix**

🐞 [Cannot create proxy with a non-object as target or handler](https://github.com/sultan99/holycow/issues/5).

## v1.1.1
**Bug fix**

🐞 [Reset removes built-in functions](https://github.com/sultan99/holycow/issues/4)

## v1.1.0
**Feature**

📢 Signal Events

## v1.0.0
**Features**

- 🍃 Atomic state updates
- 🧮 Computed values come with caching and lazy evaluation
- 📬 Subscription to state changes
- 🧩 Utility functions (compose, curry, pick, append, update)
- 🎣 No external dependency, [Ramda](https://github.com/ramda/ramda) library is removed

**Breaking changes**

🎬 Actions

- Actions must now be wrapped with the `action` function
- New declaration interface: `action(state => payload => { ... })`

🧮 Computed values

- Computed values must now be wrapped with the `computed` function
- Payload from computed functions has been removed
- New declaration interface: `computed(state => ...)`

## v0.1.1
**Chore**

- Update packages
- Remove Lerna

## v0.1.0
**Features**

- 🧠 Greedy rendering
- 🧮 Computed values with hook nesting
- 🎬 Actions
- 🗿 Static variables
- 🤹 Selectors
- 📎 Strongly typed with TypeScript.
