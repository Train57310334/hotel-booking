import React from 'react'

export default function AvailabilityMatrix({
    currentDate,
    rooms,
    availabilityMetrics,
    setAvTooltip,
    setCurrentDate,
    setViewMode
}) {
    return (
        <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-y-auto p-6 flex flex-col min-h-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.from({ length: 6 }).map((_, i) => {
                    const m = new Date(currentDate); m.setDate(1); m.setMonth(m.getMonth() + i);
                    const monthEnd = new Date(m); monthEnd.setMonth(m.getMonth() + 1); monthEnd.setDate(0);
                    const firstDay = m.getDay(); // 0 is Sun
                    const daysInMonth = monthEnd.getDate();
                    
                    return (
                        <div key={i} className="flex flex-col">
                            <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-3 text-center uppercase tracking-wider text-sm">{m.toLocaleString('en-US', { month: 'long', year: 'numeric' })}</h3>
                            <div className="grid grid-cols-7 gap-1 flex-1">
                                {['SU','MO','TU','WE','TH','FR','SA'].map(day => <div key={day} className="text-[10px] font-bold text-slate-400 text-center uppercase py-1">{day}</div>)}
                                {Array.from({ length: firstDay }).map((_, j) => <div key={`empty-${j}`} />)}
                                {Array.from({ length: daysInMonth }).map((_, d) => {
                                    const dDate = new Date(m); dDate.setDate(d + 1);
                                    const dStr = dDate.toDateString();
                                    const metrics = availabilityMetrics[dStr] || { total: rooms.length, available: rooms.length, occupancy: 0, typeBreakdown: [] };
                                    const isFull = rooms.length > 0 && metrics.available === 0;
                                    const isLow = rooms.length > 0 && metrics.available > 0 && metrics.available <= (rooms.length * 0.2);
                                    
                                    return (
                                        <div 
                                            key={d} 
                                            onMouseEnter={e => {
                                                const r = e.currentTarget.getBoundingClientRect();
                                                setAvTooltip({ isOpen: true, dStr, metrics, x: r.right + 10, y: r.top });
                                            }}
                                            onMouseLeave={() => setAvTooltip(p => ({ ...p, isOpen: false }))}
                                            onClick={() => {
                                                setAvTooltip(p => ({ ...p, isOpen: false }));
                                                setCurrentDate(dDate);
                                                setViewMode('day');
                                            }}
                                            className={`relative aspect-square rounded-lg flex flex-col items-center justify-center shadow-sm transition-transform hover:scale-105 cursor-pointer hover:shadow-md border overflow-hidden group ${
                                                isFull ? 'bg-rose-50 border-rose-200 text-rose-700' : isLow ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-teal-50 border-teal-200 text-teal-800'
                                            }`}
                                        >
                                            <div className={`absolute bottom-0 left-0 right-0 opacity-20 pointer-events-none transition-all ${
                                                isFull ? 'bg-rose-500' : isLow ? 'bg-amber-500' : 'bg-teal-500'
                                            }`} style={{ height: `${metrics.occupancy}%` }} />
                                            
                                            <span className="absolute top-1 left-1.5 text-[8px] sm:text-[10px] font-bold opacity-60 pointer-events-none">{d + 1}</span>
                                            <span className="absolute top-1 right-1.5 text-[7px] sm:text-[9px] font-bold opacity-60 pointer-events-none">{metrics.occupancy}%</span>

                                            <div className="flex flex-col items-center leading-none mt-2">
                                                <span className="font-extrabold text-sm sm:text-base lg:text-lg">{metrics.available}</span>
                                                <span className="text-[7px] uppercase font-bold tracking-wider opacity-60 hidden sm:block pointer-events-none mt-0.5">Left</span>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )
                })}
            </div>
            
            <div className="mt-auto pt-6 border-t border-slate-200 dark:border-slate-700 flex flex-wrap gap-6 items-center justify-center text-xs font-bold uppercase tracking-wider text-slate-500">
                <div className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-teal-500 shadow-sm"></span> Available</div>
                <div className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-amber-500 shadow-sm"></span> Low Availability</div>
                <div className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-rose-500 shadow-sm"></span> Sold Out</div>
            </div>
        </div>
    )
}
