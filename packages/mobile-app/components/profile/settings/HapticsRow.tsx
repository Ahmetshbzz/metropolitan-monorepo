import React from "react";
import { SettingsItem } from "@/components/profile/SettingsItem";

interface HapticsRowProps {
  label: string;
  value: boolean;
  onToggle: (v: boolean) => void;
}

export function HapticsRow({ label, value, onToggle }: HapticsRowProps) {
  return (
    <SettingsItem
      icon="phone-portrait-outline"
      label={label}
      type="toggle"
      value={value}
      onValueChange={onToggle}
    />
  );
}


