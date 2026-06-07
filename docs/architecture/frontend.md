# Architecture frontend

## Navigation

Expo Router utilise les fichiers de `frontend/app/`.

```text
app/(public)/     Connexion et inscription
app/(private)/    Écrans nécessitant une session
```

Les domaines principaux sont :

- organisations ;
- entreprises et contacts ;
- devis et lignes de devis ;
- factures et paiements ;
- tableau de bord.

## Flux de données

```text
Écran
  -> hook
  -> service
  -> instance Axios
  -> API backend
```

### Services

`frontend/services/` contient les appels HTTP par domaine. Les écrans ne doivent pas construire leurs propres requêtes Axios.

### Hooks

`frontend/hooks/` expose les queries, mutations et états de chargement utilisés par les écrans.

Les données distantes sont gérées avec TanStack Query.

### Stores

Zustand est réservé à l'état global client :

- utilisateur et token ;
- organisation sélectionnée.

Ne pas copier les données métier de TanStack Query dans Zustand.

### Composants

`frontend/components/shared/` contient les composants réutilisables :

- cartes métier ;
- header et navigation ;
- modales ;
- champs de formulaire ;
- composants graphiques.

## Formulaires

Les formulaires utilisent :

- React Hook Form pour l'état ;
- Zod pour le schéma ;
- les services ou mutations pour la soumission.

Les erreurs de validation doivent être affichées au niveau du champ concerné.

## Ajouter un écran

1. créer la route dans `app/` ;
2. réutiliser ou créer le service du domaine ;
3. créer un hook si une query ou mutation est nécessaire ;
4. réutiliser les composants partagés ;
5. gérer les états chargement, erreur et vide ;
6. ajouter un test lorsque la logique n'est pas triviale.
