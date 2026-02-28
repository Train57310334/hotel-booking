import { useState, useEffect, useCallback } from 'react';
import { Filter, X, Check, ArrowDownUp } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const COMMON_AMENITIES = [
    { id: 'wifi', label: 'Free WiFi' },
    { id: 'pool', label: 'Swimming Pool' },
    { id: 'parking', label: 'Free Parking' },
    { id: 'restaurant', label: 'Restaurant' },
    { id: 'gym', label: 'Fitness Center' },
    { id: 'spa', label: 'Spa' },
    { id: 'breakfast', label: 'Breakfast Included' }
];

export default function SearchFilters({ onFilterChange, initialFilters }) {
    const { t } = useLanguage();
    const [minPrice, setMinPrice] = useState(initialFilters?.minPrice || '');
    const [maxPrice, setMaxPrice] = useState(initialFilters?.maxPrice || '');
    const [selectedAmenities, setSelectedAmenities] = useState(initialFilters?.amenities || []);
    const [sort, setSort] = useState(initialFilters?.sort || 'recommended');

    // Debounce the filter changes
    useEffect(() => {
        const handler = setTimeout(() => {
            onFilterChange({
                minPrice: minPrice ? Number(minPrice) : null,
                maxPrice: maxPrice ? Number(maxPrice) : null,
                amenities: selectedAmenities,
                sort: sort
            });
        }, 500); // 500ms debounce
        return () => clearTimeout(handler);
    }, [minPrice, maxPrice, selectedAmenities, sort, onFilterChange]);

    const toggleAmenity = (id) => {
        setSelectedAmenities(prev =>
            prev.includes(id)
                ? prev.filter(a => a !== id)
                : [...prev, id]
        );
    };

    const clearFilters = () => {
        setMinPrice('');
        setMaxPrice('');
        setSelectedAmenities([]);
        setSort('recommended');
    };

    const hasActiveFilters = minPrice !== '' || maxPrice !== '' || selectedAmenities.length > 0 || sort !== 'recommended';

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 xl:p-8">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-display font-bold text-xl text-slate-900 flex items-center gap-2">
                    <Filter size={20} className="text-primary-500" />
                    {t('filters.title')}
                </h3>
                {hasActiveFilters && (
                    <button
                        onClick={clearFilters}
                        className="text-sm font-medium text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        {t('filters.clearAll')}
                    </button>
                )}
            </div>

            {/* Sort Order */}
            <div className="mb-8">
                <h4 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
                    <ArrowDownUp size={16} className="text-slate-400" />
                    {t('filters.sortBy')}
                </h4>
                <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all font-medium text-slate-700 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748B%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:20px] bg-[position:right_1rem_center] bg-no-repeat"
                >
                    <option value="recommended">{t('filters.sortRecommended')}</option>
                    <option value="price_asc">{t('filters.sortPriceAsc')}</option>
                    <option value="price_desc">{t('filters.sortPriceDesc')}</option>
                </select>
            </div>

            <hr className="border-slate-100 my-6" />

            {/* Price Range */}
            <div className="mb-8">
                <h4 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wider">{t('filters.priceRange')}</h4>
                <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">฿</span>
                        <input
                            type="number"
                            min="0"
                            placeholder={t('filters.min')}
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                            className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all font-medium text-slate-700"
                        />
                    </div>
                    <span className="text-slate-300 font-bold">-</span>
                    <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">฿</span>
                        <input
                            type="number"
                            min="0"
                            placeholder={t('filters.max')}
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                            className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all font-medium text-slate-700"
                        />
                    </div>
                </div>
            </div>

            <hr className="border-slate-100 my-6" />

            {/* Amenities */}
            <div>
                <h4 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wider">{t('filters.amenities')}</h4>
                <div className="space-y-3">
                    {COMMON_AMENITIES.map((amenity) => {
                        const isSelected = selectedAmenities.includes(amenity.id);
                        return (
                            <label
                                key={amenity.id}
                                className="flex items-center gap-3 cursor-pointer group"
                            >
                                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${isSelected ? 'bg-primary-500 border-primary-500 text-white' : 'border-slate-300 bg-white group-hover:border-primary-300'}`}>
                                    {isSelected && <Check size={14} strokeWidth={3} />}
                                </div>
                                <span className={`font-medium transition-colors ${isSelected ? 'text-slate-900 font-bold' : 'text-slate-600 group-hover:text-slate-900'}`}>
                                    {amenity.label}
                                </span>
                            </label>
                        );
                    })}
                </div>
            </div >
        </div >
    );
}
