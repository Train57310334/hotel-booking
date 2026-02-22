import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/AdminLayout';
import { useAdmin } from '@/contexts/AdminContext';
import { useAuth } from '@/contexts/AuthContext';
import { apiFetch } from '@/lib/api';
import { Building2, Image as ImageIcon, Globe, Save, Upload, X, CreditCard, Mail, Bell, LayoutTemplate } from 'lucide-react';
import toast from 'react-hot-toast';
import { InfoTooltip } from '@/components/Tooltip';

export default function HotelSettings() {
    const { user, checkUser } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('general');
    const [hotel, setHotel] = useState(null);
    const [systemSettings, setSystemSettings] = useState({});
    const [errors, setErrors] = useState({});

    // Form States
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        address: '',
        city: '',
        country: '',
        contactEmail: '',
        contactPhone: '',
        heroTitle: '',
        heroDescription: '',
        logoUrl: '',
        imageUrl: '',
        images: [],
        // Payment Config
        promptPayId: '',
        bankName: '',
        bankAccountName: '',
        bankAccountNumber: ''
    });

    const isPlatformAdmin = user?.roles?.includes('platform_admin') || user?.roles?.includes('owner') || user?.roles?.includes('admin');
    const { searchQuery, setSearchQuery, currentHotel, openUpgradeModal } = useAdmin() || {};

    useEffect(() => {
        if (currentHotel) {
            fetchHotel(currentHotel.id);
        } else if (user && !loading && !currentHotel) {
            if (!isPlatformAdmin && (!user.roleAssignments || user.roleAssignments.length === 0)) {
                setLoading(false);
            }
        }
    }, [user, currentHotel]);

    const fetchHotel = async (id) => {
        try {
            const hotelData = await apiFetch(`/hotels/${id}`);

            setHotel(hotelData);

            setFormData({
                name: hotelData.name || '',
                description: hotelData.description || '',
                address: hotelData.address || '',
                city: hotelData.city || '',
                country: hotelData.country || '',
                contactEmail: hotelData.contactEmail || '',
                contactPhone: hotelData.contactPhone || '',
                heroTitle: hotelData.heroTitle || '',
                heroDescription: hotelData.heroDescription || '',
                logoUrl: hotelData.logoUrl || '',
                imageUrl: hotelData.imageUrl || '',
                images: hotelData.images || [],
                // Payment Config (Hotel Level)
                promptPayId: hotelData.promptPayId || '',
                bankName: hotelData.bankName || '',
                bankAccountName: hotelData.bankAccountName || '',
                bankAccountNumber: hotelData.bankAccountNumber || ''
            });



        } catch (error) {
            console.error(error);
            toast.error('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };



    const handleUpload = async (e, field) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadFormData = new FormData();
        uploadFormData.append('file', file);

        const toastId = toast.loading('Uploading...');

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001/api'}/upload`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: uploadFormData
            });

            if (!res.ok) throw new Error('Upload failed');
            const data = await res.json();

            if (field === 'images') {
                setFormData(prev => ({ ...prev, images: [...prev.images, data.url] }));
            } else {
                setFormData(prev => ({ ...prev, [field]: data.url }));
            }
            toast.success('Uploaded successfully', { id: toastId });
        } catch (error) {
            console.error(error);
            toast.error('Upload failed', { id: toastId });
        }
    };

    const handleRemoveImage = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const validate = () => {
        const newErrors = {};
        if (formData.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
            newErrors.contactEmail = 'Invalid email format';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) {
            const newErrors = {};
            if (formData.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) newErrors.contactEmail = 'Invalid email';
            if (newErrors.contactEmail) setActiveTab('general');
            toast.error('Please fix validation errors');
            return;
        }

        setSaving(true);
        if (!hotel) return;

        try {
            await apiFetch(`/hotels/${hotel.id}`, {
                method: 'PUT',
                body: JSON.stringify(formData)
            });

            toast.success('Settings saved successfully!');
            checkUser();
        } catch (error) {
            console.error(error);
            toast.error('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <AdminLayout>Loading...</AdminLayout>;
    if (!hotel) return <AdminLayout><div className="p-8 text-center text-slate-500">No Hotel Assigned</div></AdminLayout>;

    const tabs = [
        { id: 'general', label: 'General Info', icon: Building2 },
        { id: 'branding', label: 'Branding', icon: ImageIcon },
        { id: 'web', label: 'Website Content', icon: Globe },
        { id: 'payment', label: 'Bank Accounts', icon: CreditCard }
    ];

    return (
        <AdminLayout>
            <div className="max-w-5xl mx-auto pb-20">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">Hotel Settings</h1>
                        <p className="text-slate-500 dark:text-slate-400">Manage your property details and branding</p>
                    </div>
                    <button
                        onClick={handleSubmit}
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
                        {/* GENERAL TAB */}
                        {activeTab === 'general' && (
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm space-y-6">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-4 mb-6">General Information</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="col-span-2">
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Hotel Name</label>
                                        <input
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Contact Email</label>
                                        <input
                                            name="contactEmail"
                                            value={formData.contactEmail}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-2.5 rounded-xl border ${errors.contactEmail ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'} bg-slate-50 dark:bg-slate-700/50`}
                                        />
                                        {errors.contactEmail && <p className="text-red-500 text-xs mt-1">{errors.contactEmail}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Contact Phone</label>
                                        <input
                                            name="contactPhone"
                                            value={formData.contactPhone}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Address</label>
                                        <textarea
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            rows={3}
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">City</label>
                                        <input
                                            name="city"
                                            value={formData.city}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Country</label>
                                        <input
                                            name="country"
                                            value={formData.country}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* BRANDING TAB */}
                        {activeTab === 'branding' && (
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm space-y-8">
                                {/* Logo Upload */}
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Hotel Logo</h3>
                                    <div className="flex items-center gap-6">
                                        <div className="w-32 h-32 rounded-xl bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center overflow-hidden relative group">
                                            {formData.logoUrl ? (
                                                <img src={formData.logoUrl} className="w-full h-full object-contain" />
                                            ) : (
                                                <span className="text-slate-400 text-xs">No Logo</span>
                                            )}
                                            <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                                <Upload className="text-white" size={24} />
                                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleUpload(e, 'logoUrl')} />
                                            </label>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Upload your hotel logo. Recommended size: 512x512px. Transparent PNG preferred.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-slate-100 dark:border-slate-700 my-6" />

                                {/* Main Hero Image */}
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Main Cover Image</h3>
                                    <div className="w-full max-w-2xl h-64 rounded-xl bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center overflow-hidden relative group">
                                        {formData.imageUrl ? (
                                            <img src={formData.imageUrl} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-slate-400">No Cover Image</span>
                                        )}
                                        <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                            <div className="text-center text-white">
                                                <Upload className="mx-auto mb-2" size={32} />
                                                <span className="text-sm font-bold">Change Cover</span>
                                            </div>
                                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleUpload(e, 'imageUrl')} />
                                        </label>
                                    </div>
                                </div>

                                <div className="border-t border-slate-100 dark:border-slate-700 my-6" />

                                {/* Gallery Slider */}
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Gallery / Slider Images</h3>
                                        <label className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg text-sm font-bold cursor-pointer flex items-center gap-2 transition-colors">
                                            <Upload size={16} /> Add Image
                                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleUpload(e, 'images')} />
                                        </label>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {formData.images.map((img, idx) => (
                                            <div key={idx} className="aspect-video bg-slate-100 rounded-lg overflow-hidden relative group">
                                                <img src={img} className="w-full h-full object-cover" />
                                                <button
                                                    onClick={() => handleRemoveImage(idx)}
                                                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}
                                        {formData.images.length === 0 && (
                                            <div className="col-span-full py-12 text-center text-slate-400 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-600">
                                                No images uploaded yet.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* WEB CONTENT TAB */}
                        {activeTab === 'web' && (
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm space-y-6">
                                {/* Public URL Section */}
                                <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl border border-emerald-100 dark:border-emerald-500/20">
                                    <label className="block text-sm font-bold text-emerald-800 dark:text-emerald-400 mb-2">Public Website URL</label>
                                    <div className="flex gap-2">
                                        <input
                                            readOnly
                                            value={typeof window !== 'undefined' ? `${window.location.origin}/?hotelId=${hotel?.id}` : ''}
                                            className="flex-1 px-4 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-500/30 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 font-mono text-sm"
                                            onClick={(e) => e.target.select()}
                                        />
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(`${window.location.origin}/?hotelId=${hotel?.id}`);
                                                toast.success('Copied to clipboard');
                                            }}
                                            className="px-4 py-2 bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-500/20 transition-colors"
                                        >
                                            Copy
                                        </button>
                                        <a
                                            href={`/?hotelId=${hotel?.id}`}
                                            target="_blank"
                                            className="px-4 py-2 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-colors flex items-center gap-2"
                                        >
                                            <Globe size={18} /> View Live
                                        </a>
                                    </div>
                                    <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80 mt-2">
                                        Share this link with your customers to let them book directly.
                                    </p>
                                </div>
                                <div className="border-t border-slate-100 dark:border-slate-700 my-2" />
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Headline (Hero Title)</label>
                                    <input
                                        name="heroTitle"
                                        value={formData.heroTitle}
                                        onChange={handleChange}
                                        placeholder="Welcome to Paradise"
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Sub-headline / Hero Description</label>
                                    <textarea
                                        name="heroDescription"
                                        value={formData.heroDescription}
                                        onChange={handleChange}
                                        rows={3}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50"
                                    />
                                    <p className="text-xs text-slate-400 mt-1">Accepts Markdown or Plain text.</p>
                                </div>
                                <div className="border-t border-slate-100 dark:border-slate-700 my-6" />
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">About Hotel (Full Description)</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows={6}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50"
                                    />
                                </div>
                            </div>
                        )}

                        {/* PAYMENT SETTINGS TAB */}
                        {activeTab === 'payment' && (
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm space-y-8">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">PromptPay Configuration</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="col-span-2">
                                            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                                PromptPay ID (Phone/TaxID)
                                                <InfoTooltip content="Enter your 10-digit mobile number or 13-digit Tax ID for PromptPay QR generation." />
                                            </label>
                                            <input
                                                name="promptPayId"
                                                value={formData.promptPayId}
                                                onChange={handleChange}
                                                placeholder="012-345-6789"
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50"
                                            />
                                            <p className="text-xs text-slate-500 mt-1">This will be displayed on the QR Code payment page.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-slate-100 dark:border-slate-700 my-6" />

                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Bank Transfer Configuration</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Bank Name</label>
                                            <input
                                                name="bankName"
                                                value={formData.bankName}
                                                onChange={handleChange}
                                                placeholder="e.g. Bangkok Bank"
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Account Number</label>
                                            <input
                                                name="bankAccountNumber"
                                                value={formData.bankAccountNumber}
                                                onChange={handleChange}
                                                placeholder="e.g. 123-4-56789-0"
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                                Account Name
                                                <InfoTooltip content="The name of the bank account holder (e.g. Your Company Name)." />
                                            </label>
                                            <input
                                                name="bankAccountName"
                                                value={formData.bankAccountName}
                                                onChange={handleChange}
                                                placeholder="e.g. BookingKub Co., Ltd."
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                        )}

                    </div>
                </div>
            </div>
        </AdminLayout >
    );
}
