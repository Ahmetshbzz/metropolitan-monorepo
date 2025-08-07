//  "ProductCardContent.tsx"
//  metropolitan app
//  Created by Ahmet on 26.06.2025. Edited on 23.07.2025.

import { formatPrice } from "@/core/utils";
import { useToast } from "@/hooks/useToast";
import type { ThemeColors } from "@/types/theme";
import type { Product } from "@metropolitan/shared";
import React from "react";
import { useTranslation } from "react-i18next";
import { ColorSchemeName, GestureResponderEvent, View } from "react-native";
import { ThemedText } from "../ThemedText";
import { SimpleAddToCartButton } from "./SimpleAddToCartButton";

interface ProductCardContentProps {
  product: Product;
  categoryName?: string;
  colorScheme: ColorSchemeName;
  colors: ThemeColors;
  isOutOfStock: boolean;
  isLowStock: boolean;
  handleAddToCart: (e: GestureResponderEvent) => Promise<void>;
}

export const ProductCardContent: React.FC<ProductCardContentProps> = ({
  product,
  categoryName,
  colorScheme,
  colors,
  isOutOfStock,
  isLowStock,
  handleAddToCart,
}) => {
  const { t } = useTranslation();
  const { showToast } = useToast();

  const handleNotifyMe = async () => {
    showToast(
      t("product_detail.purchase.notify_success_message", {
        productName: product.name,
      }),
      "success"
    );
  };

  return (
    <View className="p-2" style={{ backgroundColor: colors.cardBackground }}>
      {/* Category and Brand Badges */}
      <View className="mb-1 flex-row gap-1">
        <View
          className="self-start px-1.5 py-0.5 rounded-full"
          style={{
            backgroundColor:
              colorScheme === "dark"
                ? colors.tertiaryBackground
                : colors.lightGray,
          }}
        >
          <ThemedText
            className="text-[11px] font-medium uppercase tracking-wide"
            style={{
              color: colorScheme === "dark" ? colors.textSecondary : "#6b7280",
              fontSize: 9,
            }}
            numberOfLines={1}
          >
            {categoryName || product.category}
          </ThemedText>
        </View>
      </View>

      {/* Product Name */}
      <ThemedText
        className="text-sm font-semibold mb-2"
        numberOfLines={2}
        style={{
          lineHeight: 18,
          height: 36,
          color: colorScheme === "dark" ? "#fff" : "#1a1a1a",
          letterSpacing: -0.2,
        }}
      >
        {product.name}
      </ThemedText>

      {/* Price and Add to Cart - Separated */}
      <View className="flex-row items-center justify-between">
        <ThemedText className="font-bold" style={{ color: colors.primary }}>
          {formatPrice(product.price, product.currency)}
        </ThemedText>

        <SimpleAddToCartButton
          onPress={isOutOfStock ? handleNotifyMe : handleAddToCart}
          colors={colors}
          outOfStock={isOutOfStock}
        />
      </View>

      {/* Stock Status */}
      {isLowStock && !isOutOfStock && (
        <View className="mt-3 flex-row items-center justify-center">
          <View className="w-2 h-2 bg-amber-500 rounded-full mr-2" />
          <ThemedText
            className="text-xs font-semibold text-amber-500"
            style={{ letterSpacing: 0.3 }}
          >
            {t("product.low_stock")}
          </ThemedText>
        </View>
      )}
    </View>
  );
};
