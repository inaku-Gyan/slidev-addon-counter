# slidev-addon-counter 用户手册

[English](./manual.md) | 中文

`slidev-addon-counter` 为 Slidev 提供类似 LaTeX 的多级计数器。它可以在 Markdown、Vue 组件和 Slidev 布局中生成稳定的章节、小节、定理、例题等编号。

## 环境要求

- Node.js >= 22.18.0
- Slidev >= 52.0.0

## 安装和启用

安装插件：

```bash
pnpm add -D slidev-addon-counter
```

在 Slidev deck 的 frontmatter 中启用：

```md
---
addons:
  - slidev-addon-counter
---
```

## 基本概念

一个 counter 由 `id` 标识。每个 counter 都有自己的状态，互不影响。

一个 counter 可以有任意多个 level。level 是从 `1` 开始的正整数，通常用来表达层级：

```text
level 1 -> 章
level 2 -> 节
level 3 -> 小节
```

每次遇到 `<Counter>` 或 `<CounterInc>` 时，对应 level 的计数会加一。默认情况下，递增较浅层级会重置更深层级。例如先得到 `1.2`，再递增 level 1，会变成 `2`，后续 level 2 会从 `2.1` 开始。

## 配置文件

在 Slidev 入口文件同目录创建 `slidev-addon-counter.config.ts`。插件会自动加载这个文件。

```ts
import { defineCounterConfig } from "slidev-addon-counter/config";

export default defineCounterConfig({
  counters: [
    {
      id: "section",
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
          format: "%{@-1:full}第 %{:value} 节",
        },
      ],
    },
  ],
});
```

如果没有配置文件，插件会创建一个名为 `default` 的默认 counter。默认 counter 支持任意层级：

```md
<Counter :level="1" />
<Counter :level="2" />
```

如果定义了自定义 counters，并且还使用省略 `id` 的组件，需要显式声明 `default`：

```ts
export default defineCounterConfig({
  counters: [{ id: "default" }],
});
```

## Counter 配置

顶层配置字段：

```ts
export default defineCounterConfig({
  counters: [
    {
      id: "section",
      levels: [],
    },
  ],
});
```

`counters` 可选。不提供时等价于 `{ counters: [{ id: "default" }] }`。

每个已配置的 counter 定义：

| 字段     | 类型                   | 必填 | 说明                                                                 |
| -------- | ---------------------- | ---- | -------------------------------------------------------------------- |
| `id`     | `string`               | 是   | counter 名称。组件通过 `id` 引用它。                                 |
| `levels` | `CounterLevelConfig[]` | 否   | 指定某些层级的格式、别名、样式和重置规则。未声明的层级使用默认规则。 |

配置里的 `id` 必须是非空字符串，不能重复。这个要求只适用于 `counters` 里的 counter 定义；组件的 `id` prop 是可选的，默认值为 `"default"`。

## Level 配置

每个 level 支持这些字段：

| 字段     | 类型                | 默认值                                                   | 说明                                 |
| -------- | ------------------- | -------------------------------------------------------- | ------------------------------------ |
| `level`  | `number`            | 无                                                       | 正整数层级，从 `1` 开始。            |
| `alias`  | `string`            | 无                                                       | 层级别名，可在组件和格式引用中使用。 |
| `style`  | `CounterStyle`      | `"decimal"`                                              | 当前层级的编号样式。                 |
| `format` | `string`            | level 1 为 `%{:value}`，更深层为 `%{@-1:full}.%{:value}` | 当前层级完整显示文本。               |
| `reset`  | `"lower" \| "none"` | `"lower"`                                                | 当前层级递增后是否重置更深层级。     |

未声明的 level 仍然可用，会使用默认配置。例如只声明 level 1 后，仍然可以使用 `level={2}`，显示格式默认为 `1.1`。

`alias` 必须类似标识符，例如 `chapter`、`section_2`、`theorem-main`。不能使用纯数字、`@` 开头的字符串或包含 `:` 的字符串。

## 组件

### `<Counter>`

递增或显示一个 counter。

```md
<Counter id="section" level="chapter" />
<Counter id="section" :level="2" />
```

Props：

| prop     | 类型                                 | 默认值      | 说明                           |
| -------- | ------------------------------------ | ----------- | ------------------------------ |
| `id`     | `string`                             | `"default"` | counter 名称。                 |
| `level`  | `number \| string`                   | 无          | 必填。可以是数字层级或 alias。 |
| `action` | `"step" \| "increment" \| "display"` | `"step"`    | 本次操作类型。                 |

省略 `id` 时，组件会使用 `default` counter。这个 counter 会在省略 `counters` 时自动存在，也可以通过 `{ id: "default" }` 显式声明。

`action` 的含义：

| action      | 行为                         |
| ----------- | ---------------------------- |
| `step`      | 先递增，再显示递增后的编号。 |
| `increment` | 只递增，不渲染文本。         |
| `display`   | 不递增，只显示当前编号。     |

### `<CounterInc>`

`<CounterInc>` 是 `<Counter action="increment">` 的简写：

```md
<CounterInc id="theorem" level="theorem" />
```

它会更新 counter 状态，但不会渲染文本。

### `<CounterDisplay>`

`<CounterDisplay>` 是 `<Counter action="display">` 的简写：

```md
<CounterDisplay id="theorem" level="theorem" />
```

它只显示当前值，不会递增。

## 在 Markdown 中使用

组件可以放在标题、段落、Vue 片段或 Slidev 布局中：

```md
# <Counter id="section" level="chapter" /> Timers

## <Counter id="section" level="section" /> SysTick

定理 <Counter id="theorem" level="theorem" />.
```

代码块和行内代码中的组件文本不会被计数：

````md
```vue
<Counter id="section" level="section" />
```

`<Counter id="section" level="section" />`
````

## 样式

`<Counter>` 渲染的是纯文本，不会额外生成 HTML 包裹元素。需要样式时，请自己包一层元素：

```md
<span class="text-sky-600 font-bold">
  <Counter id="section" level="section" />
</span>
```

这也意味着它适合直接组合进标题：

```md
# <Counter id="section" level="chapter" /> 绪论
```

## 编号样式

`style` 控制 `%{...:value}` 的显示方式。

| style         | 示例               | 说明                           |
| ------------- | ------------------ | ------------------------------ |
| `decimal`     | `1`, `2`, `12`     | 十进制数字。                   |
| `zero`        | `01`, `02`, `12`   | 至少两位，不足补零。           |
| `lower-alpha` | `a`, `b`, `aa`     | 小写字母序号。                 |
| `upper-alpha` | `A`, `B`, `AA`     | 大写字母序号。                 |
| `lower-roman` | `i`, `ii`, `xiv`   | 小写罗马数字，范围 `1..3999`。 |
| `upper-roman` | `I`, `II`, `XIV`   | 大写罗马数字，范围 `1..3999`。 |
| `cjk`         | `一`, `二`, `十二` | 中文数字，范围 `0..9999`。     |

示例：

```ts
export default defineCounterConfig({
  counters: [
    {
      id: "theorem",
      levels: [
        {
          level: 1,
          alias: "theorem",
          style: "upper-roman",
          format: "Theorem %{:value}",
        },
      ],
    },
  ],
});
```

```md
<Counter id="theorem" level="theorem" />
```

输出：

```text
Theorem I
```

## Format 占位符

`format` 使用 `%{ref:kind}` 占位符。

`ref` 表示引用哪个层级，`kind` 表示渲染哪种值。

### ref 写法

| ref      | 示例             | 说明                                          |
| -------- | ---------------- | --------------------------------------------- |
| 空       | `%{:value}`      | 当前层级，等价于 `%{@0:value}`。              |
| 数字     | `%{1:value}`     | 指定数字层级。                                |
| 相对层级 | `%{@-1:full}`    | 相对当前层级。`@-1` 是上一层，`@0` 是当前层。 |
| alias    | `%{chapter:raw}` | 引用配置中的层级别名。                        |

### kind 写法

| kind    | 示例          | 说明                                  |
| ------- | ------------- | ------------------------------------- |
| `value` | `%{:value}`   | 按被引用层级的 `style` 格式化后的值。 |
| `raw`   | `%{:raw}`     | 原始数字值，不使用 `style`。          |
| `full`  | `%{@-1:full}` | 被引用层级的完整 `format` 输出。      |

`full` 只能引用更浅层级，不能引用当前层级或更深层级，否则会形成递归或不稳定格式。

常见二级标题格式：

```ts
{
  level: 1,
  alias: "chapter",
  format: "第 %{:value} 章",
},
{
  level: 2,
  alias: "section",
  format: "%{@-1:full}第 %{:value} 节",
}
```

如果当前状态是 `[2, 3]`，level 2 输出：

```text
第 2 章第 3 节
```

## 默认格式

未配置 `format` 时：

```text
level 1: %{:value}
level 2+: %{@-1:full}.%{:value}
```

因此默认多级 counter 会输出：

```md
<Counter id="demo" :level="1" />
<Counter id="demo" :level="2" />
<Counter id="demo" :level="3" />
```

```text
1
1.1
1.1.1
```

## 重置规则

`reset` 决定当前层级递增时，是否清除更深层级。

默认值是 `"lower"`：

```ts
{
  level: 1,
  reset: "lower",
}
```

行为示例：

```text
1
1.1
1.2
2
2.1
```

如果设置为 `"none"`，递增当前层级时会保留更深层级状态：

```ts
{
  level: 1,
  reset: "none",
}
```

这适合少数需要跨父级延续子编号的场景。大多数章节、小节编号应使用默认的 `"lower"`。

## 多个 counter

不同 `id` 的 counter 独立维护状态：

```ts
export default defineCounterConfig({
  counters: [
    { id: "section" },
    {
      id: "theorem",
      levels: [
        {
          level: 1,
          alias: "theorem",
          style: "upper-roman",
          format: "Theorem %{:value}",
        },
      ],
    },
  ],
});
```

```md
<Counter id="section" :level="1" />
<Counter id="theorem" level="theorem" />
<Counter id="section" :level="2" />
<Counter id="theorem" level="theorem" />
```

可能输出：

```text
1
Theorem I
1.1
Theorem II
```

## Level 引用方式

组件的 `level` 可以写成静态字符串、数字绑定或字符串绑定：

```md
<Counter id="section" level="chapter" />
<Counter id="section" level="2" />
<Counter id="section" :level="2" />
<Counter id="section" :level="'section'" />
```

注意：`:level` 只支持字符串或数字字面量。不要传入运行时变量，因为插件需要在构建时扫描 slides 并计算完整时间线。

## 常见模式

### 无配置文件的 default counter

没有配置文件，或省略 `counters` 时，可以省略 `id`，直接使用内置的 `default` counter：

```md
# <Counter :level="1" /> 绪论

## <Counter :level="2" /> 背景

当前小节：<CounterDisplay :level="2" />
```

### 章节和小节

```ts
export default defineCounterConfig({
  counters: [
    {
      id: "section",
      levels: [
        {
          level: 1,
          alias: "chapter",
        },
        {
          level: 2,
          alias: "section",
        },
        {
          level: 3,
          alias: "subsection",
        },
      ],
    },
  ],
});
```

```md
# <Counter id="section" level="chapter" /> 绪论

## <Counter id="section" :level="2" /> 背景

当前小节：<CounterDisplay id="section" level="section" />

### <Counter id="section" level="subsection" /> 细节

### <Counter id="section" :level="3" /> 更多细节
```

### 定理编号

```ts
export default defineCounterConfig({
  counters: [
    {
      id: "theorem",
      levels: [
        {
          level: 1,
          style: "upper-roman",
          format: "Theorem %{:value}",
        },
      ],
    },
  ],
});
```

```md
<Counter id="theorem" :level="1" /> Compactness

<Counter id="theorem" :level="1" /> Completeness
```

### 只递增，再稍后显示

```md
<CounterInc id="theorem" :level="1" />

当前定理编号：<CounterDisplay id="theorem" :level="1" />

<Counter id="theorem" :level="1" action="increment" />

当前定理编号：<Counter id="theorem" :level="1" action="display" />

下一个定理：<Counter id="theorem" :level="1" action="step" />
```

## 限制和注意事项

`level` 是必填 prop。缺少 `level` 会在构建时抛错。

counter `id` 必须已经在配置中定义。唯一例外是完全没有配置文件时，插件会自动提供 `default`。

同一个 counter 内不能重复定义 level，也不能重复定义 alias。

`format` 占位符必须包含冒号，例如 `%{:value}`。`%{value}` 是无效写法。

`full` 不能引用当前层级或更深层级。例如 level 2 的 `format` 中可以使用 `%{@-1:full}`，但不能使用 `%{:full}` 或 `%{@+1:full}`。

Roman 样式只支持 `1..3999`。CJK 样式支持 `0..9999`。正常递增不会产生 `0`，但 `display` 在尚未递增时可能显示当前层级的 `0`。

## TypeScript API

配置文件可以从 `slidev-addon-counter/config` 导入类型和辅助函数：

```ts
import {
  defineCounterConfig,
  type CounterConfig,
  type CounterDefinition,
  type CounterLevelConfig,
  type CounterReset,
  type CounterStyle,
} from "slidev-addon-counter/config";
```

通常只需要使用 `defineCounterConfig`：

```ts
export default defineCounterConfig({
  counters: [{ id: "section" }],
});
```
