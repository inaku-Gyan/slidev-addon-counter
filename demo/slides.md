---
theme: default
addons:
  - ./
title: Slidev Addon Counter
---

# Counter

Multi-level counters for Slidev decks.

Use them for chapters, sections, theorems, examples, exercises, or any number
that should stay stable across Markdown and Vue components.

---

# <Counter id="demoSection" /> Install and enable

```bash
pnpm add -D slidev-addon-counter
```

```md
---
addons:
  - slidev-addon-counter
---
```

Create `slidev-addon-counter.config.ts` next to your Slidev entry file when you
need custom counters.

---

# <Counter id="demoSection" /> Core concepts

## Counter id

Each `id` has independent state.

## Level

Levels model hierarchy: chapter, section, subsection.

## Action

`step` increments and displays. `increment` and `display` split those actions.

## Format

Formats turn raw numbers into labels such as `Chapter 1.2` or `第一章`.

---
layout: section
---

# <Counter id="demoSection" /> Examples

---

## <Counter id="demoExample" :level="1" /> Default counter with no `id`

No config is needed for the default counter. You do not need to create a
`slidev-addon-counter.config.ts` file.

### Slide source

```md
Intro <Counter />

Topic <Counter :level="2" />

Current topic <CounterDisplay :level="2" />

Current top level <Counter action="display" />
```

### Rendered

Intro <Counter />

Topic <Counter :level="2" />

Current topic <CounterDisplay :level="2" />

Current top level <Counter action="display" />

---

<CounterInc id="demoExample" :level="1" />

## <Counter id="demoExample" /> Section counter: config

```ts
const sectionCounter = {
  id: "section",
  defaultLevel: "section",
  levels: [
    { level: 1, alias: "chapter", format: "Chapter %{:value}" },
    { level: 2, alias: "section", format: "%{@-1:full}.%{:value}" },
    { level: 3, alias: "subsection", format: "%{@-1:full}.%{:value}" },
  ],
};
```

`defaultLevel: "section"` means `<Counter id="section" />` uses level 2.

---

## <Counter id="demoExample" /> Section counter: usage and output

### Slide source

```md
# <Counter id="section" level="chapter" /> Introduction

## <Counter id="section" /> Background

## <Counter id="section" :level="2" /> Setup

### <Counter id="section" level="subsection" /> Details

### <Counter id="section" :level="3" /> More details
```

### Rendered

# <Counter id="section" level="chapter" /> Introduction

## <Counter id="section" /> Background

## <Counter id="section" :level="2" /> Setup

### <Counter id="section" level="subsection" /> Details

### <Counter id="section" :level="3" /> More details

---

<CounterInc id="demoExample" :level="1" />

## <Counter id="demoExample" /> Roman theorem counter: config

```ts
const theoremCounter = {
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
};
```

The `style` field formats the current value before it is inserted into
`%{:value}`.

---

## <Counter id="demoExample" /> Roman theorem counter: usage and output

### Slide source

```md
**<Counter id="theorem" />** Compactness
<br/>
**<Counter id="theorem" level="theorem" />** Completeness
<br/>
Current theorem: _<CounterDisplay id="theorem" />_

Next: <Counter id="theorem"/>

Next: <Counter id="theorem" action="step" />
```

### Rendered

**<Counter id="theorem" />** Compactness
<br/>
**<Counter id="theorem" level="theorem" />** Completeness
<br/>
Current theorem: _<CounterDisplay id="theorem" />_

Next: <Counter id="theorem"/>

Next: <Counter id="theorem" action="step" />

---

<CounterInc id="demoExample" :level="1" />

## <Counter id="demoExample" /> Independent counters: config

```ts
const counters = [
  { id: "section", defaultLevel: "section", levels: sectionLevels },
  { id: "theorem", defaultLevel: "theorem", levels: theoremLevels },
];
```

Different `id` values keep separate timelines, even when they appear on the same
slide.

---

## <Counter id="demoExample" /> Independent counters: usage and output

### Slide source

```md
Section <Counter id="section" />

Theorem <Counter id="theorem" />

Section <Counter id="section" />

Theorem <Counter id="theorem" />
```

### Rendered

Section <Counter id="section" />

Theorem <Counter id="theorem" />

Section <Counter id="section" />

Theorem <Counter id="theorem" />

---

<CounterInc id="demoExample" :level="1" />

## <Counter id="demoExample" /> Increment now, display later: config

```ts
const claimCounter = {
  id: "claim",
  defaultLevel: "claim",
  levels: [{ level: 1, alias: "claim", format: "Claim %{:value}" }],
};
```

Use this pattern when the number is reserved in one place and shown elsewhere.

---

## <Counter id="demoExample" /> Increment now, display later: usage and output

### Slide source

```md
<CounterInc id="claim" />
Current: <CounterDisplay id="claim" />

<Counter id="claim" action="increment" />
Current: <Counter id="claim" action="display" />

Next: <Counter id="claim" action="step" />
```

### Rendered

<CounterInc id="claim" />
Current: <CounterDisplay id="claim" />

<Counter id="claim" action="increment" />
Current: <Counter id="claim" action="display" />

Next: <Counter id="claim" action="step" />

---

<CounterInc id="demoExample" :level="1" />

## <Counter id="demoExample" /> Multi-level placeholders: config

### Config

```ts
const levels = [
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
];
```

### Placeholder meaning

```text
%{:value}         current level value
%{@-1:full}       parent level full text
%{chapter:raw}    raw number by alias
```

`full` lets a child level include the formatted parent label.

---

## <Counter id="demoExample" /> Multi-level placeholders: usage and output

### Slide source

```md
Format examples: <Counter id="section" level="chapter" />

Parent full text: <Counter id="section" level="section" />

Numeric level: <Counter id="section" :level="2" />
```

### Rendered

Format examples: <Counter id="section" level="chapter" />

Parent full text: <Counter id="section" level="section" />

Numeric level: <Counter id="section" :level="2" />

---

<CounterInc id="demoExample" :level="1" />

## <Counter id="demoExample" /> Reset behavior: config

```ts
const taskFlowCounter = {
  id: "taskFlow",
  defaultLevel: "task",
  levels: [
    { level: 1, alias: "phase", format: "Phase %{:value}", reset: "none" },
    { level: 2, alias: "task", format: "%{@-1:full} / Task %{:value}" },
  ],
};
```

`reset: "none"` preserves deeper state when the phase increments.

---

## <Counter id="demoExample" /> Reset behavior: usage and output

### Slide source

```md
<ul>
<li> <Counter id="taskFlow" level="phase" /> </li>
<li> <Counter id="taskFlow" /> </li>
<li> <Counter id="taskFlow" /> </li>
<li> <Counter id="taskFlow" level="phase" /> </li>
<li> <Counter id="taskFlow" level="task" /> </li>
</ul>
```

### Rendered

<ul>
<li> <Counter id="taskFlow" level="phase" /> </li>
<li> <Counter id="taskFlow" /> </li>
<li> <Counter id="taskFlow" /> </li>
<li> <Counter id="taskFlow" level="phase" /> </li>
<li> <Counter id="taskFlow" level="task" /> </li>
</ul>

---

<CounterInc id="demoExample" :level="1" />

## <Counter id="demoExample" /> Chinese chapter and section: config

```ts
const cnSectionCounter = {
  id: "cnSection",
  defaultLevel: "section",
  levels: [
    { level: 1, alias: "chapter", style: "cjk", format: "第%{:value}章" },
    {
      level: 2,
      alias: "section",
      style: "cjk",
      format: "%{@-1:full}第%{:value}节",
    },
  ],
};
```

---

## <Counter id="demoExample" /> Chinese chapter and section: usage and output

### Slide source

```md
# <Counter id="cnSection" level="chapter" /> 绪论

## <Counter id="cnSection" /> 研究背景

## <Counter id="cnSection" :level="2" /> 研究方法
```

### Rendered

# <Counter id="cnSection" level="chapter" /> 绪论

## <Counter id="cnSection" /> 研究背景

## <Counter id="cnSection" :level="2" /> 研究方法

---

## <Counter id="demoExample" :level="1" /> Styling and heading composition

Counters render plain text, so compose them with regular Markdown when you need
styling.

### Slide source

```md
## <Counter id="section" /> Timers

**<Counter id="section" level="subsection" />** How does `HAL_Delay` work?
```

### Rendered

## <Counter id="section" /> Timers

**<Counter id="section" level="subsection" />** How does `HAL_Delay` work?

---

## <Counter id="demoExample" :level="1" /> Code fences are inert

### Slide source

````md
Before: <CounterDisplay id="claim" />

```vue
<Counter id="claim" />
```

After: <CounterDisplay id="claim" />
````

### Rendered

Before: <CounterDisplay id="claim" />

```vue
<Counter id="claim" />
```

After: <CounterDisplay id="claim" />

---

# More examples

The full source for this deck lives in `demo/`.

Read the manual for every config field, placeholder kind, component prop, and
validation rule.

```bash
pnpm dev
```
