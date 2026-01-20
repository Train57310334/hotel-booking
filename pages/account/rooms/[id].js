import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { Download, ChevronDown } from 'lucide-react'

export default function RoomDetail() {
    return (
        <DashboardLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-display font-bold text-slate-900">Room number 69</h1>
                    <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                        <span>Room</span>
                        <span className="text-slate-300">&gt;</span>
                        <span className="text-slate-900 font-medium">Room 69</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 flex items-center gap-2 hover:bg-slate-50 transition-colors shadow-sm">
                        This Month <ChevronDown size={16} className="text-slate-400" />
                    </button>
                    <button className="px-5 py-2.5 bg-[#10b981] hover:bg-[#059669] text-white rounded-xl text-sm font-medium flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:-translate-y-0.5">
                        Download <Download size={18} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Main Image */}
                <div className="lg:col-span-2 relative aspect-[16/10] rounded-3xl overflow-hidden shadow-sm group">
                    <img
                        src="https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=2000&auto=format&fit=crop"
                        alt="Room Main"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Side Grid */}
                <div className="grid grid-cols-1 gap-6">
                    <div className="relative aspect-[4/2.2] rounded-3xl overflow-hidden shadow-sm">
                        <img
                            src="https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1000&auto=format&fit=crop"
                            alt="Room Detail 1"
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        />
                    </div>
                    <div className="relative aspect-[4/2.2] rounded-3xl overflow-hidden shadow-sm">
                        <img
                            src="https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?q=80&w=1000&auto=format&fit=crop"
                            alt="Room Detail 2"
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-6 h-full">
                        <div className="relative rounded-3xl overflow-hidden shadow-sm aspect-square">
                            <img
                                src="https://images.unsplash.com/photo-1560185127-6ed189bf02f4?q=80&w=1000&auto=format&fit=crop"
                                alt="Room Detail 3"
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                            />
                        </div>
                        <div className="relative rounded-3xl overflow-hidden shadow-sm aspect-square group cursor-pointer">
                            <img
                                src="https://images.unsplash.com/photo-1591088398332-6a779161a297?q=80&w=1000&auto=format&fit=crop"
                                alt="Plus More"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-slate-900/60 group-hover:bg-slate-900/50 transition-all flex items-center justify-center backdrop-blur-[2px]">
                                <span className="text-3xl font-bold text-white">6+</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-6">
                    <div>
                        <div className="flex items-end gap-2 mb-1">
                            <h2 className="text-4xl font-bold text-emerald-600 font-display">฿2,500</h2>
                            <span className="text-slate-400 font-medium mb-1.5">/ Night</span>
                        </div>
                        <p className="text-slate-500 font-medium">Room Type: <span className="text-slate-900">Deluxe Suite</span></p>
                    </div>
                    <div className="flex gap-3">
                        <button className="px-6 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors">
                            Book Now
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <h3 className="font-bold text-slate-900 mb-3">Description</h3>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            Experience luxury in our Deluxe Suite featuring a king-size bed, city views, and a spacious living area. Perfect for business travelers or couples.
                        </p>
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 mb-3">Amenities</h3>
                        <div className="flex flex-wrap gap-2">
                            {['Free WiFi', 'King Bed', 'City View', 'Bathtub', 'Work Desk', 'Mini Bar'].map(item => (
                                <span key={item} className="px-3 py-1 bg-slate-50 text-slate-600 text-xs font-medium rounded-lg border border-slate-100">
                                    {item}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
