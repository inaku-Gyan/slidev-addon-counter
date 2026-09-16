declare module "*.vue" {
  import type { DefineComponent } from "vue";

  const component: DefineComponent<
    Record<string, never>,
    Record<string, never>,
    unknown
  >;
  export default component;
}

interface ImportMetaEnv {
  readonly DEV: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "virtual:slidev-addon-counter/snapshots" {
  export type CounterAction = "step" | "increment" | "display";
  export type LevelRef = number | string;

  export interface CounterOperation {
    id: string;
    counter: string;
    level: LevelRef;
    action: CounterAction;
    slideNo: number;
    order: number;
    title?: string;
  }

  export interface CounterSnapshot {
    id: string;
    counter: string;
    level: number;
    action: CounterAction;
    counts: number[];
    display: string;
  }

  export const revision: string | number;
  export const snapshots: Record<string, CounterSnapshot>;
  export const operations: CounterOperation[];
}
