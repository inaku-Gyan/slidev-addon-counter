---
theme: default
addons:
  - ./
title: Slidev Addon Counter
---

# Slidev Addon Counter

Development preview for `slidev-addon-counter`.

Counters render as plain text and can be composed inside normal Markdown, Vue
components, and Slidev layouts.

---
layout: two-cols-header
layoutClass: counter-demo-two-cols
---

# Basic section counter

::left::

Source

```md
<Counter id="section" level="chapter" />

<Counter id="section" level="section" /> RTOS basics

# <Counter id="section" level="section" /> Task scheduling
```

::right::

Rendered

<div class="text-3xl font-bold mb-8">
  <Counter id="section" level="chapter" />
</div>

<div class="text-xl mb-4">
  <Counter id="section" level="section" /> RTOS basics
</div>

# <Counter id="section" level="section" /> Task scheduling

---
layout: two-cols-header
layoutClass: counter-demo-two-cols
---

# Alias and numeric levels

::left::

Source

```md
<CounterStep id="section" level="chapter" />

<CounterStep id="section" level="section" />

<CounterStep id="section" :level="2" />
```

::right::

Rendered

<div class="space-y-4 text-2xl">
  <div><CounterStep id="section" level="chapter" /></div>
  <div><CounterStep id="section" level="section" /></div>
  <div><CounterStep id="section" :level="2" /></div>
</div>

---
layout: two-cols-header
layoutClass: counter-demo-two-cols
---

# Step, increment, display

::left::

Source

```md
Visible theorem:
<CounterStep id="theorem" level="theorem" />

Hidden theorem:
<CounterIncrement id="theorem" level="theorem" />

Latest theorem:
<CounterDisplay id="theorem" level="theorem" />
```

::right::

Rendered

<div class="space-y-6 text-xl">
  <p>
    Visible theorem:
    <strong><CounterStep id="theorem" level="theorem" /></strong>
  </p>

  <p>
    Hidden theorem:
    <CounterIncrement id="theorem" level="theorem" />
    <span class="opacity-60">(no text is rendered here)</span>
  </p>

  <p>
    Latest theorem:
    <strong><CounterDisplay id="theorem" level="theorem" /></strong>
  </p>
</div>

---
layout: two-cols-header
layoutClass: counter-demo-two-cols
---

# Independent counters

::left::

Source

```md
Section:
<CounterStep id="section" level="section" />

Theorem:
<CounterStep id="theorem" level="theorem" />

Section again:
<CounterStep id="section" level="section" />
```

::right::

Rendered

<div class="space-y-5 text-xl">
  <p>
    Section:
    <strong><CounterStep id="section" level="section" /></strong>
  </p>

  <p>
    Theorem:
    <strong><CounterStep id="theorem" level="theorem" /></strong>
  </p>

  <p>
    Section again:
    <strong><CounterStep id="section" level="section" /></strong>
  </p>
</div>

---
layout: two-cols-header
layoutClass: counter-demo-two-cols
---

# Plain text composition

::left::

Source

```md
# <CounterStep id="section" level="chapter" /> Timers

## <CounterStep id="section" level="section" /> SysTick

<span class="text-sky-600 font-bold">
  <CounterStep id="section" level="section" />
</span>
 HAL_Delay
```

::right::

Rendered

# <CounterStep id="section" level="chapter" /> Timers

## <CounterStep id="section" level="section" /> SysTick

<p class="text-2xl">
  <span class="text-sky-600 font-bold">
    <CounterStep id="section" level="section" />
  </span>
  HAL_Delay
</p>

---
layout: two-cols-header
layoutClass: counter-demo-two-cols
---

# Code samples are just code

::left::

Source

````md
Before:
<CounterDisplay id="section" level="section" />

```vue
<Counter id="section" level="section" />
```

After:
<CounterDisplay id="section" level="section" />
````

::right::

Rendered

<div class="space-y-4 text-xl">
  <p>
    Before:
    <strong><CounterDisplay id="section" level="section" /></strong>
  </p>

```vue
<Counter id="section" level="section" />
```

  <p>
    After:
    <strong><CounterDisplay id="section" level="section" /></strong>
  </p>
</div>

---
layout: two-cols-header
layoutClass: counter-demo-two-cols
---

# Config used by this demo

::left::

Source

```ts
export default defineCounterConfig({
  counters: {
    section: {
      levels: [
        {
          level: 1,
          alias: "chapter",
          format: "第 %{:value} 章",
        },
        {
          level: 2,
          alias: "section",
        },
      ],
    },
    theorem: {
      levels: [
        {
          level: 1,
          alias: "theorem",
          style: "upper-roman",
          format: "Theorem %{:value}",
        },
      ],
    },
  },
});
```

::right::

Rendered formats

<div class="space-y-6 text-xl">
  <div>
    <div class="text-sm uppercase tracking-wide opacity-60">chapter</div>
    <div class="text-3xl font-bold"><CounterStep id="section" level="chapter" /></div>
  </div>

  <div>
    <div class="text-sm uppercase tracking-wide opacity-60">section</div>
    <div class="text-3xl font-bold"><CounterStep id="section" level="section" /></div>
  </div>

  <div>
    <div class="text-sm uppercase tracking-wide opacity-60">theorem</div>
    <div class="text-3xl font-bold"><CounterStep id="theorem" level="theorem" /></div>
  </div>
</div>

<style>
.counter-demo-two-cols {
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  column-gap: 3rem;
}

.counter-demo-two-cols .col-left,
.counter-demo-two-cols .col-right {
  min-width: 0;
}

.counter-demo-two-cols .col-left {
  padding-right: 0.5rem;
}

.counter-demo-two-cols .col-right {
  padding-left: 1rem;
  border-left: 1px solid rgb(148 163 184 / 0.28);
}

.counter-demo-two-cols .slidev-code-wrapper,
.counter-demo-two-cols pre {
  max-width: 100%;
}

.counter-demo-two-cols pre code {
  font-size: 0.72rem;
  line-height: 1.38;
}
</style>
