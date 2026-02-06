import AdminLayout from '@/components/AdminLayout'
import { useState, useEffect } from 'react'
import { apiFetch } from '@/lib/api'
import { User, Mail, Phone, Camera, Save, Lock, Shield, CreditCard, Bell } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'

export default function AccountSettings() {
  const { checkUser } = useAuth()
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

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  // ... (fetchProfile)

  const handlePasswordUpdate = async (e) => {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error('Passwords do not match')
    }

    setSaving(true)
    try {
      await apiFetch('/users/me/change-password', {
        method: 'PUT',
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      })
      toast.success('Password updated successfully')
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      toast.error(err.message || 'Failed to update password')
    } finally {
      setSaving(false)
    }
  }

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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001/api'}/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }, // manual header
        body: formData
      })

      if (!res.ok) throw new Error('Upload failed')

      const data = await res.json()

      // Update user profile with new Avatar URL
      await apiFetch('/users/me', {
        method: 'PUT',
        body: JSON.stringify({ avatarUrl: data.url })
      })

      setUser(prev => ({ ...prev, avatarUrl: data.url }))

      // Refresh global context so header updates
      await checkUser()

      toast.success('Avatar updated successfully')

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
            onClick={() => setActiveTab('notifications')}
            className={`pb-4 px-2 font-medium text-sm transition-colors relative ${activeTab === 'notifications' ? 'text-emerald-500' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            <span className="flex items-center gap-2"><Bell size={18} /> Notifications</span>
            {activeTab === 'notifications' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500 rounded-t-full" />}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left: Card (Avatar) */}
          <div className="md:col-span-1">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col items-center text-center">
              <div className="relative w-32 h-32 mb-4 group">
                <div className="w-full h-full rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden flex items-center justify-center text-slate-300 border-4 border-white dark:border-slate-800 shadow-lg">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User size={64} />
                  )}
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
            ) : activeTab === 'security' ? (
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Security Settings</h3>
                <div className="space-y-6">
                  <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-100 dark:border-slate-700">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-white dark:bg-slate-700 rounded-lg shadow-sm">
                        <Lock size={20} className="text-slate-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-900 dark:text-white mb-4">Change Password</h4>

                        <form onSubmit={handlePasswordUpdate} className="space-y-4">
                          <input
                            type="password"
                            placeholder="Current Password"
                            required
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm"
                            value={passwordData.currentPassword}
                            onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                          />
                          <div className="grid grid-cols-2 gap-4">
                            <input
                              type="password"
                              placeholder="New Password"
                              required
                              className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm"
                              value={passwordData.newPassword}
                              onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                            />
                            <input
                              type="password"
                              placeholder="Confirm Password"
                              required
                              className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm"
                              value={passwordData.confirmPassword}
                              onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                            />
                          </div>

                          <div className="flex justify-end">
                            <button
                              type="submit"
                              disabled={saving}
                              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-bold transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                            >
                              {saving ? 'Updating...' : 'Update Password'}
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>

                  {/* 2FA Section - Updated UI */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-100 dark:border-slate-700">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-white dark:bg-slate-700 rounded-lg shadow-sm">
                        <Shield size={20} className="text-slate-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-bold text-slate-900 dark:text-white">Two-Factor Authentication</h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Add an extra layer of security to your account.</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" disabled />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                          </label>
                        </div>
                        <p className="text-xs text-orange-500 mt-2">Requires SMTP/SMS gateway configuration (Contact Admin)</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : activeTab === 'notifications' ? (
              // Notification Tab Content
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Notification Preferences</h3>
                <div className="space-y-6">
                  {/* Email Notifications */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-100 dark:border-slate-700">
                    <h4 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <Mail size={18} /> Email Notifications
                    </h4>
                    <div className="space-y-3">
                      {['New Booking Alerts', 'Booking Cancellations', 'Daily Performance Report', 'System Announcements'].map((item, idx) => (
                        <label key={idx} className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-600 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item}</span>
                          <div className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" defaultChecked={idx < 2} className="sr-only peer" />
                            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button className="px-6 py-2 bg-emerald-500 text-white font-bold rounded-lg shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all opacity-50 cursor-not-allowed" title="Preferences saving not yet implemented">
                      Save Preferences
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
