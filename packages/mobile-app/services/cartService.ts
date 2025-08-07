//  "cartService.ts"
//  metropolitan app
//  Created by Ahmet on 26.06.2025.

import { CartItem } from "@/types/cart";
import { normalizeGuestCartResponse, normalizeUserCartResponse } from "./cart/normalizers";
import {
  getUserCart as getUserCartApi,
  addToUserCart as addToUserCartApi,
  updateUserCartItem as updateUserCartItemApi,
  removeUserCartItem as removeUserCartItemApi,
  clearUserCart as clearUserCartApi,
} from "./cart/userCartService";
import {
  getGuestCart as getGuestCartApi,
  addToGuestCart as addToGuestCartApi,
  updateGuestCartItem as updateGuestCartItemApi,
  removeGuestCartItem as removeGuestCartItemApi,
  clearGuestCart as clearGuestCartApi,
} from "./cart/guestCartService";

export class CartService {
  // User cart operations
  static async getUserCart() {
    const response = await getUserCartApi();
    return normalizeUserCartResponse(response);
  }

  static async addToUserCart(productId: string, quantity: number, lang: string = 'tr') {
    try { await addToUserCartApi(productId, quantity, lang); } catch (error) { throw error as any; }
  }

  static async updateUserCartItem(itemId: string, quantity: number, lang: string = 'tr') {
    try { await updateUserCartItemApi(itemId, quantity, lang); } catch (error) { throw error as any; }
  }

  static async removeUserCartItem(itemId: string) { await removeUserCartItemApi(itemId); }

  static async clearUserCart() { await clearUserCartApi(); }

  // Guest cart operations
  static async getGuestCart(guestId: string, language: string) {
    const response = await getGuestCartApi(guestId, language);
    if (response.data.success) return normalizeGuestCartResponse(response);
    return { items: [], summary: { totalItems: 0, totalAmount: 0, currency: "TRY" } };
  }

  static async addToGuestCart(guestId: string, productId: string, quantity: number) {
    await addToGuestCartApi(guestId, productId, quantity);
  }

  static async updateGuestCartItem(guestId: string, itemId: string, productId: string, quantity: number) {
    await updateGuestCartItemApi(guestId, itemId, productId, quantity);
  }

  static async removeGuestCartItem(guestId: string, itemId: string) {
    await removeGuestCartItemApi(guestId, itemId);
  }

  static async clearGuestCart(guestId: string, cartItems: CartItem[]) {
    await clearGuestCartApi(guestId, cartItems);
  }

  // Hybrid operations (automatically choose user or guest)
  static async getCart(isUser: boolean, guestId?: string, language?: string) {
    if (isUser) {
      return this.getUserCart();
    } else if (guestId && language) {
      return this.getGuestCart(guestId, language);
    }

    return { items: [], summary: null };
  }

  static async addToCart(
    isUser: boolean,
    productId: string,
    quantity: number,
    guestId?: string,
    lang?: string
  ) {
    if (isUser) {
      return this.addToUserCart(productId, quantity, lang);
    } else if (guestId) {
      return this.addToGuestCart(guestId, productId, quantity);
    }
  }

  static async updateCartItem(
    isUser: boolean,
    itemId: string,
    quantity: number,
    guestId?: string,
    productId?: string,
    lang?: string
  ) {
    if (isUser) {
      return this.updateUserCartItem(itemId, quantity, lang);
    } else if (guestId && productId) {
      return this.updateGuestCartItem(guestId, itemId, productId, quantity);
    }
  }

  static async removeCartItem(
    isUser: boolean,
    itemId: string,
    guestId?: string
  ) {
    if (isUser) {
      return this.removeUserCartItem(itemId);
    } else if (guestId) {
      return this.removeGuestCartItem(guestId, itemId);
    }
  }

  static async clearCart(
    isUser: boolean,
    guestId?: string,
    cartItems?: CartItem[]
  ) {
    if (isUser) {
      return this.clearUserCart();
    } else if (guestId && cartItems) {
      return this.clearGuestCart(guestId, cartItems);
    }
  }
}
