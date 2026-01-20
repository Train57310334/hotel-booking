import { User, Check, AlertCircle } from 'lucide-react'

export default function RoomCard({ roomType, availability, ratePlans = [], onBook }) {
    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-6">
            <div className="flex flex-col md:flex-row gap-6">
                {/* Room Info */}
                <div className="flex-1">
                    <h3 className="text-xl font-display font-bold text-slate-900 mb-2">{roomType.name}</h3>

                    <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                        <span className="flex items-center gap-1">
                            <User size={16} />
                            Max 2 Guests
                        </span>
                        {roomType.sizeSqm && (
                            <span>{roomType.sizeSqm} m²</span>
                        )}
                        {roomType.bedConfig && (
                            <span>{roomType.bedConfig}</span>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                        {roomType.amenities?.map(am => (
                            <span key={am} className="px-2.5 py-1 rounded-lg bg-slate-50 text-slate-600 text-xs font-medium border border-slate-100">
                                {am}
                            </span>
                        ))}
                    </div>

                    {availability > 0 && availability <= 3 && (
                        <div className="inline-flex items-center gap-2 text-red-600 bg-red-50 px-3 py-1.5 rounded-lg text-sm font-medium">
                            <AlertCircle size={16} />
                            Only {availability} rooms left!
                        </div>
                    )}
                </div>

                {/* Rate Plans */}
                <div className="flex-1 space-y-3">
                    {ratePlans.map((plan, idx) => (
                        <div key={idx} className="border border-slate-200 rounded-2xl p-4 hover:border-primary-300 hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h4 className="font-bold text-slate-900">{plan.name}</h4>
                                    <div className="flex flex-col gap-1 mt-1">
                                        {plan.includesBreakfast && (
                                            <span className="text-xs text-green-600 flex items-center gap-1 font-medium">
                                                <Check size={12} /> Breakfast Included
                                            </span>
                                        )}
                                        <span className={`text-xs ${plan.cancellation === 'Non-refundable' ? 'text-slate-500' : 'text-green-600'} flex items-center gap-1`}>
                                            <Check size={12} /> {plan.cancellation}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-display font-bold text-primary-600">
                                        ฿{Number(plan.pricePerNight).toLocaleString()}
                                    </div>
                                    <div className="text-xs text-slate-400">/ night</div>
                                </div>
                            </div>
                            <button
                                onClick={() => onBook(roomType, plan.name, plan.pricePerNight)}
                                className="w-full btn-primary py-2 text-sm mt-3"
                            >
                                Book Now
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}