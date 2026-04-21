# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- `createSectionNav(options?)` — primary factory function that wires up section-based URL navigation without hash fragments.
- `sections` option — accepts a CSS selector string, `NodeListOf<Element>`, or `Element[]` to specify which elements to observe. Defaults to `'[data-section]'`.
- `rootMargin` option — forwarded to `IntersectionObserver` as the root margin. Defaults to `'0px'`.
- `threshold` option — visibility threshold used by the `IntersectionObserver`. Accepts a `number` or `number[]`. Defaults to `0.5`.
- `updateStrategy` option — chooses between `'push'` (`history.pushState`) and `'replace'` (`history.replaceState`) for URL updates. Defaults to `'replace'`.
- `basePath` option — prefix prepended to the section id in the rewritten URL (e.g. `'/docs'` → `/docs/features`). Defaults to `''`.
- `onNavigate` callback — invoked with the visible section's `id` whenever the most visible observed section changes.
- `scrollBehavior` option — controls the `ScrollBehavior` used when scrolling to sections (`'smooth'`, `'auto'`, or `'instant'`). When omitted, defaults to `'smooth'` unless `prefers-reduced-motion: reduce` is active, in which case `'auto'` is used.
- `destroy()` — stops the `IntersectionObserver`, removes the global anchor click listener, and removes the `popstate` listener.
- `navigateTo(sectionId)` — smooth-scrolls to a section by its `id` and focuses it (with `preventScroll: true`) for accessibility.
- Anchor click interception — a single delegated `click` listener on `document` intercepts `<a href="#id">` clicks, prevents the browser from writing the hash to the URL, and smooth-scrolls to the target element instead.
- Automatic scroll-on-load — on init, the library reads the current URL path and scrolls to the matching section if one exists, enabling deep-link support.
- `popstate` listener — re-scrolls to the path-derived section when the user navigates with the browser back/forward buttons.
- URL normalisation — generated paths are de-duplicated for slashes and always start with `/`.
- SSR guard — the library returns a no-op instance when `document` is `undefined`, making it safe to import in server-side rendering environments.
- Deterministic section selection — when multiple sections intersect simultaneously, the one with the highest intersection ratio wins; ties are broken by document order.
- Zero runtime dependencies.

---

<!--
HOW TO ADD A NEW ENTRY
======================

Copy the relevant category header(s) below into the [Unreleased] section and add
your bullet points underneath. When a release is cut, the [Unreleased] section is
moved to a new versioned section (e.g. ## [1.1.0] - 2026-05-01) by `changeset version`.

Categories:
  ### Added      — new features (backwards-compatible)
  ### Changed    — changes to existing behaviour (backwards-compatible)
  ### Deprecated — features that will be removed in a future version
  ### Removed    — features removed in this version
  ### Fixed      — bug fixes
  ### Security   — security patches

Keep entries short and written from the user's perspective.
Reference a PR or issue number where helpful: ([#42](https://github.com/JoshTeflon/hashless/pull/42))
-->

[unreleased]: https://github.com/JoshTeflon/hashless/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/JoshTeflon/hashless/releases/tag/v1.0.0
