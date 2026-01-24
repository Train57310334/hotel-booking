import AdminLayout from '@/components/AdminLayout'
import { useState, useEffect } from 'react'
import { apiFetch } from '@/lib/api'
import { Save, Globe, CreditCard, Mail, Shield, Bell, LayoutTemplate } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  // const { success, error } = useToast()
  const [settings, setSettings] = useState({})
  const [hotel, setHotel] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('general')

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const [settingsData, hotelsData] = await Promise.all([
        apiFetch('/settings'),
        apiFetch('/hotels')
      ])
      setSettings(settingsData || {})
      if (hotelsData && hotelsData.length > 0) {
        setHotel(hotelsData[0])
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleHotelChange = (key, value) => {
    setHotel(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // Save System Settings
      await apiFetch('/settings', {
        method: 'PUT',
        body: JSON.stringify(settings)
      })

      // Save Hotel Settings
      if (hotel.id) {
        await apiFetch(`/hotels/${hotel.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            name: hotel.name,
            description: hotel.description,
            address: hotel.address,
            city: hotel.city,
            country: hotel.country,
            contactEmail: hotel.contactEmail,
            contactPhone: hotel.contactPhone,
            latitude: parseFloat(hotel.latitude || 0),
            longitude: parseFloat(hotel.longitude || 0),
          })
        })
      }

      toast.success('Settings saved successfully!')
    } catch (err) {
      console.error(err)
      toast.error('Failed to save settings.')
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'contact', label: 'Contact Info', icon: Mail },
    { id: 'integrations', label: 'Integrations', icon: LayoutTemplate },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ]

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto pb-20">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">System Settings</h1>
            <p className="text-slate-500 dark:text-slate-400">Configure global application preferences</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? 'Saving...' : <><Save size={18} /> Save Changes</>}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar Tabs */}
          <div className="md:col-span-1 space-y-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === tab.id
                  ? 'bg-white dark:bg-slate-800 text-emerald-500 shadow-sm'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="md:col-span-3 space-y-6">
            {activeTab === 'general' && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm space-y-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-4 mb-6">General Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Site Name</label>
                    <input
                      type="text"
                      value={settings.siteName || ''}
                      onChange={e => handleChange('siteName', e.target.value)}
                      placeholder="BookingKub"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Currency</label>
                    <select
                      value={settings.currency || 'THB'}
                      onChange={e => handleChange('currency', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50"
                    >
                      <option value="THB">THB (฿)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'contact' && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm space-y-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-4 mb-6">Hotel Contact Information</h3>
                <p className="text-sm text-slate-500 mb-4">This information will be displayed on the Contact Us page.</p>

                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Hotel Name</label>
                    <input
                      type="text"
                      value={hotel.name || ''}
                      onChange={e => handleHotelChange('name', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Full Address</label>
                    <textarea
                      rows={3}
                      value={hotel.address || ''}
                      onChange={e => handleHotelChange('address', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">City</label>
                      <input
                        type="text"
                        value={hotel.city || ''}
                        onChange={e => handleHotelChange('city', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Country</label>
                      <input
                        type="text"
                        value={hotel.country || ''}
                        onChange={e => handleHotelChange('country', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Contact Email</label>
                      <input
                        type="email"
                        value={hotel.contactEmail || ''}
                        onChange={e => handleHotelChange('contactEmail', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Contact Phone</label>
                      <input
                        type="text"
                        value={hotel.contactPhone || ''}
                        onChange={e => handleHotelChange('contactPhone', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'integrations' && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm space-y-8">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-4 mb-6 flex items-center gap-2">
                    <CreditCard size={20} className="text-emerald-500" /> Payment Gateways
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Stripe Logic Key (Public)</label>
                      <input
                        type="text"
                        value={settings.stripeKey || ''}
                        onChange={e => handleChange('stripeKey', e.target.value)}
                        placeholder="pk_test_..."
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 font-mono text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Stripe Secret Key</label>
                      <input
                        type="password"
                        value={settings.stripeSecret || ''}
                        onChange={e => handleChange('stripeSecret', e.target.value)}
                        placeholder="sk_test_..."
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 font-mono text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm space-y-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-4 mb-6 flex items-center gap-2">
                  <Mail size={20} className="text-emerald-500" /> SMTP Configuration
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">SMTP Host</label>
                    <input
                      type="text"
                      value={settings.smtpHost || ''}
                      onChange={e => handleChange('smtpHost', e.target.value)}
                      placeholder="smtp.gmail.com"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">SMTP Port</label>
                    <input
                      type="number"
                      value={settings.smtpPort || ''}
                      onChange={e => handleChange('smtpPort', e.target.value)}
                      placeholder="587"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">SMTP Username</label>
                    <input
                      type="text"
                      value={settings.smtpUser || ''}
                      onChange={e => handleChange('smtpUser', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">SMTP Password</label>
                    <input
                      type="password"
                      value={settings.smtpPass || ''}
                      onChange={e => handleChange('smtpPass', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50"
                    />
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
