import React, { useState, useEffect, useRef } from 'react';
import { Analyze, History as HistoryIcon, Loader2, Search, Camera, Leaf, ScanBarcode } from 'lucide-react';
import { analyzeFood, analyzeBarcode } from './services/geminiService';
import { NutritionData, FoodEntry } from './types';
import { ResultCard } from './components/ResultCard';
import { Dashboard } from './components/Dashboard';
import { ScannerModal } from './components/ScannerModal';

export default function App() {
  const [query, setQuery] = useState('');
  const [view, setView] = useState<'scan' | 'dashboard'>('scan');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<NutritionData | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [history, setHistory] = useState<FoodEntry[]>(() => {
    const saved = localStorage.getItem('nutricalm_history');
    return saved ? JSON.parse(saved) : [];
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem('nutricalm_history', JSON.stringify(history));
  }, [history]);

  const handleAnalyze = async (e?: React.FormEvent, imageFile?: File) => {
    if (e) e.preventDefault();
    if (!query.trim() && !imageFile) return;

    setLoading(true);
    setResult(null);

    try {
        let imageBase64 = undefined;
        
        if (imageFile) {
             const reader = new FileReader();
             reader.readAsDataURL(imageFile);
             await new Promise((resolve) => {
                 reader.onload = () => {
                     const base64 = reader.result as string;
                     imageBase64 = base64.split(',')[1];
                     resolve(true);
                 }
             });
        }

      const data = await analyzeFood(query, imageBase64);
      setResult(data);
    } catch (error) {
      alert("Couldn't analyze food. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBarcodeScan = async (code: string) => {
    setShowScanner(false);
    setLoading(true);
    setResult(null);
    try {
      const data = await analyzeBarcode(code);
      setResult(data);
    } catch (error) {
      alert("Couldn't retrieve product info. Please try manual entry.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          handleAnalyze(undefined, e.target.files[0]);
      }
  };

  const saveEntry = () => {
    if (!result) return;
    const newEntry: FoodEntry = {
      ...result,
      id: Date.now().toString(),
      timestamp: Date.now(),
    };
    setHistory(prev => [...prev, newEntry]);
    setResult(null);
    setQuery('');
    setView('dashboard');
  };

  return (
    <div className="min-h-screen text-stone-800 font-sans selection:bg-nature-200">
      
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-stone-100">
        <div className="max-w-md mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-nature-700">
            <div className="bg-nature-100 p-2 rounded-xl">
                <Leaf size={20} className="text-nature-600 fill-nature-600" />
            </div>
            <h1 className="font-heading font-bold text-xl tracking-tight">NutriCalm</h1>
          </div>
          <div className="flex bg-stone-100 rounded-full p-1">
            <button 
                onClick={() => setView('scan')}
                className={`p-2 rounded-full transition-all ${view === 'scan' ? 'bg-white shadow text-nature-600' : 'text-stone-400 hover:text-stone-600'}`}
            >
                <Search size={18} />
            </button>
            <button 
                onClick={() => setView('dashboard')}
                className={`p-2 rounded-full transition-all ${view === 'dashboard' ? 'bg-white shadow text-nature-600' : 'text-stone-400 hover:text-stone-600'}`}
            >
                <HistoryIcon size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-6 py-8 pb-24">
        
        {view === 'scan' && (
            <div className="flex flex-col gap-8 animate-fade-in">
                
                {/* Intro Text */}
                {!result && !loading && (
                    <div className="text-center py-10">
                        <h2 className="font-heading text-3xl font-bold text-stone-800 mb-3">What's on your plate?</h2>
                        <p className="text-stone-500">Track your nutrition with peace of mind.</p>
                    </div>
                )}

                {/* Input Area */}
                {!result && (
                    <div className={`transition-all duration-500 ${loading ? 'opacity-50 pointer-events-none scale-95' : 'opacity-100'}`}>
                        <form onSubmit={(e) => handleAnalyze(e)} className="relative group">
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="e.g. Avocado Toast"
                                className="w-full bg-white border-2 border-stone-100 text-stone-800 placeholder-stone-400 rounded-2xl py-4 pl-5 pr-32 shadow-sm focus:outline-none focus:border-nature-300 focus:ring-4 focus:ring-nature-100 transition-all text-lg"
                            />
                            <div className="absolute right-3 top-3 flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => setShowScanner(true)}
                                  className="p-2 text-stone-400 hover:text-nature-600 hover:bg-stone-100 rounded-xl transition-colors"
                                  title="Scan Barcode"
                                >
                                  <ScanBarcode size={20} />
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-2 text-stone-400 hover:text-nature-600 hover:bg-stone-100 rounded-xl transition-colors"
                                    title="Upload Image"
                                >
                                    <Camera size={20} />
                                    <input 
                                        ref={fileInputRef}
                                        type="file" 
                                        accept="image/*" 
                                        className="hidden" 
                                        onChange={handleFileSelect}
                                    />
                                </button>
                                <button 
                                    type="submit"
                                    disabled={!query}
                                    className="bg-nature-600 hover:bg-nature-700 text-white p-2 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Search size={20} />
                                </button>
                            </div>
                        </form>
                        <p className="text-center text-xs text-stone-400 mt-4">
                            Powered by Gemini AI. Scan a barcode, type a meal, or upload a photo.
                        </p>
                    </div>
                )}

                {/* Loader */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                        <Loader2 size={48} className="text-nature-400 animate-spin mb-4" />
                        <p className="text-stone-500 font-medium">Analyzing...</p>
                    </div>
                )}

                {/* Results */}
                <ResultCard 
                    data={result} 
                    onSave={saveEntry} 
                    onDiscard={() => { setResult(null); setQuery(''); }} 
                />
            </div>
        )}

        {view === 'dashboard' && (
            <Dashboard history={history} />
        )}

      </main>

      {/* Scanner Modal */}
      {showScanner && (
        <ScannerModal 
          onScan={handleBarcodeScan} 
          onClose={() => setShowScanner(false)} 
        />
      )}

      <style>{`
        @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce-gentle {
            0%, 100% { transform: translateY(-5%); }
            50% { transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.5s ease-out; }
        .animate-fade-in-up { animation: fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
        .animate-bounce-gentle { animation: bounce-gentle 2s infinite ease-in-out; }
      `}</style>
    </div>
  );
}