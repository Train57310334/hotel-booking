import AdminLayout from '@/components/AdminLayout'
import { useState, useEffect } from 'react'
import { apiFetch } from '@/lib/api'
import { Search, Send, Clock, CheckCircle, Mail, User, Phone, Trash2, Archive, Reply } from 'lucide-react'
import toast from 'react-hot-toast'
import ConfirmationModal from '@/components/ConfirmationModal'

import { useAdmin } from '@/contexts/AdminContext'

export default function MessageCenter() {
  const { currentHotel } = useAdmin() || {}
  const [messages, setMessages] = useState([])
  const [selectedMsg, setSelectedMsg] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [replyText, setReplyText] = useState('')
  const [confirmModal, setConfirmModal] = useState({ isOpen: false })

  useEffect(() => {
    if (currentHotel) fetchMessages()
  }, [searchTerm, currentHotel])

  const fetchMessages = async () => {
    try {
      const query = new URLSearchParams()
      if (searchTerm) query.append('search', searchTerm)
      if (currentHotel?.id) query.append('hotelId', currentHotel.id)

      const data = await apiFetch(`/messages?${query.toString()}`)
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
    try {
      await apiFetch(`/messages/${selectedMsg.id}/reply`, {
        method: 'POST',
        body: JSON.stringify({ content: replyText })
      })
      toast.success(`Reply sent to ${selectedMsg.email} successfully`)
      setReplyText('')
      setMessages(prev => prev.map(m => m.id === selectedMsg.id ? { ...m, status: 'replied' } : m))
    } catch (err) {
      console.error(err)
      toast.error('Failed to send reply')
    }
  }

  const handleDeleteClick = () => {
    setConfirmModal({ isOpen: true })
  }

  const handleDelete = async () => {
    try {
      await apiFetch(`/messages/${selectedMsg.id}`, { method: 'DELETE' })
      setMessages(prev => prev.filter(m => m.id !== selectedMsg.id))
      setSelectedMsg(null)
      setConfirmModal({ isOpen: false })
      toast.success('Message deleted')
    } catch (err) {
      console.error(err)
      toast.error('Failed to delete message')
      setConfirmModal({ isOpen: false })
    }
  }

  const handleArchive = async () => {
    try {
      await apiFetch(`/messages/${selectedMsg.id}/archive`, { method: 'PUT' })
      setMessages(prev => prev.filter(m => m.id !== selectedMsg.id)) // Remove from main inbox
      setSelectedMsg(null)
      toast.success('Message archived')
    } catch (err) {
      console.error(err)
      toast.error('Failed to archive message')
    }
  }

  return (
    <AdminLayout>
      <div className="flex flex-col h-[calc(100vh-100px)]">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">Messages</h1>
            <p className="text-slate-500 dark:text-slate-400">Support Inbox</p>
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
                  placeholder="Search inbox..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-700/50 border-none focus:ring-2 focus:ring-emerald-500/20 text-slate-900 dark:text-white text-sm"
                />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <p className="p-8 text-center text-slate-400 text-sm">Loading...</p>
              ) : messages.length === 0 ? (
                <p className="p-8 text-center text-slate-400 text-sm">No messages found.</p>
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
                        {msg.status === 'unread' && <span className="ml-2 w-2 h-2 rounded-full bg-emerald-500 inline-block align-middle" />}
                      </h4>
                      <span className="text-xs text-slate-400 whitespace-nowrap">{new Date(msg.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate mb-1">{msg.subject || 'No Subject'}</p>
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
                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                      {selectedMsg.name[0]}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white">{selectedMsg.subject || 'No Subject'}</h3>
                      <p className="text-sm text-slate-500 flex items-center gap-2">
                        From: {selectedMsg.name} &lt;{selectedMsg.email}&gt;
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 text-slate-400">
                    <button onClick={handleArchive} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-amber-500" title="Archive"><Archive size={18} /></button>
                    <button onClick={handleDeleteClick} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-rose-500" title="Delete"><Trash2 size={18} /></button>
                  </div>
                </div>

                {/* Body */}
                <div className="flex-1 p-8 overflow-y-auto">
                  <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 max-w-3xl">
                    <p className="text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                      {selectedMsg.content}
                    </p>
                    <p className="mt-6 text-xs text-slate-400 border-t border-slate-100 dark:border-slate-700 pt-4 flex items-center gap-2">
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
                      placeholder="Type your reply here..."
                      className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      onKeyDown={(e) => e.key === 'Enter' && sendReply()}
                    />
                    <button
                      onClick={sendReply}
                      className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                    >
                      <Send size={18} />
                      <span>Send</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-300">
                  <Mail size={32} />
                </div>
                <p>Select a message to view details</p>
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
        message="Are you sure you want to delete this message?"
        type="danger"
        confirmText="Delete"
      />
    </AdminLayout>
  )
}
