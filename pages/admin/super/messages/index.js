import AdminLayout from '@/components/AdminLayout'
import { useState, useEffect } from 'react'
import { apiFetch } from '@/lib/api'
import { Search, Send, Clock, CheckCircle, Mail, User, Phone, Trash2, Archive, Reply } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SuperAdminMessages() {
    const [messages, setMessages] = useState([])
    const [selectedMsg, setSelectedMsg] = useState(null)
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [replyText, setReplyText] = useState('')

    useEffect(() => {
        fetchMessages()
    }, [searchTerm])

    const fetchMessages = async () => {
        try {
            const query = searchTerm ? `?search=${searchTerm}` : ''
            const data = await apiFetch(`/messages${query}`)
            setMessages(data)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const selectMessage = async (msg) => {
        setSelectedMsg(msg)
        if (msg.status === 'unread') {
            try {
                await apiFetch(`/messages/${msg.id}/read`, { method: 'PUT' })
                setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, status: 'read' } : m))
            } catch (e) {
                console.error(e)
            }
        }
    }

    const sendReply = async () => {
        if (!replyText.trim()) return
        toast.success(`Reply recorded for ${selectedMsg.email}`)
        try {
            await apiFetch(`/messages/${selectedMsg.id}/reply`, {
                method: 'POST',
                body: JSON.stringify({ content: replyText })
            })
            setMessages(prev => prev.map(m => m.id === selectedMsg.id ? { ...m, status: 'replied' } : m))
        } catch (e) {
            toast.error('Failed to send reply')
            console.error(e)
        }
        setReplyText('')
    }

    const archiveMessage = async (e, msgId) => {
        e.stopPropagation();
        try {
            await apiFetch(`/messages/${msgId}/archive`, { method: 'PUT' })
            setMessages(prev => prev.filter(m => m.id !== msgId))
            if (selectedMsg?.id === msgId) setSelectedMsg(null)
            toast.success('Message archived')
        } catch (error) {
            toast.error('Failed to archive message')
        }
    }

    return (
        <AdminLayout>
            <div className="flex flex-col h-[calc(100vh-100px)]">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">Platform Messages</h1>
                        <p className="text-slate-500 dark:text-slate-400">Manage all Contact Support inquiries</p>
                    </div>
                </div>

                <div className="flex flex-1 gap-6 overflow-hidden rounded-3xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm relative">

                    {/* Sidebar: List */}
                    <div className={`w-full md:w-1/3 flex flex-col border-r border-slate-100 dark:border-slate-700 ${selectedMsg ? 'hidden md:flex' : 'flex'}`}>
                        {/* Search */}
                        <div className="p-4 border-b border-slate-100 dark:border-slate-700">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search by name, email, or subject..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-700/50 border-none focus:ring-2 focus:ring-primary-500/20 text-slate-900 dark:text-white text-sm"
                                />
                            </div>
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto">
                            {loading ? (
                                <p className="p-8 text-center text-slate-400 text-sm">Loading...</p>
                            ) : messages.length === 0 ? (
                                <p className="p-8 text-center text-slate-400 text-sm">No inquiries found.</p>
                            ) : (
                                messages.map(msg => (
                                    <div
                                        key={msg.id}
                                        onClick={() => selectMessage(msg)}
                                        className={`p-4 border-b border-slate-50 dark:border-slate-700 cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50 ${selectedMsg?.id === msg.id ? 'bg-slate-50 dark:bg-slate-700/50' : ''}`}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className={`font-bold text-sm ${msg.status === 'unread' ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                                                {msg.name}
                                                {msg.status === 'unread' && <span className="ml-2 w-2 h-2 rounded-full bg-primary-500 inline-block align-middle" />}
                                            </h4>
                                            <span className="text-xs text-slate-400 whitespace-nowrap">{new Date(msg.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate mb-1">
                                            {msg.subject || 'General Inquiry'}
                                            {msg.status === 'replied' && <span className="ml-2 text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full uppercase font-bold tracking-wider">Replied</span>}
                                        </p>
                                        <p className="text-xs text-slate-400 truncate">{msg.content}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Main: Content */}
                    <div className={`flex-1 flex flex-col bg-slate-50/30 dark:bg-slate-900/10 ${!selectedMsg ? 'hidden md:flex' : 'flex'}`}>
                        {selectedMsg ? (
                            <>
                                {/* Header */}
                                <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <button onClick={() => setSelectedMsg(null)} className="md:hidden text-slate-400 hover:text-slate-600">
                                            ← Back
                                        </button>
                                        <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold uppercase">
                                            {selectedMsg.name[0]}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                {selectedMsg.subject || 'General Inquiry'}
                                            </h3>
                                            <p className="text-sm text-slate-500 flex items-center gap-2">
                                                <Mail size={14} className="text-slate-400" />
                                                {selectedMsg.email}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 text-slate-400">
                                        <button
                                            onClick={(e) => archiveMessage(e, selectedMsg.id)}
                                            title="Archive Inquiry"
                                            className="p-2 hover:bg-red-50 hover:text-red-500 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                        >
                                            <Archive size={18} />
                                        </button>
                                    </div>
                                </div>

                                {/* Body */}
                                <div className="flex-1 p-8 overflow-y-auto">
                                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 max-w-3xl">
                                        <div className="mb-4 flex items-center gap-2 text-sm text-slate-500 pb-4 border-b border-slate-100 dark:border-slate-700">
                                            <User size={16} /> <span className="font-medium text-slate-700 dark:text-slate-300">{selectedMsg.name}</span> wrote:
                                        </div>
                                        <p className="text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed text-[15px]">
                                            {selectedMsg.content}
                                        </p>
                                        <p className="mt-8 text-xs text-slate-400 flex items-center gap-2">
                                            <Clock size={12} /> Received on {new Date(selectedMsg.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                {/* Reply */}
                                <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700">
                                    <div className="max-w-3xl mx-auto flex gap-4">
                                        <input
                                            type="text"
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                            placeholder="Type your reply to send via email..."
                                            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-900 dark:text-white"
                                            onKeyDown={(e) => e.key === 'Enter' && sendReply()}
                                        />
                                        <button
                                            onClick={sendReply}
                                            className="px-6 py-3 bg-gradient-to-r from-primary-600 to-indigo-600 text-white rounded-xl font-bold hover:from-primary-500 hover:to-indigo-500 flex items-center gap-2 shadow-lg shadow-primary-500/20 transition-all transform hover:-translate-y-0.5"
                                        >
                                            <Reply size={18} />
                                            <span>Reply via Email</span>
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-300">
                                    <Mail size={32} />
                                </div>
                                <p>Select an inquiry to view details</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}
