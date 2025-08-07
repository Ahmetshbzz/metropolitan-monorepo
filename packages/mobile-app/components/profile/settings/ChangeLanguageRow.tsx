import React from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ContextMenu from "react-native-context-menu-view";
import Colors from "@/constants/Colors";
import { ThemedText } from "@/components/ThemedText";
import { useTranslation } from "react-i18next";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useHaptics } from "@/hooks/useHaptics";
import { changeLanguage } from "@/core/i18n";

interface ChangeLanguageRowProps {
  label: string;
}

export function ChangeLanguageRow({ label }: ChangeLanguageRowProps) {
  const { t, i18n } = useTranslation();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const { triggerHaptic } = useHaptics();

  function getCurrentLanguageName() {
    switch (i18n.language) {
      case "tr":
        return t("languages.tr");
      case "pl":
        return t("languages.pl");
      case "en":
        return t("languages.en");
      default:
        return t("languages.tr");
    }
  }

  const handleLanguageChange = async (lang: "tr" | "en" | "pl") => {
    triggerHaptic("success");
    await changeLanguage(lang);
  };

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        minHeight: 44,
      }}
    >
      <Ionicons name="language-outline" size={20} color={colors.darkGray} />
      <ThemedText className="flex-1 ml-4 text-base">{label}</ThemedText>
      <ContextMenu
        dropdownMenuMode
        actions={[
          { title: t("languages.tr"), selected: i18n.language === "tr" },
          { title: t("languages.en"), selected: i18n.language === "en" },
          { title: t("languages.pl"), selected: i18n.language === "pl" },
        ]}
        onPress={(e) => {
          const languages = ["tr", "en", "pl"] as const;
          const selectedLang = languages[e.nativeEvent.index];
          if (selectedLang) handleLanguageChange(selectedLang);
        }}
      >
        <View
          style={{
            minWidth: 80,
            paddingVertical: 8,
            paddingHorizontal: 8,
            borderRadius: 8,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "flex-end",
          }}
        >
          <ThemedText className="text-base" style={{ color: colors.darkGray, marginRight: 4 }}>
            {getCurrentLanguageName()}
          </ThemedText>
          <Ionicons name="chevron-down" size={16} color={colors.mediumGray} />
        </View>
      </ContextMenu>
    </View>
  );
}


