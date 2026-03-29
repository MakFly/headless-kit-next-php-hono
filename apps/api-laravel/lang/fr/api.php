<?php

declare(strict_types=1);

return [

    // Common
    'common' => [
        'deleted' => 'Ressource supprimée avec succès.',
        'not_found' => 'Ressource introuvable.',
        'forbidden' => 'Accès refusé.',
        'unauthenticated' => 'Non authentifié.',
        'validation_error' => 'Les données fournies sont invalides.',
        'internal_error' => 'Une erreur inattendue s\'est produite.',
        'role_not_authorized' => 'Interdit — rôle non autorisé.',
        'insufficient_permissions' => 'Interdit — permissions insuffisantes.',
    ],

    // Auth
    'auth' => [
        'oauth_providers' => 'Fournisseurs OAuth récupérés.',
        'test_accounts' => 'Comptes de test récupérés.',
    ],

    // Admin — RBAC
    'admin' => [
        'role_assigned' => 'Rôle assigné.',
        'role_removed' => 'Rôle retiré.',
        'permissions_updated' => 'Permissions mises à jour.',
    ],

    // Shop — Products
    'shop' => [
        'product_not_found' => 'Produit introuvable.',
        'product_deleted' => 'Produit supprimé.',
        'category_not_found' => 'Catégorie introuvable.',
        'order_not_found' => 'Commande introuvable.',
        'cart_empty' => 'Le panier est vide.',
        'stock_exceeded' => 'La quantité demandée dépasse le stock disponible.',
        'item_not_found' => 'Article du panier introuvable.',
        'customer_not_found' => 'Client introuvable.',
        'customer_deleted' => 'Client supprimé.',
        'review_not_found' => 'Avis introuvable.',
    ],

    // SaaS
    'saas' => [
        'plan_not_found' => 'Forfait introuvable.',
        'already_subscribed' => 'Déjà abonné à un forfait.',
        'no_active_subscription' => 'Aucun abonnement actif.',
        'member_not_found' => 'Membre introuvable.',
        'user_not_found' => 'Utilisateur introuvable.',
        'already_member' => 'L\'utilisateur est déjà membre.',
        'member_limit_reached' => 'Limite de membres atteinte pour votre forfait.',
        'cannot_change_owner' => 'Impossible de modifier le rôle du propriétaire.',
        'cannot_remove_owner' => 'Impossible de supprimer le propriétaire.',
        'member_removed' => 'Membre retiré.',
    ],

    // Support
    'support' => [
        'conversation_not_found' => 'Conversation introuvable.',
        'conversation_closed' => 'Impossible d\'envoyer un message à une conversation fermée.',
        'conversation_not_closed' => 'Seules les conversations résolues ou fermées peuvent être notées.',
        'already_rated' => 'Conversation déjà notée.',
        'already_assigned' => 'Conversation déjà assignée.',
        'invalid_transition' => "Transition invalide de ':from' vers ':to'.",
        'canned_not_found' => 'Réponse prédéfinie introuvable.',
        'canned_deleted' => 'Réponse prédéfinie supprimée.',
    ],

    // Org
    'org' => [
        'not_found' => 'Organisation introuvable.',
        'forbidden' => 'Accès interdit.',
    ],

];
