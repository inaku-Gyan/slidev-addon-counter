import { defineCounterConfig } from "../config";

export default defineCounterConfig({
  counters: [
    // Demo-only counters used to structure this teaching deck.
    {
      id: "demoSection",
    },
    {
      id: "demoExample",
      defaultLevel: 2,
      levels: [
        {
          level: 1,
          format: "Example %{:value}.",
        },
        {
          level: 2,
          format: "%{@-1:full}%{:value}.",
        },
      ],
    },

    // User-facing counters used by the examples below.
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
        },
        {
          level: 3,
          alias: "subsection",
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
