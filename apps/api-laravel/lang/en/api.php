<?php

declare(strict_types=1);

return [

    // Common
    'common' => [
        'deleted' => 'Resource deleted successfully.',
        'not_found' => 'Resource not found.',
        'forbidden' => 'Access denied.',
        'unauthenticated' => 'Unauthenticated.',
        'validation_error' => 'The given data was invalid.',
        'internal_error' => 'An unexpected error occurred.',
        'role_not_authorized' => 'Forbidden — role not authorized.',
        'insufficient_permissions' => 'Forbidden — insufficient permissions.',
    ],

    // Auth
    'auth' => [
        'oauth_providers' => 'OAuth providers retrieved.',
        'test_accounts' => 'Test accounts retrieved.',
    ],

    // Admin — RBAC
    'admin' => [
        'role_assigned' => 'Role assigned.',
        'role_removed' => 'Role removed.',
        'permissions_updated' => 'Permissions updated.',
    ],

    // Shop — Products
    'shop' => [
        'product_not_found' => 'Product not found.',
        'product_deleted' => 'Product deleted.',
        'category_not_found' => 'Category not found.',
        'order_not_found' => 'Order not found.',
        'cart_empty' => 'Cart is empty.',
        'stock_exceeded' => 'Requested quantity exceeds available stock.',
        'item_not_found' => 'Cart item not found.',
        'customer_not_found' => 'Customer not found.',
        'customer_deleted' => 'Customer deleted.',
        'review_not_found' => 'Review not found.',
    ],

    // SaaS
    'saas' => [
        'plan_not_found' => 'Plan not found.',
        'already_subscribed' => 'Already subscribed to a plan.',
        'no_active_subscription' => 'No active subscription.',
        'member_not_found' => 'Member not found.',
        'user_not_found' => 'User not found.',
        'already_member' => 'User is already a member.',
        'member_limit_reached' => 'Team member limit reached for your plan.',
        'cannot_change_owner' => 'Cannot change the role of the owner.',
        'cannot_remove_owner' => 'Cannot remove the owner.',
        'member_removed' => 'Member removed.',
    ],

    // Support
    'support' => [
        'conversation_not_found' => 'Conversation not found.',
        'conversation_closed' => 'Cannot send message to a closed conversation.',
        'conversation_not_closed' => 'Can only rate resolved or closed conversations.',
        'already_rated' => 'Conversation already rated.',
        'already_assigned' => 'Conversation already assigned.',
        'invalid_transition' => "Invalid transition from ':from' to ':to'.",
        'canned_not_found' => 'Canned response not found.',
        'canned_deleted' => 'Canned response deleted.',
    ],

    // Org
    'org' => [
        'not_found' => 'Organization not found.',
        'forbidden' => 'Forbidden.',
    ],

];
