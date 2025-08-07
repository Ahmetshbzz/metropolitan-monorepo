import { HapticIconButton } from "@/components/HapticButton";
import { SearchInput } from "@/components/appbar/SearchInput";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View } from "react-native";

interface ProductsHeaderRightProps {
  onNotify: () => void;
  onSearchChange: (text: string) => void;
  initialValue: string;
}

export function ProductsHeaderRight({
  onNotify,
  onSearchChange,
  initialValue,
}: ProductsHeaderRightProps) {
  const { colors } = useTheme();
  return (
    <View
      style={{ flexDirection: "row", alignItems: "center", marginRight: 4 }}
    >
      <SearchInput
        onSearchChange={onSearchChange}
        initialValue={initialValue}
        placeholder="Ürün ara..."
      />
      <HapticIconButton
        onPress={onNotify}
        hapticType="light"
        style={{ padding: 8 }}
      >
        <Ionicons name="notifications-outline" size={24} color={colors.text} />
      </HapticIconButton>
    </View>
  );
}
