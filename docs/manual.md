# slidev-addon-counter User Manual

English | [中文](./manual.zh-CN.md)

`slidev-addon-counter` provides LaTeX-like multi-level counters for Slidev. Use it to generate stable chapter, section, theorem, example, or other reusable numbers in Markdown, Vue components, and Slidev layouts.

## Requirements

- Node.js >= 22.18.0
- Slidev >= 52.0.0

## Install and Enable

Install the addon:

```bash
pnpm add -D slidev-addon-counter
```

Enable it in your Slidev deck frontmatter:

```md
---
addons:
  - slidev-addon-counter
---
```

## Core Concepts

A counter is identified by an `id`. Each counter keeps its own state and does not affect other counters.

A counter can have any number of levels. Levels are positive integers starting from `1` and usually represent hierarchy:

```text
level 1 -> chapter
level 2 -> section
level 3 -> subsection
```

Every `<Counter>` or `<CounterInc>` increments the selected level. By default, incrementing a shallower level resets deeper levels. For example, after `1.2`, incrementing level 1 produces `2`, and the next level 2 value starts at `2.1`.

## Config File

Create `slidev-addon-counter.config.ts` next to the Slidev entry file. The addon loads it automatically.

```ts
import { defineCounterConfig } from "slidev-addon-counter/config";

export default defineCounterConfig({
  counters: [
    {
      id: "section",
      defaultLevel: "section",
      levels: [
        {
          level: 1,
          alias: "chapter",
          style: "decimal",
          format: "Chapter %{:value}",
        },
        {
          level: 2,
          alias: "section",
          style: "decimal",
          format: "%{@-1:full}.%{:value}",
        },
      ],
    },
  ],
});
```

If there is no config file, the addon creates a `default` counter. The default counter supports any level:

```md
<Counter />
<Counter :level="2" />
```

If you define custom counters and still use components without `id`, declare `default` explicitly:

```ts
export default defineCounterConfig({
  counters: [{ id: "default" }],
});
```

## Counter Config

Top-level config:

```ts
export default defineCounterConfig({
  counters: [
    {
      id: "section",
      defaultLevel: 1,
      levels: [],
    },
  ],
});
```

`counters` is optional. If omitted, it behaves like `{ counters: [{ id: "default" }] }`.

Each configured counter definition:

| Field          | Type                   | Required | Description                                                                                           |
| -------------- | ---------------------- | -------- | ----------------------------------------------------------------------------------------------------- |
| `id`           | `string`               | Yes      | Counter name. Components reference it through `id`.                                                   |
| `defaultLevel` | `number \| string`     | No       | Level used when a component omits `level`. Defaults to `1`. Strings must be configured level aliases. |
| `levels`       | `CounterLevelConfig[]` | No       | Configures selected levels with formats, aliases, styles, and reset rules. Other levels use defaults. |

Config `id` must be a non-empty string and cannot be duplicated. This requirement applies to counter definitions in `counters`; component `id` props are optional and default to `"default"`.

## Level Config

Each level supports these fields:

| Field    | Type                | Default                                                      | Description                                           |
| -------- | ------------------- | ------------------------------------------------------------ | ----------------------------------------------------- |
| `level`  | `number`            | None                                                         | Positive integer level, starting from `1`.            |
| `alias`  | `string`            | None                                                         | Level alias for component props and format refs.      |
| `style`  | `CounterStyle`      | `"decimal"`                                                  | Number style for this level.                          |
| `format` | `string`            | level 1: `%{:value}`; deeper levels: `%{@-1:full}.%{:value}` | Full display text for this level.                     |
| `reset`  | `"lower" \| "none"` | `"lower"`                                                    | Whether incrementing this level resets deeper levels. |

Unconfigured levels are still usable. For example, if you only configure level 1, `level={2}` still works and defaults to the `1.1` style.

`alias` must be identifier-like, such as `chapter`, `section_2`, or `theorem-main`. It cannot be all digits, start with `@`, or contain `:`.

## Components

### `<Counter>`

Increments or displays a counter.

```md
<Counter id="section" level="chapter" />
<Counter id="section" :level="2" />
<Counter id="section" />
```

Props:

| Prop     | Type                                 | Default                | Description                         |
| -------- | ------------------------------------ | ---------------------- | ----------------------------------- |
| `id`     | `string`                             | `"default"`            | Counter name.                       |
| `level`  | `number \| string`                   | Counter `defaultLevel` | Optional number level or alias.     |
| `action` | `"step" \| "increment" \| "display"` | `"step"`               | Operation type for this occurrence. |

If `level` is omitted, the component uses that counter's `defaultLevel`. The fallback `defaultLevel` is `1`.

If `id` is omitted, the component uses the `default` counter. That counter exists automatically when `counters` is omitted, or when it is declared explicitly as `{ id: "default" }`.

Actions:

| Action      | Behavior                                        |
| ----------- | ----------------------------------------------- |
| `step`      | Increment first, then display the new value.    |
| `increment` | Increment only and render no text.              |
| `display`   | Display the current value without incrementing. |

### `<CounterInc>`

`<CounterInc>` is shorthand for `<Counter action="increment">`:

```md
<CounterInc id="theorem" />
```

It updates the counter state but renders no text.

### `<CounterDisplay>`

`<CounterDisplay>` is shorthand for `<Counter action="display">`:

```md
<CounterDisplay id="theorem" />
```

It only displays the current value and does not increment.

## Use in Markdown

Components can be used in headings, paragraphs, Vue fragments, and Slidev layouts:

```md
# <Counter id="section" level="chapter" /> Timers

## <Counter id="section" level="section" /> SysTick

Theorem <Counter id="theorem" level="theorem" />.
```

Counter-looking text inside fenced code blocks or inline code is ignored:

````md
```vue
<Counter id="section" level="section" />
```

`<Counter id="section" level="section" />`
````

## Styling

`<Counter>` renders plain text and does not create a wrapper element. Wrap it yourself when you need styling:

```md
<span class="text-sky-600 font-bold">
  <Counter id="section" level="section" />
</span>
```

That also makes it easy to compose directly in headings:

```md
# <Counter id="section" level="chapter" /> Introduction
```

## Number Styles

`style` controls how `%{...:value}` is displayed.

| Style         | Example            | Description                                |
| ------------- | ------------------ | ------------------------------------------ |
| `decimal`     | `1`, `2`, `12`     | Decimal digits.                            |
| `zero`        | `01`, `02`, `12`   | At least two digits, padded with zero.     |
| `lower-alpha` | `a`, `b`, `aa`     | Lowercase alphabetic sequence.             |
| `upper-alpha` | `A`, `B`, `AA`     | Uppercase alphabetic sequence.             |
| `lower-roman` | `i`, `ii`, `xiv`   | Lowercase Roman numerals, range `1..3999`. |
| `upper-roman` | `I`, `II`, `XIV`   | Uppercase Roman numerals, range `1..3999`. |
| `cjk`         | `一`, `二`, `十二` | Chinese numerals, range `0..9999`.         |

Example:

```ts
export default defineCounterConfig({
  counters: [
    {
      id: "theorem",
      levels: [
        {
          level: 1,
          alias: "theorem",
          style: "upper-roman",
          format: "Theorem %{:value}",
        },
      ],
    },
  ],
});
```

```md
<Counter id="theorem" level="theorem" />
```

Output:

```text
Theorem I
```

## Format Placeholders

`format` uses `%{ref:kind}` placeholders.

`ref` selects a level. `kind` selects what to render from that level.

### Ref Syntax

| Ref            | Example          | Description                                         |
| -------------- | ---------------- | --------------------------------------------------- |
| Empty          | `%{:value}`      | Current level, equivalent to `%{@0:value}`.         |
| Number         | `%{1:value}`     | Specific numeric level.                             |
| Relative level | `%{@-1:full}`    | Relative to the current level. `@-1` is the parent. |
| Alias          | `%{chapter:raw}` | Level alias from config.                            |

### Kind Syntax

| Kind    | Example       | Description                                      |
| ------- | ------------- | ------------------------------------------------ |
| `value` | `%{:value}`   | Value formatted with the referenced level style. |
| `raw`   | `%{:raw}`     | Raw numeric value, without `style`.              |
| `full`  | `%{@-1:full}` | Full `format` output of the referenced level.    |

`full` can only reference shallower levels. It cannot reference the current level or deeper levels because that would be recursive or unstable.

Common two-level format:

```ts
{
  level: 1,
  alias: "chapter",
  format: "Chapter %{:value}",
},
{
  level: 2,
  alias: "section",
  format: "%{@-1:full}.%{:value}",
}
```

If the current state is `[2, 3]`, level 2 outputs:

```text
Chapter 2.3
```

## Default Format

When `format` is omitted:

```text
level 1: %{:value}
level 2+: %{@-1:full}.%{:value}
```

So a default multi-level counter outputs:

```md
<Counter id="demo" :level="1" />
<Counter id="demo" :level="2" />
<Counter id="demo" :level="3" />
```

```text
1
1.1
1.1.1
```

## Reset Rules

`reset` controls whether incrementing the current level clears deeper levels.

The default is `"lower"`:

```ts
{
  level: 1,
  reset: "lower",
}
```

Behavior:

```text
1
1.1
1.2
2
2.1
```

With `"none"`, deeper-level state is preserved when the current level increments:

```ts
{
  level: 1,
  reset: "none",
}
```

Use `"none"` only for cases where child numbering should continue across parent changes. Most chapter and section counters should keep the default `"lower"`.

## Multiple Counters

Counters with different `id` values keep independent state:

```ts
export default defineCounterConfig({
  counters: [
    { id: "section" },
    {
      id: "theorem",
      levels: [
        {
          level: 1,
          alias: "theorem",
          style: "upper-roman",
          format: "Theorem %{:value}",
        },
      ],
    },
  ],
});
```

```md
<Counter id="section" :level="1" />
<Counter id="theorem" level="theorem" />
<Counter id="section" :level="2" />
<Counter id="theorem" level="theorem" />
```

Possible output:

```text
1
Theorem I
1.1
Theorem II
```

## Level References in Components

The optional component `level` prop can be a static string, numeric binding, or string binding:

```md
<Counter id="section" />
<Counter id="section" level="chapter" />
<Counter id="section" level="2" />
<Counter id="section" :level="2" />
<Counter id="section" :level="'section'" />
```

Omit `level` to use the counter's `defaultLevel`. `:level` only supports string or number literals. Do not pass runtime variables, because the addon scans slides and builds the complete counter timeline at build time.

## Common Patterns

### Default Counter Without Config

If there is no config file, or if `counters` is omitted, use the built-in `default` counter by leaving out `id`:

```md
# <Counter /> Introduction

## <Counter :level="2" /> Background

Current section: <CounterDisplay :level="2" />
```

### Chapters and Sections

```ts
export default defineCounterConfig({
  counters: [
    {
      id: "section",
      defaultLevel: "section",
      levels: [
        {
          level: 1,
          alias: "chapter",
        },
        {
          level: 2,
          alias: "section",
        },
        {
          level: 3,
          alias: "subsection",
        },
      ],
    },
  ],
});
```

```md
# <Counter id="section" level="chapter" /> Introduction

## <Counter id="section" /> Background

Current section: <CounterDisplay id="section" />

### <Counter id="section" level="subsection" /> Details

### <Counter id="section" :level="3" /> More Details
```

### Theorem Numbers

```ts
export default defineCounterConfig({
  counters: [
    {
      id: "theorem",
      defaultLevel: "theorem",
      levels: [
        {
          level: 1,
          alias: "theorem",
          style: "upper-roman",
          format: "Theorem %{:value}",
        },
      ],
    },
  ],
});
```

```md
<Counter id="theorem" /> Compactness

<Counter id="theorem" /> Completeness
```

### Increment Now, Display Later

```md
<CounterInc id="theorem" />

Current theorem number: <CounterDisplay id="theorem" />

<Counter id="theorem" action="increment" />

Current theorem number: <Counter id="theorem" action="display" />

Next theorem: <Counter id="theorem" action="step" />
```

## Limitations and Notes

`level` is optional. Missing `level` uses the selected counter's `defaultLevel`, which defaults to `1`.

`defaultLevel` must be a positive integer, numeric string, or configured alias. Relative references such as `@+1` are not valid for `defaultLevel`.

Counter `id` values must be defined in config. The only exception is when there is no config file; then the addon provides `default` automatically.

Levels and aliases cannot be duplicated within the same counter.

`format` placeholders must include a colon, such as `%{:value}`. `%{value}` is invalid.

`full` cannot reference the current level or deeper levels. In a level 2 `format`, `%{@-1:full}` is valid, but `%{:full}` and `%{@+1:full}` are not.

Roman styles support `1..3999`. CJK style supports `0..9999`. Normal increments do not produce `0`, but `display` can show `0` if the selected level has not been incremented yet.

## TypeScript API

Config files can import helpers and types from `slidev-addon-counter/config`:

```ts
import {
  defineCounterConfig,
  type CounterConfig,
  type CounterDefinition,
  type CounterLevelConfig,
  type CounterReset,
  type CounterStyle,
} from "slidev-addon-counter/config";
```

Most configs only need `defineCounterConfig`:

```ts
export default defineCounterConfig({
  counters: [{ id: "section" }],
});
```
