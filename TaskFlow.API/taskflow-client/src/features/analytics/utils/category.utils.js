import { CATEGORY_MAP } from "@/features/analytics/constants/category.constants";

export function getCategoryName(category) {
  if (typeof category === "number") {
    return CATEGORY_MAP[category] ?? "General";
  }

  return category || "General";
}
