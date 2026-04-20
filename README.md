# hashless

`hashless` is a small browser utility for section-based navigation without `#hash` fragments in the URL.

It watches visible sections with `IntersectionObserver`, updates the path with the History API, and intercepts in-page anchor clicks so navigation stays clean while still scrolling smoothly.

## Features

- No hash fragments in the URL
- Smooth scrolling for anchor links like `#about`
- Automatic path updates as sections enter view
- `pushState` or `replaceState` update strategies
- Small API with TypeScript types included

## Installation

```bash
# npm
npm install hashless

# pnpm
pnpm add hashless

# yarn
yarn add hashless
```

## How It Works

Given page sections with `id` attributes and links that point to those ids, `hashless`:

1. Prevents the browser from briefly writing `#section-id` to the URL.
2. Smooth-scrolls to the target section when an anchor is clicked.
3. Observes visible sections.
4. Rewrites the current URL to `/{sectionId}` or `{basePath}/{sectionId}`.

Example:

- Clicking `<a href="#features">Features</a>` scrolls to `#features`
- The URL becomes `/features` instead of `/#features`
- With `basePath: '/docs'`, the URL becomes `/docs/features`

## Basic Usage

```ts
import { createSectionNav } from 'hashless';

const nav = createSectionNav({
  sections: 'section',
  threshold: 0.5,
  updateStrategy: 'replace',
  basePath: '/docs',
  onNavigate: (sectionId) => {
    console.log('Visible section:', sectionId);
  },
});

// Later
nav.navigateTo('api');

// Cleanup
nav.destroy();
```

## HTML Example

```html
<nav>
  <a href="#intro">Intro</a>
  <a href="#features">Features</a>
  <a href="#api">API</a>
</nav>

<section id="intro" data-section>...</section>
<section id="features" data-section>...</section>
<section id="api" data-section>...</section>
```

```ts
import { createSectionNav } from 'hashless';

createSectionNav({
  sections: '[data-section]',
});
```

## API

### `createSectionNav(options?)`

Creates section navigation and returns a controller object.

#### Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `sections` | `string \| NodeListOf<Element> \| Element[]` | `'[data-section]'` | Selector or explicit list of observed sections |
| `rootMargin` | `string` | `'0px'` | `IntersectionObserver` root margin |
| `threshold` | `number` | `0.5` | Visibility threshold used by the observer |
| `updateStrategy` | `'push' \| 'replace'` | `'replace'` | Chooses `history.pushState` or `history.replaceState` |
| `onNavigate` | `(sectionId: string) => void` | `undefined` | Called when the most visible observed section changes |
| `basePath` | `string` | `''` | Prefix added before the section id in the rewritten URL |

#### Return Value

```ts
interface ISectionNavInstance {
  destroy: () => void;
  navigateTo: (sectionId: string) => void;
}
```

### `destroy()`

Stops observing sections and removes the global click listener.

### `navigateTo(sectionId)`

Smooth-scrolls to a section by its `id`.

## Requirements and Notes

- This library is intended for browser environments.
- Observed sections should have unique `id` values.
- Anchor links should use `href="#section-id"`.
- URL updates use the History API and do not trigger full page reloads.
- Generated paths are normalized to avoid duplicate slashes.
- If your page lives under a nested route such as `/docs`, set `basePath: '/docs'` so section updates do not rewrite the URL to the site root.