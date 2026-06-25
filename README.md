# slidev-addon-counter

LaTeX-like multi-level counters for Slidev.

> Runtime registry experiment: this branch avoids source scanning by registering
> real `<Counter>` component instances at runtime. It fixes code-block false
> positives, but first render order across preview/overview/export can still
> make cross-slide numbering unstable. This prototype currently orders by
> component registration order, not by original slide source order.

## Usage

Enable the addon in your Slidev deck:

```md
---
addons:
  - slidev-addon-counter
---
```

Define counters in `slidev-addon-counter.config.ts` next to your deck entry:

```ts
import { defineCounterConfig } from "slidev-addon-counter/config";

export default defineCounterConfig({
  counters: {
    section: {
      levels: [
        {
          level: 1,
          alias: "chapter",
          style: "decimal",
          format: "第 %{:value} 章",
        },
        {
          level: 2,
          alias: "section",
          style: "decimal",
          format: "%{@-1:full}.%{:value}",
        },
      ],
    },
  },
});
```

Use counters in slides:

```md
<Counter id="section" level="chapter" />

<Counter id="section" level="section" />

<CounterIncrement id="theorem" level="theorem" />
<CounterDisplay id="theorem" level="theorem" />
```

`action="step"` increments and displays, `action="increment"` only increments,
and `action="display"` only displays the current value.

`<Counter>` renders plain text, not an HTML wrapper element. To style a counter,
wrap it yourself:

```md
<span class="text-red-500">
  <Counter id="section" level="section" />
</span>
```

Formats use `%{ref:kind}` placeholders. The `ref` may be empty for the
current level, so `%{:value}` is equivalent to `%{@0:value}`. Use relative
refs such as `%{@-1:full}` for parent levels, numeric refs such as
`%{2:value}`, and aliases such as `%{chapter:raw}`.

The first version supports `value`, `raw`, and `full`. A `full` placeholder may
only reference a shallower level.

## Development

```bash
source ~/.nvm/nvm.sh
nvm use
pnpm install
pnpm check
```

Preview the local addon:

```bash
pnpm dev
```
