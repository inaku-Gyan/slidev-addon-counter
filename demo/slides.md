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

# Basic section counter

Source

```md
Chapter <Counter id="section" level="chapter" />
<br>
Section <Counter id="section" level="section" />
<br>
Section <Counter id="section" level="section" />
<br>
Chapter <Counter id="section" level="chapter" />
<br>
Section <Counter id="section" level="section" />
```

Rendered

<div class="text-xl leading-10">
  Chapter <Counter id="section" level="chapter" />
  <br />
  Section <Counter id="section" level="section" />
  <br />
  Section <Counter id="section" level="section" />
  <br />
  Chapter <Counter id="section" level="chapter" />
  <br />
  Section <Counter id="section" level="section" />
</div>

---

# Alias and numeric levels

Source

```md
<CounterStep id="section" level="chapter" />

<CounterStep id="section" level="section" />

<CounterStep id="section" :level="2" />
```

Rendered

<div class="space-y-3 text-2xl">
  <div><CounterStep id="section" level="chapter" /></div>
  <div><CounterStep id="section" level="section" /></div>
  <div><CounterStep id="section" :level="2" /></div>
</div>

---

# Step, increment, display

Source

```md
Visible theorem:
<CounterStep id="theorem" level="theorem" />

Hidden theorem:
<CounterIncrement id="theorem" level="theorem" />

Latest theorem:
<CounterDisplay id="theorem" level="theorem" />
```

Rendered

<div class="space-y-4 text-xl">
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

# Independent counters

Source

```md
Section:
<CounterStep id="section" level="section" />

Theorem:
<CounterStep id="theorem" level="theorem" />

Section again:
<CounterStep id="section" level="section" />
```

Rendered

<div class="space-y-4 text-xl">
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

# Markdown heading composition

Source

```md
# <CounterStep id="section" level="chapter" /> Timers

## <CounterStep id="section" level="section" /> SysTick
```

Rendered

# <CounterStep id="section" level="chapter" /> Timers

## <CounterStep id="section" level="section" /> SysTick

---

# Styled plain text

Source

```md
<span class="text-sky-600 font-bold">
  <CounterStep id="section" level="section" />
</span>
HAL_Delay
```

Rendered

<p class="text-2xl">
  <span class="text-sky-600 font-bold">
    <CounterStep id="section" level="section" />
  </span>
  HAL_Delay
</p>

---

# Code samples are just code

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

# Config used by this demo

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

Rendered formats

<div class="grid grid-cols-3 gap-6 text-xl">
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
