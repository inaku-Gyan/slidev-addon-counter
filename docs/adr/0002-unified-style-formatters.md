---
status: accepted
---

# Unify built-in styles and custom formatters

Counter styles can be either a built-in name or a user-provided synchronous formatter function. Configuration normalizes both into one `CounterFormatter` per level, so rendering has a single path: read the logical counter value, run the level formatter, and substitute the resulting display token into the level format. This keeps built-in and custom behavior on the same code path, lets `formatCounterValue()` accept both forms, and avoids a second configuration field with precedence rules. The trade-off is that normalized levels no longer retain the built-in style name, and custom formatters run in the Node-side config load rather than in the browser, so they must be synchronous and must return a string.
