# CSS Parser

> Source officielle : https://docs.uniwind.dev/api/css

> Version Markdown source : https://docs.uniwind.dev/api/css.md

**Section locale :** `api/`

## Résumé

Write custom CSS classes alongside Tailwind in your React Native app

## Points importants

- custom CSS classes in `global.css`
- mixing custom classes with Tailwind utilities
- `light-dark()` for theme-aware values
- compile-time CSS parsing

## Exemple / syntaxe typique

```css
/* global.css */
.card {
  background-color: white;
  border-radius: 8px;
}
```

```tsx
<View className="card p-4" />
```

## Attention

- Prefer Tailwind utilities for simple styles.
- Keep selectors flat and component-scoped; React Native does not behave like full browser CSS.
- Unsupported web CSS features can fail or be ignored.

## Quand utiliser cette page

- Quand tu travailles sur `CSS Parser` dans un projet React Native / Expo avec Uniwind.
- Quand tu veux vérifier la syntaxe exacte, les limites ou les props supportées.
- Quand tu veux alimenter Claude Code/Cursor avec une documentation locale courte et navigable.

## Référence

- URL : https://docs.uniwind.dev/api/css
- Chemin docs : `api/css.md`

---

Note : ce fichier est une fiche locale structurée et condensée construite à partir de l’index officiel `llms.txt` et des pages publiques Uniwind. Pour une copie brute intégrale, utiliser directement `llms-full.txt`.