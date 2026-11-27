# Development environment

Docker-based toolchain so you don't need Node/pnpm installed on the host. All commands below are
run from the **project root** (one level up from this file), passing `development/compose.yml`
explicitly via `-f`.

The `pnpm-store` volume is shared across your projects on this host. Before the first install,
create it once:

```sh
docker volume create pnpm-store
```

## Rebuild the images

The services run in two images built from `development/Dockerfile`: `injectcode-e2e` for `validate`, `e2e` and
`e2e-debug`, and `injectcode-tools` for all the others. Both carry Node (the `FROM` lines in the Dockerfile) and pnpm
(`packageManager` in `package.json`). The e2e image also carries the Chromium build matched to the `@playwright/test`
version in `pnpm-lock.yaml`. Rebuild both after changing any of these:

```sh
docker compose -f development/compose.yml build
```

`run --build <service>` rebuilds only the image of the service it runs and leaves the other image stale.

## Install dependencies

```sh
docker compose -f development/compose.yml run --rm install
```

To update the lockfile (e.g. after changing `package.json`):

```sh
docker compose -f development/compose.yml run --rm install-update
```

## Build

```sh
docker compose -f development/compose.yml run --rm build
```

If the Dockerfile changed, [rebuild the images](#rebuild-the-images) first.

Output is written to `dist/` on the host, ready to be loaded as an unpacked extension via
`chrome://extensions`.

## Watch mode

Rebuilds `dist/` on file changes:

```sh
docker compose -f development/compose.yml up dev
```

## Type checking & linting

```sh
docker compose -f development/compose.yml run --rm type-check
docker compose -f development/compose.yml run --rm lint
docker compose -f development/compose.yml run --rm lint-fix
```

## Tests

```sh
docker compose -f development/compose.yml run --rm test
```

## End-to-end tests

Playwright drives the built extension in Chromium, so build first. The e2e image carries the browser, matched to the
`@playwright/test` version in `pnpm-lock.yaml`. After bumping it, [rebuild the images](#rebuild-the-images), otherwise
Playwright fails with `Executable doesn't exist at /ms-playwright/...`.

```sh
docker compose -f development/compose.yml run --rm build
docker compose -f development/compose.yml run --rm e2e
docker compose -f development/compose.yml run --rm e2e restore-editor -g "focused"
docker compose -f development/compose.yml run --rm e2e-debug
```

The list reporter prints to the console and the JSON report lands in `development/.artifacts/e2e.json`; traces and
screenshots of failures go to `development/.artifacts/e2e-results/`.

## Audit

```sh
docker compose -f development/compose.yml run --rm audit
```

To fix what it reports, see [Fix vulnerable dependencies](#fix-vulnerable-dependencies).

## Validate all

Runs `audit`, `type-check`, `lint`, `test`, `build` and `e2e` in that order, stopping at the first failure:

```sh
docker compose -f development/compose.yml run --rm validate
```

## Fix vulnerable dependencies

`audit` reports known vulnerabilities in the installed packages. Most of them are in transitive dependencies (the
dependencies of our dependencies), which can't be bumped in `package.json`. `audit-fix` works around that by adding an
entry to the `overrides` list in `pnpm-workspace.yaml` for each advisory, forcing the patched version of that package.

1. Add overrides for every reported vulnerability:
    ```sh
    docker compose -f development/compose.yml run --rm audit-fix
    ```
2. `audit-fix` only edits `pnpm-workspace.yaml`. Apply the overrides to `pnpm-lock.yaml`:
    ```sh
    docker compose -f development/compose.yml run --rm install-update
    ```
3. Check that nothing is reported anymore and that the forced versions didn't break anything:
    ```sh
    docker compose -f development/compose.yml run --rm validate
    ```

### When an override can't be used

Sometimes `audit-fix` can't help: the only fixed version is a new major release that breaks a package depending on it
(`validate` fails), or no fixed version exists yet. Then:

1. Remove that override from `pnpm-workspace.yaml`.
2. Read the advisory and judge whether it applies to us: which of our dependencies pulls the package in, whether it
   ends up in `dist/` or is only used by the dev tooling, and whether it ever handles untrusted input.
3. If it is safe to ignore, add the advisory ID to `audit.ignore`, with a short comment naming the package and why it
   doesn't affect us:
    ```yaml
    audit:
      ignore:
        - GHSA-g3hv-75wg-m249 # minimatch: lint-only, trusted globs
    ```
   If it isn't safe, don't ignore it. Fix the breakage or replace the dependency instead.
4. Run `install-update` and `validate` again.

With `audit.ignorePrune: true`, `audit-fix` removes ignore entries once their advisory no longer shows up, so the list
cleans itself up over time.

## Update dependencies

Overrides pin a package version at the time of the audit. Once the packages that depend on them ship fixed versions of
their own, the overrides are no longer needed, and they can hold back newer versions. So an update starts by removing
them and lets the audit add back only what is still vulnerable.

1. Delete the whole `overrides` list from `pnpm-workspace.yaml`.
2. Update pnpm and Node by hand, since the next step leaves them alone: pnpm in `packageManager` in `package.json`
   (newest version on [npm](https://www.npmjs.com/package/pnpm)), Node in both `FROM` lines of
   `development/Dockerfile` (a `<version>-bookworm-slim` tag from [Docker Hub](https://hub.docker.com/_/node)).
3. Update every dependency in `package.json` to its newest version, including new major versions beyond the ranges in
   `package.json`. This rewrites `package.json` and `pnpm-lock.yaml`:
    ```sh
    docker compose -f development/compose.yml run --rm update-latest
    ```
4. Review the diff in `package.json`. For each major version bump, check that package's changelog for breaking changes.
   Keep `@types/node` on the same major as the Node in the Dockerfile: if `update-latest` moved it past that, set it
   back in `package.json` and run `install-update`.
5. [Rebuild the images](#rebuild-the-images), so that `validate` in the next step runs on the new Node and pnpm, with
   the browser for the new `@playwright/test` version.
6. Follow [Fix vulnerable dependencies](#fix-vulnerable-dependencies) above. `validate` there also catches breakage from
   the major bumps.
