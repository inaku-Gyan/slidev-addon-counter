import {
  extractCounterOperations,
  normalizeCounterConfig,
  type CounterConfig,
  type CounterOperation,
  type CounterTimeline,
  type NormalizedCounterConfig,
} from "../src/counter";
import {
  buildCounterTimelineState,
  type CounterTimelineState,
} from "../src/counter-timeline";

export interface SnapshotSlide {
  index: number;
  title?: string;
  content: string;
  filepath: string;
}

export type SnapshotUpdateKind =
  | "initial"
  | "unchanged"
  | "incremental"
  | "full";

export interface SnapshotModule {
  code: string;
  timeline: CounterTimeline;
  updateKind: SnapshotUpdateKind;
}

export interface CounterSnapshotStore {
  createSnapshotModule(
    slides: readonly SnapshotSlide[],
    config: CounterConfig | undefined,
    configRevision: number,
    revision?: string | number,
  ): SnapshotModule;
}

interface CachedSlide extends SnapshotSlide {
  operations: CounterOperation[];
}

export function createCounterSnapshotStore(): CounterSnapshotStore {
  let cachedSlides: CachedSlide[] | undefined;
  let configRevision: number | undefined;
  let normalizedConfig: NormalizedCounterConfig | undefined;
  let timelineState: CounterTimelineState | undefined;

  return {
    createSnapshotModule(slides, config, nextConfigRevision, revision = 0) {
      const configChanged = nextConfigRevision !== configRevision;
      if (configChanged) {
        normalizedConfig = normalizeCounterConfig(config);
        configRevision = nextConfigRevision;
      }

      const structureChanged =
        cachedSlides != null &&
        (cachedSlides.length !== slides.length ||
          slides.some(
            (slide, index) =>
              !cachedSlides || !sameSlideStructure(cachedSlides[index], slide),
          ) ||
          hasReorderedSlides(cachedSlides, slides));
      const nextSlides = slides.map((slide, index) => {
        const previous = cachedSlides?.[index];
        if (previous && sameSlideSource(previous, slide)) {
          return previous;
        }

        return {
          ...slide,
          operations: extractCounterOperations(
            slide.content,
            slide.index + 1,
            slide.title,
          ),
        };
      });
      const firstChangedSlide = findFirstChangedSlide(cachedSlides, nextSlides);
      const operationsChanged = firstChangedSlide != null;
      const updateKind: SnapshotUpdateKind =
        timelineState == null
          ? "initial"
          : configChanged || structureChanged
            ? "full"
            : operationsChanged
              ? "incremental"
              : "unchanged";

      if (timelineState == null || configChanged || structureChanged) {
        timelineState = buildCounterTimelineState(
          getOperations(nextSlides),
          normalizedConfig,
          undefined,
          1,
          slides.length,
        );
      } else if (operationsChanged) {
        timelineState = buildCounterTimelineState(
          getOperations(nextSlides),
          normalizedConfig,
          timelineState,
          firstChangedSlide,
          slides.length,
        );
      }

      cachedSlides = nextSlides;
      const timeline = timelineState.timeline;

      return {
        code: serializeSnapshotModule(timeline, revision),
        timeline,
        updateKind,
      };
    },
  };
}

function getOperations(slides: readonly CachedSlide[]): CounterOperation[] {
  return slides.flatMap((slide) => slide.operations);
}

function findFirstChangedSlide(
  previous: readonly CachedSlide[] | undefined,
  next: readonly CachedSlide[],
): number | undefined {
  if (!previous) {
    return 1;
  }

  for (let index = 0; index < next.length; index += 1) {
    const previousSlide = previous[index];
    if (
      !previousSlide ||
      !sameOperations(previousSlide.operations, next[index].operations)
    ) {
      return index + 1;
    }
  }

  return previous.length === next.length ? undefined : 1;
}

function sameSlideStructure(
  previous: SnapshotSlide | undefined,
  next: SnapshotSlide,
): boolean {
  return Boolean(
    previous &&
    previous.index === next.index &&
    previous.filepath === next.filepath,
  );
}

function hasReorderedSlides(
  previous: readonly SnapshotSlide[],
  next: readonly SnapshotSlide[],
): boolean {
  const previousKeys = previous.map(getSlideIdentity);
  const nextKeys = next.map(getSlideIdentity);

  if (previousKeys.every((key, index) => key === nextKeys[index])) {
    return false;
  }

  const counts = new Map<string, number>();
  for (const key of previousKeys) {
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  for (const key of nextKeys) {
    const count = counts.get(key);
    if (!count) {
      return false;
    }
    if (count === 1) {
      counts.delete(key);
    } else {
      counts.set(key, count - 1);
    }
  }

  return counts.size === 0;
}

function getSlideIdentity(slide: SnapshotSlide): string {
  return JSON.stringify([slide.filepath, slide.title, slide.content]);
}

function sameSlideSource(
  previous: SnapshotSlide,
  next: SnapshotSlide,
): boolean {
  return (
    sameSlideStructure(previous, next) &&
    previous.title === next.title &&
    previous.content === next.content
  );
}

function sameOperations(
  previous: readonly CounterOperation[],
  next: readonly CounterOperation[],
): boolean {
  if (previous.length !== next.length) {
    return false;
  }

  return previous.every((operation, index) => {
    const other = next[index];
    return (
      operation.id === other.id &&
      operation.counter === other.counter &&
      operation.level === other.level &&
      operation.action === other.action &&
      operation.slideNo === other.slideNo &&
      operation.order === other.order &&
      operation.title === other.title
    );
  });
}

function serializeSnapshotModule(
  timeline: CounterTimeline,
  revision: string | number,
): string {
  return [
    `export const revision = ${JSON.stringify(revision)}`,
    `export const snapshots = ${JSON.stringify(timeline.snapshots, null, 2)}`,
    `export const operations = ${JSON.stringify(timeline.operations, null, 2)}`,
  ].join("\n");
}
