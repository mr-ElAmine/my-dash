# Tailwind Basics

> Source officielle : https://docs.uniwind.dev/tailwind-basics

> Version Markdown source : https://docs.uniwind.dev/tailwind-basics.md

**Section locale :** `tailwind/`

## Résumé

Learn to use Tailwind CSS classes in React Native with Uniwind. Covers utility classes, responsive breakpoints, dark mode, CSS variables, and platform selectors.

## Points importants

- complete class names must be present at build time
- avoid dynamic string interpolation for classes
- use mapping objects or conditional complete class names
- tailwind-variants can help for variants/compound variants

## Exemple / syntaxe typique

```tsx
const colorVariants = {
  primary: 'bg-blue-500 text-white',
  danger: 'bg-red-500 text-white',
}

<View className={colorVariants[variant]} />
```

## Attention

- Avoid `bg-${color}-500` and similar dynamic class construction.

## Quand utiliser cette page

- Quand tu travailles sur `Tailwind Basics` dans un projet React Native / Expo avec Uniwind.
- Quand tu veux vérifier la syntaxe exacte, les limites ou les props supportées.
- Quand tu veux alimenter Claude Code/Cursor avec une documentation locale courte et navigable.

## Référence

- URL : https://docs.uniwind.dev/tailwind-basics
- Chemin docs : `tailwind-basics.md`

---

Note : ce fichier est une fiche locale structurée et condensée construite à partir de l’index officiel `llms.txt` et des pages publiques Uniwind. Pour une copie brute intégrale, utiliser directement `llms-full.txt`.