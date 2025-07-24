//  "[id].tsx"
//  metropolitan app
//  Created by Ahmet on 06.07.2025.

import { Ionicons } from "@expo/vector-icons";
import { Link, useLocalSearchParams, useNavigation } from "expo-router";
import { useLayoutEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  View,
} from "react-native";
import Animated, { FadeIn, SlideInUp } from "react-native-reanimated";
import {
  KeyboardAwareScrollView,
  KeyboardStickyView,
} from "react-native-keyboard-controller";

import { HapticIconButton } from "@/components/HapticButton";
import { ProductImage } from "@/components/product-detail/ProductImage";
import { ProductInfo } from "@/components/product-detail/ProductInfo";
import { PurchaseSection } from "@/components/product-detail/PurchaseSection";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import Colors from "@/constants/Colors";
import { useCart } from "@/context/CartContext";
import { useProducts } from "@/context/ProductContext";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { products, loadingProducts } = useProducts();
  const { t } = useTranslation();
  const { cartItems } = useCart();
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const product = products.find((p) => p.id === id);

  // Klavye açıldığında içeriğin en alta kayması için ScrollView referansı
  const scrollViewRef = useRef<ScrollView>(null);
  const cartItemCount = cartItems.length;

  // Native header'a ürün adını ve butonları dinamik olarak ekle
  useLayoutEffect(() => {
    if (product) {
      navigation.setOptions({
        headerTitle: product.name,
        headerRight: () => (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginRight: -12,
            }}
          >
            <Link href="/(tabs)/cart" asChild>
              <HapticIconButton hapticType="light" style={{ padding: 8 }}>
                <View style={{ position: "relative" }}>
                  <Ionicons name="cart-outline" size={24} color={colors.text} />
                  {cartItemCount > 0 && (
                    <View
                      style={{
                        position: "absolute",
                        backgroundColor: colors.tint,
                        right: -10,
                        top: -5,
                        borderRadius: 10,
                        width: 20,
                        height: 20,
                        justifyContent: "center",
                        alignItems: "center",
                        ...(cartItemCount > 99 && { width: 28, right: -15 }),
                      }}
                    >
                      <Text
                        style={{
                          fontSize: cartItemCount > 99 ? 10 : 12,
                          lineHeight: 20,
                          color: "#FFFFFF",
                          fontWeight: "bold",
                          textAlign: "center",
                        }}
                      >
                        {cartItemCount > 99 ? "99+" : cartItemCount}
                      </Text>
                    </View>
                  )}
                </View>
              </HapticIconButton>
            </Link>
          </View>
        ),
      });
    }
  }, [navigation, product, cartItemCount, colors]);


  if (loadingProducts) {
    return (
      <ThemedView className="flex-1 justify-center items-center">
        <Animated.View entering={FadeIn.duration(300)}>
          <ActivityIndicator size="large" color={colors.tint} />
        </Animated.View>
      </ThemedView>
    );
  }

  if (!product) {
    return (
      <ThemedView className="flex-1">
        <Animated.View 
          className="flex-1 justify-center items-center px-6"
          entering={FadeIn.duration(400)}
        >
          <View 
            className="p-6 rounded-2xl items-center"
            style={{
              backgroundColor: colors.card,
              borderWidth: 1,
              borderColor: colors.borderColor,
            }}
          >
            <ThemedText className="text-lg text-center" style={{ color: colors.mediumGray }}>
              {t("product_detail.not_found_body")}
            </ThemedText>
          </View>
        </Animated.View>
      </ThemedView>
    );
  }

  return (
    <ThemedView className="flex-1">
      <KeyboardStickyView style={{ flex: 1 }}>
        <KeyboardAwareScrollView
          ref={scrollViewRef}
          style={{ flex: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bottomOffset={120} // PurchaseSection yüksekliği için space
          extraKeyboardSpace={20} // Ekstra boşluk
          contentContainerStyle={{
            flexGrow: 1,
          }}
        >
          <Animated.View entering={FadeIn.duration(500)}>
            <ProductImage product={product} />
          </Animated.View>
          <Animated.View entering={SlideInUp.delay(100).duration(400)}>
            <ProductInfo product={product} />
          </Animated.View>
        </KeyboardAwareScrollView>
        <PurchaseSection product={product} />
      </KeyboardStickyView>
    </ThemedView>
  );
}
