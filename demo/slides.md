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
<Counter id="section" level="chapter" />
```

<Counter id="section" level="chapter" />

```vue
<Counter id="section" level="section" />
```

<Counter id="section" level="section" />

```vue
<Counter id="section" :level="2" />
```

<Counter id="section" :level="2" />

---

# Step, increment, display

```vue
<Counter id="theorem" level="theorem" />
```

<Counter id="theorem" level="theorem" />

```vue
<CounterInc id="theorem" level="theorem" />
```

<CounterInc id="theorem" level="theorem" /> No text is rendered here.

```vue
<CounterDisplay id="theorem" level="theorem" />
```

<CounterDisplay id="theorem" level="theorem" />

---

# Independent counters

```vue
<Counter id="section" level="section" />
```

Section: <Counter id="section" level="section" />

```vue
<Counter id="theorem" level="theorem" />
```

Theorem: <Counter id="theorem" level="theorem" />

```vue
<Counter id="section" level="section" />
```

Section again: <Counter id="section" level="section" />

---

# Markdown heading composition

```md
# <Counter id="section" level="chapter" /> Timers
```

# <Counter id="section" level="chapter" /> Timers

```md
## <Counter id="section" level="section" /> SysTick
```

## <Counter id="section" level="section" /> SysTick

---

# Styled plain text

```vue
<span class="text-sky-600 font-bold">
  <Counter id="section" level="section" />
</span>
How does
<code>HAL_Delay</code>
work?
```

<span class="text-sky-600 font-bold">
  <Counter id="section" level="section" />
</span>
How does
<code>HAL_Delay</code>
work?

---

# Code samples are just code

````md
Before:
<CounterDisplay id="section" level="section" />

```vue
<Counter id="section" level="section" />
```

After:
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

Chapter: <Counter id="section" level="chapter" />

Section: <Counter id="section" level="section" />

```ts
theorem: {
  levels: [
    { level: 1, alias: "theorem", style: "upper-roman", format: "Theorem %{:value}" },
  ],
}
```

Theorem: <Counter id="theorem" level="theorem" />
