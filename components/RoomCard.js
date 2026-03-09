import { User, Maximize2, Coffee, Minus, Plus, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'

export default function RoomCard({ roomType, ratePlans = [], onSelect, selectedCounts = {} }) {
    const isAvailable = roomType.isAvailable !== false;
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const hasImages = roomType.images && roomType.images.length > 0;

    const nextImage = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev + 1) % roomType.images.length);
    };

    const prevImage = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev === 0 ? roomType.images.length - 1 : prev - 1));
    };

    return (
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-slate-200 transition-all duration-300 flex flex-col w-full">

            {/* TOP SECTION: Room Details (Image + Info) */}
            <div className="flex flex-col sm:flex-row border-b border-slate-200 bg-slate-50/50">
                {/* Image Carousel */}
                <div className="relative w-full sm:w-2/5 aspect-[4/3] sm:aspect-auto shrink-0 overflow-hidden group">
                    {hasImages ? (
                        <>
                            <img
                                src={roomType.images[currentImageIndex]}
                                alt={roomType.name}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            {roomType.images.length > 1 && (
                                <>
                                    <button onClick={prevImage} className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur text-slate-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow-md">
                                        <ChevronLeft size={18} />
                                    </button>
                                    <button onClick={nextImage} className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur text-slate-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow-md">
                                        <ChevronRight size={18} />
                                    </button>
                                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                                        {roomType.images.map((_, idx) => (
                                            <div key={idx} className={`h-1.5 rounded-full transition-all ${idx === currentImageIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}`} />
                                        ))}
                                    </div>
                                </>
                            )}
                        </>
                    ) : (
                        <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300 min-h-[200px]">
                            <span className="text-sm font-medium">No Image</span>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 pointer-events-none" />
                </div>

                {/* Info */}
                <div className="p-5 sm:p-6 w-full sm:w-3/5 flex flex-col">
                    <h3 className="text-2xl font-display font-bold text-slate-900 mb-2">
                        {roomType.name}
                    </h3>

                    <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 font-medium mb-3">
                        <div className="flex items-center gap-1.5">
                            <User size={16} className="text-slate-400" />
                            <span>Max {roomType.maxAdults || 2} Adults</span>
                        </div>
                        {roomType.sizeSqm && (
                            <>
                                <span className="w-1 h-1 rounded-full bg-slate-300" />
                                <div className="flex items-center gap-1.5">
                                    <Maximize2 size={16} className="text-slate-400" />
                                    <span>{roomType.sizeSqm} m²</span>
                                </div>
                            </>
                        )}
                    </div>

                    <p className="text-sm text-slate-500 leading-relaxed mb-4 line-clamp-2">
                        {roomType.description || "Experience comfort and style in our carefully designed rooms."}
                    </p>

                    {roomType.amenities && roomType.amenities.length > 0 && (
                        <div className="mt-auto">
                            <div className="flex flex-wrap gap-2">
                                {roomType.amenities.slice(0, 5).map(am => (
                                    <span key={am} className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 text-xs font-semibold uppercase tracking-wide">
                                        {am}
                                    </span>
                                ))}
                                {roomType.amenities.length > 5 && (
                                    <span className="px-2 py-1 rounded-lg bg-slate-100 text-slate-500 text-xs font-semibold uppercase tracking-wide">
                                        +{roomType.amenities.length - 5} more
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* BOTTOM SECTION: Rate Plans */}
            <div className="w-full flex flex-col bg-white">
                <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <div className="col-span-6">Rate Options</div>
                    <div className="col-span-3 text-right">Price / Night</div>
                    <div className="col-span-3 text-center">Select Room</div>
                </div>

                <div className="flex flex-col p-4 sm:p-0">
                    {!isAvailable ? (
                        <div className="flex-1 flex items-center justify-center p-8">
                            <div className="bg-red-50 text-red-600 px-6 py-4 rounded-2xl border border-red-100 font-medium text-center">
                                {roomType.availabilityReason || "Sold Out for these dates."}
                            </div>
                        </div>
                    ) : ratePlans && ratePlans.length > 0 ? (
                        <div className="flex flex-col sm:divide-y divide-slate-100 gap-4 sm:gap-0">
                            {ratePlans.map((plan, idx) => (
                                <div key={idx} className={`grid grid-cols-1 sm:grid-cols-12 gap-4 p-4 sm:p-5 rounded-2xl sm:rounded-none border sm:border-0 transition-colors ${selectedCounts[plan.id] ? 'bg-emerald-50/50 border-emerald-200' : 'bg-white border-slate-200 hover:bg-slate-50/50'}`}>
                                    {/* Left: Plan Info */}
                                    <div className="col-span-1 sm:col-span-6 flex flex-col justify-center">
                                        <h5 className="font-bold text-slate-900 text-base mb-2">{plan.name}</h5>
                                        <ul className="text-[13px] text-slate-600 space-y-2">
                                            {plan.includesBreakfast && (
                                                <li className="flex items-start gap-1.5 text-emerald-600 font-semibold bg-emerald-50 w-fit px-2 py-1 rounded-md">
                                                    <Coffee size={15} className="shrink-0" />
                                                    <span>Breakfast Included</span>
                                                </li>
                                            )}
                                            {plan.cancellationRule && (
                                                <li className="flex items-start gap-1.5">
                                                    <CheckCircle2 size={15} className="shrink-0 mt-0.5 text-slate-400" />
                                                    <span>{plan.cancellationRule}</span>
                                                </li>
                                            )}
                                        </ul>
                                    </div>

                                    {/* Middle: Price */}
                                    <div className="col-span-1 sm:col-span-3 flex flex-row sm:flex-col items-center justify-between sm:justify-center text-right border-t border-slate-100 sm:border-0 pt-3 sm:pt-0">
                                        <span className="sm:hidden text-xs font-bold text-slate-500 uppercase">Price</span>
                                        <div className="flex flex-col items-end">
                                            <span className="text-2xl font-display font-bold text-slate-900 tracking-tight leading-none">
                                                ฿{Number(plan.pricePerNight || plan.baseRate || roomType.basePrice || 0).toLocaleString()}
                                            </span>
                                            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mt-1">/ night</span>
                                        </div>
                                    </div>

                                    {/* Right: Selector */}
                                    <div className="col-span-1 sm:col-span-3 flex items-center justify-end sm:justify-center mt-2 sm:mt-0">
                                        {onSelect ? (
                                            <div className="w-full sm:w-11/12 lg:w-4/5">
                                                {selectedCounts[plan.id] > 0 ? (
                                                    <div className="flex items-center justify-between gap-2 bg-white border-2 border-emerald-500 rounded-xl p-1 shadow-sm w-full mx-auto max-w-full sm:max-w-none">
                                                        <button
                                                            onClick={() => onSelect(roomType, plan, -1)}
                                                            className="w-10 h-10 flex items-center justify-center rounded-lg text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                                                        >
                                                            <Minus size={18} />
                                                        </button>
                                                        <span className="font-bold text-slate-900 w-6 text-center text-lg flex-1">
                                                            {selectedCounts[plan.id]}
                                                        </span>
                                                        <button
                                                            onClick={() => onSelect(roomType, plan, 1)}
                                                            className="w-10 h-10 flex items-center justify-center rounded-lg text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                                                        >
                                                            <Plus size={18} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => onSelect(roomType, plan, 1)}
                                                        className="w-full mx-auto max-w-full sm:max-w-none px-4 py-3 bg-white border-2 border-slate-200 hover:border-emerald-500 text-slate-700 hover:text-emerald-600 font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                                                    >
                                                        Select
                                                    </button>
                                                )}
                                            </div>
                                        ) : (
                                            <a
                                                href={`/search?hotelId=${roomType.hotelId}`}
                                                className="w-full px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center text-center"
                                            >
                                                Book Now
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center p-8">
                            <div className="text-slate-500 font-medium">No pricing configured for this date.</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}