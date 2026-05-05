# Custom Tailwind Utilities

> Source officielle : https://docs.uniwind.dev/theming/custom-utilities

> Version Markdown source : https://docs.uniwind.dev/theming/custom-utilities.md

**Section locale :** `theming/`

## Résumé

Add, extend, and override Tailwind utility classes using @utility and @theme in global.css

## Points importants

- create custom utilities with `@utility`
- use `@theme static` for runtime-updated variables
- override or extend Tailwind utilities in CSS

## Exemple / syntaxe typique

```css
@theme static {
  --header-height: 0px;
}

@utility p-safe-header {
  padding-top: var(--header-height);
}
```

## Attention

- Custom utility names should be kebab-case.
- Use `@theme static` when JS needs access to variables even before they appear in class names.

## Quand utiliser cette page

- Quand tu travailles sur `Custom Tailwind Utilities` dans un projet React Native / Expo avec Uniwind.
- Quand tu veux vérifier la syntaxe exacte, les limites ou les props supportées.
- Quand tu veux alimenter Claude Code/Cursor avec une documentation locale courte et navigable.

## Référence

- URL : https://docs.uniwind.dev/theming/custom-utilities
- Chemin docs : `theming/custom-utilities.md`

---

Note : ce fichier est une fiche locale structurée et condensée construite à partir de l’index officiel `llms.txt` et des pages publiques Uniwind. Pour une copie brute intégrale, utiliser directement `llms-full.txt`.