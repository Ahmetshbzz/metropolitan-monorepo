//  "ProductInfo.tsx"
//  metropolitan app
//  Created by Ahmet on 15.06.2025.

import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import Animated, { FadeInDown, FadeInLeft, FadeInRight } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import Colors from "@/constants/Colors";
import { Product } from "@/context/ProductContext";
import { formatPrice } from "@/core/utils";
import { useColorScheme } from "@/hooks/useColorScheme";

interface ProductInfoProps {
  product: Product | null;
}

export function ProductInfo({ product }: ProductInfoProps) {
  const { t } = useTranslation();
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  if (!product) {
    return null; // or a loading indicator
  }

  return (
    <ThemedView 
      className="px-5 pt-8 pb-6 rounded-t-3xl -mt-6"
      style={{
        shadowColor: colors.text,
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 5,
      }}
    >
      {/* Product name and brand header */}
      <Animated.View 
        className="mb-6"
        entering={FadeInDown.delay(200).duration(400)}
      >
        <View className="flex-row justify-between items-start mb-2">
          <View className="flex-1 mr-4">
            <ThemedText className="text-2xl font-bold leading-8 mb-1">
              {product.name}
            </ThemedText>
          </View>
          <View 
            className="px-3 py-1.5 rounded-full"
            style={{
              backgroundColor: `${colors.tint}15`,
              borderWidth: 1,
              borderColor: `${colors.tint}30`,
            }}
          >
            <ThemedText 
              className="text-xs font-semibold"
              style={{ color: colors.tint }}
            >
              {t(`brands.${product.brand.toLowerCase()}`)}
            </ThemedText>
          </View>
        </View>
      </Animated.View>

      {/* Price section with emphasis */}
      <Animated.View 
        className="mb-6 p-4 rounded-2xl"
        style={{
          backgroundColor: `${colors.tint}08`,
          borderWidth: 1,
          borderColor: `${colors.tint}20`,
        }}
        entering={FadeInLeft.delay(300).duration(400)}
      >
        <ThemedText 
          className="text-3xl font-bold leading-10"
          style={{ color: colors.tint }}
        >
          {formatPrice(product.price, product.currency)}
        </ThemedText>
      </Animated.View>

      {/* Product details section */}
      <Animated.View 
        className="space-y-3"
        entering={FadeInRight.delay(400).duration(400)}
      >
        {/* Stock information */}
        <View 
          className="flex-row items-center p-3 rounded-xl"
          style={{
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.borderColor,
          }}
        >
          <View 
            className="w-8 h-8 rounded-full items-center justify-center mr-3"
            style={{
              backgroundColor: product.stock > 0 ? `${colors.tint}20` : "rgba(239, 68, 68, 0.2)",
            }}
          >
            <Ionicons 
              name={product.stock > 0 ? "checkmark-circle" : "close-circle"} 
              size={18} 
              color={product.stock > 0 ? colors.tint : "#EF4444"} 
            />
          </View>
          <View className="flex-1">
            <ThemedText className="text-sm font-medium">
              {product.stock > 0
                ? t("product_detail.stock_available", { count: product.stock })
                : t("product_detail.out_of_stock")}
            </ThemedText>
          </View>
        </View>

        {/* Category information */}
        <View 
          className="flex-row items-center p-3 rounded-xl"
          style={{
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.borderColor,
          }}
        >
          <View 
            className="w-8 h-8 rounded-full items-center justify-center mr-3"
            style={{
              backgroundColor: `${colors.tint}20`,
            }}
          >
            <Ionicons name="grid" size={16} color={colors.tint} />
          </View>
          <View className="flex-1">
            <ThemedText className="text-sm font-medium">
              {t("product_detail.category", { category: product.category })}
            </ThemedText>
          </View>
        </View>
      </Animated.View>
    </ThemedView>
  );
}
