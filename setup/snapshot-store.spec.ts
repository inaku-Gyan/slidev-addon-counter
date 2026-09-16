import { describe, expect, it } from "vitest";

import { buildCounterTimeline, extractCounterOperations } from "../src/counter";
import {
  createCounterSnapshotStore,
  type SnapshotSlide,
} from "./snapshot-store";

function createSlides(): SnapshotSlide[] {
  return [
    {
      index: 0,
      title: "One",
      content: '<Counter op="one" />',
      filepath: "/deck.md",
    },
    {
      index: 1,
      title: "Two",
      content: '<Counter op="two" />',
      filepath: "/deck.md",
    },
    {
      index: 2,
      title: "Three",
      content: '<CounterDisplay op="three" />',
      filepath: "/deck.md",
    },
  ];
}

function getOperations(slides: readonly SnapshotSlide[]) {
  return slides.flatMap((slide) =>
    extractCounterOperations(slide.content, slide.index + 1, slide.title),
  );
}

describe("counter snapshot store", () => {
  it("rebuilds from a changed slide and keeps later snapshots correct", () => {
    const store = createCounterSnapshotStore();
    const slides = createSlides();
    store.createSnapshotModule(slides, undefined, 0);

    const changedSlides = slides.map((slide) =>
      slide.index === 1
        ? { ...slide, content: '<CounterDisplay op="two" />' }
        : slide,
    );
    const result = store.createSnapshotModule(changedSlides, undefined, 0);

    expect(result.updateKind).toBe("incremental");
    expect(result.timeline).toEqual(
      buildCounterTimeline(getOperations(changedSlides), undefined),
    );
    expect(result.timeline.snapshots.three.display).toBe("1");
  });

  it("skips timeline work when an edit does not change counter operations", () => {
    const store = createCounterSnapshotStore();
    const slides = createSlides();
    const initial = store.createSnapshotModule(slides, undefined, 0);
    const changedSlides = slides.map((slide) =>
      slide.index === 2
        ? { ...slide, content: `Updated text\n${slide.content}` }
        : slide,
    );

    const result = store.createSnapshotModule(changedSlides, undefined, 0);

    expect(result.updateKind).toBe("unchanged");
    expect(result.timeline).toEqual(initial.timeline);
  });

  it("uses a full rebuild when configuration changes", () => {
    const store = createCounterSnapshotStore();
    const slides = createSlides();
    store.createSnapshotModule(slides, undefined, 0);

    const config = {
      counters: [
        { id: "default", levels: [{ level: 1, format: "N%{:value}" }] },
      ],
    };
    const result = store.createSnapshotModule(slides, config, 1);

    expect(result.updateKind).toBe("full");
    expect(result.timeline.snapshots.one.display).toBe("N1");
  });

  it("uses a full rebuild when the slide structure changes", () => {
    const store = createCounterSnapshotStore();
    const slides = createSlides();
    store.createSnapshotModule(slides, undefined, 0);

    const result = store.createSnapshotModule(
      [
        ...slides,
        {
          index: 3,
          title: "Four",
          content: '<Counter op="four" />',
          filepath: "/deck.md",
        },
      ],
      undefined,
      0,
    );

    expect(result.updateKind).toBe("full");
  });

  it("uses a full rebuild when slides are reordered in one markdown file", () => {
    const store = createCounterSnapshotStore();
    const slides = createSlides();
    store.createSnapshotModule(slides, undefined, 0);

    const reorderedSlides = [slides[1], slides[0], slides[2]].map(
      (slide, index) => ({ ...slide, index }),
    );
    const result = store.createSnapshotModule(reorderedSlides, undefined, 0);

    expect(result.updateKind).toBe("full");
  });
});
