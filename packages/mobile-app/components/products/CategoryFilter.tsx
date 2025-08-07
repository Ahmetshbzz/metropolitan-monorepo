//  "CategoryFilter.tsx"
//  metropolitan app
//  Created by Ahmet on 25.06.2025.

import React from "react";
import { ScrollView, View } from "react-native";

import { HapticButton } from "@/components/HapticButton";
import { Category } from "@/context/ProductContext";
import { CategoryFilterItem } from "./CategoryFilterItem";

interface CategoryFilterProps {
  categories: Category[];
  activeCategory: string | null;
  onCategoryPress: (slug: string) => void;
}

export function CategoryFilter({
  categories,
  activeCategory,
  onCategoryPress,
}: CategoryFilterProps) {
  const handleCategoryPress = (slug: string) => {
    onCategoryPress(slug);
  };

  return (
    <View className="py-3 justify-center">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      >
        {categories.map((category) => (
          <HapticButton
            key={category.id}
            hapticType="light"
            onPress={() => handleCategoryPress(category.slug)}
            className="mr-4"
            style={{
              paddingVertical: 0,
              paddingHorizontal: 0,
              backgroundColor: "transparent",
            }}
          >
            <CategoryFilterItem
              category={category}
              isActive={activeCategory === category.slug}
              onPress={handleCategoryPress}
            />
          </HapticButton>
        ))}
      </ScrollView>
    </View>
  );
}
