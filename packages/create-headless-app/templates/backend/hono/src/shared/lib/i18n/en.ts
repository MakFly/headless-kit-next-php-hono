/**
 * English translations
 */

export const en: Record<string, string> = {
  // Common
  'common.not_found': 'Not found',
  'common.forbidden': 'Forbidden',
  'common.unauthorized': 'Unauthorized',
  'common.validation_error': 'Validation failed',
  'common.internal_error': 'Internal server error',
  'common.route_not_found': 'Route {{method}} {{path}} not found',
  'common.something_went_wrong': 'Something went wrong',
  'common.deleted': 'Deleted successfully',

  // Auth
  'auth.email_exists': 'Email already registered',
  'auth.invalid_credentials': 'Invalid credentials',
  'auth.invalid_token': 'Invalid refresh token',
  'auth.token_expired': 'Refresh token expired or revoked',
  'auth.user_not_found': 'User not found',
  'auth.missing_token': 'Refresh token is required',
  'auth.logged_out': 'Logged out successfully',

  // Shop
  'shop.product_not_found': 'Product not found',
  'shop.category_not_found': 'Category not found',

  // Cart
  'cart.product_not_found': 'Product not found',
  'cart.product_unavailable': 'Product is not available',
  'cart.insufficient_stock': 'Insufficient stock',
  'cart.item_not_found': 'Cart item not found',

  // Order
  'order.cart_empty': 'Cart is empty',
  'order.product_unavailable': 'Product "{{name}}" is no longer available',
  'order.insufficient_stock': 'Insufficient stock for "{{name}}"',
  'order.not_found': 'Order not found',

  // Admin
  'admin.product_not_found': 'Product not found',
  'admin.order_not_found': 'Order not found',
  'admin.invalid_status': 'Invalid status. Must be one of: {{values}}',
  'admin.invalid_stock': 'Stock quantity cannot be negative',
  'admin.customer_not_found': 'Customer not found',
  'admin.review_not_found': 'Review not found',

  // SaaS
  'saas.slug_taken': 'Slug already taken',
  'saas.org_error': 'Failed to create organization',
  'saas.no_subscription': 'No active subscription',
  'saas.plan_not_found': 'Plan not found',
  'saas.already_subscribed': 'Already subscribed',
  'saas.already_member': 'User is already a member',
  'saas.member_limit_reached': 'Member limit reached for current plan',
  'saas.user_not_found': 'User not found with that email',
  'saas.member_not_found': 'Member not found',
  'saas.cannot_change_owner': 'Cannot change owner role',
  'saas.cannot_remove_owner': 'Cannot remove the owner',
  'saas.org_not_found': 'Organization not found',
  'saas.org_id_required': 'Organization ID required',
  'saas.not_a_member': 'Not a member of this organization',
  'saas.insufficient_permissions': 'Insufficient permissions',

  // Support
  'support.create_failed': 'Failed to create conversation',
  'support.not_found': 'Conversation not found',
  'support.conversation_closed': 'Cannot send message to closed conversation',
  'support.invalid_status': 'Invalid status transition',
  'support.invalid_rating': 'Rating must be between 1 and 5',
  'support.already_rated': 'Conversation already rated',
  'support.already_assigned': 'Conversation already assigned',
  'support.canned_not_found': 'Canned response not found',
  'support.canned_validation': 'title and content are required',
};
