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

# <Counter id="demo" :level="1" /> Basic section counter

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

# <Counter id="demo" :level="1" /> Alias and numeric levels

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

# <Counter id="demo" :level="1" /> Step, increment, display

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

# <Counter id="demo" :level="1" /> Independent counters

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

# <Counter id="demo" :level="1" /> Markdown heading composition

```md
# <Counter id="section" level="chapter" /> Timers
```

# <Counter id="section" level="chapter" /> Timers

```md
## <Counter id="section" level="section" /> SysTick
```

## <Counter id="section" level="section" /> SysTick

---

# <Counter id="demo" :level="1" /> Styled plain text

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

# <Counter id="demo" :level="1" /> Code samples are just code

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

# <Counter id="demo" :level="1" /> Config overview

```ts
{
  // Register every named counter used by the deck.
  "counters": [
    { "id": "section", "levels": [...] },
    { "id": "demo" },
    { "id": "theorem", "levels": [...] }
  ]
}
```

---

# <Counter id="demo" :level="2" /> Section config

```ts
{
  // A two-level counter with Chinese chapter/section labels.
  "id": "section",
  "levels": [
    {
      // The alias can be used as <Counter level="chapter" />.
      "level": 1,
      "alias": "chapter",
      "format": "第 %{:value} 章"
    },
    {
      // A full parent reference keeps the chapter prefix.
      "level": 2,
      "alias": "section",
      "format": "%{@-1:full}第 %{:value} 节"
    }
  ]
}
```

---

# <Counter id="demo" :level="2" /> Demo title config

```ts
{
  // No levels means the default decimal format is used.
  "id": "demo"
}
```

---

# <Counter id="demo" :level="2" /> Theorem config

```ts
{
  // A single-level counter with Roman numerals.
  "id": "theorem",
  "levels": [
    {
      "level": 1,
      "alias": "theorem",
      "style": "upper-roman",
      "format": "Theorem %{:value}"
    }
  ]
}
```
