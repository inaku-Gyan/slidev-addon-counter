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
---

# Basic section counter

::left::

Source

```md
<Counter id="section" level="chapter" />

<Counter id="section" level="section" /> RTOS basics

<Counter id="section" level="section" /> Task scheduling
```

::right::

Rendered

<div class="text-3xl font-bold mb-8">
  <Counter id="section" level="chapter" />
</div>

<div class="text-xl mb-4">
  <Counter id="section" level="section" /> RTOS basics
</div>

<div class="text-xl">
  <Counter id="section" level="section" /> Task scheduling
</div>

---
layout: two-cols-header
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
---

# Plain text composition

::left::

Source

```md
## <CounterStep id="section" level="chapter" /> Timers

<span class="text-sky-600 font-bold">
  <CounterStep id="section" level="section" />
</span>
 SysTick
```

::right::

Rendered

<h2 class="text-3xl font-bold mb-8">
  <CounterStep id="section" level="chapter" /> Timers
</h2>

<p class="text-2xl">
  <span class="text-sky-600 font-bold">
    <CounterStep id="section" level="section" />
  </span>
  SysTick
</p>

---
layout: two-cols-header
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
