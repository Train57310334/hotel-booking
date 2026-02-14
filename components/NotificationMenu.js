import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { Bell, Check, Calendar, CreditCard, AlertTriangle, Info, X, Clock } from 'lucide-react'
import { apiFetch } from '@/lib/api'
import Link from 'next/link'

export default function NotificationMenu({ notifications, setNotifications, darkMode }) {

    const markAllAsRead = async () => {
        try {
            await apiFetch('/notifications/read-all', { method: 'PUT' })
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
        } catch (e) {
            console.error(e)
        }
    }

    const markAsRead = async (id) => {
        try {
            await apiFetch(`/notifications/${id}/read`, { method: 'PUT' })
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
        } catch (e) {
            console.error(e)
        }
    }

    const unreadCount = notifications.filter(n => !n.isRead).length

    const getIcon = (type, title) => {
        const lowerTitle = title.toLowerCase()
        if (type === 'success' || lowerTitle.includes('confirmed') || lowerTitle.includes('payment')) return <Check className="text-white" size={14} />
        if (lowerTitle.includes('booking')) return <Calendar className="text-white" size={14} />
        if (lowerTitle.includes('cancel')) return <X className="text-white" size={14} />
        if (type === 'warning') return <AlertTriangle className="text-white" size={14} />
        if (type === 'error') return <X className="text-white" size={14} />
        return <Info className="text-white" size={14} />
    }

    const getBgColor = (type, title) => {
        const lowerTitle = title.toLowerCase()
        if (type === 'success' || lowerTitle.includes('confirmed')) return 'bg-emerald-500'
        if (lowerTitle.includes('payment')) return 'bg-blue-500'
        if (lowerTitle.includes('cancel') || type === 'error') return 'bg-rose-500'
        if (type === 'warning') return 'bg-amber-500'
        return 'bg-slate-400'
    }

    return (
        <Menu as="div" className="relative">
            <Menu.Button className={`relative p-2 rounded-full transition-all duration-200 outline-none focus:ring-2 focus:ring-emerald-500/50 ${darkMode
                ? 'text-slate-400 hover:bg-slate-800 hover:text-white'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                }`}>
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse"></span>
                )}
            </Menu.Button>

            <Transition
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                <Menu.Items className={`absolute right-0 mt-3 w-96 origin-top-right rounded-2xl shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden ${darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-100'
                    }`}>
                    <div className={`px-4 py-3 border-b flex justify-between items-center ${darkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-50 bg-white'}`}>
                        <div className="flex items-center gap-2">
                            <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Notifications</h3>
                            {unreadCount > 0 && <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{unreadCount}</span>}
                        </div>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-xs text-emerald-500 font-bold hover:text-emerald-600 transition-colors uppercase tracking-wider"
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    <div className="max-h-[28rem] overflow-y-auto custom-scrollbar">
                        {notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                                <div className={`w-12 h-12 rounded-full mb-3 flex items-center justify-center ${darkMode ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                                    <Bell size={20} className="text-slate-400 opacity-50" />
                                </div>
                                <p className={`text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>No new notifications</p>
                                <p className="text-xs text-slate-500 mt-1">We'll notify you when something happens.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                {notifications.map((n) => (
                                    <Menu.Item key={n.id}>
                                        {({ active }) => (
                                            <div
                                                onClick={() => !n.isRead && markAsRead(n.id)}
                                                className={`flex gap-4 p-4 transition-colors cursor-pointer ${active ? (darkMode ? 'bg-slate-700/50' : 'bg-slate-50') : ''
                                                    } ${!n.isRead ? (darkMode ? 'bg-emerald-500/5' : 'bg-emerald-50/30') : ''}`}
                                            >
                                                <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${getBgColor(n.type, n.title)}`}>
                                                    {getIcon(n.type, n.title)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start gap-2 mb-1">
                                                        <p className={`text-sm font-bold truncate ${darkMode ? 'text-slate-200' : 'text-slate-800'} ${!n.isRead ? 'text-emerald-600 dark:text-emerald-400' : ''}`}>
                                                            {n.title}
                                                        </p>
                                                        {!n.isRead && <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1.5"></span>}
                                                    </div>
                                                    <p className={`text-sm leading-relaxed mb-2 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                                                        {n.message}
                                                    </p>
                                                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                                        <Clock size={12} />
                                                        <span>{n.time}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </Menu.Item>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className={`p-2 border-t text-center ${darkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-50 bg-slate-50'}`}>
                        <Link href="/admin/notifications" className={`text-xs font-bold hover:underline ${darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}>
                            View all history
                        </Link>
                    </div>
                </Menu.Items>
            </Transition>
        </Menu>
    )
}
