# Development environment

Docker-based toolchain so you don't need Node/pnpm installed on the host. All commands below are
run from the **project root** (one level up from this file), passing `development/compose.yml`
explicitly via `-f`.

The `pnpm-store` volume is shared across your projects on this host. Before the first install,
create it once:

```sh
docker volume create pnpm-store
```

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

Rebuild the toolchain image first if the Dockerfile changed:

```sh
docker compose -f development/compose.yml run --rm --build build
```

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

## Audit

```sh
docker compose -f development/compose.yml run --rm audit
docker compose -f development/compose.yml run --rm audit-fix
```
