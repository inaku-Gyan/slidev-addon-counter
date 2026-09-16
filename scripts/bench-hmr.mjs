/* eslint-disable no-await-in-loop -- each benchmark edit must finish before the next one. */

import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";

import { chromium } from "playwright";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const slidevCli = resolve(repoRoot, "node_modules/@slidev/cli/bin/slidev.mjs");
const sizes = parseSizes(
  process.env.SLIDEV_COUNTER_BENCH_SIZES ?? "10,100,500",
);
const warmupRuns = parseCount(process.env.SLIDEV_COUNTER_BENCH_WARMUP ?? "3");
const measuredRuns = parseCount(process.env.SLIDEV_COUNTER_BENCH_RUNS ?? "10");

async function main() {
  const browser = await chromium.launch({
    headless: true,
    ...(process.env.SLIDEV_COUNTER_BENCH_CHROMIUM
      ? { executablePath: process.env.SLIDEV_COUNTER_BENCH_CHROMIUM }
      : {}),
  });
  const results = [];

  try {
    for (const size of sizes) {
      results.push(...(await benchmarkSize(browser, size)));
    }
  } finally {
    await browser.close();
  }

  console.table(results);
}

async function benchmarkSize(browser, size) {
  const temporaryRoot = await mkdtemp(
    join(tmpdir(), "slidev-addon-counter-bench-"),
  );
  const slidesPath = join(temporaryRoot, "slides.md");
  const configPath = join(temporaryRoot, "slidev-addon-counter.config.ts");
  const port = await getFreePort();
  const baseUrl = `http://127.0.0.1:${port}`;
  await writeFile(slidesPath, createDeck(size, null, "step"), "utf8");
  await writeFile(configPath, createConfig("B"), "utf8");
  const child = spawn(
    process.execPath,
    [slidevCli, slidesPath, "--port", String(port), "--log", "error"],
    {
      cwd: repoRoot,
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  let serverOutput = "";
  child.stdout.on("data", (chunk) => {
    serverOutput += chunk.toString();
  });
  child.stderr.on("data", (chunk) => {
    serverOutput += chunk.toString();
  });

  try {
    await waitForServer(baseUrl, child, () => serverOutput);
    const page = await browser.newPage();
    let pageLoads = 0;
    page.on("load", () => {
      pageLoads += 1;
    });

    try {
      await page.goto(`${baseUrl}/${size}?counter-bench=1`, {
        waitUntil: "domcontentloaded",
      });
      await waitForRenderedRevision(page, 0);

      let revision = 0;
      const samples = [];
      const targetPositions = [0, Math.floor(size / 2), size - 1];

      for (const [scenarioIndex, target] of targetPositions.entries()) {
        revision = await resetScenario(
          page,
          slidesPath,
          baseUrl,
          size,
          target,
          revision,
          scenarioIndex > 0,
        );
        const scenarioSamples = await measureSlideEdits({
          page,
          slidesPath,
          size,
          target,
          revision,
          pageLoads: () => pageLoads,
        });
        revision = scenarioSamples.revision;
        samples.push(...scenarioSamples.samples);
      }

      const configSamples = await measureConfigEdits({
        page,
        configPath,
        revision,
        pageLoads: () => pageLoads,
      });
      samples.push(...configSamples.samples);

      return summarizeSamples(size, samples);
    } finally {
      await page.close();
    }
  } finally {
    await stopProcess(child);
    await rm(temporaryRoot, { recursive: true, force: true });
  }
}

async function resetScenario(
  page,
  slidesPath,
  baseUrl,
  size,
  target,
  revision,
  shouldReset,
) {
  await page.goto(`${baseUrl}/${target + 1}?counter-bench=1`, {
    waitUntil: "domcontentloaded",
  });
  await waitForRenderedRevision(page, revision);

  if (!shouldReset) {
    return revision;
  }

  const nextRevision = revision + 1;
  await writeFile(slidesPath, createDeck(size, target, "step"), "utf8");
  await waitForRenderedRevision(page, nextRevision);
  return nextRevision;
}

async function measureSlideEdits({
  page,
  slidesPath,
  size,
  target,
  revision,
  pageLoads,
}) {
  let nextRevision = revision;
  let action = "step";
  const samples = [];

  for (let run = 0; run < warmupRuns + measuredRuns; run += 1) {
    action = action === "step" ? "display" : "step";
    nextRevision += 1;
    const beforeLoads = pageLoads();
    const start = process.hrtime.bigint();
    await writeFile(slidesPath, createDeck(size, target, action), "utf8");
    await waitForRenderedRevision(page, nextRevision);
    const elapsedMs = elapsedMilliseconds(start);
    const fullReload = pageLoads() !== beforeLoads;

    if (fullReload) {
      throw new Error(
        `slide edit at ${target + 1}/${size} triggered a full reload`,
      );
    }

    if (run >= warmupRuns) {
      samples.push({
        size,
        scenario: `slide-${positionName(target, size)}`,
        elapsedMs,
      });
    }
  }

  return { revision: nextRevision, samples };
}

async function measureConfigEdits({ page, configPath, revision, pageLoads }) {
  let nextRevision = revision;
  const samples = [];
  const formats = ["C", "D"];

  for (let run = 0; run < warmupRuns + measuredRuns; run += 1) {
    nextRevision += 1;
    const beforeLoads = pageLoads();
    const start = process.hrtime.bigint();
    await writeFile(
      configPath,
      createConfig(formats[run % formats.length]),
      "utf8",
    );
    await waitForRenderedRevision(page, nextRevision);
    const elapsedMs = elapsedMilliseconds(start);

    if (pageLoads() !== beforeLoads) {
      throw new Error("counter config edit triggered a full reload");
    }

    if (run >= warmupRuns) {
      samples.push({ size: undefined, scenario: "config", elapsedMs });
    }
  }

  return { revision: nextRevision, samples };
}

function summarizeSamples(size, samples) {
  const grouped = new Map();
  for (const sample of samples) {
    const values = grouped.get(sample.scenario) ?? [];
    values.push(sample.elapsedMs);
    grouped.set(sample.scenario, values);
  }

  return [...grouped.entries()].map(([scenario, values]) => ({
    size,
    scenario,
    runs: values.length,
    p50Ms: formatMilliseconds(percentile(values, 0.5)),
    p95Ms: formatMilliseconds(percentile(values, 0.95)),
  }));
}

function createDeck(size, changedIndex, changedAction) {
  const frontmatter = [
    "---",
    "theme: default",
    `addons:\n  - ${JSON.stringify(repoRoot)}`,
    "---",
  ].join("\n");
  const slides = Array.from({ length: size }, (_, index) => {
    const component =
      index === changedIndex && changedAction === "display"
        ? `<CounterDisplay op="counter-${index}" />`
        : `<Counter op="counter-${index}" />`;
    return [
      `# Benchmark slide ${index + 1}`,
      component,
      `<CounterDisplay op="probe-${index}" />`,
    ].join("\n");
  });

  return `${frontmatter}\n${slides.join("\n---\n")}\n`;
}

function createConfig(formatPrefix) {
  return [
    "export default {",
    "  counters: [",
    "    {",
    '      id: "default",',
    "      levels: [",
    `        { level: 1, format: "${formatPrefix}%{:value}" },`,
    "      ],",
    "    },",
    "  ],",
    "};",
    "",
  ].join("\n");
}

async function waitForRenderedRevision(page, revision) {
  await page.waitForFunction(
    (expectedRevision) =>
      [...document.querySelectorAll("[data-counter-bench-revision]")].some(
        (element) => {
          const rect = element.getBoundingClientRect();
          const style = getComputedStyle(element);
          return (
            element.getAttribute("data-counter-bench-revision") ===
              String(expectedRevision) &&
            rect.width > 0 &&
            rect.height > 0 &&
            style.visibility !== "hidden"
          );
        },
      ),
    revision,
    { polling: "raf", timeout: 10_000 },
  );
  await page.evaluate(
    () =>
      new Promise((resolvePromise) => {
        requestAnimationFrame(() => requestAnimationFrame(resolvePromise));
      }),
  );
}

async function waitForServer(url, child, getOutput) {
  for (let attempt = 0; attempt < 150; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
    } catch {
      if (child.exitCode != null) {
        break;
      }
    }

    await delay(100);
  }

  throw new Error(`Slidev server did not start.\n${getOutput()}`);
}

async function getFreePort() {
  const server = createServer();
  await new Promise((resolvePromise, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolvePromise);
  });
  const address = server.address();
  const port =
    typeof address === "object" && address ? address.port : undefined;
  await new Promise((resolvePromise) => server.close(resolvePromise));

  if (!port) {
    throw new Error("Could not allocate a free benchmark port");
  }
  return port;
}

async function stopProcess(child) {
  if (child.exitCode != null) {
    return;
  }

  child.kill("SIGTERM");
  await Promise.race([
    once(child, "exit"),
    delay(3_000).then(() => {
      if (child.exitCode == null) {
        child.kill("SIGKILL");
      }
    }),
  ]);
}

function positionName(index, size) {
  if (index === 0) {
    return "start";
  }
  if (index === size - 1) {
    return "end";
  }
  return "middle";
}

function elapsedMilliseconds(start) {
  return Number(process.hrtime.bigint() - start) / 1_000_000;
}

function percentile(values, ratio) {
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(
    sorted.length - 1,
    Math.ceil(sorted.length * ratio) - 1,
  );
  return sorted[index];
}

function formatMilliseconds(value) {
  return Number(value.toFixed(2));
}

function parseSizes(value) {
  const parsedSizes = value
    .split(",")
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isInteger(item) && item > 0);
  if (parsedSizes.length === 0) {
    throw new Error(
      "SLIDEV_COUNTER_BENCH_SIZES must contain positive integers",
    );
  }
  return parsedSizes;
}

function parseCount(value) {
  const count = Number(value);
  if (!Number.isInteger(count) || count < 0) {
    throw new Error("Benchmark run counts must be non-negative integers");
  }
  return count;
}

function delay(milliseconds) {
  return new Promise((resolvePromise) => {
    setTimeout(resolvePromise, milliseconds);
  });
}

main().catch((error) => {
  if (
    error instanceof Error &&
    error.message.includes("Executable doesn't exist")
  ) {
    console.error(
      "Chromium is not installed. Run `pnpm exec playwright install chromium` first.",
    );
  } else {
    console.error(error);
  }
  process.exitCode = 1;
});
