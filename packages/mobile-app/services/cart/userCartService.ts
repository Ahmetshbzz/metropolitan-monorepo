import { api } from "@/core/api";

export async function getUserCart() {
  const response = await api.get("/me/cart");
  return response;
}

export async function addToUserCart(productId: string, quantity: number, lang: string = "tr") {
  await api.post(
    "/me/cart",
    { productId, quantity },
    {
      params: { lang },
    }
  );
}

export async function updateUserCartItem(itemId: string, quantity: number, lang: string = "tr") {
  await api.put(
    `/me/cart/${itemId}`,
    { quantity },
    {
      params: { lang },
    }
  );
}

export async function removeUserCartItem(itemId: string) {
  await api.delete(`/me/cart/${itemId}`);
}

export async function clearUserCart() {
  await api.delete("/me/cart");
}


