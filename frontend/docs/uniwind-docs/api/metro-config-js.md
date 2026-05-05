# metro.config.js

> Source officielle : https://docs.uniwind.dev/api/metro-config

> Version Markdown source : https://docs.uniwind.dev/api/metro-config.md

**Section locale :** `api/`

## Résumé

Configure Uniwind in your Metro bundler for React Native

## Points importants

- `withUniwindConfig` wraps Metro config
- `cssEntryFile` points to `global.css`
- `dtsFile` controls generated TypeScript definitions
- `extraThemes` registers custom themes
- `debug` helps identify unsupported CSS

## Exemple / syntaxe typique

```js
const { getDefaultConfig } = require('expo/metro-config')
const { withUniwindConfig } = require('uniwind/metro')

const config = getDefaultConfig(__dirname)

module.exports = withUniwindConfig(config, {
  cssEntryFile: './src/global.css',
  dtsFile: './src/uniwind-types.d.ts',
})
```

## Attention

- `cssEntryFile` should be a relative path.
- `withUniwindConfig` should be the outermost Metro wrapper.
- Restart Metro after config changes.

## Quand utiliser cette page

- Quand tu travailles sur `metro.config.js` dans un projet React Native / Expo avec Uniwind.
- Quand tu veux vérifier la syntaxe exacte, les limites ou les props supportées.
- Quand tu veux alimenter Claude Code/Cursor avec une documentation locale courte et navigable.

## Référence

- URL : https://docs.uniwind.dev/api/metro-config
- Chemin docs : `api/metro-config.md`

---

Note : ce fichier est une fiche locale structurée et condensée construite à partir de l’index officiel `llms.txt` et des pages publiques Uniwind. Pour une copie brute intégrale, utiliser directement `llms-full.txt`.