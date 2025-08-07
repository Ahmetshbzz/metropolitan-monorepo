//  "CartSummary.tsx"
//  metropolitan app
//  Created by Ahmet on 16.06.2025.

import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { BaseButton } from "@/components/base/BaseButton";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import Colors from "@/constants/Colors";
import { CartSummary as CartSummaryType } from "@/context/CartContext";
import { formatPrice } from "@/core/utils";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useTabBarHeight } from "@/hooks/useTabBarHeight";

interface CartSummaryProps {
  summary: CartSummaryType;
  onCheckout: () => void;
  isCheckingOut?: boolean;
}

export const CART_SUMMARY_HEIGHT = 104; // more compact mini sheet

// Hook to get dynamic cart summary height
export function useCartSummaryHeight() {
  const { paddingBottom } = useTabBarHeight();
  return CART_SUMMARY_HEIGHT + paddingBottom;
}

export function CartSummary({
  summary,
  onCheckout,
  isCheckingOut,
}: CartSummaryProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const { t } = useTranslation();
  const { paddingBottom } = useTabBarHeight();

  return (
    <ThemedView
      className="absolute bottom-0 left-0 right-0 z-10"
      style={{
        paddingTop: 12,
        paddingBottom,
        paddingHorizontal: 16,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        backgroundColor: colors.cardBackground,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 8,
      }}
    >
      <View className="flex-row items-center justify-between mb-2.5">
        <ThemedText className="text-xs" style={{ color: "#666" }}>
          {t("cart.summary.total_label", { count: summary.totalItems })}
        </ThemedText>
        <ThemedText
          className="text-lg font-bold"
          style={{ color: colors.tint }}
        >
          {formatPrice(summary.totalAmount, summary.currency)}
        </ThemedText>
      </View>

      <BaseButton
        variant="primary"
        size="small"
        title={t("cart.checkout")}
        onPress={onCheckout}
        loading={isCheckingOut}
        disabled={isCheckingOut}
        hapticType="success"
        fullWidth
      />
    </ThemedView>
  );
}
