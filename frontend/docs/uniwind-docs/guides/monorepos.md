# Monorepos

> Source officielle : https://docs.uniwind.dev/monorepos

> Version Markdown source : https://docs.uniwind.dev/monorepos.md

**Section locale :** `guides/`

## Résumé

Configure Uniwind to work seamlessly in monorepo setups

## Points importants

- include code outside app root with `@source`
- configure `cssEntryFile` carefully
- workspace package scanning

## Exemple / syntaxe typique

```css
@source "../packages/ui";
```

## Attention

- If shared package classes are missing, check `global.css` location and `@source` directives.

## Quand utiliser cette page

- Quand tu travailles sur `Monorepos` dans un projet React Native / Expo avec Uniwind.
- Quand tu veux vérifier la syntaxe exacte, les limites ou les props supportées.
- Quand tu veux alimenter Claude Code/Cursor avec une documentation locale courte et navigable.

## Référence

- URL : https://docs.uniwind.dev/monorepos
- Chemin docs : `monorepos.md`

---

Note : ce fichier est une fiche locale structurée et condensée construite à partir de l’index officiel `llms.txt` et des pages publiques Uniwind. Pour une copie brute intégrale, utiliser directement `llms-full.txt`.