// "order-cart-operations.service.ts"
// metropolitan backend
// Cart and order data operations for webhooks

import { eq } from "drizzle-orm";

import { db } from "../../../../shared/infrastructure/database/connection";
import { cartItems } from "../../../../shared/infrastructure/database/schema";

export class OrderCartOperationsService {
  /**
   * Clear user's cart after successful payment
   */
  static async clearUserCart(userId: string): Promise<{
    success: boolean;
    itemsCleared: number;
    message: string;
  }> {
    try {
      return await db.transaction(async (tx) => {
        // Check if cart still has items
        const remainingCartItems = await tx
          .select({ id: cartItems.id })
          .from(cartItems)
          .where(eq(cartItems.userId, userId));

        if (remainingCartItems.length === 0) {
          return {
            success: true,
            itemsCleared: 0,
            message: `Cart already cleared for user ${userId}`,
          };
        }

        // Clear cart
        await tx.delete(cartItems).where(eq(cartItems.userId, userId));

        return {
          success: true,
          itemsCleared: remainingCartItems.length,
          message: `Cart cleared for user ${userId}, ${remainingCartItems.length} items removed`,
        };
      });
    } catch (error) {
      return {
        success: false,
        itemsCleared: 0,
        message: `Failed to clear cart for user ${userId}: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }

  /**
   * Get order basic information from payment intent metadata
   */
  static extractOrderInfo(metadata: any): {
    orderId?: string;
    userId?: string;
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!metadata.order_id) {
      errors.push("Order ID not found in payment intent metadata");
    }

    if (!metadata.user_id) {
      errors.push("User ID not found in payment intent metadata");
    }

    return {
      orderId: metadata.order_id,
      userId: metadata.user_id,
      isValid: errors.length === 0,
      errors,
    };
  }
}
