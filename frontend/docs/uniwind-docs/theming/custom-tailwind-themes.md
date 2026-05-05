# Custom Tailwind Themes

> Source officielle : https://docs.uniwind.dev/theming/custom-themes

> Version Markdown source : https://docs.uniwind.dev/theming/custom-themes.md

**Section locale :** `theming/`

## Résumé

Go beyond light and dark. Create unlimited custom themes in React Native using Tailwind CSS variables — branding, seasonal modes, accessibility themes and more.

## Points importants

- define CSS variables per theme in `global.css`
- register theme names in `extraThemes`
- all themes should define the same variable set

## Exemple / syntaxe typique

```css
@layer theme {
  :root {
    @variant premium {
      --color-background: #1e1b4b;
      --color-foreground: #fef3c7;
    }
  }
}
```

## Attention

- Restart Metro after adding themes.
- Missing variables can produce inconsistent UI.

## Quand utiliser cette page

- Quand tu travailles sur `Custom Tailwind Themes` dans un projet React Native / Expo avec Uniwind.
- Quand tu veux vérifier la syntaxe exacte, les limites ou les props supportées.
- Quand tu veux alimenter Claude Code/Cursor avec une documentation locale courte et navigable.

## Référence

- URL : https://docs.uniwind.dev/theming/custom-themes
- Chemin docs : `theming/custom-themes.md`

---

Note : ce fichier est une fiche locale structurée et condensée construite à partir de l’index officiel `llms.txt` et des pages publiques Uniwind. Pour une copie brute intégrale, utiliser directement `llms-full.txt`.