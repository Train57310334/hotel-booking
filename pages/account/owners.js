import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react'

export default function OwnerManagement() {
    const owners = [
        { id: 1, name: 'Dianne Russel', phone: '0818003345', email: 'Watt@gmail.com', role: 'Admin', status: 'Active' },
        { id: 2, name: 'Jenny Wilson', phone: '0818003345', email: 'Watt@gmail.com', role: 'Admin', status: 'Inactive' },
        { id: 3, name: 'Brooklyn Simmons', phone: '0818003345', email: 'Watt@gmail.com', role: 'Admin', status: 'Inactive' },
        { id: 4, name: 'Dianne Russell', phone: '0818003345', email: 'Watt@gmail.com', role: 'Admin', status: 'Active' },
    ]

    return (
        <DashboardLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-display font-bold text-slate-900">Owner Management</h1>
                </div>
                <button className="btn-primary flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm bg-[#10b981] hover:bg-[#059669] border-none shadow-none">
                    <Plus size={18} />
                    Add New Owner
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                {/* Table Search */}
                <div className="p-4 border-b border-slate-100 flex items-center gap-3 w-full md:w-96">
                    <Search size={20} className="text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search owners..."
                        className="w-full text-sm outline-none placeholder:text-slate-400 text-slate-700"
                    />
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Owner Name</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Mobile Number</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Email Address</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Role</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {owners.map((owner) => (
                                <tr key={owner.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-xs font-bold">
                                                {owner.name.charAt(0)}
                                            </div>
                                            <span className="text-sm font-medium text-slate-900">{owner.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500">{owner.phone}</td>
                                    <td className="px-6 py-4 text-sm text-slate-500">{owner.email}</td>
                                    <td className="px-6 py-4 text-sm text-slate-500">{owner.role}</td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${owner.status === 'Active'
                                                    ? 'bg-emerald-50 text-emerald-600'
                                                    : 'bg-red-50 text-red-600'
                                                }
                      `}
                                        >
                                            {owner.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                                                <Edit size={16} />
                                            </button>
                                            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                                                <Eye size={16} />
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
