import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/AdminLayout';
import { useAdmin } from '@/contexts/AdminContext';
import { useAuth } from '@/contexts/AuthContext';
import { apiFetch } from '@/lib/api';
import { Building2, Image as ImageIcon, Globe, Save, Upload, X, CreditCard, Mail, Bell, LayoutTemplate, BarChart2, Search, ToggleLeft, ToggleRight, ExternalLink } from 'lucide-react';
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
        footerDescription: '',
        facebookUrl: '',
        instagramUrl: '',
        twitterUrl: '',
        // Payment Config
        promptPayId: '',
        bankName: '',
        bankAccountName: '',
        bankAccountNumber: '',
        stripePublicKey: '',
        stripeSecretKey: '',
        omisePublicKey: '',
        omiseSecretKey: '',
        // SEO & Marketing
        seoTitle: '',
        seoDescription: '',
        seoKeywords: '',
        ogImage: '',
        canonicalUrl: '',
        customDomain: '',
        robotsIndex: true,
        googleAnalyticsId: '',
        googleTagManagerId: '',
        facebookPixelId: '',
        googleAdsId: '',
        analyticsEmbedUrl: ''
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
            let paymentConfig = {};
            try {
                paymentConfig = await apiFetch(`/hotels/${id}/payment-config`);
            } catch (err) {
                console.warn('Could not load payment config', err);
            }

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
                checkInTime: hotelData.checkInTime || '14:00',
                checkOutTime: hotelData.checkOutTime || '12:00',
                logoUrl: hotelData.logoUrl || '',
                imageUrl: hotelData.imageUrl || '',
                images: hotelData.images || [],
                footerDescription: hotelData.footerDescription || '',
                facebookUrl: hotelData.facebookUrl || '',
                instagramUrl: hotelData.instagramUrl || '',
                twitterUrl: hotelData.twitterUrl || '',
                // Payment Config (Hotel Level)
                promptPayId: hotelData.promptPayId || '',
                bankName: hotelData.bankName || '',
                bankAccountName: hotelData.bankAccountName || '',
                bankAccountNumber: hotelData.bankAccountNumber || '',
                stripePublicKey: paymentConfig.stripePublicKey || '',
                stripeSecretKey: paymentConfig.stripeSecretKey || '',
                omisePublicKey: paymentConfig.omisePublicKey || '',
                omiseSecretKey: paymentConfig.omiseSecretKey || '',
                // SEO & Marketing
                seoTitle: hotelData.seoTitle || '',
                seoDescription: hotelData.seoDescription || '',
                seoKeywords: hotelData.seoKeywords || '',
                ogImage: hotelData.ogImage || '',
                canonicalUrl: hotelData.canonicalUrl || '',
                customDomain: hotelData.customDomain || '',
                robotsIndex: hotelData.robotsIndex !== false,
                googleAnalyticsId: hotelData.googleAnalyticsId || '',
                googleTagManagerId: hotelData.googleTagManagerId || '',
                facebookPixelId: hotelData.facebookPixelId || '',
                googleAdsId: hotelData.googleAdsId || '',
                analyticsEmbedUrl: hotelData.analyticsEmbedUrl || ''
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
        { id: 'payment', label: 'Payment Gateways', icon: CreditCard },
        { id: 'seo', label: 'SEO & Marketing', icon: Search }
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
                                        <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Hotel Name <InfoTooltip content="The display name of your hotel shown on the public booking page, confirmation emails, and all guest-facing materials. This can be updated anytime." /></label>
                                        <input
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Contact Email <InfoTooltip content="Used for sending booking confirmation emails to guests. Must be a valid email address. Also used as the reply-to address on guest notification emails." /></label>
                                        <input
                                            name="contactEmail"
                                            value={formData.contactEmail}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-2.5 rounded-xl border ${errors.contactEmail ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'} bg-slate-50 dark:bg-slate-700/50`}
                                        />
                                        {errors.contactEmail && <p className="text-red-500 text-xs mt-1">{errors.contactEmail}</p>}
                                    </div>
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Contact Phone <InfoTooltip content="Hotel's front desk or reservation phone number. Displayed on the booking confirmation page and emails for guests to contact you. Include country code (e.g. +66812345678)." /></label>
                                        <input
                                            name="contactPhone"
                                            value={formData.contactPhone}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Address <InfoTooltip content="Hotel's full street address. Shown on confirmation emails and invoices. Guests also use this to navigate to your property. Include building number, street, district, province, and postal code." /></label>
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
                                    <div className="col-span-2">
                                        <div className="border-t border-slate-100 dark:border-slate-700 my-2 mb-4" />
                                        <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Check-in / Check-out Policy <InfoTooltip content="Set your hotel's standard check-in and check-out times. These are shown on the public booking page in the 'Good to Know' section and on booking confirmation emails." /></label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1 block">Check-in from</label>
                                                <select
                                                    name="checkInTime"
                                                    value={formData.checkInTime}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50"
                                                >
                                                    {Array.from({ length: 48 }, (_, i) => {
                                                        const h = String(Math.floor(i / 2)).padStart(2, '0');
                                                        const m = i % 2 === 0 ? '00' : '30';
                                                        const val = `${h}:${m}`;
                                                        return <option key={val} value={val}>{val}</option>;
                                                    })}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1 block">Check-out before</label>
                                                <select
                                                    name="checkOutTime"
                                                    value={formData.checkOutTime}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50"
                                                >
                                                    {Array.from({ length: 48 }, (_, i) => {
                                                        const h = String(Math.floor(i / 2)).padStart(2, '0');
                                                        const m = i % 2 === 0 ? '00' : '30';
                                                        const val = `${h}:${m}`;
                                                        return <option key={val} value={val}>{val}</option>;
                                                    })}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* BRANDING TAB */}
                        {activeTab === 'branding' && (
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm space-y-8">
                                {/* Logo Upload */}
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">Hotel Logo <InfoTooltip content="Your hotel logo displayed in the admin sidebar, public booking page header, and all confirmation emails. Recommended: 512×512px PNG with transparent background. Max 5MB." /></h3>
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
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">Main Cover Image <InfoTooltip content="The hero background photo at the top of your public booking page. This is the first image guests see. Use a high-quality exterior or interior shot. Recommended: 1920×1080px (16:9). Max 10MB." /></h3>
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
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">Gallery / Slider Images <InfoTooltip content="Additional photos shown in the image slider carousel on your public booking page. Add 3-8 high-quality photos of rooms, common areas, pool, and dining to encourage bookings. Hover over any image and click the X to remove it." /></h3>
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
                                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Headline (Hero Title) <InfoTooltip content="The main headline displayed at the top of your public booking page. This is the first text guests read. Keep it compelling and under 80 characters. e.g. 'Escape to Paradise on the Andaman Coast'." /></label>
                                    <input
                                        name="heroTitle"
                                        value={formData.heroTitle}
                                        onChange={handleChange}
                                        placeholder="Welcome to Paradise"
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50"
                                    />
                                </div>
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Sub-headline / Hero Description <InfoTooltip content="A short description below the main headline. Use it to highlight your hotel's unique selling points (e.g. 'Beachfront 5-star resort with 3 pools and a world-class spa'). Accepts plain text." /></label>
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
                                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">About Hotel (Full Description) <InfoTooltip content="A detailed description of your property shown in the 'About' section on your booking page. Describe amenities, atmosphere, location advantages, and what makes your hotel special. 150-300 words is ideal." /></label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows={6}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50"
                                    />
                                </div>
                                <div className="border-t border-slate-100 dark:border-slate-700 my-6" />
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Footer & Social Links</h3>
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Footer Description <InfoTooltip content="A short 1-2 sentence description shown in the footer of your booking page." /></label>
                                    <textarea
                                        name="footerDescription"
                                        value={formData.footerDescription}
                                        onChange={handleChange}
                                        rows={2}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Facebook URL</label>
                                        <input
                                            name="facebookUrl"
                                            value={formData.facebookUrl}
                                            onChange={handleChange}
                                            placeholder="https://facebook.com/..."
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Instagram URL</label>
                                        <input
                                            name="instagramUrl"
                                            value={formData.instagramUrl}
                                            onChange={handleChange}
                                            placeholder="https://instagram.com/..."
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">X (Twitter) URL</label>
                                        <input
                                            name="twitterUrl"
                                            value={formData.twitterUrl}
                                            onChange={handleChange}
                                            placeholder="https://twitter.com/..."
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50"
                                        />
                                    </div>
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
                                                <InfoTooltip content="Enter a 10-digit Thai mobile number (e.g. 0812345678) or a 13-digit Tax ID. This ID is used to generate the PromptPay QR code shown to guests on the payment page." />
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
                                                <InfoTooltip content="The registered name of the bank account holder — exactly as it appears in the bank (e.g. BookingKub Co., Ltd.). Guests will see this when making a transfer." />
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

                                <div className="border-t border-slate-100 dark:border-slate-700 my-6" />

                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">Stripe Configuration (Online Card Payments) <InfoTooltip content="Stripe enables credit/debit card payments. Get your keys from dashboard.stripe.com → Developers → API Keys. Use 'pk_live_' and 'sk_live_' for production, or 'pk_test_' and 'sk_test_' for testing." /></h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="col-span-2">
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Publishable Key</label>
                                            <input
                                                name="stripePublicKey"
                                                value={formData.stripePublicKey}
                                                onChange={handleChange}
                                                placeholder="pk_live_..."
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 font-mono text-sm"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Secret Key</label>
                                            <input
                                                type="password"
                                                name="stripeSecretKey"
                                                value={formData.stripeSecretKey}
                                                onChange={handleChange}
                                                placeholder="sk_live_..."
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 font-mono text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-slate-100 dark:border-slate-700 my-6" />

                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">Omise Configuration (PromptPay &amp; Optional Cards) <InfoTooltip content="Omise enables PromptPay QR payments and card processing for Thai merchants. Get your keys from dashboard.omise.co → API Keys. Use 'pkey_' (public) and 'skey_' (secret). Requires a PRO plan." /></h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="col-span-2">
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Public Key</label>
                                            <input
                                                name="omisePublicKey"
                                                value={formData.omisePublicKey}
                                                onChange={handleChange}
                                                placeholder="pkey_..."
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 font-mono text-sm"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Secret Key</label>
                                            <input
                                                type="password"
                                                name="omiseSecretKey"
                                                value={formData.omiseSecretKey}
                                                onChange={handleChange}
                                                placeholder="skey_..."
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 font-mono text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                        )}

                        {/* SEO & MARKETING TAB */}
                        {activeTab === 'seo' && (
                            <div className="space-y-6">
                                {/* Meta Tags */}
                                <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm space-y-6">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-4 flex items-center gap-2">
                                        <Search size={18} className="text-emerald-500" /> Search Engine Optimization (SEO)
                                    </h3>
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">SEO Title <InfoTooltip content="The &lt;title&gt; tag shown in browser tabs and Google search results. Ideal length: 50-60 characters. If empty, the hotel name is used." /></label>
                                            <span className={`text-xs font-mono ${(formData.seoTitle || '').length > 60 ? 'text-red-500' : 'text-slate-400'}`}>{(formData.seoTitle || '').length}/60</span>
                                        </div>
                                        <input
                                            name="seoTitle"
                                            value={formData.seoTitle}
                                            onChange={handleChange}
                                            placeholder={`${formData.name} – Book Direct & Save`}
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50"
                                        />
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">Meta Description <InfoTooltip content="The description snippet shown under your hotel in Google search results. Optimal length: 120-160 characters. This directly impacts click-through rate from search." /></label>
                                            <span className={`text-xs font-mono ${(formData.seoDescription || '').length > 160 ? 'text-red-500' : 'text-slate-400'}`}>{(formData.seoDescription || '').length}/160</span>
                                        </div>
                                        <textarea
                                            name="seoDescription"
                                            value={formData.seoDescription}
                                            onChange={handleChange}
                                            rows={3}
                                            placeholder="Experience luxury beachfront stays with world-class amenities. Book direct for the best rates and exclusive perks."
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Keywords <InfoTooltip content="Comma-separated keywords related to your hotel. While Google ignores this tag, some booking aggregators and Bing still use it. e.g. 'luxury hotel phuket, beachfront resort, pool villa'" /></label>
                                        <input
                                            name="seoKeywords"
                                            value={formData.seoKeywords}
                                            onChange={handleChange}
                                            placeholder="luxury hotel phuket, beachfront resort, pool villa thailand"
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50"
                                        />
                                    </div>

                                    <div className="border-t border-slate-100 dark:border-slate-700 my-2 pt-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">Allow Search Engine Indexing <InfoTooltip content="When enabled, Google and other search engines can index your hotel page. Disable only if you want your hotel page to remain private or during testing." /></label>
                                                <p className="text-xs text-slate-400 mt-1">If OFF, a &ldquo;noindex&rdquo; tag will be added to your page.</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, robotsIndex: !prev.robotsIndex }))}
                                                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${formData.robotsIndex
                                                        ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                                                        : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                                                    }`}
                                            >
                                                {formData.robotsIndex ? <><ToggleRight size={20} /> Indexing ON</> : <><ToggleLeft size={20} /> Indexing OFF</>}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Open Graph / Social Sharing */}
                                <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm space-y-6">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-4 flex items-center gap-2">
                                        <Globe size={18} className="text-blue-500" /> Social Sharing (Open Graph)
                                    </h3>
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Social Share Image (OG Image) <InfoTooltip content="This image is shown when someone shares your hotel page on Facebook, LINE, WhatsApp, or Twitter. Recommended: 1200×630px JPG/PNG. If empty, the main cover image is used." /></label>
                                        <div className="flex gap-4 items-start">
                                            {formData.ogImage && (
                                                <div className="w-40 h-24 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-600 shrink-0">
                                                    <img src={formData.ogImage} alt="OG Preview" className="w-full h-full object-cover" />
                                                </div>
                                            )}
                                            <div className="flex-1 space-y-2">
                                                <input
                                                    name="ogImage"
                                                    value={formData.ogImage}
                                                    onChange={handleChange}
                                                    placeholder="https://your-cdn.com/og-image.jpg or upload below"
                                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50"
                                                />
                                                <label className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg text-sm font-bold cursor-pointer transition-colors">
                                                    <Upload size={15} /> Upload Image
                                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleUpload(e, 'ogImage')} />
                                                </label>
                                            </div>
                                        </div>
                                        <p className="text-xs text-slate-400 mt-2">Recommended: 1200×630px (1.91:1 ratio). Max 5MB.</p>
                                    </div>
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Canonical URL <InfoTooltip content="If your hotel has a custom domain (e.g. https://grandhotel.com), enter it here. This tells Google which URL is the 'official' one, preventing duplicate content issues when the same page is accessible from multiple URLs." /></label>
                                        <input
                                            name="canonicalUrl"
                                            value={formData.canonicalUrl}
                                            onChange={handleChange}
                                            placeholder="https://grandhotel.com"
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 font-mono text-sm"
                                        />
                                        <p className="text-xs text-slate-400 mt-1">Leave empty if using the platform URL only.</p>
                                    </div>
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Custom Domain <InfoTooltip content="Your hotel's custom domain for sitemap and robots.txt generation. e.g. grandhotel.com (without https://). DNS setup must be done separately via your hosting provider." /></label>
                                        <input
                                            name="customDomain"
                                            value={formData.customDomain}
                                            onChange={handleChange}
                                            placeholder="grandhotel.com"
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 font-mono text-sm"
                                        />
                                    </div>
                                </div>

                                {/* Tracking Codes */}
                                <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm space-y-6">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-4 flex items-center gap-2">
                                        <BarChart2 size={18} className="text-purple-500" /> Analytics & Tracking
                                    </h3>
                                    <div className="p-4 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-xl">
                                        <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">💡 These tracking codes are injected on your hotel&apos;s public booking page only. They are separate from the platform-level analytics.</p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Google Analytics 4 ID <InfoTooltip content="Your GA4 Measurement ID. Found in Google Analytics → Admin → Data Streams → Measurement ID. Format: G-XXXXXXXXXX. Create a free account at analytics.google.com" /></label>
                                            <input
                                                name="googleAnalyticsId"
                                                value={formData.googleAnalyticsId}
                                                onChange={handleChange}
                                                placeholder="G-XXXXXXXXXX"
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 font-mono text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Google Tag Manager ID <InfoTooltip content="GTM Container ID for advanced tag management. Found in Google Tag Manager → Admin → Container Settings. Format: GTM-XXXXXXX. Use this instead of GA4 if you need multiple tracking tools." /></label>
                                            <input
                                                name="googleTagManagerId"
                                                value={formData.googleTagManagerId}
                                                onChange={handleChange}
                                                placeholder="GTM-XXXXXXX"
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 font-mono text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Facebook Pixel ID <InfoTooltip content="Your Facebook (Meta) Pixel ID for tracking conversions on Facebook/Instagram Ads. Found in Meta Business Suite → Events Manager → Pixel. Format: a long number like 1234567890123456." /></label>
                                            <input
                                                name="facebookPixelId"
                                                value={formData.facebookPixelId}
                                                onChange={handleChange}
                                                placeholder="1234567890123456"
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 font-mono text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Google Ads Conversion ID <InfoTooltip content="Your Google Ads Conversion Tracking ID. Found in Google Ads → Tools → Conversions → Tag Setup. Format: AW-XXXXXXXXX. Used to track bookings as conversions in your Google Ads campaigns." /></label>
                                            <input
                                                name="googleAdsId"
                                                value={formData.googleAdsId}
                                                onChange={handleChange}
                                                placeholder="AW-XXXXXXXXX"
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 font-mono text-sm"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2 pt-2 text-xs text-slate-500">
                                        <span className="font-bold text-slate-600 dark:text-slate-400">Quick links:</span>
                                        <a href="https://analytics.google.com" target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-500 hover:underline"><ExternalLink size={11} />GA4 Console</a>
                                        <a href="https://tagmanager.google.com" target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-500 hover:underline"><ExternalLink size={11} />GTM Console</a>
                                        <a href="https://business.facebook.com/events_manager" target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-500 hover:underline"><ExternalLink size={11} />Meta Pixel</a>
                                        <a href="https://ads.google.com" target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-500 hover:underline"><ExternalLink size={11} />Google Ads</a>
                                    </div>
                                </div>

                                {/* Analytics Dashboard Embed */}
                                <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm space-y-6">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-4 flex items-center gap-2">
                                        <BarChart2 size={18} className="text-emerald-500" /> Analytics Dashboard
                                    </h3>
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Looker Studio Embed URL <InfoTooltip content="Paste the embed URL from a Looker Studio (Google Data Studio) report connected to your GA4. In Looker Studio → Share → Embed Report → Copy Embed Code and paste only the src=&quot;...&quot; URL here." /></label>
                                        <input
                                            name="analyticsEmbedUrl"
                                            value={formData.analyticsEmbedUrl}
                                            onChange={handleChange}
                                            placeholder="https://lookerstudio.google.com/embed/reporting/..."
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 font-mono text-sm"
                                        />
                                        <p className="text-xs text-slate-400 mt-1">Once set, an Analytics Dashboard page will appear in your admin Reports menu.</p>
                                    </div>
                                    <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600">
                                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">📊 How to set up your Analytics Dashboard:</p>
                                        <ol className="text-sm text-slate-600 dark:text-slate-400 space-y-1 list-decimal list-inside">
                                            <li>Set up GA4 by entering your Measurement ID above and saving</li>
                                            <li>Create a free report at <a href="https://lookerstudio.google.com" target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">Looker Studio</a> connected to your GA4</li>
                                            <li>Click <strong>Share → Embed Report</strong> and copy the URL from the iframe src attribute</li>
                                            <li>Paste the URL in the field above and save</li>
                                        </ol>
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
