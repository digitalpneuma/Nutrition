import React from 'react';
import { NutritionData, NutrientMetric } from '../types';
import { NutrientBar } from './NutrientBar';
import { Plus, X } from 'lucide-react';

interface ResultCardProps {
  data: NutritionData | null;
  onSave: () => void;
  onDiscard: () => void;
}

const METRICS: NutrientMetric[] = [
  { key: 'calories', label: 'Energy', unit: 'kcal', color: 'bg-nature-500', max: 800 }, // Max arbitrary for visual scale
  { key: 'protein', label: 'Protein', unit: 'g', color: 'bg-blue-400', max: 50 },
  { key: 'carbs', label: 'Carbs', unit: 'g', color: 'bg-amber-400', max: 100 },
  { key: 'fats', label: 'Fats', unit: 'g', color: 'bg-rose-400', max: 40 },
  { key: 'sugars', label: 'Sugars', unit: 'g', color: 'bg-purple-400', max: 40 },
];

export const ResultCard: React.FC<ResultCardProps> = ({ data, onSave, onDiscard }) => {
  if (!data) return null;

  return (
    <div className="w-full animate-fade-in-up">
      <div className="bg-white rounded-3xl shadow-xl shadow-stone-200/50 overflow-hidden border border-stone-100">
        {/* Header / Image area */}
        <div className="bg-nature-50 p-6 text-center relative">
           <button 
            onClick={onDiscard}
            className="absolute top-4 right-4 p-2 bg-white/50 hover:bg-white rounded-full text-stone-400 hover:text-stone-600 transition-colors"
          >
            <X size={18} />
          </button>
          <div className="text-6xl mb-2 filter drop-shadow-sm animate-bounce-gentle inline-block">
            {data.emoji}
          </div>
          <h2 className="text-2xl font-heading font-bold text-stone-800">{data.name}</h2>
          <p className="text-stone-500 text-sm mt-1 max-w-[80%] mx-auto">{data.briefDescription}</p>
        </div>

        {/* Metrics */}
        <div className="p-6 space-y-4">
          {METRICS.map((metric, index) => (
            <NutrientBar 
              key={metric.key} 
              metric={metric} 
              value={data[metric.key] as number} 
              delay={index * 100} 
            />
          ))}
        </div>

        {/* Actions */}
        <div className="p-6 pt-0">
          <button
            onClick={onSave}
            className="w-full py-3.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-medium transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-stone-200"
          >
            <Plus size={20} />
            Log to Daily Intake
          </button>
        </div>
      </div>
    </div>
  );
};