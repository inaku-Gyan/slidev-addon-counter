# Release process

This package is released from GitHub Actions, not from a local machine.

## CI

The `ci` workflow runs on pull requests, pushes to `main`, and as a reusable
workflow from `release`.

It uses Node `24.18.0` and pnpm `11.5.3`, then runs:

```bash
pnpm install --frozen-lockfile
pnpm check
pnpm pack --dry-run
```

`pnpm check` covers type checking, Oxlint, Prettier, Vitest, and the Slidev demo
build. `pnpm pack --dry-run` verifies the npm package file list without
publishing.

## npm publishing

Publishing uses npm Trusted Publishing with GitHub Actions OIDC. Do not add a
long-lived `NPM_TOKEN` unless Trusted Publishing must be replaced later.

Configure npm Trusted Publishing for:

- Package: `slidev-addon-counter`
- Repository: `inaku-Gyan/slidev-addon-counter`
- Workflow: `.github/workflows/release.yml`
- Environment: none

When Trusted Publishing is used from GitHub Actions, npm automatically publishes
provenance attestations. The workflow therefore does not pass `--provenance`.

## Version tags

The release workflow runs only for tags matching `v*.*.*`. The tag version must
match `package.json.version` exactly after removing the leading `v`.

Stable release:

```bash
pnpm version 0.1.0
git push --follow-tags
```

This publishes:

```bash
npm publish --access public --tag latest
```

Prerelease:

```bash
pnpm version 0.1.0-beta.0
git push --follow-tags
```

The npm dist-tag is derived from the first prerelease identifier:

| Version         | npm dist-tag |
| --------------- | ------------ |
| `0.1.0-alpha.0` | `alpha`      |
| `0.1.0-beta.0`  | `beta`       |
| `0.1.0-rc.0`    | `rc`         |

Users can install a prerelease with:

```bash
pnpm add slidev-addon-counter@beta
```

## GitHub Release

After npm publish succeeds, the workflow creates a GitHub Release with generated
release notes. Prerelease SemVer tags create GitHub prereleases.

The workflow intentionally uploads no files to the GitHub Release. The npm
package is available from the npm registry, and GitHub's automatically generated
source archives are left as-is.
