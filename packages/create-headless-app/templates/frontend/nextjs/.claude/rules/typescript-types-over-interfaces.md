# TypeScript : Préférer `type` à `interface`

## Règle

**Toujours utiliser `type` ou `export type` au lieu de `interface`.**

## Pourquoi ?

1. **Cohérence** : Un seul mot-clé pour tous les types
2. **Flexibilité** : `type` supporte les unions, intersections, tuples, mapped types
3. **Pas de declaration merging** : Évite les fusions accidentelles d'interfaces
4. **Meilleure inférence** : TypeScript gère mieux les types aliasés dans certains cas

## Exemples

### Correct

```typescript
// Type simple
type User = {
  id: string;
  name: string;
  email: string;
};

// Export
export type ApiResponse<T> = {
  data: T;
  error?: string;
};

// Union
type Status = 'pending' | 'active' | 'inactive';

// Intersection
type AdminUser = User & {
  permissions: string[];
};

// Props de composant
type ButtonProps = {
  variant: 'primary' | 'secondary';
  onClick: () => void;
  children: React.ReactNode;
};
```

### Incorrect

```typescript
// Ne pas utiliser interface
interface User {
  id: string;
  name: string;
}

// Ne pas utiliser interface pour les props
interface ButtonProps {
  variant: string;
}
```

## Exceptions

Aucune. Même pour les cas où `interface` semble approprié (comme l'extension de types), utiliser `type` avec intersection (`&`).

```typescript
// Au lieu de : interface AdminUser extends User { ... }
type AdminUser = User & {
  role: 'admin';
};
```

## Configuration ESLint recommandée

```json
{
  "rules": {
    "@typescript-eslint/consistent-type-definitions": ["error", "type"]
  }
}
```
