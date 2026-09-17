import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const packedDirs = ["components", "setup", "src"];
const readmes = ["README.md", "docs/README.zh-CN.md"];
const testArtifactPath = /(^|\/)(__tests__|__snapshots__)\//;
const testArtifactName = /\.(spec|test)\.[cm]?[jt]sx?$/;

const packed = packedFileList();
const problems = [
  ...findPublishedTestArtifacts(),
  ...findMissingFiles(),
  ...findMissingLinkedDocs(),
];

if (problems.length > 0) {
  console.error("Packed file list check failed:");
  for (const problem of problems) {
    console.error(`  - ${problem}`);
  }
  process.exit(1);
}

console.log(`Packed file list check passed (${packed.size} files).`);

function packedFileList() {
  const output = execFileSync(
    process.platform === "win32" ? "pnpm.cmd" : "pnpm",
    ["pack", "--dry-run", "--json"],
    { cwd: repoRoot, encoding: "utf8" },
  );
  const manifests = JSON.parse(output);
  const manifest = Array.isArray(manifests) ? manifests[0] : manifests;
  const files = manifest?.files ?? [];
  return new Set(files.map((file) => toPosix(file.path)));
}

function findPublishedTestArtifacts() {
  return [...packed]
    .filter((path) => isTestArtifact(path))
    .map((path) => `test artifact is published: ${path}`);
}

function findMissingFiles() {
  return packedDirs
    .flatMap((dir) => listFiles(dir))
    .filter((path) => !isTestArtifact(path))
    .filter((path) => !packed.has(path))
    .map((path) => `file is missing from the package: ${path}`);
}

function findMissingLinkedDocs() {
  return readmes.flatMap((readme) => {
    const content = readFileSync(join(repoRoot, readme), "utf8");
    const targets = new Set(
      [...content.matchAll(/\]\(([^)\s]+)\)/g)]
        .map((match) => match[1].split("#")[0])
        .filter((target) => target !== "" && !target.includes("://"))
        .map((target) =>
          toPosix(
            relative(repoRoot, resolve(repoRoot, dirname(readme), target)),
          ),
        ),
    );
    return [...targets]
      .filter((target) => target.endsWith(".md") && !target.startsWith(".."))
      .filter((target) => !packed.has(target))
      .map(
        (target) => `${readme} links ${target}, which is not in the package`,
      );
  });
}

function listFiles(dir) {
  const absoluteDir = join(repoRoot, dir);
  return readdirSync(absoluteDir, { recursive: true })
    .filter((entry) => statSync(join(absoluteDir, entry)).isFile())
    .map((entry) => toPosix(join(dir, entry)));
}

function isTestArtifact(path) {
  return testArtifactPath.test(path) || testArtifactName.test(path);
}

function toPosix(path) {
  return path.split(sep).join("/");
}
