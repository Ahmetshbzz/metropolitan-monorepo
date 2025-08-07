import { api } from "@/core/api";
import { CartItem } from "@/types/cart";

export async function getGuestCart(guestId: string, language: string) {
  const response = await api.get(`/guest/cart/${guestId}`, { params: { lang: language } });
  return response;
}

export async function addToGuestCart(guestId: string, productId: string, quantity: number) {
  await api.post("/guest/cart/add", { guestId, productId, quantity });
}

export async function updateGuestCartItem(guestId: string, itemId: string, productId: string, quantity: number) {
  await api.delete(`/guest/cart/${guestId}/${itemId}`);
  await api.post("/guest/cart/add", { guestId, productId, quantity });
}

export async function removeGuestCartItem(guestId: string, itemId: string) {
  await api.delete(`/guest/cart/${guestId}/${itemId}`);
}

export async function clearGuestCart(guestId: string, cartItems: CartItem[]) {
  for (const item of cartItems) await api.delete(`/guest/cart/${guestId}/${item.id}`);
}


