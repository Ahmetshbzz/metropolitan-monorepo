//  "TabScreens.tsx"
//  metropolitan app
//  Created by Ahmet on 04.07.2025.

import { CartHeaderRight } from "@/components/tabs/CartHeaderRight";
import { HomeHeaderRight } from "@/components/tabs/HomeHeaderRight";
import { ProductsHeaderRight } from "@/components/tabs/ProductsHeaderRight";
import { CartIcon, HomeIcon, OrdersIcon, ProductsIcon, ProfileIcon } from "@/components/tabs/TabIcons";
import { useProductsSearch } from "@/context/ProductsSearchContext";
import { Tabs } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";

interface TabScreensProps {
  cartItemCount: number;
  handleClearCart: () => void;
  handleNotification: () => void;
  scrollToTop: (routeName: string) => void;
  screenOptions: any;
}

export const TabScreens = ({
  cartItemCount,
  handleClearCart,
  handleNotification,
  scrollToTop,
  screenOptions,
}: TabScreensProps) => {
  const { t } = useTranslation();
  const { searchQuery, setSearchQuery } = useProductsSearch();

  return (
    <Tabs
      screenOptions={screenOptions}
      screenListeners={({ navigation, route }) => ({
        tabPress: () => {
          const currentRoute =
            navigation.getState().routes[navigation.getState().index];
          if (
            currentRoute.name === route.name &&
            (route.name === "index" || route.name === "products")
          ) {
            scrollToTop(route.name);
          }
        },
      })}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("tabs.home"),
          headerShown: true,
          headerTitle: t("tabs.home"),
          headerRight: () => <HomeHeaderRight onPress={handleNotification} />,
          tabBarIcon: ({ color, focused }) => <HomeIcon color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: t("tabs.products"),
          headerShown: true,
          headerTitle: t("tabs.products"),
          headerRight: () => (
            <ProductsHeaderRight
              onNotify={handleNotification}
              onSearchChange={setSearchQuery}
              initialValue={searchQuery}
            />
          ),
          tabBarIcon: ({ color, focused }) => <ProductsIcon color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: t("tabs.cart.title"),
          headerShown: true,
          headerTitle: t("tabs.cart.title"),
          headerRight: cartItemCount > 0 ? () => <CartHeaderRight onClear={handleClearCart} /> : undefined,
          tabBarIcon: ({ color, focused }) => <CartIcon color={color} focused={focused} />,
          tabBarBadge: cartItemCount > 0 ? cartItemCount : undefined,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: t("tabs.orders"),
          headerShown: true,
          headerTitle: t("tabs.orders"),
          tabBarIcon: ({ color, focused }) => <OrdersIcon color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t("tabs.profile"),
          headerShown: true,
          headerTitle: t("tabs.profile"),
          tabBarIcon: ({ color, focused }) => <ProfileIcon color={color} focused={focused} />,
        }}
      />
    </Tabs>
  );
};
