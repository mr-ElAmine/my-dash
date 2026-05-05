# Troubleshooting

> Source officielle : https://docs.uniwind.dev/faq

> Version Markdown source : https://docs.uniwind.dev/faq.md

**Section locale :** `guides/`

## Résumé

Common issues and solutions for Uniwind — the React Native Tailwind CSS library. Setup errors, theming questions, className merging, migration from NativeWind, and performance tips.

## Points importants

- setup errors
- font loading
- global.css placement
- class merging
- style specificity
- Next.js support status
- safe-area utilities

## Exemple / syntaxe typique

```tsx
<View className="bg-red-500" style={{ backgroundColor: 'blue' }} />
// inline style wins
```

## Attention

- Inline styles override className styles.
- Next.js is not the main official target; Uniwind is built for Metro and Vite/RNW.

## Quand utiliser cette page

- Quand tu travailles sur `Troubleshooting` dans un projet React Native / Expo avec Uniwind.
- Quand tu veux vérifier la syntaxe exacte, les limites ou les props supportées.
- Quand tu veux alimenter Claude Code/Cursor avec une documentation locale courte et navigable.

## Référence

- URL : https://docs.uniwind.dev/faq
- Chemin docs : `faq.md`

---

Note : ce fichier est une fiche locale structurée et condensée construite à partir de l’index officiel `llms.txt` et des pages publiques Uniwind. Pour une copie brute intégrale, utiliser directement `llms-full.txt`.