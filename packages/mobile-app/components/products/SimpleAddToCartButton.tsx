//  "SimpleAddToCartButton.tsx"
//  metropolitan app
//  Created by Ahmet on 30.06.2025.

import { useHaptics } from "@/hooks/useHaptics";
import type { ThemeColors } from "@/types/theme";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  GestureResponderEvent,
  TouchableOpacity,
} from "react-native";

interface SimpleAddToCartButtonProps {
  onPress: (e: GestureResponderEvent) => Promise<void>;
  colors: ThemeColors;
  outOfStock?: boolean;
}

export const SimpleAddToCartButton: React.FC<SimpleAddToCartButtonProps> = ({
  onPress,
  colors,
  outOfStock = false,
}) => {
  const [state, setState] = useState<"idle" | "loading" | "success">("idle");
  const { triggerHaptic } = useHaptics();

  const handlePress = async (e: GestureResponderEvent) => {
    if (state !== "idle") return;

    // Tıklandığı anda hafif haptik tetikle (non-blocking)
    triggerHaptic("light");
    setState("loading");

    try {
      await onPress(e);
      setState("success");
      // Başarı/hata sonrası ekstra haptik yok; tek haptik basış anında
      setTimeout(() => setState("idle"), 1200);
    } catch {
      setState("idle");
    }
  };

  const getIcon = () => {
    switch (state) {
      case "success":
        return "checkmark";
      default:
        return outOfStock ? "notifications-outline" : "cart-outline";
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      className="w-9 h-9 rounded-full items-center justify-center"
      style={{ backgroundColor: colors.primary }}
      activeOpacity={0.8}
    >
      {state === "loading" ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <Ionicons name={getIcon()} size={16} color="#fff" />
      )}
    </TouchableOpacity>
  );
};
