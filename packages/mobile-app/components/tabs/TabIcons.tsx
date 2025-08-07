import { Ionicons } from "@expo/vector-icons";
import React from "react";

export function HomeIcon({
  color,
  focused,
}: {
  color: string;
  focused: boolean;
}) {
  return (
    <Ionicons
      size={24}
      name={focused ? "home" : "home-outline"}
      color={color}
    />
  );
}

export function ProductsIcon({
  color,
  focused,
}: {
  color: string;
  focused: boolean;
}) {
  return (
    <Ionicons size={24} name={focused ? "bag" : "bag-outline"} color={color} />
  );
}

export function CartIcon({
  color,
  focused,
}: {
  color: string;
  focused: boolean;
}) {
  return (
    <Ionicons
      size={24}
      name={focused ? "cart" : "cart-outline"}
      color={color}
    />
  );
}

export function OrdersIcon({
  color,
  focused,
}: {
  color: string;
  focused: boolean;
}) {
  return (
    <Ionicons
      size={24}
      name={focused ? "receipt" : "receipt-outline"}
      color={color}
    />
  );
}

export function ProfileIcon({
  color,
  focused,
}: {
  color: string;
  focused: boolean;
}) {
  return (
    <Ionicons
      size={24}
      name={focused ? "person" : "person-outline"}
      color={color}
    />
  );
}
