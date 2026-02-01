import { User, Check, AlertCircle, Maximize2, Bed, List } from 'lucide-react'

export default function RoomCard({ roomType, availability, ratePlans = [], onBook }) {
    return (
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 mb-8 transition-transform hover:shadow-lg duration-300">
            <div className="flex flex-col lg:flex-row">
                {/* Room Image - Larger and Prominent */}
                <div className="w-full lg:w-[320px] shrink-0 bg-slate-100 relative group min-h-[240px]">
                    {roomType.images && roomType.images.length > 0 ? (
                        <>
                            <img src={roomType.images[0]} alt={roomType.name} className="w-full h-full object-cover absolute inset-0 transition-transform duration-700 group-hover:scale-105" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                        </>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <Bed size={48} />
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 p-6 lg:p-8 flex flex-col lg:flex-row gap-6">
                    {/* Room Info */}
                    <div className="flex-1">
                        <div className="mb-4">
                            <h3 className="text-2xl font-display font-bold text-slate-900 mb-2">{roomType.name}</h3>
                            <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">
                                {roomType.description || "Experience comfort and style in our carefully designed rooms, featuring modern amenities and stunning views."}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm text-slate-600 mb-6">
                            <div className="flex items-center gap-2">
                                <User size={16} className="text-slate-400" />
                                <span>Max {roomType.maxAdults || 2} Adults</span>
                            </div>
                            {roomType.sizeSqm && (
                                <div className="flex items-center gap-2">
                                    <Maximize2 size={16} className="text-slate-400" />
                                    <span>{roomType.sizeSqm} m²</span>
                                </div>
                            )}
                            {roomType.bedConfig && (
                                <div className="flex items-center gap-2">
                                    <Bed size={16} className="text-slate-400" />
                                    <span>{roomType.bedConfig}</span>
                                </div>
                            )}
                        </div>

                        {/* Validated Tags / Amenities */}
                        <div className="flex flex-wrap gap-2">
                            {roomType.amenities?.slice(0, 5).map(am => (
                                <span key={am} className="px-2.5 py-1 rounded-full bg-slate-50 text-slate-500 text-xs font-medium border border-slate-100">
                                    {am}
                                </span>
                            ))}
                            {roomType.amenities?.length > 5 && (
                                <span className="px-2.5 py-1 rounded-full bg-slate-50 text-slate-400 text-xs font-medium border border-slate-100">
                                    +{roomType.amenities.length - 5} more
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Booking Options / Rate Plans - Separator on Mobile */}
                    <div className="lg:w-80 shrink-0 border-t lg:border-t-0 lg:border-l border-slate-100 pt-6 lg:pt-0 lg:pl-6 space-y-3">
                        {availability > 0 && availability <= 3 && (
                            <div className="mb-3 text-red-600 text-xs font-bold flex items-center gap-1.5 animate-pulse">
                                <AlertCircle size={14} />
                                Only {availability} rooms left!
                            </div>
                        )}

                        {ratePlans.length === 0 && (
                            <div className="text-center py-4 text-slate-400 text-sm">Unavailable dates</div>
                        )}

                        {ratePlans.map((plan, idx) => (
                            <div key={idx} className="group border border-slate-200 rounded-xl p-4 hover:border-emerald-500/50 hover:bg-emerald-50/10 hover:shadow-md hover:shadow-emerald-500/5 transition-all cursor-pointer">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="space-y-1">
                                        <h4 className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition-colors">{plan.name}</h4>
                                        <div className="text-xs space-y-0.5">
                                            {plan.includesBreakfast && (
                                                <div className="text-emerald-600 flex items-center gap-1 font-medium">
                                                    <Check size={10} strokeWidth={3} /> Breakfast
                                                </div>
                                            )}
                                            <div className="text-slate-500 flex items-center gap-1">
                                                {plan.cancellation === 'Non-refundable' ? <AlertCircle size={10} /> : <Check size={10} />}
                                                {plan.cancellation}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xl font-display font-bold text-slate-900">
                                            ฿{Number(plan.pricePerNight || 0).toLocaleString()}
                                        </div>
                                        <div className="text-[10px] text-slate-400 uppercase font-medium">Per Night</div>
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onBook(roomType, plan.name, plan.pricePerNight);
                                    }}
                                    className="w-full mt-2 py-2.5 rounded-lg bg-slate-900 text-white font-bold text-sm shadow-lg shadow-slate-900/20 group-hover:bg-emerald-600 group-hover:shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
                                >
                                    Select Room <Check size={16} className="opacity-0 group-hover:opacity-100 -ml-4 group-hover:ml-0 transition-all" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}