import AdminLayout from '@/components/AdminLayout'
import { useState, useEffect, useRef } from 'react'
import { apiFetch } from '@/lib/api'
import {
    Search, Send, Clock, Mail, Trash2, Archive,
    MessageSquare, ChevronLeft, Zap, RotateCcw, Loader2,
    User, CheckCheck, Inbox, MessageCircle
} from 'lucide-react'
import toast from 'react-hot-toast'
import ConfirmationModal from '@/components/ConfirmationModal'
import { useAdmin } from '@/contexts/AdminContext'

const STATUS_TABS = [
    { key: 'all', label: 'All', icon: Inbox },
    { key: 'unread', label: 'Unread', icon: Mail },
    { key: 'replied', label: 'Replied', icon: CheckCheck },
    { key: 'archived', label: 'Archived', icon: Archive },
]

const QUICK_REPLIES = [
    'Thank you for reaching out! We will get back to you shortly.',
    'We have received your request and are currently checking availability.',
    'Your booking has been confirmed. Please let us know if you need anything else.',
    'We appreciate your feedback and will work on improving our service.',
    'Our team is looking into this for you. Expect a response within 24 hours.',
]

const STATUS_BADGE = {
    unread: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    read: 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400',
    replied: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    archived: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
}

function timeAgo(dateStr) {
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000)
    if (diff < 60) return 'just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return new Date(dateStr).toLocaleDateString()
}

function Avatar({ name, size = 'md', className = '' }) {
    const s = size === 'sm' ? 'w-7 h-7 text-xs' : 'w-10 h-10 text-sm'
    const colors = ['bg-blue-500', 'bg-purple-500', 'bg-teal-500', 'bg-pink-500', 'bg-amber-500', 'bg-cyan-500']
    const color = colors[(name?.charCodeAt(0) || 0) % colors.length]
    return (
        <div className={`${s} ${color} rounded-full flex items-center justify-center font-bold text-white shrink-0 ${className}`}>
            {name?.[0]?.toUpperCase() || '?'}
        </div>
    )
}

export default function MessageCenter() {
    const { currentHotel } = useAdmin() || {}
    const [messages, setMessages] = useState([])
    const [selectedMsg, setSelectedMsg] = useState(null)
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [activeTab, setActiveTab] = useState('all')
    const [replyText, setReplyText] = useState('')
    const [sending, setSending] = useState(false)
    const [showTemplates, setShowTemplates] = useState(false)
    const [confirmModal, setConfirmModal] = useState({ isOpen: false })
    const threadRef = useRef(null)

    useEffect(() => {
        if (currentHotel) fetchMessages()
    }, [searchTerm, currentHotel?.id, activeTab])

    useEffect(() => {
        // Scroll to bottom of thread when a message is selected or replies change
        if (threadRef.current) {
            threadRef.current.scrollTop = threadRef.current.scrollHeight
        }
    }, [selectedMsg])

    const fetchMessages = async () => {
        setLoading(true)
        try {
            const query = new URLSearchParams()
            if (searchTerm) query.append('search', searchTerm)
            if (currentHotel?.id) query.append('hotelId', currentHotel.id)
            if (activeTab !== 'all') query.append('status', activeTab)

            const data = await apiFetch(`/messages?${query.toString()}`)
            setMessages(data || [])
        } catch (error) {
            console.error(error)
            toast.error('Failed to load messages')
        } finally {
            setLoading(false)
        }
    }

    const selectMessage = async (msg) => {
        setSelectedMsg(msg)
        setShowTemplates(false)
        if (msg.status === 'unread') {
            try {
                await apiFetch(`/messages/${msg.id}/read`, { method: 'PUT' })
                setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, status: 'read' } : m))
                setSelectedMsg(prev => prev?.id === msg.id ? { ...prev, status: 'read' } : prev)
            } catch (e) { console.error(e) }
        }
    }

    const sendReply = async () => {
        if (!replyText.trim() || !selectedMsg) return
        setSending(true)
        try {
            const newReply = await apiFetch(`/messages/${selectedMsg.id}/reply`, {
                method: 'POST',
                body: JSON.stringify({ content: replyText, staffName: 'Hotel Staff' })
            })
            toast.success('Reply sent!')
            setReplyText('')
            setShowTemplates(false)

            // Update message in list + thread
            const updatedMsg = {
                ...selectedMsg,
                status: 'replied',
                replies: [...(selectedMsg.replies || []), newReply]
            }
            setSelectedMsg(updatedMsg)
            setMessages(prev => prev.map(m => m.id === selectedMsg.id
                ? { ...m, status: 'replied', replies: updatedMsg.replies }
                : m
            ))

            // Scroll after adding
            setTimeout(() => {
                if (threadRef.current) threadRef.current.scrollTop = threadRef.current.scrollHeight
            }, 100)
        } catch (err) {
            console.error(err)
            toast.error('Failed to send reply')
        } finally {
            setSending(false)
        }
    }

    const handleDelete = async () => {
        try {
            await apiFetch(`/messages/${selectedMsg.id}`, { method: 'DELETE' })
            setMessages(prev => prev.filter(m => m.id !== selectedMsg.id))
            setSelectedMsg(null)
            setConfirmModal({ isOpen: false })
            toast.success('Message deleted')
        } catch (err) {
            toast.error('Failed to delete message')
            setConfirmModal({ isOpen: false })
        }
    }

    const handleArchive = async () => {
        try {
            await apiFetch(`/messages/${selectedMsg.id}/archive`, { method: 'PUT' })
            setMessages(prev => prev.filter(m => m.id !== selectedMsg.id))
            setSelectedMsg(null)
            toast.success('Message archived')
        } catch (err) {
            toast.error('Failed to archive message')
        }
    }

    const unreadCount = messages.filter(m => m.status === 'unread').length

    return (
        <AdminLayout>
            <div className="flex flex-col h-[calc(100vh-100px)]">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                            <MessageSquare className="text-blue-500" size={24} />
                            Guest Messages
                            {unreadCount > 0 && (
                                <span className="px-2 py-0.5 text-xs font-bold bg-blue-500 text-white rounded-full">
                                    {unreadCount} new
                                </span>
                            )}
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage and reply to guest inquiries</p>
                    </div>
                    <button onClick={fetchMessages} className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors">
                        <RotateCcw size={18} />
                    </button>
                </div>

                <div className="flex flex-1 gap-0 overflow-hidden rounded-3xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm">

                    {/* ── Sidebar ─────────────────────────────── */}
                    <div className={`w-full md:w-[340px] flex flex-col border-r border-slate-100 dark:border-slate-700 shrink-0 ${selectedMsg ? 'hidden md:flex' : 'flex'}`}>

                        {/* Search */}
                        <div className="p-3 border-b border-slate-100 dark:border-slate-700">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search messages..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                                />
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-slate-100 dark:border-slate-700 px-2 pt-2">
                            {STATUS_TABS.map(tab => (
                                <button
                                    key={tab.key}
                                    onClick={() => { setActiveTab(tab.key); setSelectedMsg(null) }}
                                    className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors ${
                                        activeTab === tab.key
                                            ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400'
                                            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                                    }`}
                                >
                                    <tab.icon size={13} />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Message List */}
                        <div className="flex-1 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-700/50">
                            {loading ? (
                                <div className="flex justify-center py-16">
                                    <Loader2 className="animate-spin text-blue-400" size={24} />
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="py-16 text-center text-slate-400">
                                    <MessageCircle size={40} className="mx-auto mb-3 opacity-30" />
                                    <p className="text-sm">No messages in this folder</p>
                                </div>
                            ) : (
                                messages.map(msg => (
                                    <div
                                        key={msg.id}
                                        onClick={() => selectMessage(msg)}
                                        className={`p-4 cursor-pointer transition-all hover:bg-blue-50/50 dark:hover:bg-slate-700/40 ${
                                            selectedMsg?.id === msg.id ? 'bg-blue-50 dark:bg-slate-700/60 border-l-4 border-blue-500' : 'border-l-4 border-transparent'
                                        }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <Avatar name={msg.name} />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-center mb-0.5">
                                                    <h4 className={`text-sm truncate ${msg.status === 'unread' ? 'font-bold text-slate-900 dark:text-white' : 'font-medium text-slate-600 dark:text-slate-300'}`}>
                                                        {msg.name}
                                                        {msg.status === 'unread' && <span className="ml-2 inline-block w-2 h-2 rounded-full bg-blue-500 align-middle" />}
                                                    </h4>
                                                    <span className="text-xs text-slate-400 shrink-0 ml-2">{timeAgo(msg.createdAt)}</span>
                                                </div>
                                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate mb-1">{msg.subject || 'No Subject'}</p>
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className="text-xs text-slate-400 truncate flex-1">{msg.content}</p>
                                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 capitalize ${STATUS_BADGE[msg.status] || STATUS_BADGE.read}`}>
                                                        {msg.status}
                                                    </span>
                                                </div>
                                                {msg.replies?.length > 0 && (
                                                    <p className="text-xs text-blue-500 mt-1 flex items-center gap-1">
                                                        <CheckCheck size={11} /> {msg.replies.length} {msg.replies.length === 1 ? 'reply' : 'replies'}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* ── Chat Thread Panel ─────────────────────── */}
                    <div className={`flex-1 flex flex-col min-w-0 ${!selectedMsg ? 'hidden md:flex' : 'flex'}`}>
                        {selectedMsg ? (
                            <>
                                {/* Thread Header */}
                                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <button
                                            onClick={() => setSelectedMsg(null)}
                                            className="md:hidden p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                                        >
                                            <ChevronLeft size={20} />
                                        </button>
                                        <Avatar name={selectedMsg.name} />
                                        <div className="min-w-0">
                                            <h3 className="font-bold text-slate-900 dark:text-white text-sm truncate">
                                                {selectedMsg.subject || 'No Subject'}
                                            </h3>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                From: <span className="font-medium">{selectedMsg.name}</span> · {selectedMsg.email}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={handleArchive}
                                            className="p-2 rounded-xl text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                                            title="Archive"
                                        >
                                            <Archive size={17} />
                                        </button>
                                        <button
                                            onClick={() => setConfirmModal({ isOpen: true })}
                                            className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 size={17} />
                                        </button>
                                    </div>
                                </div>

                                {/* Chat bubbles thread */}
                                <div ref={threadRef} className="flex-1 overflow-y-auto p-6 space-y-5 bg-slate-50/50 dark:bg-slate-900/20">

                                    {/* Guest message bubble */}
                                    <div className="flex items-end gap-3">
                                        <Avatar name={selectedMsg.name} size="sm" />
                                        <div className="max-w-[75%]">
                                            <p className="text-xs text-slate-400 mb-1 font-medium">{selectedMsg.name} · {timeAgo(selectedMsg.createdAt)}</p>
                                            <div className="bg-white dark:bg-slate-700 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm border border-slate-100 dark:border-slate-600 text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                                                {selectedMsg.content}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Staff reply bubbles */}
                                    {(selectedMsg.replies || []).map(reply => (
                                        <div key={reply.id} className="flex items-end gap-3 flex-row-reverse">
                                            <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                                                <User size={14} className="text-white" />
                                            </div>
                                            <div className="max-w-[75%]">
                                                <p className="text-xs text-slate-400 mb-1 text-right font-medium">{reply.staffName} · {timeAgo(reply.createdAt)}</p>
                                                <div className="bg-blue-600 rounded-2xl rounded-br-none px-4 py-3 text-sm text-white whitespace-pre-wrap leading-relaxed shadow-sm">
                                                    {reply.content}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Quick Templates */}
                                {showTemplates && (
                                    <div className="px-4 pb-2 flex gap-2 flex-wrap bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 pt-3">
                                        {QUICK_REPLIES.map((t, i) => (
                                            <button
                                                key={i}
                                                onClick={() => { setReplyText(t); setShowTemplates(false) }}
                                                className="text-xs px-3 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full transition-colors font-medium line-clamp-1 max-w-xs"
                                            >
                                                {t.substring(0, 55)}…
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Reply Box */}
                                <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700">
                                    <div className="flex gap-3 items-end">
                                        <div className="flex-1 relative">
                                            <textarea
                                                rows={2}
                                                value={replyText}
                                                onChange={e => setReplyText(e.target.value)}
                                                placeholder="Type a reply... (press Ctrl+Enter to send)"
                                                onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) sendReply() }}
                                                className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none dark:text-white"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <button
                                                onClick={() => setShowTemplates(!showTemplates)}
                                                className={`px-3 py-3 rounded-xl transition-colors border ${showTemplates ? 'bg-blue-50 border-blue-200 text-blue-600' : 'border-slate-200 dark:border-slate-600 text-slate-400 hover:text-blue-500 hover:border-blue-300'}`}
                                                title="Quick reply templates"
                                            >
                                                <Zap size={17} />
                                            </button>
                                            <button
                                                onClick={sendReply}
                                                disabled={sending || !replyText.trim()}
                                                className="px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-bold flex items-center gap-2 shadow-sm transition-colors"
                                            >
                                                {sending ? <Loader2 size={17} className="animate-spin" /> : <Send size={17} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-4">
                                <div className="w-20 h-20 rounded-3xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                                    <MessageSquare size={36} className="text-slate-300 dark:text-slate-500" />
                                </div>
                                <div className="text-center">
                                    <p className="font-semibold text-slate-600 dark:text-slate-300 mb-1">Select a conversation</p>
                                    <p className="text-sm text-slate-400">Choose a message from the left to view the thread</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false })}
                onConfirm={handleDelete}
                title="Delete Message"
                message="This will permanently delete the message thread and all replies. This action cannot be undone."
                type="danger"
                confirmText="Delete Thread"
            />
        </AdminLayout>
    )
}
