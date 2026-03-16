/**
 * Cart repository
 */

import { eq, and } from 'drizzle-orm';
import { db, schema } from '../../shared/db/index.ts';

/**
 * Find or create cart for user
 */
export async function findOrCreateByUserId(userId: string) {
  let cart = await db.query.carts.findFirst({
    where: eq(schema.carts.userId, userId),
  });

  if (!cart) {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    await db.insert(schema.carts).values({
      id,
      userId,
      createdAt: now,
      updatedAt: now,
    });

    cart = await db.query.carts.findFirst({
      where: eq(schema.carts.id, id),
    });
  }

  return cart!;
}

/**
 * Get cart with items and product details
 */
export async function getCartWithItems(userId: string) {
  const cart = await findOrCreateByUserId(userId);

  const items = await db
    .select({
      id: schema.cartItems.id,
      productId: schema.cartItems.productId,
      quantity: schema.cartItems.quantity,
      createdAt: schema.cartItems.createdAt,
      productName: schema.products.name,
      productSlug: schema.products.slug,
      productPrice: schema.products.price,
      productImageUrl: schema.products.imageUrl,
      productStatus: schema.products.status,
      productStockQuantity: schema.products.stockQuantity,
    })
    .from(schema.cartItems)
    .innerJoin(schema.products, eq(schema.cartItems.productId, schema.products.id))
    .where(eq(schema.cartItems.cartId, cart.id));

  const formattedItems = items.map((item) => ({
    id: item.id,
    productId: item.productId,
    quantity: item.quantity,
    createdAt: item.createdAt,
    product: {
      id: item.productId,
      name: item.productName,
      slug: item.productSlug,
      price: item.productPrice,
      imageUrl: item.productImageUrl,
      status: item.productStatus,
      stockQuantity: item.productStockQuantity,
    },
  }));

  const total = formattedItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return {
    id: cart.id,
    items: formattedItems,
    total,
  };
}

/**
 * Find existing cart item
 */
export async function findCartItem(cartId: string, productId: string) {
  return db.query.cartItems.findFirst({
    where: and(
      eq(schema.cartItems.cartId, cartId),
      eq(schema.cartItems.productId, productId)
    ),
  }) ?? null;
}

/**
 * Find cart item by ID
 */
export async function findCartItemById(id: string) {
  return db.query.cartItems.findFirst({
    where: eq(schema.cartItems.id, id),
  }) ?? null;
}

/**
 * Add item to cart (or increment quantity)
 */
export async function addItem(cartId: string, productId: string, quantity: number) {
  const existing = await findCartItem(cartId, productId);

  if (existing) {
    const newQty = existing.quantity + quantity;
    await db
      .update(schema.cartItems)
      .set({ quantity: newQty })
      .where(eq(schema.cartItems.id, existing.id));

    return { ...existing, quantity: newQty };
  }

  const id = crypto.randomUUID();
  await db.insert(schema.cartItems).values({
    id,
    cartId,
    productId,
    quantity,
    createdAt: new Date().toISOString(),
  });

  return db.query.cartItems.findFirst({
    where: eq(schema.cartItems.id, id),
  });
}

/**
 * Update cart item quantity
 */
export async function updateItemQuantity(id: string, quantity: number) {
  await db
    .update(schema.cartItems)
    .set({ quantity })
    .where(eq(schema.cartItems.id, id));

  return db.query.cartItems.findFirst({
    where: eq(schema.cartItems.id, id),
  });
}

/**
 * Remove cart item
 */
export async function removeItem(id: string) {
  await db.delete(schema.cartItems).where(eq(schema.cartItems.id, id));
}

/**
 * Clear all items from cart
 */
export async function clearCart(cartId: string) {
  await db.delete(schema.cartItems).where(eq(schema.cartItems.cartId, cartId));
}

/**
 * Get all items for a cart (raw, for order creation)
 */
export async function getItemsWithProducts(cartId: string) {
  return db
    .select({
      id: schema.cartItems.id,
      productId: schema.cartItems.productId,
      quantity: schema.cartItems.quantity,
      productName: schema.products.name,
      productPrice: schema.products.price,
      productStockQuantity: schema.products.stockQuantity,
      productStatus: schema.products.status,
    })
    .from(schema.cartItems)
    .innerJoin(schema.products, eq(schema.cartItems.productId, schema.products.id))
    .where(eq(schema.cartItems.cartId, cartId));
}
