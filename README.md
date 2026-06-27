# slidev-addon-counter

English | [中文](./docs/README.zh-CN.md)

Multi-level counters for Slidev, useful for chapter, section, theorem, and other reusable numbers.

[Live demo](https://inaku-Gyan.github.io/slidev-addon-counter/)

## Requirements

- Node.js >= 22.18.0
- Slidev >= 52.0.0

## Install

```bash
pnpm add -D slidev-addon-counter
```

Enable the addon in your Slidev deck frontmatter:

```yml
addons:
  - slidev-addon-counter
```

## Quick Examples

### No Config

Without a config file, components use the built-in `default` counter:

```md
# <Counter /> Introduction

## <Counter :level="2" /> Background

Current section: <CounterDisplay :level="2" />
```

### Level Aliases

Create `slidev-addon-counter.config.ts` next to your Slidev entry file:

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

Use aliases, numeric levels, or the configured default level in slides:

```md
# <Counter id="section" level="chapter" /> Introduction

## <Counter id="section" /> Background

Current section: <CounterDisplay id="section" />

### <Counter id="section" level="subsection" /> Details

### <Counter id="section" :level="3" /> More Details
```

### Roman Theorems

Configure a theorem counter with Roman numerals and a custom format.

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

### Actions

Use shorthand components or pass `action` to `<Counter>`:

```md
<CounterInc id="theorem" />
Current theorem: <CounterDisplay id="theorem" />

<Counter id="theorem" action="increment" />
Current theorem: <Counter id="theorem" action="display" />

Next theorem: <Counter id="theorem" action="step" />
```

`<Counter>` increments and displays by default. `<CounterInc>` increments without rendering text. `<CounterDisplay>` displays the current value without incrementing.

## Manual

See the [user manual](./docs/manual.md) for full configuration, format syntax, component behavior, and common patterns.

## Development

```bash
source ~/.nvm/nvm.sh
nvm use
pnpm install
pnpm check
```

Preview the local demo:

```bash
pnpm dev
```
