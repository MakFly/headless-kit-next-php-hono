/**
 * French translations
 */

export const fr: Record<string, string> = {
  // Commun
  'common.not_found': 'Ressource introuvable',
  'common.forbidden': 'Accès interdit',
  'common.unauthorized': 'Non autorisé',
  'common.validation_error': 'Erreur de validation',
  'common.internal_error': 'Erreur interne du serveur',
  'common.route_not_found': 'Route {{method}} {{path}} introuvable',
  'common.something_went_wrong': 'Une erreur est survenue',
  'common.deleted': 'Supprimé avec succès',

  // Auth
  'auth.email_exists': 'Adresse email déjà enregistrée',
  'auth.invalid_credentials': 'Identifiants invalides',
  'auth.invalid_token': 'Token de rafraîchissement invalide',
  'auth.token_expired': 'Token de rafraîchissement expiré ou révoqué',
  'auth.user_not_found': 'Utilisateur introuvable',
  'auth.missing_token': 'Le token de rafraîchissement est requis',
  'auth.logged_out': 'Déconnexion réussie',

  // Boutique
  'shop.product_not_found': 'Produit introuvable',
  'shop.category_not_found': 'Catégorie introuvable',

  // Panier
  'cart.product_not_found': 'Produit introuvable',
  'cart.product_unavailable': 'Produit indisponible',
  'cart.insufficient_stock': 'Stock insuffisant',
  'cart.item_not_found': 'Article du panier introuvable',

  // Commande
  'order.cart_empty': 'Le panier est vide',
  'order.product_unavailable': 'Le produit "{{name}}" n\'est plus disponible',
  'order.insufficient_stock': 'Stock insuffisant pour "{{name}}"',
  'order.not_found': 'Commande introuvable',

  // Admin
  'admin.product_not_found': 'Produit introuvable',
  'admin.order_not_found': 'Commande introuvable',
  'admin.invalid_status': 'Statut invalide. Doit être l\'un de : {{values}}',
  'admin.invalid_stock': 'La quantité en stock ne peut pas être négative',
  'admin.customer_not_found': 'Client introuvable',
  'admin.review_not_found': 'Avis introuvable',

  // SaaS
  'saas.slug_taken': 'Ce slug est déjà utilisé',
  'saas.org_error': 'Impossible de créer l\'organisation',
  'saas.no_subscription': 'Aucun abonnement actif',
  'saas.plan_not_found': 'Plan introuvable',
  'saas.already_subscribed': 'Déjà abonné',
  'saas.already_member': 'L\'utilisateur est déjà membre',
  'saas.member_limit_reached': 'Limite de membres atteinte pour le plan actuel',
  'saas.user_not_found': 'Aucun utilisateur trouvé avec cet email',
  'saas.member_not_found': 'Membre introuvable',
  'saas.cannot_change_owner': 'Impossible de modifier le rôle du propriétaire',
  'saas.cannot_remove_owner': 'Impossible de supprimer le propriétaire',
  'saas.org_not_found': 'Organisation introuvable',
  'saas.org_id_required': 'Identifiant d\'organisation requis',
  'saas.not_a_member': 'Vous n\'êtes pas membre de cette organisation',
  'saas.insufficient_permissions': 'Permissions insuffisantes',

  // Support
  'support.create_failed': 'Impossible de créer la conversation',
  'support.not_found': 'Conversation introuvable',
  'support.conversation_closed': 'Impossible d\'envoyer un message dans une conversation fermée',
  'support.invalid_status': 'Transition de statut invalide',
  'support.invalid_rating': 'La note doit être comprise entre 1 et 5',
  'support.already_rated': 'La conversation a déjà été notée',
  'support.already_assigned': 'La conversation est déjà assignée',
  'support.canned_not_found': 'Réponse prédéfinie introuvable',
  'support.canned_validation': 'Le titre et le contenu sont requis',
};
