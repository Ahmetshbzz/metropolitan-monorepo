//  "order-creation.service.ts"
//  metropolitan backend
//  Refactored: Main orchestration service for order creation
//  Now coordinates between specialized services for better modularity

import type { CartItem as CartItemData } from "@metropolitan/shared/types/cart";
import type {
  OrderCreationRequest,
  OrderCreationResult,
  OrderItem as OrderItemData,
} from "@metropolitan/shared/types/order";
import { eq } from "drizzle-orm";

import { createDomainEvent } from "../../../../shared/application/events/domain-events";
import { OutboxService } from "../../../../shared/application/events/outbox.service";
import { db } from "../../../../shared/infrastructure/database/connection";
import {
  orders,
  users,
} from "../../../../shared/infrastructure/database/schema";

// Refactored modular services
import { CartManagementService } from "./order-creation/cart-management.service";
import { PaymentProcessingService } from "./order-creation/payment-processing.service";
// Stock management removed

export class OrderCreationService {
  /**
   * Main order creation orchestrator - coordinates between specialized services
   * This is now the main entry point that delegates to modular services
   */

  /**
   * Main Stripe order creation method - now uses modular services
   */
  static async createOrderWithStripe(
    userId: string,
    request: OrderCreationRequest,
    orderItemsData: OrderItemData[],
    cartItemsData: CartItemData[],
    totalAmount: number
  ): Promise<OrderCreationResult> {
    const result = await db.transaction(async (tx) => {
      // Stock reservation/validation removed

      const isStripePayment = PaymentProcessingService.isStripePayment(
        request.paymentMethodId
      );
      const isBankTransfer = request.paymentMethodId === "bank_transfer";

      // Get user info for corporate customer check
      const [user] = await tx
        .select({
          id: users.id,
          userType: users.userType,
        })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user) {
        throw new Error("Kullanıcı bulunamadı");
      }

      // Create order (delegated)
      const orderPayload = PaymentProcessingService.createOrderPayload(
        userId,
        request,
        totalAmount,
        isStripePayment
      );

      console.log("📦 Creating order with payload:", orderPayload);
      const [order] = await tx.insert(orders).values(orderPayload).returning();
      if (!order) throw new Error("Sipariş oluşturulamadı");

      // Publish OrderCreated event via outbox (same transaction boundary)
      const orderCreated = createDomainEvent(
        "order.created",
        {
          orderId: order.id,
          userId,
          totalAmount,
          currency: order.currency,
        },
        order.id
      );
      await OutboxService.addEvent(orderCreated);

      // Handle corporate bank transfer auto-approval (delegated)
      if (isBankTransfer && user.userType === "corporate") {
        const result =
          await PaymentProcessingService.handleCorporateBankTransfer(
            tx,
            order,
            orderItemsData,
            cartItemsData,
            userId
          );

        // Payment succeeded for corporate bank transfer - emit event
        const paymentSucceeded = createDomainEvent(
          "payment.succeeded",
          {
            orderId: order.id,
            userId,
            paymentIntentId: "bank_transfer",
          },
          order.id
        );
        await OutboxService.addEvent(paymentSucceeded);

        return result;
      }

      // Process Stripe payment (delegated)
      const stripeInfo = await PaymentProcessingService.processStripePayment(
        order,
        request,
        cartItemsData,
        userId
      );

      // Update order with Stripe info (delegated)
      await PaymentProcessingService.updateOrderWithStripeInfo(
        tx,
        order.id,
        stripeInfo.paymentIntentId,
        stripeInfo.clientSecret
      );

      // Emit payment intent created event (optional for analytics)
      const paymentIntentCreated = createDomainEvent(
        "payment.intent_created",
        {
          orderId: order.id,
          userId,
          paymentIntentId: stripeInfo.paymentIntentId,
        },
        order.id
      );
      await OutboxService.addEvent(paymentIntentCreated);

      // Create order items (delegated)
      await CartManagementService.createOrderItems(
        tx,
        order.id,
        orderItemsData
      );

      // Clear cart (delegated)
      if (cartItemsData.length > 0) {
        await CartManagementService.clearUserCart(tx, userId);
      }

      return {
        ...order,
        stripePaymentIntentId: stripeInfo.paymentIntentId,
        stripeClientSecret: stripeInfo.clientSecret,
      };
    });

    return this.formatOrderCreationResult(result);
  }

  /**
   * Ödeme tamamlandıktan sonra sipariş işlemlerini finalize eder (delegated)
   * Bu method webhook'dan çağrılır
   */
  static async finalizeOrderAfterPayment(orderId: string): Promise<void> {
    await CartManagementService.finalizeOrderAfterPayment(orderId);
  }

  /**
   * Legacy method - now also uses modular services for consistency
   */
  static async createOrderWithTransaction(
    userId: string,
    request: OrderCreationRequest,
    orderItemsData: OrderItemData[],
    cartItemsData: CartItemData[],
    totalAmount: number
  ): Promise<OrderCreationResult> {
    console.warn(
      "Legacy order creation method used - consider using createOrderWithStripe"
    );

    const result = await db.transaction(async (tx) => {
      // Create order using modular service
      const orderPayload = PaymentProcessingService.createOrderPayload(
        userId,
        request,
        totalAmount,
        false // not Stripe payment
      );

      const [order] = await tx.insert(orders).values(orderPayload).returning();
      if (!order) throw new Error("Sipariş oluşturulamadı");

      // Use modular services
      await CartManagementService.createOrderItems(
        tx,
        order.id,
        orderItemsData
      );
      await CartManagementService.clearUserCart(tx, userId);

      return order;
    });

    return {
      success: true,
      order: {
        id: result.id,
        orderNumber: result.orderNumber,
        status: result.status,
        totalAmount: result.totalAmount,
        currency: result.currency,
        createdAt: result.createdAt,
      },
    };
  }

  /**
   * Formats order creation result based on order status
   */
  private static formatOrderCreationResult(order: {
    id: string;
    orderNumber: string;
    status: string;
    totalAmount: string;
    currency: string;
    createdAt: Date | string;
    paymentStatus?: string;
    stripePaymentIntentId?: string;
    stripeClientSecret?: string;
  }): OrderCreationResult {
    const baseResult = {
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        totalAmount: order.totalAmount,
        currency: order.currency,
        createdAt: order.createdAt,
        paymentStatus: order.paymentStatus || "pending",
      },
    };

    // Add Stripe payment info if available
    if (order.stripePaymentIntentId) {
      baseResult.order.stripePaymentIntentId = order.stripePaymentIntentId;
      if (order.stripeClientSecret) {
        baseResult.order.stripeClientSecret = order.stripeClientSecret;
      }
    }

    return baseResult;
  }

  /**
   * Rollback stock if order fails (delegated to StockManagementService)
   */
  static async rollbackStock(_orderId: string): Promise<void> {
    // No-op: stock rollback removed
  }
}
