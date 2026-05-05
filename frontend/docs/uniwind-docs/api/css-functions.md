# CSS Functions

> Source officielle : https://docs.uniwind.dev/api/css-functions

> Version Markdown source : https://docs.uniwind.dev/api/css-functions.md

**Section locale :** `api/`

## Résumé

Use CSS functions to create dynamic styles

## Points importants

- `hairlineWidth()` for thin dividers
- `fontScale()` for accessibility-aware typography
- `pixelRatio()` for density-aware sizing
- `light-dark()` for light/dark values

## Exemple / syntaxe typique

```css
@utility h-hairline { height: hairlineWidth(); }
@utility text-base-scaled { font-size: fontScale(); }
@utility bg-adaptive { background-color: light-dark(#ffffff, #111827); }
```

## Attention

- Declare functions inside utilities in `global.css`; do not rely on arbitrary runtime strings in `className`.

## Quand utiliser cette page

- Quand tu travailles sur `CSS Functions` dans un projet React Native / Expo avec Uniwind.
- Quand tu veux vérifier la syntaxe exacte, les limites ou les props supportées.
- Quand tu veux alimenter Claude Code/Cursor avec une documentation locale courte et navigable.

## Référence

- URL : https://docs.uniwind.dev/api/css-functions
- Chemin docs : `api/css-functions.md`

---

Note : ce fichier est une fiche locale structurée et condensée construite à partir de l’index officiel `llms.txt` et des pages publiques Uniwind. Pour une copie brute intégrale, utiliser directement `llms-full.txt`.