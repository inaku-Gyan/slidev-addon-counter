import { defineCounterConfig } from "../config";

export default defineCounterConfig({
  counters: [
    {
      id: "section",
      defaultLevel: "section",
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
    {
      id: "demo",
    },
    {
      id: "theorem",
      defaultLevel: "theorem",
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
