import { User, Maximize2, Coffee, Minus, Plus } from 'lucide-react'

export default function RoomCard({ roomType, ratePlans = [], onSelect, selectedCounts = {} }) {
    // Determine overall availability status
    // The backend `processAvailability` sets isAvailable to false if no inventory.
    const isAvailable = roomType.isAvailable !== false;

    return (
        <div className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-slate-100 transition-all duration-300 flex flex-col md:flex-row h-full w-full">
            {/* Image Section - Left side on desktop */}
            <div className="relative aspect-[4/3] md:aspect-auto md:w-[40%] overflow-hidden shrink-0">
                {roomType.images && roomType.images.length > 0 ? (
                    <img
                        src={roomType.images[0]}
                        alt={roomType.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
                        <span className="text-sm">No Image</span>
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
            </div>

            {/* Content Section - Right side on desktop */}
            <div className="p-6 md:p-8 flex flex-col flex-1">
                <div className="mb-4">
                    <h3 className="text-2xl font-display font-bold text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors">
                        {roomType.name}
                    </h3>
                    <p className="text-sm text-slate-500 leading-relaxed max-w-lg">
                        {roomType.description || "Experience comfort and style in our carefully designed rooms."}
                    </p>
                </div>

                {/* Key Features */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 font-medium mb-6">
                    <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                        <User size={16} className="text-emerald-500" />
                        <span>Up to {roomType.maxAdults || 2} Adults</span>
                    </div>
                    {roomType.sizeSqm && (
                        <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                            <Maximize2 size={16} className="text-emerald-500" />
                            <span>{roomType.sizeSqm} m²</span>
                        </div>
                    )}
                </div>

                {/* Amenities */}
                {roomType.amenities && roomType.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-100 pb-6">
                        {roomType.amenities.map(am => (
                            <span key={am} className="px-2.5 py-1 rounded-md bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider border border-slate-100">
                                {am}
                            </span>
                        ))}
                    </div>
                )}

                {/* Rate Plans List */}
                <div className="mt-auto space-y-3">
                    <h4 className="text-sm font-bold text-slate-900 mb-3">Available Rates</h4>

                    {!isAvailable ? (
                        <div className="text-center py-6 bg-red-50/50 rounded-2xl border border-red-100 text-red-600 font-medium">
                            {roomType.availabilityReason || "Sold Out for these dates."}
                        </div>
                    ) : ratePlans && ratePlans.length > 0 ? (
                        <div className="flex flex-col gap-3">
                            {ratePlans.map((plan, idx) => (
                                <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-slate-200 bg-white hover:border-emerald-300 hover:shadow-md transition-all">
                                    <div className="flex-1 mb-4 sm:mb-0">
                                        <h5 className="font-bold text-slate-900 text-base">{plan.name}</h5>
                                        <ul className="text-sm text-slate-500 mt-1 space-y-1">
                                            {plan.includesBreakfast && (
                                                <li className="flex items-center gap-1.5 text-emerald-600 font-medium">
                                                    <Coffee size={14} /> Breakfast Included
                                                </li>
                                            )}
                                            {plan.cancellationRule && (
                                                <li className="flex items-center gap-1.5">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                                    {plan.cancellationRule}
                                                </li>
                                            )}
                                        </ul>
                                    </div>
                                    <div className="flex items-center justify-between sm:flex-col sm:items-end sm:justify-center gap-3 border-t border-slate-100 sm:border-0 pt-3 sm:pt-0 pl-0 sm:pl-4">
                                        <div className="flex flex-col sm:items-end">
                                            <span className="text-xl font-display font-bold text-slate-900 tracking-tight">
                                                ฿{Number(plan.pricePerNight).toLocaleString()}
                                            </span>
                                            <span className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold mt-0.5">/ night</span>
                                        </div>
                                        {/* Cart Selector */}
                                        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl p-1">
                                            <button
                                                onClick={() => onSelect(roomType, plan, -1)}
                                                disabled={!selectedCounts[plan.id]}
                                                className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${selectedCounts[plan.id] ? 'bg-white shadow text-slate-700 hover:bg-slate-100 border border-slate-200' : 'text-slate-300'}`}
                                            >
                                                <Minus size={16} />
                                            </button>
                                            <span className="font-bold text-slate-900 w-4 text-center">
                                                {selectedCounts[plan.id] || 0}
                                            </span>
                                            <button
                                                onClick={() => onSelect(roomType, plan, 1)}
                                                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white shadow text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 border border-slate-200 transition-colors"
                                            >
                                                <Plus size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-6 bg-slate-50 rounded-2xl border border-slate-100">
                            <span className="text-slate-500 font-medium">No pricing configured for this date.</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}