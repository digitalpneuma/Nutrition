import React, { useMemo, useState } from 'react';
import { FoodEntry, TimeRange } from '../types';
import { 
  ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { Calendar, TrendingUp } from 'lucide-react';

interface DashboardProps {
  history: FoodEntry[];
}

// Matching colors from ResultCard
const COLORS = {
  calories: '#3a9b70', // Nature-500
  protein: '#60a5fa',  // Blue-400
  carbs: '#fbbf24',    // Amber-400
  fats: '#fb7185',     // Rose-400
  sugars: '#c084fc',   // Purple-400
};

export const Dashboard: React.FC<DashboardProps> = ({ history }) => {
  const [range, setRange] = useState<TimeRange>('1W');

  const chartData = useMemo(() => {
    const now = new Date();
    let data: any[] = [];

    if (range === '1D') {
      // Group by Hour for last 24h
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      const todayEntries = history.filter(h => h.timestamp >= startOfDay);
      
      // Create hourly buckets (every 3 hours for cleaner graph)
      for (let i = 0; i <= 21; i+=3) {
        const label = `${i}:00`;
        // Filter for a 3-hour window
        const entryInBucket = todayEntries.filter(e => {
          const h = new Date(e.timestamp).getHours();
          return h >= i && h < i + 3;
        });
        
        data.push({ 
          name: label, 
          calories: entryInBucket.reduce((sum, e) => sum + e.calories, 0),
          protein: entryInBucket.reduce((sum, e) => sum + e.protein, 0),
          carbs: entryInBucket.reduce((sum, e) => sum + e.carbs, 0),
          fats: entryInBucket.reduce((sum, e) => sum + e.fats, 0),
          sugars: entryInBucket.reduce((sum, e) => sum + e.sugars, 0),
        });
      }
    } 
    else if (range === '1W') {
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
        const dayEnd = dayStart + 86400000;
        
        const dayEntries = history.filter(h => h.timestamp >= dayStart && h.timestamp < dayEnd);
        
        data.push({ 
          name: d.toLocaleDateString('en-US', { weekday: 'short' }), 
          calories: dayEntries.reduce((sum, e) => sum + e.calories, 0),
          protein: dayEntries.reduce((sum, e) => sum + e.protein, 0),
          carbs: dayEntries.reduce((sum, e) => sum + e.carbs, 0),
          fats: dayEntries.reduce((sum, e) => sum + e.fats, 0),
          sugars: dayEntries.reduce((sum, e) => sum + e.sugars, 0),
        });
      }
    } 
    else if (range === '1Y') {
        // Last 12 months
        for (let i = 11; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const label = d.toLocaleDateString('en-US', { month: 'short' });
            const monthStart = d.getTime();
            // End of month
            const nextMonth = new Date(d.getFullYear(), d.getMonth() + 1, 1);
            const monthEnd = nextMonth.getTime();

            const monthEntries = history.filter(h => h.timestamp >= monthStart && h.timestamp < monthEnd);

            data.push({ 
              name: label, 
              calories: monthEntries.reduce((sum, e) => sum + e.calories, 0),
              protein: monthEntries.reduce((sum, e) => sum + e.protein, 0),
              carbs: monthEntries.reduce((sum, e) => sum + e.carbs, 0),
              fats: monthEntries.reduce((sum, e) => sum + e.fats, 0),
              sugars: monthEntries.reduce((sum, e) => sum + e.sugars, 0),
            });
        }
    }
    return data;
  }, [history, range]);

  const totalCalories = useMemo(() => chartData.reduce((acc, curr) => acc + curr.calories, 0), [chartData]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-2xl shadow-xl border border-stone-100">
          <p className="font-heading font-bold text-stone-800 mb-2">{label}</p>
          <div className="space-y-1">
            {payload.map((entry: any) => (
              <div key={entry.name} className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-stone-500 capitalize w-16">{entry.name}:</span>
                <span className="font-bold text-stone-700">
                  {entry.value} {entry.name === 'calories' ? 'kcal' : 'g'}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Stats Header */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-stone-100 shadow-sm">
           <div className="flex items-center gap-2 text-stone-500 text-xs font-medium mb-1">
             <TrendingUp size={14} /> TOTAL ENERGY
           </div>
           <div className="text-2xl font-heading font-bold text-stone-800">{totalCalories} <span className="text-sm font-normal text-stone-400">kcal</span></div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-stone-100 shadow-sm">
           <div className="flex items-center gap-2 text-stone-500 text-xs font-medium mb-1">
             <Calendar size={14} /> LOGGED ITEMS
           </div>
           <div className="text-2xl font-heading font-bold text-stone-800">{history.length}</div>
        </div>
      </div>

      {/* Graph Card */}
      <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="flex items-center gap-2">
            <h3 className="font-heading font-bold text-lg text-stone-800">Nutrition Trends</h3>
            {/* Legend */}
            <div className="flex gap-1.5 ml-2">
                <div className="w-2 h-2 rounded-full bg-nature-500" title="Calories"></div>
                <div className="w-2 h-2 rounded-full bg-blue-400" title="Protein"></div>
                <div className="w-2 h-2 rounded-full bg-amber-400" title="Carbs"></div>
                <div className="w-2 h-2 rounded-full bg-rose-400" title="Fats"></div>
                <div className="w-2 h-2 rounded-full bg-purple-400" title="Sugars"></div>
            </div>
          </div>
          
          {/* Toggle */}
          <div className="flex bg-stone-100 rounded-xl p-1">
            {(['1D', '1W', '1Y'] as TimeRange[]).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  range === r 
                  ? 'bg-white text-stone-900 shadow-sm' 
                  : 'text-stone-500 hover:text-stone-700'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData}>
              <defs>
                <linearGradient id="colorCal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.calories} stopOpacity={0.15}/>
                  <stop offset="95%" stopColor={COLORS.calories} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#a8a29e', fontSize: 12}} 
                dy={10}
              />
              {/* Right Axis for Calories (Energy) */}
              <YAxis yAxisId="energy" orientation="right" hide />
              {/* Left Axis for Macros (Grams) */}
              <YAxis yAxisId="grams" orientation="left" hide />
              
              <Tooltip content={<CustomTooltip />} cursor={{stroke: '#d6d3d1', strokeWidth: 1, strokeDasharray: '4 4'}} />

              {/* Calories: Area Chart (Background) */}
              <Area 
                yAxisId="energy"
                type="monotone" 
                dataKey="calories" 
                stroke={COLORS.calories} 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorCal)" 
                animationDuration={1000}
              />

              {/* Macros: Line Charts */}
              <Line yAxisId="grams" type="monotone" dataKey="protein" stroke={COLORS.protein} strokeWidth={3} dot={false} animationDuration={1200} />
              <Line yAxisId="grams" type="monotone" dataKey="carbs" stroke={COLORS.carbs} strokeWidth={3} dot={false} animationDuration={1400} />
              <Line yAxisId="grams" type="monotone" dataKey="fats" stroke={COLORS.fats} strokeWidth={3} dot={false} animationDuration={1600} />
              <Line yAxisId="grams" type="monotone" dataKey="sugars" stroke={COLORS.sugars} strokeWidth={3} dot={false} animationDuration={1800} />

            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent History List */}
      <div>
        <h3 className="font-heading font-bold text-lg text-stone-800 mb-4 px-1">Recent Entries</h3>
        <div className="space-y-3">
          {history.slice().reverse().slice(0, 10).map((item) => (
            <div key={item.id} className="flex items-center justify-between bg-white p-4 rounded-2xl border border-stone-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                    <div className="text-2xl bg-nature-50 w-12 h-12 flex items-center justify-center rounded-xl">{item.emoji}</div>
                    <div>
                        <div className="font-bold text-stone-800">{item.name}</div>
                        <div className="text-xs text-stone-400 flex items-center gap-1">
                             {new Date(item.timestamp).toLocaleDateString()} • {new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="font-bold text-nature-600">{item.calories} kcal</div>
                    <div className="flex gap-1 justify-end mt-1">
                        <span className="w-2 h-2 rounded-full bg-blue-400" title={`Protein: ${item.protein}g`}></span>
                        <span className="w-2 h-2 rounded-full bg-amber-400" title={`Carbs: ${item.carbs}g`}></span>
                        <span className="w-2 h-2 rounded-full bg-rose-400" title={`Fats: ${item.fats}g`}></span>
                    </div>
                </div>
            </div>
          ))}
          {history.length === 0 && (
              <div className="text-center py-8 text-stone-400">
                  No meals tracked yet.
              </div>
          )}
        </div>
      </div>

    </div>
  );
};