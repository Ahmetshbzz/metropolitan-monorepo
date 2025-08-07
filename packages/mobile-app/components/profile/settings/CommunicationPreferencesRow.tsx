import React from "react";
import { SettingsItem } from "@/components/profile/SettingsItem";

interface CommunicationPreferencesRowProps {
  label: string;
  onPress: () => void;
}

export function CommunicationPreferencesRow({ label, onPress }: CommunicationPreferencesRowProps) {
  return <SettingsItem icon="chatbubble-ellipses-outline" label={label} type="link" onPress={onPress} />;
}


