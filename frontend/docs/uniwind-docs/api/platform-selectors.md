# Platform Selectors

> Source officielle : https://docs.uniwind.dev/api/platform-select

> Version Markdown source : https://docs.uniwind.dev/api/platform-select.md

**Section locale :** `api/`

## Résumé

Apply platform-specific styles with built-in selectors for iOS, Android, Web, and TV platforms

## Points importants

- `ios:`
- `android:`
- `web:`
- `native:` for iOS+Android
- `tv:`, `apple-tv:`, `android-tv:` when TV support is enabled

## Exemple / syntaxe typique

```tsx
<View className="ios:pt-12 android:pt-6 web:hover:bg-muted native:px-4" />
```

## Attention

- Use `native:` when iOS and Android share the same style.
- TV selectors require enabling TV support in config.

## Quand utiliser cette page

- Quand tu travailles sur `Platform Selectors` dans un projet React Native / Expo avec Uniwind.
- Quand tu veux vérifier la syntaxe exacte, les limites ou les props supportées.
- Quand tu veux alimenter Claude Code/Cursor avec une documentation locale courte et navigable.

## Référence

- URL : https://docs.uniwind.dev/api/platform-select
- Chemin docs : `api/platform-select.md`

---

Note : ce fichier est une fiche locale structurée et condensée construite à partir de l’index officiel `llms.txt` et des pages publiques Uniwind. Pour une copie brute intégrale, utiliser directement `llms-full.txt`.