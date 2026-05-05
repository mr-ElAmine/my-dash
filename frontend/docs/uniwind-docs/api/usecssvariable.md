# useCSSVariable

> Source officielle : https://docs.uniwind.dev/api/use-css-variable

> Version Markdown source : https://docs.uniwind.dev/api/use-css-variable.md

**Section locale :** `api/`

## Résumé

Access CSS variable values in JavaScript with automatic theme updates

## Points importants

- read CSS variables from JavaScript
- single variable or array of variables
- reacts to theme changes
- useful for charts, maps, native modules, and animations

## Exemple / syntaxe typique

```tsx
const [primary, background] = useCSSVariable([
  '--color-primary',
  '--color-background',
])
```

## Attention

- Prefer `className` for styling components.
- Variables must be used in classes or defined in `@theme static` to be available.

## Quand utiliser cette page

- Quand tu travailles sur `useCSSVariable` dans un projet React Native / Expo avec Uniwind.
- Quand tu veux vérifier la syntaxe exacte, les limites ou les props supportées.
- Quand tu veux alimenter Claude Code/Cursor avec une documentation locale courte et navigable.

## Référence

- URL : https://docs.uniwind.dev/api/use-css-variable
- Chemin docs : `api/use-css-variable.md`

---

Note : ce fichier est une fiche locale structurée et condensée construite à partir de l’index officiel `llms.txt` et des pages publiques Uniwind. Pour une copie brute intégrale, utiliser directement `llms-full.txt`.