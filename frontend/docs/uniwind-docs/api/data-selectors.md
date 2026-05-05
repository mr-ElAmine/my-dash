# Data Selectors

> Source officielle : https://docs.uniwind.dev/api/data-selectors

> Version Markdown source : https://docs.uniwind.dev/api/data-selectors.md

**Section locale :** `api/`

## Résumé

Style components based on prop values using data-[...] variants

## Points importants

- Tailwind-like `data-[prop=value]:...` variants
- boolean matches with `true` / `false`
- string matches for custom state/variant props

## Exemple / syntaxe typique

```tsx
<View
  data-state={isOpen ? 'open' : 'closed'}
  className="data-[state=open]:bg-muted data-[state=closed]:bg-transparent"
/>
```

## Attention

- Only equality checks are supported.
- Presence-only selectors such as `data-[disabled]` are not supported.

## Quand utiliser cette page

- Quand tu travailles sur `Data Selectors` dans un projet React Native / Expo avec Uniwind.
- Quand tu veux vérifier la syntaxe exacte, les limites ou les props supportées.
- Quand tu veux alimenter Claude Code/Cursor avec une documentation locale courte et navigable.

## Référence

- URL : https://docs.uniwind.dev/api/data-selectors
- Chemin docs : `api/data-selectors.md`

---

Note : ce fichier est une fiche locale structurée et condensée construite à partir de l’index officiel `llms.txt` et des pages publiques Uniwind. Pour une copie brute intégrale, utiliser directement `llms-full.txt`.