# Contributing to hashless

Thank you for your interest in contributing! This document explains how to get involved.

---

## Code of Conduct

Be kind. hashless is a small, focused project maintained in spare time. Hostile, dismissive, or harassing issues and pull requests will be closed without discussion.

---

## The Golden Rule

**Open an issue before opening a PR for anything non-trivial.**

For bug fixes with a clear reproduction this is not required. For new features, API changes, or significant refactors, please discuss first. This saves everyone time.

---

## Ways to Contribute

- **Bug reports** — clear reproductions are incredibly helpful
- **Documentation** — fixing typos, improving examples, expanding the README
- **Tests** — adding missing coverage or improving existing test quality
- **Answering issues** — helping other users is a real contribution
- **Sharing** — writing about the library or including it in a showcase

---

## Reporting a Bug

1. Search existing issues before opening a new one.
2. Include a **minimal reproduction** — a CodePen, StackBlitz, or small repo that demonstrates the problem.
3. State the browser(s), OS, and version of hashless where you saw the issue.

Reports without a reproduction will be deprioritised.

---

## Requesting a Feature

Open an issue describing the use case you want to solve. Note that **hashless is intentionally small and has zero runtime dependencies**. Features that would add weight, introduce dependencies, or push the gzipped bundle past 2 kB will generally not be accepted unless they address a significant gap.

---

## Setting Up the Project Locally

Requires [Node.js](https://nodejs.org) ≥ 24 and [pnpm](https://pnpm.io).

```bash
git clone https://github.com/JoshTeflon/hashless.git
cd hashless
pnpm install
```

---

## Scripts

| Script | What it does |
| --- | --- |
| `pnpm build` | Compile the library with tsdown (CJS + ESM + `.d.ts`) |
| `pnpm build:watch` | Compile in watch mode |
| `pnpm test` | Run unit tests with Vitest (jsdom environment) |
| `pnpm test:e2e` | Run end-to-end tests with Playwright |
| `pnpm test:bundle` | Verify the built bundle is importable as CJS and ESM |
| `pnpm test:size` | Check the gzipped bundle size against the 2 kB limit |
| `pnpm lint` | Lint `src/` with ESLint + TypeScript ESLint |
| `pnpm changeset` | Start the interactive prompt to record a changeset |
| `pnpm version` | Consume pending changesets and bump `package.json` + `CHANGELOG.md` |
| `pnpm release` | Build and publish to npm via changesets |

---

## Making a Change

1. Fork the repo and create a branch from `main`.

   Branch naming convention:
   - `feat/short-description` — new feature
   - `fix/short-description` — bug fix
   - `docs/short-description` — documentation only
   - `refactor/short-description` — internal change with no behaviour change

2. **hashless has zero runtime dependencies and must stay that way.** Do not add anything to `dependencies` in `package.json`.

3. All source code lives in `src/`. It must pass strict TypeScript (`strict: true`, `noImplicitAny`, `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`).

4. Every browser API call must be guarded against SSR environments (check `typeof document !== 'undefined'` or `typeof history !== 'undefined'` before use).

5. Public API changes (`SectionNavOptions`, `SectionNavInstance`) require an issue discussion before a PR is opened.

6. Run `pnpm lint` and `pnpm test` before pushing. Both must pass.

---

## Writing Tests

### Unit tests — `tests/unit/`

Run with `pnpm test` (Vitest, jsdom).

- Cover all public option behaviours.
- Cover edge cases: missing sections, SSR environment (`document` undefined), duplicate slash normalisation.
- Mock browser APIs (`IntersectionObserver`, `history`, `matchMedia`) where needed — see `tests/unit/setup.ts` and `tests/unit/utils.ts` for helpers.

### End-to-end tests — `tests/e2e/`

Run with `pnpm test:e2e` (Playwright, real browser).

- Use the fixture page at `tests/e2e/fixtures/index.html` as a base.
- The local dev server is started by `tests/e2e/server.mjs`.
- Cover real navigation: anchor clicks, URL updates, back/forward, deep-link scroll-on-load.

### Bundle tests — `tests/bundle/`

Run with `pnpm test:bundle`.

- Verify that the built CJS and ESM outputs can be imported and that exports resolve correctly.

---

## Submitting a Pull Request

Before opening a PR, confirm:

- [ ] An issue exists for non-trivial changes (or you've discussed it in the relevant issue).
- [ ] `pnpm lint` passes with no new warnings.
- [ ] `pnpm test` passes.
- [ ] `pnpm build` succeeds and `pnpm test:size` is under the limit.
- [ ] New behaviour is covered by tests.
- [ ] If you changed the public API, `README.md` is updated to reflect it.
- [ ] A changeset has been created (`pnpm changeset`).

Fill in the PR description with a summary of what changed and why.

---

## Commit Message Format

This project follows [Conventional Commits](https://www.conventionalcommits.org/).

```
<type>: <short summary>
```

Types:

| Type | When to use |
| --- | --- |
| `feat` | A new feature visible to users |
| `fix` | A bug fix |
| `docs` | Documentation only changes |
| `test` | Adding or updating tests |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `chore` | Build process, tooling, or dependency updates |
| `perf` | A change that improves performance |

Examples:

```
feat: add scrollBehavior option with prefers-reduced-motion support
fix: prevent duplicate slashes in basePath URL normalisation
docs: document navigateTo in README API table
chore: update vitest to v4
```

---

## Adding a Changeset

Every user-facing change needs a changeset so the version bump and changelog entry are generated automatically.

```bash
pnpm changeset
```

The interactive prompt will ask:

1. **Which packages to include** — select `hashless` (press `Space`, then `Enter`).
2. **Bump type:**
   - `patch` — bug fixes, documentation, internal changes with no API impact (`1.0.0` → `1.0.1`)
   - `minor` — new backwards-compatible options or behaviours (`1.0.0` → `1.1.0`)
   - `major` — breaking API changes (`1.0.0` → `2.0.0`)
3. **Summary** — write a single sentence describing the change from the user's perspective.

This creates a file in `.changeset/`. Commit it alongside your code changes.

---

## Release Process (maintainers only)

Releases are fully automated via GitHub Actions (`.github/workflows/release.yml`).

1. Merge a PR that contains one or more `.changeset/*.md` files into `main`.
2. The workflow opens (or updates) a **"Version Packages"** PR that bumps `package.json` and writes `CHANGELOG.md` entries.
3. Merging the Version Packages PR triggers a publish to npm automatically.

No manual `npm publish` is required.
