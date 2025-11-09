export default function Filters({ minPrice, setMinPrice, maxPrice, setMaxPrice, minRating, setMinRating, amenities, toggleAmenity, amenitiesOptions, sortKey, setSortKey, showMap, setShowMap }){
  return (
    <aside className="card p-4 md:sticky md:top-6 md:h-max dark:bg-gray-800 border dark:border-gray-700">
      <h3 className="font-semibold mb-3">Filters</h3>
      <div className="space-y-3">
        <div><p className="text-sm font-medium mb-1">Price range</p><div className="flex items-center gap-2">
          <input type="number" placeholder="Min" value={minPrice} onChange={e=>setMinPrice(e.target.value)} className="w-24 border border-ink-200 rounded-lg px-2 py-1"/>
          <span className="text-ink-400">—</span>
          <input type="number" placeholder="Max" value={maxPrice} onChange={e=>setMaxPrice(e.target.value)} className="w-24 border border-ink-200 rounded-lg px-2 py-1"/>
        </div></div>
        <div><p className="text-sm font-medium mb-1">Minimum rating</p>
          <select value={minRating} onChange={e=>setMinRating(Number(e.target.value))} className="w-full border border-ink-200 rounded-lg px-2 py-1">
            <option value={0}>Any</option><option value={3}>3+</option><option value={4}>4+</option><option value={5}>5</option>
          </select>
        </div>
        <div><p className="text-sm font-medium mb-2">Amenities</p>
          <div className="flex flex-wrap gap-2">{amenitiesOptions.map(am => (<label key={am} className="text-xs"><input type="checkbox" className="mr-1" checked={amenities.includes(am)} onChange={()=>toggleAmenity(am)} />{am}</label>))}</div>
        </div>
        <div><p className="text-sm font-medium mb-1">Sort</p>
          <select value={sortKey} onChange={e=>setSortKey(e.target.value)} className="w-full border border-ink-200 rounded-lg px-2 py-1">
            <option value="priceAsc">Price ↑</option><option value="priceDesc">Price ↓</option><option value="ratingDesc">Rating</option><option value="popular">Popularity</option>
          </select>
        </div>
        <div className="mt-2 flex">
          <button type="button" onClick={()=>setShowMap(false)} className={`flex-1 btn ${!showMap ? 'btn-primary' : 'btn-outline'}`}>List</button>
          <button type="button" onClick={()=>setShowMap(true)} className={`flex-1 btn ${showMap ? 'btn-primary' : 'btn-outline'}`}>Map</button>
        </div>
      </div>
    </aside>
  )
}