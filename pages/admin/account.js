import AdminLayout from '@/components/AdminLayout'
import { useState, useEffect } from 'react'
import { apiFetch } from '@/lib/api'
import { User, Mail, Phone, Camera, Save, Lock, Shield, CreditCard, Bell } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AccountSettings() {
  // const { success, error, info } = useToast()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')

  // Form States
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: ''
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const data = await apiFetch('/users/me')
      setUser(data)
      setFormData({
        name: data.name || '',
        phone: data.phone || '',
        email: data.email || ''
      })
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const updated = await apiFetch('/users/me', {
        method: 'PUT',
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone
        })
      })
      setUser(updated)
      toast.success('Profile updated successfully!')
    } catch (err) {
      console.error(err)
      toast.error('Failed to update profile.')
    } finally {
      setSaving(false)
    }
  }

  // Avatar Upload Handler
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    try {
      // Adjust API URL if it differs, usually /upload
      // We need to use native fetch for FormData or adjust apiFetch to not set Content-Type
      const token = localStorage.getItem('token')
      const res = await fetch('http://localhost:3001/api/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }, // manual header
        body: formData
      })

      if (!res.ok) throw new Error('Upload failed')

      const data = await res.json()
      // Update user profile with new Avatar URL
      // Assuming 'avatar' field exists or we use a generic field. 
      // If schema doesn't have avatar, we might need to add it or skip.
      // checking schema: User has no avatar field. 
      // We will just alert the URL for now or if we added it?
      // User schema: id, email, passwordHash, name, phone, roles.
      // We'll skip saving to DB for now unless I add the column.
      console.log('Uploaded:', data.url)
      toast('Avatar uploaded (Note: DB schema update needed to persist this image)', { icon: 'ℹ️' })

    } catch (err) {
      console.error(err)
      toast.error('Upload failed')
    }
  }

  if (loading) return <AdminLayout><div className="p-8">Loading...</div></AdminLayout>

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">My Account</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8">Manage your personal information and security settings</p>

        {/* Tabs */}
        <div className="flex gap-6 border-b border-slate-200 dark:border-slate-700 mb-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-4 px-2 font-medium text-sm transition-colors relative ${activeTab === 'profile' ? 'text-emerald-500' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            <span className="flex items-center gap-2"><User size={18} /> Profile</span>
            {activeTab === 'profile' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500 rounded-t-full" />}
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`pb-4 px-2 font-medium text-sm transition-colors relative ${activeTab === 'security' ? 'text-emerald-500' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            <span className="flex items-center gap-2"><Shield size={18} /> Security</span>
            {activeTab === 'security' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500 rounded-t-full" />}
          </button>
          <button
            className="pb-4 px-2 font-medium text-sm text-slate-400 cursor-not-allowed flex items-center gap-2"
            title="Coming Soon"
          >
            <Bell size={18} /> Notifications
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left: Card (Avatar) */}
          <div className="md:col-span-1">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col items-center text-center">
              <div className="relative w-32 h-32 mb-4 group">
                <div className="w-full h-full rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden flex items-center justify-center text-slate-300 border-4 border-white dark:border-slate-800 shadow-lg">
                  {/* Placeholder Avatar */}
                  <User size={64} />
                </div>
                <label className="absolute bottom-1 right-1 p-2 bg-emerald-500 text-white rounded-full cursor-pointer hover:bg-emerald-600 shadow-lg transition-transform hover:scale-105">
                  <Camera size={16} />
                  <input type="file" className="hidden" onChange={handleAvatarChange} accept="image/*" />
                </label>
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white capitalize">{user?.name || 'Admin User'}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{user?.roles?.[0] || 'Administrator'}</p>

              <div className="w-full pt-4 border-t border-slate-100 dark:border-slate-700 flex flex-col gap-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Member Since</span>
                  <span className="font-medium text-slate-900 dark:text-white">{new Date(user?.createdAt).getFullYear()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Status</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-800">Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Form */}
          <div className="md:col-span-2">
            {activeTab === 'profile' ? (
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Personal Information</h3>
                <form onSubmit={handleUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                          type="text"
                          value={formData.name}
                          onChange={e => setFormData({ ...formData, name: e.target.value })}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:text-white transition-all"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={e => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:text-white transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Email Address</label>
                    <div className="relative opacity-75 cursor-not-allowed">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        type="email"
                        value={formData.email}
                        readOnly
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-100 dark:bg-slate-700 text-slate-500 cursor-not-allowed"
                      />
                    </div>
                    <p className="text-xs text-slate-400">Email cannot be changed securely without verification.</p>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? 'Saving...' : <><Save size={18} /> Save Changes</>}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Security Settings</h3>
                <div className="space-y-6">
                  <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-100 dark:border-slate-700">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-white dark:bg-slate-700 rounded-lg shadow-sm">
                        <Lock size={20} className="text-slate-400" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white">Change Password</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Ensure your account is using a long, random password to stay secure.</p>
                        <button className="px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors">
                          Update Password
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-100 dark:border-slate-700">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-white dark:bg-slate-700 rounded-lg shadow-sm">
                        <Shield size={20} className="text-slate-400" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white">Two-Factor Authentication</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Add an extra layer of security to your account.</p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-400 bg-slate-200 dark:bg-slate-600 px-2 py-1 rounded">Disabled</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
