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

### 默认 counter

省略 `id` 的组件会使用内置的 `default` counter。即使配置了其他 counters，插件也会自动提供它：

```md
# <Counter /> 绪论

## <Counter :level="2" /> 背景

当前小节：<CounterDisplay :level="2" />
```

### 配置 counter

在幻灯片入口文件同目录创建 `slidev-addon-counter.config.ts`：

```ts
import { defineCounterConfig } from "slidev-addon-counter/config";

export default defineCounterConfig({
  counters: [
    {
      id: "section",
      defaultLevel: "section",
      levels: [
        {
          level: 1,
          alias: "chapter",
        },
        {
          level: 2,
          alias: "section",
        },
      ],
    },
  ],
});
```

在 slides 中可以使用 alias 和已配置的默认 level：

```md
# <Counter id="section" level="chapter" /> 绪论

## <Counter id="section" /> 背景

当前小节：<CounterDisplay id="section" />
```

## 更多示例

[在线示例](https://inaku-Gyan.github.io/slidev-addon-counter/) 中提供了更完整的示例，并把配置、slides 源码和渲染效果放在一起对照展示。

也可以直接阅读完整 demo 源码：[`demo/`](../demo/)。

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
