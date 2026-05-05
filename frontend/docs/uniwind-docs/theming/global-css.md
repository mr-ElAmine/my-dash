# Global CSS

> Source officielle : https://docs.uniwind.dev/theming/global-css

> Version Markdown source : https://docs.uniwind.dev/theming/global-css.md

**Section locale :** `theming/`

## Résumé

Configure global styles, themes, and CSS variables in your Uniwind app

## Points importants

- central CSS entry point
- Tailwind and Uniwind imports
- CSS variables and theme layers
- custom utilities and sources

## Exemple / syntaxe typique

```css
@import 'tailwindcss';
@import 'uniwind';
```

## Attention

- Keep `global.css` near the app root for predictable scanning.
- Use `@source` for files outside the default scan root.

## Quand utiliser cette page

- Quand tu travailles sur `Global CSS` dans un projet React Native / Expo avec Uniwind.
- Quand tu veux vérifier la syntaxe exacte, les limites ou les props supportées.
- Quand tu veux alimenter Claude Code/Cursor avec une documentation locale courte et navigable.

## Référence

- URL : https://docs.uniwind.dev/theming/global-css
- Chemin docs : `theming/global-css.md`

---

Note : ce fichier est une fiche locale structurée et condensée construite à partir de l’index officiel `llms.txt` et des pages publiques Uniwind. Pour une copie brute intégrale, utiliser directement `llms-full.txt`.