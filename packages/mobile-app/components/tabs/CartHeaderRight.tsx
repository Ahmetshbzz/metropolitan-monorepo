import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity } from "react-native";

interface CartHeaderRightProps {
  onClear: () => void;
}

export function CartHeaderRight({ onClear }: CartHeaderRightProps) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity onPress={onClear} style={{ padding: 8, marginRight: 4 }}>
      <Ionicons name="trash-outline" size={24} color={colors.text} />
    </TouchableOpacity>
  );
}
