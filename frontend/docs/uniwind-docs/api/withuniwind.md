# withUniwind

> Source officielle : https://docs.uniwind.dev/api/with-uniwind

> Version Markdown source : https://docs.uniwind.dev/api/with-uniwind.md

**Section locale :** `api/`

## Résumé

Add `className` support to any React Native component

## Points importants

- add `className` support to third-party React Native components
- map classes to style props or other component props
- useful when a component does not expose `className` by default

## Exemple / syntaxe typique

```tsx
const StyledComponent = withUniwind(SomeComponent)

<StyledComponent className="bg-blue-500 p-4" />
```

## Attention

- Not every component needs wrapping; components built on RN primitives may already work.
- Check that the wrapped component forwards style-like props correctly.

## Quand utiliser cette page

- Quand tu travailles sur `withUniwind` dans un projet React Native / Expo avec Uniwind.
- Quand tu veux vérifier la syntaxe exacte, les limites ou les props supportées.
- Quand tu veux alimenter Claude Code/Cursor avec une documentation locale courte et navigable.

## Référence

- URL : https://docs.uniwind.dev/api/with-uniwind
- Chemin docs : `api/with-uniwind.md`

---

Note : ce fichier est une fiche locale structurée et condensée construite à partir de l’index officiel `llms.txt` et des pages publiques Uniwind. Pour une copie brute intégrale, utiliser directement `llms-full.txt`.