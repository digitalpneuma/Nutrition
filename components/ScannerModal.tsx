import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

declare const Html5Qrcode: any;

interface ScannerModalProps {
  onScan: (code: string) => void;
  onClose: () => void;
}

export const ScannerModal: React.FC<ScannerModalProps> = ({ onScan, onClose }) => {
  const scannerRef = useRef<any>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const scannerId = "reader";
    let html5QrCode: any;

    const startScanner = async () => {
      try {
        html5QrCode = new Html5Qrcode(scannerId);
        scannerRef.current = html5QrCode;
        
        await html5QrCode.start(
          { facingMode: "environment" },
          { 
            fps: 10, 
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0 
          },
          (decodedText: string) => {
            onScan(decodedText);
            stopScanner();
          },
          (errorMessage: any) => {
            // ignore frame errors
          }
        );
      } catch (err) {
        console.error("Error starting scanner", err);
        setError("Could not access camera. Please check permissions.");
      }
    };

    const stopScanner = async () => {
      if (scannerRef.current) {
        try {
          await scannerRef.current.stop();
          scannerRef.current.clear();
        } catch (e) {
          console.warn("Failed to stop scanner", e);
        }
        scannerRef.current = null;
      }
    };

    startScanner();

    return () => {
      stopScanner();
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl relative">
        <div className="p-4 flex justify-between items-center bg-stone-50 border-b border-stone-100">
          <h3 className="font-heading font-bold text-stone-800">Scan Barcode</h3>
          <button 
            onClick={onClose}
            className="p-2 bg-white rounded-full text-stone-400 hover:text-stone-600 shadow-sm transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="relative bg-black h-80 w-full">
          {error ? (
            <div className="absolute inset-0 flex items-center justify-center text-white p-6 text-center">
              {error}
            </div>
          ) : (
            <>
              <div id="reader" className="w-full h-full object-cover"></div>
              {/* Custom Overlay */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-64 h-64 border-2 border-nature-400/50 rounded-2xl relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-full h-1 bg-nature-400/80 shadow-[0_0_10px_rgba(94,184,139,0.8)] animate-scan-line"></div>
                   
                   {/* Corners */}
                   <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-nature-500 rounded-tl-sm"></div>
                   <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-nature-500 rounded-tr-sm"></div>
                   <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-nature-500 rounded-bl-sm"></div>
                   <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-nature-500 rounded-br-sm"></div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="p-6 text-center">
          <p className="text-stone-500 text-sm">Point your camera at a food barcode.</p>
        </div>
      </div>
      <style>{`
        @keyframes scan-line {
          0% { transform: translateY(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(250px); opacity: 0; }
        }
        .animate-scan-line {
          animation: scan-line 2s infinite linear;
        }
      `}</style>
    </div>
  );
};