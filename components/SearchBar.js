import { Search, MapPin, Calendar, Users } from 'lucide-react'

export default function SearchBar({ query = {} }) {
  return (
    <form
      method="GET"
      action="/search"
      className="glass p-2 rounded-2xl flex flex-col md:flex-row gap-2 max-w-5xl mx-auto shadow-2xl shadow-emerald-500/10"
    >
      <div className="flex-1 relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors">
          <MapPin size={20} />
        </div>
        <input
          name="destination"
          defaultValue={query.destination || ''}
          placeholder="Where are you going?"
          className="w-full bg-white/50 hover:bg-white focus:bg-white border-none rounded-xl py-4 pl-12 pr-4 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
        />
      </div>

      <div className="flex gap-2 md:w-auto">
        <div className="relative group flex-1 md:w-40">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors pointer-events-none">
            <Calendar size={20} />
          </div>
          <input
            type="date"
            name="checkIn"
            defaultValue={query.checkIn || ''}
            className="w-full bg-white/50 hover:bg-white focus:bg-white border-none rounded-xl py-4 pl-12 pr-4 text-slate-900 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
          />
        </div>

        <div className="relative group flex-1 md:w-40">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors pointer-events-none">
            <Calendar size={20} />
          </div>
          <input
            type="date"
            name="checkOut"
            defaultValue={query.checkOut || ''}
            className="w-full bg-white/50 hover:bg-white focus:bg-white border-none rounded-xl py-4 pl-12 pr-4 text-slate-900 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
          />
        </div>
      </div>

      <div className="relative group md:w-32">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors pointer-events-none">
          <Users size={20} />
        </div>
        <input
          type="number"
          name="guests"
          min="1"
          defaultValue={query.guests || 1}
          className="w-full bg-white/50 hover:bg-white focus:bg-white border-none rounded-xl py-4 pl-12 pr-4 text-slate-900 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
          placeholder="Guests"
        />
      </div>

      <button className="btn-primary flex items-center justify-center gap-2 px-8 py-4 rounded-xl md:w-auto">
        <Search size={20} />
        <span>Search</span>
      </button>
    </form>
  )
}