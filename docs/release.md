# Release process

This package is published by GitHub Actions when a version tag is pushed.
Do not publish from a local machine.

## Release operator checklist

1. Start from an up-to-date `main` branch.

   ```bash
   git switch main
   git pull --ff-only
   ```

2. Make sure all intended code and documentation changes are already committed.
   The working tree should be clean before the version bump.

   ```bash
   git status --short
   ```

3. Run the same verification used by CI.

   ```bash
   pnpm install --frozen-lockfile
   pnpm check
   pnpm pack --dry-run
   ```

4. Bump the version and create the matching Git tag.

   Stable patch release:

   ```bash
   pnpm version patch
   ```

   Explicit stable version:

   ```bash
   pnpm version 0.1.1
   ```

   Prerelease:

   ```bash
   pnpm version 0.1.1-beta.0
   ```

   `pnpm version` must create a tag like `v0.1.1`. The tag version must match
   `package.json.version` exactly after removing the leading `v`.

5. Push the version commit and tag.

   ```bash
   git push --follow-tags
   ```

6. Watch the `release` workflow in GitHub Actions. A successful workflow
   publishes to npm and creates the GitHub Release.

7. After the workflow succeeds, verify npm dist-tags.

   ```bash
   npm dist-tag ls slidev-addon-counter
   ```

## Version and tag rules

The release workflow only runs for tags matching `v*.*.*`.

Valid examples:

```text
v0.1.1
v0.1.1-alpha.0
v0.1.1-beta.0
v0.1.1-rc.0
```

The npm dist-tag is derived from the version:

| Version         | npm dist-tag |
| --------------- | ------------ |
| `0.1.1`         | `latest`     |
| `0.1.1-alpha.0` | `alpha`      |
| `0.1.1-beta.0`  | `beta`       |
| `0.1.1-rc.0`    | `rc`         |

Users can install a prerelease with:

```bash
pnpm add slidev-addon-counter@beta
```

## GitHub Actions behavior

`.github/workflows/release.yml` runs on pushed tags matching `v*.*.*`.

The workflow:

1. Validates the tag with `.github/scripts/validate-release-tag.mjs`.
2. Confirms the tag is valid SemVer with a leading `v`.
3. Confirms the tag version matches `package.json.version`.
4. Derives the npm dist-tag: `latest` for stable versions, or the first
   prerelease identifier for prereleases.
5. Runs the reusable `ci` workflow.
6. Publishes the npm package.
7. Creates a GitHub Release with generated release notes.

The reusable `ci` workflow runs:

```bash
pnpm install --frozen-lockfile
pnpm check
pnpm pack --dry-run
```

`pnpm check` covers type checking, Oxlint, Prettier, Vitest, and the Slidev demo
build. `pnpm pack --dry-run` verifies the npm package file list without
publishing.

## npm publishing mechanism

Publishing uses npm Trusted Publishing through GitHub Actions OIDC.
Do not add a long-lived `NPM_TOKEN` unless the release process is intentionally
changed.

Trusted Publishing must be configured on npm for:

- Package: `slidev-addon-counter`
- Repository: `inaku-Gyan/slidev-addon-counter`
- Workflow: `.github/workflows/release.yml`
- Environment: none

`package.json` pins npm publishing to the official registry:

```json
"publishConfig": {
  "access": "public",
  "registry": "https://registry.npmjs.org/"
}
```

This prevents accidental publishing to a mirror registry. When Trusted
Publishing is used from GitHub Actions, npm provides provenance automatically;
the workflow does not pass `--provenance`.

## GitHub Release

After npm publish succeeds, the workflow creates a GitHub Release with generated
release notes. Prerelease SemVer tags create GitHub prereleases.

The workflow intentionally uploads no files to the GitHub Release. The npm
package is available from the npm registry, and GitHub's generated source
archives are left as-is.
