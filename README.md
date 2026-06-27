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

### Default Counter

Components without `id` use the built-in `default` counter. The addon provides it automatically, even when you configure other counters:

```md
# <Counter /> Introduction

## <Counter :level="2" /> Background

Current section: <CounterDisplay :level="2" />
```

### Configured Counter

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
      ],
    },
  ],
});
```

Use the configured aliases and default level in slides:

```md
# <Counter id="section" level="chapter" /> Introduction

## <Counter id="section" /> Background

Current section: <CounterDisplay id="section" />
```

## More Examples

The [live demo](https://inaku-Gyan.github.io/slidev-addon-counter/) shows richer examples with the config, slide source, and rendered output side by side.

You can also read the complete demo source in [`demo/`](./demo/).

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
