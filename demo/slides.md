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

```vue
<Counter id="section" level="chapter" />
```

<Counter id="section" level="chapter" />

```vue
<Counter id="section" level="section" />
```

<Counter id="section" level="section" />

```vue
<Counter id="section" level="section" />
```

<Counter id="section" level="section" />

```vue
<Counter id="section" level="chapter" />
```

<Counter id="section" level="chapter" />

```vue
<Counter id="section" level="section" />
```

<Counter id="section" level="section" />

---

# Alias and numeric levels

```vue
<CounterStep id="section" level="chapter" />
```

<CounterStep id="section" level="chapter" />

```vue
<CounterStep id="section" level="section" />
```

<CounterStep id="section" level="section" />

```vue
<CounterStep id="section" :level="2" />
```

<CounterStep id="section" :level="2" />

---

# Step, increment, display

```vue
<CounterStep id="theorem" level="theorem" />
```

<CounterStep id="theorem" level="theorem" />

```vue
<CounterIncrement id="theorem" level="theorem" />
```

<CounterIncrement id="theorem" level="theorem" /> No text is rendered here.

```vue
<CounterDisplay id="theorem" level="theorem" />
```

<CounterDisplay id="theorem" level="theorem" />

---

# Independent counters

```vue
<CounterStep id="section" level="section" />
```

Section: <CounterStep id="section" level="section" />

```vue
<CounterStep id="theorem" level="theorem" />
```

Theorem: <CounterStep id="theorem" level="theorem" />

```vue
<CounterStep id="section" level="section" />
```

Section again: <CounterStep id="section" level="section" />

---

# Markdown heading composition

```vue
#
<CounterStep id="section" level="chapter" />
Timers
```

# <CounterStep id="section" level="chapter" /> Timers

```vue
##
<CounterStep id="section" level="section" />
SysTick
```

## <CounterStep id="section" level="section" /> SysTick

---

# Styled plain text

```vue
<span class="text-sky-600 font-bold">
  <CounterStep id="section" level="section" />
</span>
HAL_Delay
```

<span class="text-sky-600 font-bold">
  <CounterStep id="section" level="section" />
</span>
HAL_Delay

---

# Code samples are just code

````vue
Before:
<CounterDisplay id="section" level="section" />

```vue
<Counter id="section" level="section" />
``` After:
<CounterDisplay id="section" level="section" />
````

Before: <CounterDisplay id="section" level="section" />

```vue
<Counter id="section" level="section" />
```

After: <CounterDisplay id="section" level="section" />

---

# Config used by this demo

```ts
section: {
  levels: [
    { level: 1, alias: "chapter", format: "第 %{:value} 章" },
    { level: 2, alias: "section" },
  ],
}
```

Chapter: <CounterStep id="section" level="chapter" />

Section: <CounterStep id="section" level="section" />

```ts
theorem: {
  levels: [
    { level: 1, alias: "theorem", style: "upper-roman", format: "Theorem %{:value}" },
  ],
}
```

Theorem: <CounterStep id="theorem" level="theorem" />
