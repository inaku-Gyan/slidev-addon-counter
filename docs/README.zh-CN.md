# slidev-addon-counter

[English](../README.md) | 中文

Slidev 的多级计数器插件，适合生成章节号、小节号、定理编号等可复用编号。

[在线示例](https://inaku-Gyan.github.io/slidev-addon-counter/)

## 环境要求

- Node.js >= 22.18.0
- Slidev >= 52.0.0

## 安装

```bash
pnpm add -D slidev-addon-counter
```

在 Slidev deck 的 frontmatter 中启用插件：

```yml
addons:
  - slidev-addon-counter
```

## 快速示例

### 无配置文件

没有配置文件时，组件会使用内置的 `default` counter：

```md
# <Counter :level="1" /> 绪论

## <Counter :level="2" /> 背景

当前小节：<CounterDisplay :level="2" />
```

### Level alias

在幻灯片入口文件同目录创建 `slidev-addon-counter.config.ts`：

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

在 slides 中可以使用 alias，也可以使用数字 level：

```md
# <Counter id="section" level="chapter" /> 绪论

## <Counter id="section" :level="2" /> 背景

当前小节：<CounterDisplay id="section" level="section" />

### <Counter id="section" level="subsection" /> 细节

### <Counter id="section" :level="3" /> 更多细节
```

### 罗马数字定理

用罗马数字和自定义格式配置 theorem counter：

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

### Action 用法

可以使用简写组件，也可以给 `<Counter>` 传 `action`：

```md
<CounterInc id="theorem" :level="1" />
当前定理：<CounterDisplay id="theorem" :level="1" />

<Counter id="theorem" :level="1" action="increment" />
当前定理：<Counter id="theorem" :level="1" action="display" />

下一个定理：<Counter id="theorem" :level="1" action="step" />
```

`<Counter>` 默认会递增并显示编号；`<CounterInc>` 只递增不显示；`<CounterDisplay>` 只显示当前编号。

## 用户手册

完整配置、格式语法、组件行为和常见模式见 [用户手册](./manual.zh-CN.md)。

## 开发

```bash
source ~/.nvm/nvm.sh
nvm use
pnpm install
pnpm check
```

预览本地 demo：

```bash
pnpm dev
```
