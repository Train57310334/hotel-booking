import { SlidersHorizontal, Map, X } from 'lucide-react'
import { useState } from 'react'

export default function Filters({ minPrice, setMinPrice, maxPrice, setMaxPrice, minRating, setMinRating, amenities, toggleAmenity, amenitiesOptions, sortKey, setSortKey, showMap, setShowMap }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="w-full lg:hidden mb-4 bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-center justify-center gap-2 font-bold text-slate-700"
      >
        <SlidersHorizontal size={20} />
        Filter & Sort
      </button>

      {/* Backdrop for Mobile */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsOpen(false)} />
      )}

      {/* Sidebar Content */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-80 bg-white p-6 shadow-2xl transform transition-transform duration-300 ease-in-out lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:static lg:w-full lg:shadow-sm lg:rounded-3xl lg:border lg:border-slate-100 lg:h-fit lg:block
      `}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={20} className="text-primary-600" />
            <h3 className="font-display font-bold text-lg text-slate-900">Filters</h3>
          </div>
          <button onClick={() => setIsOpen(false)} className="lg:hidden text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-8 max-h-[85vh] overflow-y-auto lg:max-h-none custom-scrollbar">
          {/* Price Range */}
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-3">Price range</p>
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">฿</span>
                <input
                  type="number"
                  placeholder="0"
                  value={minPrice}
                  onChange={e => setMinPrice(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-100 focus:border-primary-300 outline-none transition-all"
                />
              </div>
              <span className="text-slate-300">—</span>
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">฿</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={e => setMaxPrice(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-100 focus:border-primary-300 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Rating */}
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-3">Minimum rating</p>
            <div className="grid grid-cols-4 gap-2">
              {[0, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setMinRating(rating)}
                  className={`py-2 rounded-xl text-sm font-medium transition-all ${minRating === rating
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                >
                  {rating === 0 ? 'Any' : `${rating}+`}
                </button>
              ))}
            </div>
          </div>

          {/* Amenities */}
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-3">Amenities</p>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {amenitiesOptions.map(am => (
                <label key={am} className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${amenities.includes(am)
                    ? 'bg-primary-600 border-primary-600'
                    : 'bg-white border-slate-300 group-hover:border-primary-400'
                    }`}>
                    {amenities.includes(am) && (
                      <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={amenities.includes(am)}
                    onChange={() => toggleAmenity(am)}
                  />
                  <span className={`text-sm transition-colors ${amenities.includes(am) ? 'text-slate-900 font-medium' : 'text-slate-600'}`}>
                    {am}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Sort */}
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-3">Sort by</p>
            <select
              value={sortKey}
              onChange={e => setSortKey(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-primary-100 focus:border-primary-300 outline-none appearance-none cursor-pointer"
            >
              <option value="priceAsc">Price: Low to High</option>
              <option value="priceDesc">Price: High to Low</option>
              <option value="ratingDesc">Rating: High to Low</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>

          {/* View Toggle */}
          <div className="p-1 bg-slate-100 rounded-xl flex">
            <button
              type="button"
              onClick={() => setShowMap(false)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${!showMap ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              List
            </button>
            <button
              type="button"
              onClick={() => setShowMap(true)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${showMap ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              Map
            </button>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-slate-100 lg:hidden">
          <button onClick={() => setIsOpen(false)} className="w-full btn-primary py-3">
            Show Results
          </button>
        </div>
      </aside>
    </>
  )
}