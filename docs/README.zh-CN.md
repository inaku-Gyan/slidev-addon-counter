# slidev-addon-counter

[English](../README.md) | 中文

Slidev 的多级计数器插件，适合生成章节号、小节号、定理编号等可复用编号。

## 安装

```bash
pnpm add -D slidev-addon-counter
```

在 Slidev deck 的 frontmatter 中启用插件：

```md
---
addons:
  - slidev-addon-counter
---
```

## 快速示例

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
          format: "第 %{:value} 章",
        },
        {
          level: 2,
          alias: "section",
          format: "%{@-1:full}第 %{:value} 节",
        },
      ],
    },
  ],
});
```

在 slides 中使用：

```md
# <Counter id="section" level="chapter" /> 绪论

## <Counter id="section" level="section" /> 背景

当前小节：<CounterDisplay id="section" level="section" />
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
