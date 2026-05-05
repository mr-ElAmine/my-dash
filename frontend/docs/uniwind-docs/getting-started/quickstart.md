# Quickstart

> Source officielle : https://docs.uniwind.dev/quickstart

> Version Markdown source : https://docs.uniwind.dev/quickstart.md

**Section locale :** `getting-started/`

## Résumé

Set up Tailwind CSS in React Native with Uniwind in under 5 minutes. Works with Expo, bare React Native, and Vite. No Babel preset required.

## Points importants

- install `uniwind` and `tailwindcss`
- create `global.css` with Tailwind and Uniwind imports
- import CSS in app/root component
- configure Metro or Vite
- enable Tailwind IntelliSense

## Exemple / syntaxe typique

```bash
npm install uniwind tailwindcss
```

```css
@import 'tailwindcss';
@import 'uniwind';
```

## Attention

- Uniwind targets Tailwind CSS v4.
- Import `global.css` from your app/root component, not from a registration-only entry file.
- The location of `global.css` affects class scanning.

## Quand utiliser cette page

- Quand tu travailles sur `Quickstart` dans un projet React Native / Expo avec Uniwind.
- Quand tu veux vérifier la syntaxe exacte, les limites ou les props supportées.
- Quand tu veux alimenter Claude Code/Cursor avec une documentation locale courte et navigable.

## Référence

- URL : https://docs.uniwind.dev/quickstart
- Chemin docs : `quickstart.md`

---

Note : ce fichier est une fiche locale structurée et condensée construite à partir de l’index officiel `llms.txt` et des pages publiques Uniwind. Pour une copie brute intégrale, utiliser directement `llms-full.txt`.