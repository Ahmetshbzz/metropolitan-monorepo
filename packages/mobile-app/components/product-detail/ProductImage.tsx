//  "ProductImage.tsx"
//  metropolitan app
//  Created by Ahmet on 09.06.2025.

import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { useTranslation } from "react-i18next";
import { Dimensions, Share, View } from "react-native";
import Animated, { FadeIn, FadeInDown, FadeInUp } from "react-native-reanimated";

import { HapticIconButton } from "@/components/HapticButton";
import { ThemedText } from "@/components/ThemedText";
import Colors from "@/constants/Colors";
import { Product } from "@/context/ProductContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useHaptics } from "@/hooks/useHaptics";

const { width } = Dimensions.get("window");

interface ProductImageProps {
  product: Product | null;
}

export function ProductImage({ product }: ProductImageProps) {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const { triggerHaptic } = useHaptics();

  const handleShare = async () => {
    if (product) {
      try {
        await Share.share({
          message: `${product.name} - ${t("product_detail.share.check_out_this_product")}`,
          title: product.name,
        });
        triggerHaptic("light");
      } catch (error) {
        console.error("Error sharing:", error);
      }
    }
  };

  return (
    <Animated.View
      className="items-center justify-center"
      style={{
        width: width,
        height: width * 0.85,
        backgroundColor: colors.card,
      }}
      entering={FadeIn.duration(400)}
    >
      {/* Modern gradient background */}
      <View
        className="absolute inset-0 opacity-5"
        style={{
          backgroundColor: `${colors.tint}10`,
        }}
      />
      
      {/* Product image container with subtle shadow */}
      <View
        className="w-full h-full p-6 items-center justify-center"
        style={{
          shadowColor: colors.text,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 3,
        }}
      >
        <Animated.View
          className="w-full h-full rounded-2xl overflow-hidden"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            borderWidth: 1,
            borderColor: colors.borderColor,
          }}
          entering={FadeIn.delay(100).duration(400)}
        >
          <Image
            source={{ uri: product?.image }}
            style={{ width: "100%", height: "100%" }}
            contentFit="contain"
            transition={500}
          />
        </Animated.View>
      </View>

      {/* Modern low stock badge */}
      {product && product.stock <= 5 && (
        <Animated.View
          className="absolute flex-row items-center px-3 py-1.5 rounded-full"
          style={{
            top: 24,
            left: 20,
            backgroundColor: "rgba(239, 68, 68, 0.95)",
            shadowColor: "#EF4444",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 4,
          }}
          entering={FadeInDown.delay(200).duration(300)}
        >
          <Ionicons name="warning" size={14} color="white" style={{ marginRight: 4 }} />
          <ThemedText className="text-white text-xs font-semibold">
            {t("product_detail.low_stock", { count: product.stock })}
          </ThemedText>
        </Animated.View>
      )}

      {/* Modern share button */}
      <Animated.View
        className="absolute top-6 right-5"
        entering={FadeInUp.delay(150).duration(300)}
      >
        <HapticIconButton
          onPress={handleShare}
          className="w-11 h-11 justify-center items-center rounded-full"
          style={{
            backgroundColor: colors.cardBackground,
            shadowColor: colors.text,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
            borderWidth: 1,
            borderColor: colors.borderColor,
          }}
          hapticType="light"
        >
          <Ionicons name="share-outline" size={20} color={colors.text} />
        </HapticIconButton>
      </Animated.View>
    </Animated.View>
  );
}
