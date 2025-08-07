import React from "react";
import { SettingsItem } from "@/components/profile/SettingsItem";

interface ThemeRowProps {
  label: string;
  value: "light" | "dark";
  onToggle: () => void;
}

export function ThemeRow({ label, value, onToggle }: ThemeRowProps) {
  return (
    <SettingsItem
      icon="color-palette-outline"
      label={label}
      type="toggle"
      value={value === "dark"}
      onValueChange={onToggle}
    />
  );
}


