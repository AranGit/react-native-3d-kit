# Releasing

No package is published by this repository configuration automatically.

## Prerequisites

Before the first release, the repository owner must:

1. Confirm that `https://github.com/AranGit/react-native-3d-kit` exists and that
   maintainers have push/tag permissions.
2. Confirm ownership or publishing access for the public `@arangit` npm scope.
3. Sign in locally with `npm login` and verify with `npm whoami`.
4. Confirm each final package name with `npm view <package-name>`.

Public scoped packages require `publishConfig.access: public`, which is already
present in all three manifests.

## Pre-1.0 version policy

All packages start at `0.1.0`. Changesets treats them as a fixed group, so they
receive matching versions while the plugin contract is changing. Independent
versioning can be considered after the model-viewer plugin API is stable.

Use SemVer conservatively:

- patch: fixes and documentation with no intentional contract change;
- minor: backwards-compatible public APIs or features;
- major: breaking changes, including breaking pre-1.0 contract changes when the
  project adopts stable SemVer.

## Changesets workflow

Create a release note in the feature branch:

```sh
pnpm changeset
```

After changes merge to `main`, update package versions and changelogs:

```sh
pnpm version-packages
pnpm install
```

Review and commit the resulting manifests, changelogs, Changeset deletion, and
lockfile together.

## Local validation

```sh
pnpm install --frozen-lockfile
pnpm format:check
pnpm validate
pnpm pack:check
```

`pack:check` creates real tarballs in `.artifacts/`, checks their whitelists and
manifests, rejects test/example files, local absolute paths, secrets, and runtime
`workspace:` ranges, then installs all three tarballs into a temporary consumer
and validates their public imports with TypeScript.

Native example checks should also run before release:

```sh
pnpm native:android:build
pnpm native:ios:pods
pnpm native:ios:build
```

After both build gates pass, complete the runtime smoke test in
[`native-validation.md`](./native-validation.md) on an iOS Simulator or device
and an Android emulator or device.

## Manual first publish

Only after package/scope ownership is confirmed:

```sh
pnpm format:check
pnpm validate
pnpm pack:check
pnpm changeset publish
```

Then tag the exact release commit and push the tag:

```sh
git tag v0.1.0
git push origin main --follow-tags
```

Never publish from a dirty tree. Verify the public metadata after publication
with `npm view` and test installation in a clean app.

Automated npm Trusted Publishing may be added after the GitHub repository and
all npm packages are confirmed. CI intentionally contains no publish job or npm
token today.
