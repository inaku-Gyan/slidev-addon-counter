---
theme: default
addons:
  - ./
title: Slidev Addon Counter
---

# Slidev Addon Counter

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

<div class="concept-grid">
  <div>
    <h3>Counter id</h3>
    <p>Each <code>id</code> has independent state.</p>
  </div>
  <div>
    <h3>Level</h3>
    <p>Levels model hierarchy: chapter, section, subsection.</p>
  </div>
  <div>
    <h3>Action</h3>
    <p><code>step</code> increments and displays. <code>increment</code> and <code>display</code> split those actions.</p>
  </div>
  <div>
    <h3>Format</h3>
    <p>Formats turn raw numbers into labels such as <code>Chapter 1.2</code> or <code>第一章</code>.</p>
  </div>
</div>

---
layout: section
---

# <Counter id="demoSection" /> Examples

---

## <Counter id="demoExample" :level="1" /> Default counter with no `id`

<div class="example-grid">
  <div class="example-panel">

**Config**

No any config is needed for the default counter. You don't even need to create a `slidev-addon-counter.config.ts` file.

  </div>
  <div class="example-panel">

**Slide source**

```md
Intro <Counter />

Topic <Counter :level="2" />

Current topic <CounterDisplay :level="2" />

Current top level <Counter action="display" />
```

  </div>
  <div class="example-panel rendered-panel">

**Rendered**

Intro <Counter />

Topic <Counter :level="2" />

Current topic <CounterDisplay :level="2" />

Current top level <Counter action="display" />

  </div>
</div>

---

<CounterInc id="demoExample" :level="1" />

## <Counter id="demoExample" /> Section counter: config

<div class="example-panel wide-panel">

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

</div>

`defaultLevel: "section"` means `<Counter id="section" />` uses level 2.

---

## <Counter id="demoExample" /> Section counter: usage and output

<div class="two-col">
  <div class="example-panel">

**Slide source**

```md
# <Counter id="section" level="chapter" /> Introduction

## <Counter id="section" /> Background

## <Counter id="section" :level="2" /> Setup

### <Counter id="section" level="subsection" /> Details

### <Counter id="section" :level="3" /> More details
```

  </div>
  <div class="example-panel rendered-panel">

**Rendered**

<p class="h1-like"><Counter id="section" level="chapter" /> Introduction</p>

<p class="h2-like"><Counter id="section" /> Background</p>

<p class="h2-like"><Counter id="section" :level="2" /> Setup</p>

<p class="h3-like"><Counter id="section" level="subsection" /> Details</p>

<p class="h3-like"><Counter id="section" :level="3" /> More details</p>

  </div>
</div>

---

<CounterInc id="demoExample" :level="1" />

## <Counter id="demoExample" /> Roman theorem counter: config

<div class="example-panel wide-panel">

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

</div>

The `style` field formats the current value before it is inserted into
`%{:value}`.

---

## <Counter id="demoExample" /> Roman theorem counter: usage and output

<div class="two-col">
  <div class="example-panel">

**Slide source**

```md
<Counter id="theorem" /> Compactness

<Counter id="theorem" level="theorem" /> Completeness

Current theorem: <CounterDisplay id="theorem" />
```

  </div>
  <div class="example-panel rendered-panel">

**Rendered**

<Counter id="theorem" /> Compactness

<Counter id="theorem" level="theorem" /> Completeness

Current theorem: <CounterDisplay id="theorem" />

  </div>
</div>

---

<CounterInc id="demoExample" :level="1" />

## <Counter id="demoExample" /> Independent counters: config

<div class="example-panel wide-panel">

```ts
const counters = [
  { id: "section", defaultLevel: "section", levels: sectionLevels },
  { id: "theorem", defaultLevel: "theorem", levels: theoremLevels },
];
```

</div>

Different `id` values keep separate timelines, even when they appear on the same
slide.

---

## <Counter id="demoExample" /> Independent counters: usage and output

<div class="two-col">
  <div class="example-panel">

**Slide source**

```md
Section <Counter id="section" />

Theorem <Counter id="theorem" />

Section <Counter id="section" />

Theorem <Counter id="theorem" />
```

  </div>
  <div class="example-panel rendered-panel">

**Rendered**

Section <Counter id="section" />

Theorem <Counter id="theorem" />

Section <Counter id="section" />

Theorem <Counter id="theorem" />

  </div>
</div>

---

<CounterInc id="demoExample" :level="1" />

## <Counter id="demoExample" /> Increment now, display later: config

<div class="example-panel wide-panel">

```ts
const claimCounter = {
  id: "claim",
  defaultLevel: "claim",
  levels: [{ level: 1, alias: "claim", format: "Claim %{:value}" }],
};
```

</div>

Use this pattern when the number is reserved in one place and shown elsewhere.

---

## <Counter id="demoExample" /> Increment now, display later: usage and output

<div class="two-col">
  <div class="example-panel">

**Slide source**

```md
<CounterInc id="claim" />
Current: <CounterDisplay id="claim" />

<Counter id="claim" action="increment" />
Current: <Counter id="claim" action="display" />

Next: <Counter id="claim" action="step" />
```

  </div>
  <div class="example-panel rendered-panel">

**Rendered**

<CounterInc id="claim" />
Current: <CounterDisplay id="claim" />

<Counter id="claim" action="increment" />
Current: <Counter id="claim" action="display" />

Next: <Counter id="claim" action="step" />

  </div>
</div>

---

<CounterInc id="demoExample" :level="1" />

## <Counter id="demoExample" /> Multi-level placeholders: config

<div class="two-col">
  <div class="example-panel">

**Config**

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

  </div>
  <div class="example-panel">

**Placeholder meaning**

```text
%{:value}         current level value
%{@-1:full}       parent level full text
%{chapter:raw}    raw number by alias
```

`full` lets a child level include the formatted parent label.

  </div>
</div>

---

## <Counter id="demoExample" /> Multi-level placeholders: usage and output

<div class="two-cols">
  <div class="example-panel">

**Slide source**

```md
<Counter id="section" level="chapter" /> Format examples

<Counter id="section" level="section" /> Parent full text

<Counter id="section" :level="2" /> Numeric level
```

  </div>
  <div class="example-panel rendered-panel">

**Rendered**

<Counter id="section" level="chapter" /> Format examples

<Counter id="section" level="section" /> Parent full text

<Counter id="section" :level="2" /> Numeric level

  </div>
</div>

---

<CounterInc id="demoExample" :level="1" />

## <Counter id="demoExample" /> Reset behavior: config

<div class="example-panel wide-panel">

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

</div>

`reset: "none"` preserves deeper state when the phase increments.

---

## <Counter id="demoExample" /> Reset behavior: usage and output

<div class="two-col">
  <div class="example-panel">

**Slide source**

```md
<Counter id="taskFlow" level="phase" />
<Counter id="taskFlow" />
<Counter id="taskFlow" />
<Counter id="taskFlow" level="phase" />
<Counter id="taskFlow" level="task" />
```

  </div>
  <div class="example-panel rendered-panel">

**Rendered**

<Counter id="taskFlow" level="phase" />

<Counter id="taskFlow" />

<Counter id="taskFlow" />

<Counter id="taskFlow" level="phase" />

<Counter id="taskFlow" level="task" />

  </div>
</div>

---

<CounterInc id="demoExample" :level="1" />

## <Counter id="demoExample" /> Chinese chapter and section: config

<div class="example-panel wide-panel">

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

</div>

---

## <Counter id="demoExample" /> Chinese chapter and section: usage and output

<div class="two-col">
  <div class="example-panel">

**Slide source**

```md
# <Counter id="cnSection" level="chapter" /> 绪论

## <Counter id="cnSection" /> 研究背景

## <Counter id="cnSection" :level="2" /> 研究方法
```

  </div>
  <div class="example-panel rendered-panel">

**Rendered**

<p class="h1-like"><Counter id="cnSection" level="chapter" /> 绪论</p>

<p class="h2-like"><Counter id="cnSection" /> 研究背景</p>

<p class="h2-like"><Counter id="cnSection" :level="2" /> 研究方法</p>

  </div>
</div>

---

<CounterInc id="demoExample" :level="1" />

## <Counter id="demoExample" /> Styling and heading composition: config

<div class="example-panel wide-panel">

```ts
const sectionCounter = {
  id: "section",
  defaultLevel: "section",
  levels: sectionLevels,
};
```

</div>

Counters render plain text, so wrap them yourself when you need styling.

---

## <Counter id="demoExample" /> Styling and heading composition: usage and output

<div class="two-col">
  <div class="example-panel">

**Slide source**

```md
## <Counter id="section" /> Timers

<span class="text-sky-600 font-bold">
  <Counter id="section" />
</span>
How does `HAL_Delay` work?
```

  </div>
  <div class="example-panel rendered-panel">

**Rendered**

<p class="h2-like"><Counter id="section" /> Timers</p>

<span class="text-sky-600 font-bold">
  <Counter id="section" />
</span>
How does <code>HAL_Delay</code> work?

  </div>
</div>

---

## <Counter id="demoExample" :level="1" /> Code fences are inert

<div class="example-grid">
  <div class="example-panel">

**Config**

```ts
const claimCounter = {
  id: "claim",
  defaultLevel: "claim",
  levels: claimLevels,
};
```

  </div>
  <div class="example-panel">

**Slide source**

````md
Before: <CounterDisplay id="claim" />

```vue
<Counter id="claim" />
```

After: <CounterDisplay id="claim" />
````

  </div>
  <div class="example-panel rendered-panel">

**Rendered**

Before: <CounterDisplay id="claim" />

```vue
<Counter id="claim" />
```

After: <CounterDisplay id="claim" />

  </div>
</div>

---

# More examples

The full source for this deck lives in `demo/`.

Read the manual for every config field, placeholder kind, component prop, and
validation rule.

```bash
pnpm dev
```

<style>
.concept-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.concept-grid > div,
.example-panel {
  border: 1px solid #d4d4d8;
  border-radius: 8px;
  padding: 0.85rem;
  background: #ffffff;
}

.concept-grid h3 {
  margin: 0 0 0.35rem;
  font-size: 1rem;
  font-weight: 700;
}

.concept-grid p,
.example-panel p {
  margin: 0.25rem 0;
}

.two-col,
.example-grid {
  display: grid;
  gap: 1rem;
}

.two-col {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.example-grid {
  grid-template-columns: 1fr 1.18fr 0.9fr;
}

.wide-panel {
  max-width: 50rem;
}

.rendered-panel {
  font-size: 0.95rem;
}

.h1-like,
.h2-like,
.h3-like {
  font-weight: 700;
  line-height: 1.2;
}

.h1-like {
  font-size: 1.45rem;
}

.h2-like {
  font-size: 1.2rem;
}

.h3-like {
  font-size: 1rem;
}

.slidev-layout pre {
  max-height: 19rem;
}
</style>
