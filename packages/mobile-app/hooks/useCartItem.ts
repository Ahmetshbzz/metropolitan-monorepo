//  "useCartItem.ts"
//  metropolitan app
//  Created by Ahmet on 08.07.2025.

import { CartItem as CartItemType, useCart } from "@/context/CartContext";
import { useProducts } from "@/context/ProductContext";
import { useHaptics } from "@/hooks/useHaptics";
import { useTheme } from "@/hooks/useTheme";
import { useRouter } from "expo-router";

export const useCartItem = (item: CartItemType) => {
  const { colors, colorScheme } = useTheme();
  const { triggerHaptic } = useHaptics();
  const { products } = useProducts();
  const { summary } = useCart();
  const router = useRouter();

  // Find the full product details from the ProductContext
  const product = products.find((p) => p.id === item.product.id);

  if (!product) {
    return null;
  }

  const totalItemPrice = product.price * item.quantity;

  // Actions
  const handleProductPress = () => {
    router.push(`/product/${product.id}`);
  };

  const handleIncrement = (onUpdateQuantity: (quantity: number) => void) => {
    onUpdateQuantity(item.quantity + 1);
  };

  const handleDecrement = (onUpdateQuantity: (quantity: number) => void) => {
    if (item.quantity > 1) {
      onUpdateQuantity(item.quantity - 1);
    }
  };

  const handleSwipeWillOpen = (direction: "left" | "right") => {
    // Hafif tek haptik
    triggerHaptic("light");
  };

  const handleDelete = (onRemove: () => void) => {
    triggerHaptic("medium");
    onRemove();
  };

  return {
    // Data
    product,
    totalItemPrice,
    colors,
    colorScheme,
    summary,

    // Actions
    handleProductPress,
    handleIncrement,
    handleDecrement,
    handleSwipeWillOpen,
    handleDelete,
  };
};
