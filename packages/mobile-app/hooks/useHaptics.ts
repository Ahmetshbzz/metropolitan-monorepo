//  "useHaptics.ts"
//  metropolitan app
//  Created by Ahmet on 30.06.2025.

import { useUserSettings } from "@/context/UserSettings";
import * as Haptics from "expo-haptics";
import { GestureResponderEvent, Platform } from "react-native";

// Haptic feedback türleri
export type HapticType =
  | "light"
  | "medium"
  | "heavy"
  | "success"
  | "warning"
  | "error";

/**
 * Haptic feedback gönderen hook
 */
export function useHaptics() {
  // Kullanıcı ayarlarından titreşim durumunu al
  const { settings } = useUserSettings();
  // Çifte tetiklemeyi engellemek için kısa bir cooldown
  let lastTriggerTs = 0;

  /**
   * Farklı türlerde titreşimler için işlev
   * @param type - titreşim tipi
   */
  const triggerHaptic = (type: HapticType = "light", force = false) => {
    // Kullanıcı titreşim kapalı olarak ayarladıysa ve zorlama yoksa işlem yapma
    if (!settings.hapticsEnabled && !force) return;

    // iOS'ta çalışır, Android'de bazı cihazlarda desteklenebilir
    if (Platform.OS === "ios" || Platform.OS === "android") {
      try {
        const now = Date.now();
        if (!force && now - lastTriggerTs < 120) return; // 120ms cooldown
        lastTriggerTs = now;
        switch (type) {
          case "light":
            // Daha yumuşak ve hızlı his için selection kullan
            Haptics.selectionAsync();
            break;
          case "medium":
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            break;
          case "heavy":
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            break;
          case "success":
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            break;
          case "warning":
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            break;
          case "error":
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            break;
          default:
            Haptics.selectionAsync();
        }
      } catch (error) {}
    }
  };

  /**
   * Titreşim ile birlikte çalışacak onPress işlevi
   * @param callback - tıklama işlevi
   * @param type - titreşim tipi
   */
  const withHapticFeedback = (
    callback?: (event?: GestureResponderEvent) => void,
    type: HapticType = "light"
  ) => {
    return (event?: GestureResponderEvent) => {
      // Callback'i hemen çağır, haptic'i arka planda çalıştır
      if (callback) {
        callback(event);
      }
      // Haptic feedback'i non-blocking olarak tetikle
      setTimeout(() => triggerHaptic(type), 0);
    };
  };

  return {
    triggerHaptic,
    withHapticFeedback,
    // Ayarlar için titreşim durumunu da dışarı aç
    isEnabled: settings.hapticsEnabled,
  };
}
