import { appendFileSync, readFileSync } from "node:fs";

const refName = process.env.REF_NAME ?? "";
const outputPath = process.env.GITHUB_OUTPUT;
const semverPattern =
  /^v(?<version>(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-(?<prerelease>(?:0|[1-9]\d*|\d*[A-Za-z-][0-9A-Za-z-]*)(?:\.(?:0|[1-9]\d*|\d*[A-Za-z-][0-9A-Za-z-]*))*))?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?)$/;

const match = semverPattern.exec(refName);
if (!match?.groups) {
  fail(
    `tag '${refName}' is invalid. Expected vMAJOR.MINOR.PATCH[-prerelease][+build].`,
  );
}

const tagVersion = match.groups.version;
const prerelease = match.groups.prerelease;
const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
const packageVersion = String(packageJson.version ?? "");

if (tagVersion !== packageVersion) {
  fail(
    `tag version '${tagVersion}' does not match package.json version '${packageVersion}'.`,
  );
}

const isPrerelease = prerelease != null;
const npmTag = isPrerelease ? prerelease.split(".")[0] : "latest";

if (!/^[A-Za-z][A-Za-z0-9._-]*$/.test(npmTag)) {
  fail(`npm dist-tag '${npmTag}' derived from '${tagVersion}' is invalid.`);
}

appendOutput("package_version", packageVersion);
appendOutput("prerelease", String(isPrerelease));
appendOutput("npm_tag", npmTag);

console.log(
  `tag '${refName}' matches package.json version '${packageVersion}'`,
);
console.log(`npm dist-tag: ${npmTag}`);
console.log(`GitHub prerelease: ${isPrerelease}`);

function appendOutput(name, value) {
  if (!outputPath) {
    return;
  }

  const line = `${name}=${value}\n`;
  appendFileSync(outputPath, line);
}

function fail(message) {
  console.error(`::error::${message}`);
  process.exit(1);
}
