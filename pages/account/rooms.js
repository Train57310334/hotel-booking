import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react'
import Link from 'next/link'

export default function RoomManagement() {
    const rooms = [
        { id: 1, number: '69', type: 'Deluxe Suite', price: '2,500', status: 'Available', floor: '3rd' },
        { id: 2, number: '101', type: 'Standard Room', price: '1,200', status: 'Occupied', floor: '1st' },
        { id: 3, number: '205', type: 'Grand Suite', price: '4,500', status: 'Available', floor: '2nd' },
        { id: 4, number: '304', type: 'Family Room', price: '3,200', status: 'Cleaning', floor: '3rd' },
    ]

    return (
        <DashboardLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-display font-bold text-slate-900">Room Management</h1>
                </div>
                <button className="btn-primary flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm bg-[#10b981] hover:bg-[#059669] border-none shadow-none">
                    <Plus size={18} />
                    Add New Room
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                {/* Table Search */}
                <div className="p-4 border-b border-slate-100 flex items-center gap-3 w-full md:w-96">
                    <Search size={20} className="text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search rooms..."
                        className="w-full text-sm outline-none placeholder:text-slate-400 text-slate-700"
                    />
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Room Number</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Type</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Price / Night</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Floor</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {rooms.map((room) => (
                                <tr key={room.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <span className="font-bold text-slate-900">Room {room.number}</span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500">{room.type}</td>
                                    <td className="px-6 py-4 text-sm text-slate-500">฿{room.price}</td>
                                    <td className="px-6 py-4 text-sm text-slate-500">{room.floor}</td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${room.status === 'Available' ? 'bg-emerald-50 text-emerald-600' :
                                                    room.status === 'Occupied' ? 'bg-red-50 text-red-600' :
                                                        'bg-orange-50 text-orange-600'}
                      `}
                                        >
                                            {room.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link href="/account/rooms/69" className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                                                <Eye size={16} />
                                            </Link>
                                            <button className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                                                <Edit size={16} />
                                            </button>
                                            <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    )
}
