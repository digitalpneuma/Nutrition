import React, { useEffect, useState } from 'react';
import { NutrientMetric } from '../types';

interface NutrientBarProps {
  metric: NutrientMetric;
  value: number;
  delay?: number;
}

export const NutrientBar: React.FC<NutrientBarProps> = ({ metric, value, delay = 0 }) => {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const percentage = Math.min(100, (value / metric.max) * 100);
    const timer = setTimeout(() => {
      setWidth(percentage);
    }, delay);
    return () => clearTimeout(timer);
  }, [value, metric.max, delay]);

  return (
    <div className="mb-3">
      <div className="flex justify-between items-end mb-1">
        <span className="text-sm font-medium text-stone-600">{metric.label}</span>
        <span className="text-sm font-bold font-heading text-stone-800">
          {value}<span className="text-xs font-normal text-stone-400 ml-0.5">{metric.unit}</span>
        </span>
      </div>
      <div className="h-2.5 w-full bg-stone-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out ${metric.color}`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
};