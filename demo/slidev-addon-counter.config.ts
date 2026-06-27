import { defineCounterConfig } from "../config";

export default defineCounterConfig({
  counters: [
    // Demo-only counters used to structure this teaching deck.
    {
      id: "demoSection",
      defaultLevel: "section",
      levels: [
        {
          level: 1,
          alias: "section",
          format: "%{:value}",
        },
      ],
    },
    {
      id: "demoExample",
      defaultLevel: "example",
      levels: [
        {
          level: 1,
          alias: "example",
          format: "Example %{:value}",
        },
      ],
    },

    // User-facing counters used by the examples below.
    {
      id: "default",
    },
    {
      id: "section",
      defaultLevel: "section",
      levels: [
        {
          level: 1,
          alias: "chapter",
          format: "Chapter %{:value}",
        },
        {
          level: 2,
          alias: "section",
          format: "%{@-1:full}.%{:value}",
        },
        {
          level: 3,
          alias: "subsection",
          format: "%{@-1:full}.%{:value}",
        },
      ],
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
    {
      id: "claim",
      defaultLevel: "claim",
      levels: [
        {
          level: 1,
          alias: "claim",
          format: "Claim %{:value}",
        },
      ],
    },
    {
      id: "taskFlow",
      defaultLevel: "task",
      levels: [
        {
          level: 1,
          alias: "phase",
          format: "Phase %{:value}",
          reset: "none",
        },
        {
          level: 2,
          alias: "task",
          format: "%{@-1:full} / Task %{:value}",
        },
      ],
    },
    {
      id: "cnSection",
      defaultLevel: "section",
      levels: [
        {
          level: 1,
          alias: "chapter",
          style: "cjk",
          format: "第%{:value}章",
        },
        {
          level: 2,
          alias: "section",
          style: "cjk",
          format: "%{@-1:full}第%{:value}节",
        },
      ],
    },
  ],
});
