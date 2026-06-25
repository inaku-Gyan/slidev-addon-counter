import { injectCounterOperationIds } from "../src/counter";

export default function counterTransformers() {
  return {
    pre: [
      (ctx: {
        s: {
          appendLeft: (index: number, content: string) => void;
          original?: string;
          toString: () => string;
        };
        slide?: { index?: number };
      }) => {
        const slideNo = (ctx.slide?.index ?? 0) + 1;
        const content = ctx.s.original ?? ctx.s.toString();
        for (const edit of injectCounterOperationIds(content, slideNo)) {
          ctx.s.appendLeft(edit.index, edit.value);
        }
      },
    ],
  };
}
