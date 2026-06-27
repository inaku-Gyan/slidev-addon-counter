# slidev-addon-counter

English | [中文](./docs/README.zh-CN.md)

Multi-level counters for Slidev, useful for chapter, section, theorem, and other reusable numbers.

## Install

```bash
pnpm add -D slidev-addon-counter
```

Enable the addon in your Slidev deck frontmatter:

```md
---
addons:
  - slidev-addon-counter
---
```

## Quick Example

Create `slidev-addon-counter.config.ts` next to your Slidev entry file:

```ts
import { defineCounterConfig } from "slidev-addon-counter/config";

export default defineCounterConfig({
  counters: [
    {
      id: "section",
      levels: [
        {
          level: 1,
          alias: "chapter",
          format: "Chapter %{:value}",
        },
        {
          level: 2,
          alias: "section",
          format: "%{@-1:full}.%{:value}",
        },
      ],
    },
  ],
});
```

Use counters in slides:

```md
# <Counter id="section" level="chapter" /> Introduction

## <Counter id="section" level="section" /> Background

Current section: <CounterDisplay id="section" level="section" />
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
