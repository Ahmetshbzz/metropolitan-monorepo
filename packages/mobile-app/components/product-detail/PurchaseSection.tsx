//  "PurchaseSection.tsx"
//  metropolitan app
//  Created by Ahmet on 13.06.2025.

import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Text, TextInput, View } from "react-native";
import Animated, { FadeInUp, useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BaseButton } from "@/components/base/BaseButton";
import { HapticIconButton } from "@/components/HapticButton";
import { ThemedView } from "@/components/ThemedView";
import Colors from "@/constants/Colors";
import { useCart } from "@/context/CartContext";
import { Product } from "@/context/ProductContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useHaptics } from "@/hooks/useHaptics";
import { useToast } from "@/hooks/useToast";

interface PurchaseSectionProps {
  product: Product;
}

export function PurchaseSection({ product }: PurchaseSectionProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { addToCart, cartItems } = useCart();
  const { showToast } = useToast();
  const { triggerHaptic } = useHaptics();

  // Ürün sepette mi kontrol et
  const existingCartItem = cartItems.find(
    (item) => item.product.id === product.id
  );
  
  const [quantity, setQuantity] = useState(
    existingCartItem ? String(existingCartItem.quantity) : "1"
  );
  const [isAdded, setIsAdded] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sepet güncellendiğinde miktarı güncelle
  useEffect(() => {
    const currentCartItem = cartItems.find(
      (item) => item.product.id === product.id
    );
    if (currentCartItem) {
      setQuantity(String(currentCartItem.quantity));
    } else {
      // Ürün sepetten çıkarıldıysa miktarı 1'e sıfırla
      setQuantity("1");
    }
  }, [cartItems, product.id]);

  // Cleanup için useEffect
  useEffect(() => {
    return () => {
      // Component unmount olduğunda timeout'u temizle
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleAddToCart = async () => {
    const numQuantity = parseInt(quantity, 10) || 1;
    
    const cartItem = cartItems.find(
      (item) => item.product.id === product.id
    );
    const existingQuantity = cartItem ? cartItem.quantity : 0;

    if (existingQuantity === 0 && numQuantity > product.stock) {
      showToast(
        t("product_detail.purchase.stock_error_message", {
          count: product.stock,
        }),
        "warning"
      );
      throw new Error("Stock limit exceeded");
    }

    try {
      await addToCart(product.id, numQuantity);
      
      // Başarılı ekleme/güncelleme sonrası hafif titreşim
      triggerHaptic("light", true);
      
      if (!cartItem) {
        // Yeni ekleme ise geçici olarak "Sepete Eklendi" göster
        setIsAdded(true);
        
        // Önceki timeout'u temizle
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        // Yeni timeout oluştur
        timeoutRef.current = setTimeout(() => {
          setIsAdded(false);
          timeoutRef.current = null;
        }, 2000);
      }
    } catch (error: any) {
      console.error("Sepete ekleme hatası:", error);
      
      // useCartState'ten gelen structured error'ı handle et
      if (error.key) {
        // Structured error message'ı direkt kullan (zaten çevrilmiş)
        showToast(error.message, "error");
      } else if (error.code === "AUTH_REQUIRED") {
        // Auth error'ı handle et
        showToast(error.message, "warning");
      } else {
        // Generic error
        showToast(t("product_detail.purchase.generic_error_message"), "error");
      }
      throw error;
    }
  };

  const handleQuantityChange = (text: string) => {
    setQuantity(text.replace(/[^0-9]/g, ""));
  };

  const handleQuantityBlur = () => {
    const num = parseInt(quantity, 10);
    if (isNaN(num) || num < 1) {
      setQuantity("1");
    } else if (num > product.stock) {
      setQuantity(String(product.stock));
    }
  };

  const updateQuantity = (amount: number) => {
    const currentQuantity = parseInt(quantity, 10) || 0;
    const newQuantity = currentQuantity + amount;
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(String(newQuantity));
    }
  };

  const numericQuantity = parseInt(quantity, 10) || 0;
  
  // Buton durumunu belirle
  const currentCartItem = cartItems.find(
    (item) => item.product.id === product.id
  );
  const isInCart = !!currentCartItem;
  const isSameQuantity = currentCartItem && currentCartItem.quantity === numericQuantity;

  const buttonScale = useSharedValue(1);
  
  const animatedButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: buttonScale.value }],
    };
  });

  const handleAddToCartAnimated = async () => {
    buttonScale.value = withSpring(0.95, { duration: 100 }, () => {
      buttonScale.value = withSpring(1, { duration: 100 });
    });
    await handleAddToCart();
  };

  return (
    <Animated.View
      className="px-5 pt-6 pb-2"
      style={{
        paddingBottom: insets.bottom + 12,
        backgroundColor: colors.cardBackground,
        shadowColor: colors.text,
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 8,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: colors.borderColor,
      }}
      entering={FadeInUp.duration(300)}
    >
      {/* Quantity selector with modern design */}
      <View className="flex-row items-center mb-4">
        <View
          className="flex-row items-center rounded-2xl border overflow-hidden"
          style={{ 
            borderColor: colors.borderColor,
            backgroundColor: colors.card,
            shadowColor: colors.text,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          <HapticIconButton
            className="w-14 h-14 items-center justify-center"
            onPress={() => updateQuantity(-1)}
            hapticType="light"
            disabled={numericQuantity <= 1}
            style={{
              opacity: numericQuantity <= 1 ? 0.4 : 1,
            }}
          >
            <Ionicons
              name="remove"
              size={20}
              color={numericQuantity <= 1 ? colors.mediumGray : colors.text}
            />
          </HapticIconButton>
          
          <View 
            className="px-4"
            style={{
              borderLeftWidth: 1,
              borderRightWidth: 1,
              borderColor: colors.borderColor,
              backgroundColor: colors.cardBackground,
            }}
          >
            <TextInput
              className="text-lg font-bold text-center"
              style={{
                color: colors.text,
                minWidth: 60,
                height: 56,
                textAlignVertical: "center",
                paddingVertical: 0,
                includeFontPadding: false,
                lineHeight: 22,
              }}
              value={quantity}
              onChangeText={handleQuantityChange}
              onBlur={handleQuantityBlur}
              keyboardType="number-pad"
              maxLength={3}
              selectTextOnFocus
            />
          </View>
          
          <HapticIconButton
            className="w-14 h-14 items-center justify-center"
            onPress={() => updateQuantity(1)}
            hapticType="light"
            disabled={numericQuantity >= product.stock}
            style={{
              opacity: numericQuantity >= product.stock ? 0.4 : 1,
            }}
          >
            <Ionicons
              name="add"
              size={20}
              color={
                numericQuantity >= product.stock ? colors.mediumGray : colors.text
              }
            />
          </HapticIconButton>
        </View>
        
        {/* Action button */}
        <Animated.View 
          className="flex-1 ml-4"
          style={animatedButtonStyle}
        >
          {isInCart && isSameQuantity ? (
            <Link href="/(tabs)/cart" asChild>
              <BaseButton
                variant="success"
                size="large"
                hapticType="medium"
                style={{
                  borderRadius: 16,
                  shadowColor: "#10B981",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 6,
                }}
              >
                <View className="flex-row items-center justify-center">
                  <Ionicons name="cart" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text className="text-base font-bold" style={{ color: "#FFFFFF" }}>
                    {t("product_detail.purchase.go_to_cart")}
                  </Text>
                </View>
              </BaseButton>
            </Link>
          ) : (
            <BaseButton
              variant={isAdded ? "success" : "primary"}
              size="large"
              onPress={handleAddToCartAnimated}
              hapticType={isAdded ? "success" : "medium"}
              disabled={product.stock === 0 || numericQuantity === 0}
              style={{
                borderRadius: 16,
                shadowColor: isAdded ? "#10B981" : colors.tint,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 6,
                opacity: (product.stock === 0 || numericQuantity === 0) ? 0.5 : 1,
              }}
            >
              <View className="flex-row items-center justify-center">
                <Ionicons 
                  name={isAdded ? "checkmark" : "add"} 
                  size={18} 
                  color="#FFFFFF" 
                  style={{ marginRight: 8 }} 
                />
                <Text className="text-base font-bold" style={{ color: "#FFFFFF" }}>
                  {product.stock === 0
                    ? t("product_detail.purchase.out_of_stock")
                    : isAdded
                      ? t("product_detail.purchase.added_to_cart")
                      : isInCart
                        ? t("product_detail.purchase.update_cart")
                        : t("product_detail.purchase.add_to_cart")}
                </Text>
              </View>
            </BaseButton>
          )}
        </Animated.View>
      </View>
    </Animated.View>
  );
}
