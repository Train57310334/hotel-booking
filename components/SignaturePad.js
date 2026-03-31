import React, { useRef, useState, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { RefreshCcw } from 'lucide-react';

export default function SignaturePad({ onSign }) {
    const padRef = useRef(null);
    const [isEmpty, setIsEmpty] = useState(true);

    const handleClear = () => {
        padRef.current.clear();
        setIsEmpty(true);
        if (onSign) onSign(null);
    };

    const handleEnd = () => {
        if (!padRef.current) return;
        const empty = padRef.current.isEmpty();
        setIsEmpty(empty);
        if (!empty) {
            // Use getCanvas().toDataURL() directly to avoid a broken `trim-canvas` internal dep
            if (onSign) onSign(padRef.current.getCanvas().toDataURL('image/png'));
        } else {
            if (onSign) onSign(null);
        }
    };

    // Responsive canvas handling to prevent blurry lines on mobile
    useEffect(() => {
        const resizeCanvas = () => {
             if (!padRef.current) return;
             // Ensure the wrapper div is properly rendered first
             setTimeout(() => {
                 if (!padRef.current) return;
                 const canvas = padRef.current.getCanvas();
                 const container = canvas.parentNode;
                 const ratio =  Math.max(window.devicePixelRatio || 1, 1);
                 canvas.width = container.offsetWidth * ratio;
                 canvas.height = container.offsetHeight * ratio;
                 canvas.getContext("2d").scale(ratio, ratio);
                 padRef.current.clear(); 
                 if (onSign) onSign(null);
                 setIsEmpty(true);
             }, 100);
        }
        
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
        return () => window.removeEventListener('resize', resizeCanvas);
    }, [onSign]);

    return (
        <div className="w-full flex flex-col items-center">
             <div className="w-full h-48 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-800 relative overflow-hidden">
                 {/* Z-index keeps the placeholder below the canvas */}
                 {isEmpty && (
                     <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-slate-400 font-medium z-0">
                         Sign strictly within the box
                     </div>
                 )}
                 <SignatureCanvas 
                    ref={padRef}
                    penColor='black'
                    canvasProps={{ className: "w-full h-full cursor-crosshair touch-none relative z-10" }}
                    onEnd={handleEnd}
                 />
             </div>
             
             <div className="flex justify-between w-full mt-3">
                 <span className="text-xs text-slate-500">I confirm the details above are correct.</span>
                 <button type="button" onClick={handleClear} className="text-xs font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1 px-2 py-1 bg-rose-50 rounded-lg">
                     <RefreshCcw size={12} /> Clear Signature
                 </button>
             </div>
        </div>
    );
}
