# Scoped Themes

> Source officielle : https://docs.uniwind.dev/api/scoped-themes

> Version Markdown source : https://docs.uniwind.dev/api/scoped-themes.md

**Section locale :** `api/`

## Résumé

Apply a different theme to a subtree with `ScopedTheme`

## Points importants

- `ScopedTheme` creates a theme boundary for descendants
- nested scopes override parent scopes
- hooks and `withUniwind` resolve against the closest scope

## Exemple / syntaxe typique

```tsx
<ScopedTheme theme="dark">
  <View className="bg-background">
    <Text className="text-foreground">Dark subtree</Text>
  </View>
</ScopedTheme>
```

## Attention

- Scoped themes do not change the global app theme.
- The theme name must be registered/available.

## Quand utiliser cette page

- Quand tu travailles sur `Scoped Themes` dans un projet React Native / Expo avec Uniwind.
- Quand tu veux vérifier la syntaxe exacte, les limites ou les props supportées.
- Quand tu veux alimenter Claude Code/Cursor avec une documentation locale courte et navigable.

## Référence

- URL : https://docs.uniwind.dev/api/scoped-themes
- Chemin docs : `api/scoped-themes.md`

---

Note : ce fichier est une fiche locale structurée et condensée construite à partir de l’index officiel `llms.txt` et des pages publiques Uniwind. Pour une copie brute intégrale, utiliser directement `llms-full.txt`.