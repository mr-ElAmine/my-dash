# Conventions API

## URL

Les endpoints utilisent le préfixe :

```text
/api
```

Il n'existe actuellement pas de version dans l'URL.

Exemples :

```text
/api/auth/login
/api/organizations
/api/organizations/:organizationId/companies
/api/organizations/:organizationId/quotes
```

## Authentification

Les routes protégées attendent :

```http
Authorization: Bearer <access_token>
```

Le frontend ajoute ce header dans l'interceptor de `frontend/services/api.ts`.

## Organisation et rôles

Les ressources métier sont isolées avec `organizationId`.

```text
owner > admin > member
```

Les routes doivent vérifier :

1. que le token est valide ;
2. que l'utilisateur est membre actif de l'organisation ;
3. que son rôle autorise l'action.

## Format des réponses

Succès :

```json
{
  "data": {}
}
```

Liste :

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

Erreur :

```json
{
  "error": {
    "code": "QUOTE_NOT_FOUND",
    "message": "Quote not found"
  }
}
```

## Documentation exhaustive

Les matrices détaillées sont maintenues dans :

```text
backend/docs/api-endpoints.md
backend/docs/api-rbac.md
backend/docs/api-response-format.md
```

Lorsqu'un endpoint change, mettre à jour ces fichiers dans la même pull request.
