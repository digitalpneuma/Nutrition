export interface NutritionData {
  calories: number;
  protein: number; // grams
  carbs: number;   // grams
  fats: number;    // grams
  sugars: number;  // grams
  name: string;
  emoji: string;
  briefDescription?: string;
}

export interface FoodEntry extends NutritionData {
  id: string;
  timestamp: number;
}

export type TimeRange = '1D' | '1W' | '1M' | '1Y';

export interface NutrientMetric {
  key: keyof NutritionData;
  label: string;
  unit: string;
  color: string;
  max: number; // Arbitrary daily reference for bar scaling
}