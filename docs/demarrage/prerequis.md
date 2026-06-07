# Prérequis

## Outils nécessaires

- Git ;
- Docker Desktop avec Docker Compose ;
- Node.js 20 ou une version compatible ;
- pnpm 10 ;
- un éditeur TypeScript, par exemple VS Code.

Docker est utilisé pour lancer les services d'infrastructure. Le backend et le frontend sont lancés localement afin de conserver le rechargement automatique.

## Récupérer le dépôt

```bash
git clone git@github.com:mr-ElAmine/my-dash.git
cd my-dash
```

## Structure racine

```text
my-dash/
  backend/
  frontend/
  infrastructure/
    dev/
    test/
    prod/
  .github/workflows/
```

## Installation des dépendances

Les deux applications possèdent leur propre `package.json` et leur propre lockfile.

```bash
cd backend
pnpm install --frozen-lockfile

cd ../frontend
pnpm install --frozen-lockfile
```

Ne pas lancer une installation depuis la racine : le dépôt n'est pas configuré comme un workspace pnpm.
