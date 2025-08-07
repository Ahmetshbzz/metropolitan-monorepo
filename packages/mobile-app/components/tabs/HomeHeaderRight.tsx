import { HapticIconButton } from "@/components/HapticButton";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View } from "react-native";

interface HomeHeaderRightProps {
  onPress: () => void;
}

export function HomeHeaderRight({ onPress }: HomeHeaderRightProps) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: "row", marginRight: 4 }}>
      <HapticIconButton
        onPress={onPress}
        hapticType="light"
        style={{ padding: 8 }}
      >
        <Ionicons name="notifications-outline" size={24} color={colors.text} />
      </HapticIconButton>
    </View>
  );
}
