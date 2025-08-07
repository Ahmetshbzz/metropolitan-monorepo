//  "CartItemContent.tsx"
//  metropolitan app
//  Created by Ahmet on 19.06.2025.

import { HapticIconButton } from "@/components/HapticButton";
import { ThemedText } from "@/components/ThemedText";
import { BaseCard } from "@/components/base/BaseCard";
import { CartItem as CartItemType } from "@/context/CartContext";
import { Product } from "@/context/ProductContext";
import { formatPrice } from "@/core/utils";
import {
  getQuantityButtonStyle,
  getQuantityControlStyle,
} from "@/utils/cartItemStyles";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { TouchableOpacity, View } from "react-native";

interface CartItemContentProps {
  item: CartItemType;
  product: Product;
  totalItemPrice: number;
  colors: any;
  colorScheme: any;
  summary: any;
  onProductPress: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
}

export const CartItemContent: React.FC<CartItemContentProps> = ({
  item,
  product,
  totalItemPrice,
  colors,
  colorScheme,
  summary,
  onProductPress,
  onIncrement,
  onDecrement,
}) => {
  const quantityControlStyle = getQuantityControlStyle(colors);
  const quantityButtonStyle = getQuantityButtonStyle(colors);

  return (
    <View className="mx-3 mb-2">
      <BaseCard borderRadius={16} padding={10}>
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={onProductPress}
            className="flex-row items-center flex-1"
          >
            <Image
              source={{ uri: product.image }}
              style={{ width: 64, height: 64, marginRight: 10 }}
              contentFit="contain"
            />
            <View className="flex-1 justify-start">
              <ThemedText
                className="text-sm font-semibold mb-0.5"
                numberOfLines={2}
              >
                {product.name}
              </ThemedText>
              <ThemedText
                className="text-xs mb-1"
                style={{ color: colors.mediumGray }}
              >
                {product.brand} • {product.size}
              </ThemedText>
              <View className="flex-row items-center justify-between">
                <ThemedText className="text-sm font-bold">
                  {formatPrice(totalItemPrice, summary?.currency)}
                </ThemedText>
              </View>
            </View>
          </TouchableOpacity>

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View
              className="flex-row items-center rounded-xl overflow-hidden border"
              style={quantityControlStyle}
            >
              <HapticIconButton
                className="w-8 h-8 items-center justify-center"
                onPress={onDecrement}
                hapticType="light"
                disabled={item.quantity === 1}
              >
                <Ionicons
                  name="remove"
                  size={18}
                  color={item.quantity === 1 ? colors.mediumGray : colors.text}
                />
              </HapticIconButton>
              <View style={quantityButtonStyle}>
                <ThemedText className="text-sm font-semibold text-center min-w-6">
                  {item.quantity}
                </ThemedText>
              </View>
              <HapticIconButton
                className="w-8 h-8 items-center justify-center"
                onPress={onIncrement}
                hapticType="light"
              >
                <Ionicons name="add" size={18} color={colors.text} />
              </HapticIconButton>
            </View>
          </View>
        </View>
      </BaseCard>
    </View>
  );
};
