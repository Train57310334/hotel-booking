import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { apiFetch } from '@/lib/api';
import { Building2, Image as ImageIcon, Globe, Save, Upload, X, CreditCard } from 'lucide-react';

export default function HotelSettings() {
    const { user, checkUser } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('general');
    const [hotel, setHotel] = useState(null);

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
        images: []
    });

    useEffect(() => {
        if (user && user.roleAssignments && user.roleAssignments.length > 0) {
            const hotelId = user.roleAssignments[0].hotelId;
            fetchHotel(hotelId);
        } else if (user) {
            setLoading(false); // No hotel assigned
        }
    }, [user]);

    const fetchHotel = async (id) => {
        try {
            const data = await apiFetch(`/hotels/${id}`);
            setHotel(data);
            setFormData({
                name: data.name || '',
                description: data.description || '',
                address: data.address || '',
                city: data.city || '',
                country: data.country || '',
                contactEmail: data.contactEmail || '',
                contactPhone: data.contactPhone || '',
                heroTitle: data.heroTitle || '',
                heroDescription: data.heroDescription || '',
                logoUrl: data.logoUrl || '',
                imageUrl: data.imageUrl || '',
                images: data.images || [],
                // Payment Config
                promptPayId: data.promptPayId || '',
                bankName: data.bankName || '',
                bankAccountName: data.bankAccountName || '',
                bankAccountNumber: data.bankAccountNumber || ''
            });
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleUpload = async (e, field) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('file', file);

        try {
            // Upload to Backend
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001/api'}/upload`, {
                method: 'POST',
                body: uploadData,
                // Do NOT set Content-Type header, let browser set boundary
            });

            if (!res.ok) throw new Error('Upload failed');

            const data = await res.json();

            if (field === 'images') {
                setFormData(prev => ({ ...prev, images: [...prev.images, data.url] }));
            } else {
                setFormData(prev => ({ ...prev, [field]: data.url }));
            }
        } catch (error) {
            console.error('Upload Error:', error);
            alert('Upload failed');
        }
    };

    const handleRemoveImage = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        if (!hotel) return;

        try {
            await apiFetch(`/hotels/${hotel.id}`, {
                method: 'PUT',
                body: JSON.stringify(formData)
            });
            alert('Settings saved successfully!');
            checkUser(); // Refresh context if needed
        } catch (error) {
            console.error(error);
            alert('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <AdminLayout>Loading...</AdminLayout>;
    if (!hotel) return <AdminLayout><div className="p-8 text-center text-slate-500">No Hotel Assigned</div></AdminLayout>;

    const TabButton = ({ id, icon: Icon, label }) => (
        <button
            type="button"
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors font-medium ${activeTab === id
                ? 'border-emerald-500 text-emerald-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
        >
            <Icon size={18} />
            {label}
        </button>
    );

    return (
        <AdminLayout>
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Hotel Settings</h1>
                        <p className="text-slate-500">Manage your property details and branding</p>
                    </div>
                    <button
                        onClick={handleSubmit}
                        disabled={saving}
                        className="btn-primary flex items-center gap-2 px-6 py-2.5 rounded-xl shadow-lg shadow-emerald-500/20"
                    >
                        {saving ? 'Saving...' : <><Save size={18} /> Save Changes</>}
                    </button>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    {/* Tabs */}
                    <div className="flex border-b border-slate-100 px-4">
                        <TabButton id="general" icon={Building2} label="General Info" />
                        <TabButton id="branding" icon={ImageIcon} label="Branding & Images" />
                        <TabButton id="web" icon={Globe} label="Website Content" />
                        <TabButton id="payment" icon={CreditCard} label="Payment Settings" />
                    </div>

                    <div className="p-8">
                        {/* GENERAL TAB */}
                        {activeTab === 'general' && (
                            <div className="space-y-6 max-w-2xl">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Hotel Name</label>
                                        <input
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="input-field w-full"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Contact Email</label>
                                        <input
                                            name="contactEmail"
                                            value={formData.contactEmail}
                                            onChange={handleChange}
                                            className="input-field w-full"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Contact Phone</label>
                                        <input
                                            name="contactPhone"
                                            value={formData.contactPhone}
                                            onChange={handleChange}
                                            className="input-field w-full"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                                        <textarea
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            rows={3}
                                            className="input-field w-full"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                                        <input
                                            name="city"
                                            value={formData.city}
                                            onChange={handleChange}
                                            className="input-field w-full"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Country</label>
                                        <input
                                            name="country"
                                            value={formData.country}
                                            onChange={handleChange}
                                            className="input-field w-full"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* BRANDING TAB */}
                        {activeTab === 'branding' && (
                            <div className="space-y-8">
                                {/* Logo Upload */}
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-4">Hotel Logo</h3>
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
                                            <p className="text-sm text-slate-600 mb-2">Upload your hotel logo. Recommended size: 512x512px. Transparent PNG preferred.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-slate-100 my-6" />

                                {/* Main Hero Image */}
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-4">Main Cover Image</h3>
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

                                <div className="border-t border-slate-100 my-6" />

                                {/* Gallery Slider */}
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-bold text-slate-900">Gallery / Slider Images</h3>
                                        <label className="btn-secondary text-sm px-4 py-2 cursor-pointer flex items-center gap-2">
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
                                            <div className="col-span-full py-12 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                                No images uploaded yet.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* WEB CONTENT TAB */}
                        {activeTab === 'web' && (
                            <div className="space-y-6 max-w-2xl">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Headline (Hero Title)</label>
                                    <input
                                        name="heroTitle"
                                        value={formData.heroTitle}
                                        onChange={handleChange}
                                        placeholder="Welcome to Paradise"
                                        className="input-field w-full"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Sub-headline / Hero Description</label>
                                    <textarea
                                        name="heroDescription"
                                        value={formData.heroDescription}
                                        onChange={handleChange}
                                        rows={3}
                                        className="input-field w-full"
                                    />
                                    <p className="text-xs text-slate-400 mt-1">Accepts Markdown or Plain text.</p>
                                </div>
                                <div className="border-t border-slate-100 my-6" />
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">About Hotel (Full Description)</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows={6}
                                        className="input-field w-full"
                                    />
                                </div>
                            </div>
                        )}

                        {/* PAYMENT SETTINGS TAB */}
                        {activeTab === 'payment' && (
                            <div className="space-y-8 max-w-2xl">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-4">PromptPay Configuration</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="col-span-2">
                                            <label className="block text-sm font-medium text-slate-700 mb-1">PromptPay ID (Phone/TaxID)</label>
                                            <input
                                                name="promptPayId"
                                                value={formData.promptPayId}
                                                onChange={handleChange}
                                                placeholder="012-345-6789"
                                                className="input-field w-full"
                                            />
                                            <p className="text-xs text-slate-500 mt-1">This will be displayed on the QR Code payment page.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-slate-100 my-6" />

                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-4">Bank Transfer Configuration</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Bank Name</label>
                                            <input
                                                name="bankName"
                                                value={formData.bankName}
                                                onChange={handleChange}
                                                placeholder="e.g. Bangkok Bank"
                                                className="input-field w-full"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Account Number</label>
                                            <input
                                                name="bankAccountNumber"
                                                value={formData.bankAccountNumber}
                                                onChange={handleChange}
                                                placeholder="e.g. 123-4-56789-0"
                                                className="input-field w-full"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Account Name</label>
                                            <input
                                                name="bankAccountName"
                                                value={formData.bankAccountName}
                                                onChange={handleChange}
                                                placeholder="e.g. BookingKub Co., Ltd."
                                                className="input-field w-full"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
