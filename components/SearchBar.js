import { useState } from 'react';
import { useRouter } from 'next/router';
import { Search, Users } from 'lucide-react';
import DatePicker from './DatePicker';

export default function SearchBar({ query = {} }) {
  const router = useRouter();
  const [dates, setDates] = useState({
    checkIn: query.checkIn ? new Date(query.checkIn) : null,
    checkOut: query.checkOut ? new Date(query.checkOut) : null,
  });
  const [guests, setGuests] = useState({
    adults: parseInt(query.adults) || 2,
    children: parseInt(query.children) || 0
  });
  const [open, setOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    const toLocalISO = (date) => {
      const offset = date.getTimezoneOffset()
      const local = new Date(date.getTime() - (offset * 60 * 1000))
      return local.toISOString().split('T')[0]
    }

    if (dates.checkIn) params.append('checkIn', toLocalISO(dates.checkIn));
    if (dates.checkOut) params.append('checkOut', toLocalISO(dates.checkOut));
    params.append('adults', guests.adults);
    params.append('children', guests.children);

    router.push(`/search?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSearch}
      className="glass p-2 rounded-2xl flex flex-col md:flex-row gap-2 max-w-5xl mx-auto shadow-2xl shadow-emerald-500/10"
    >
      <div className="flex gap-2 w-full md:w-auto flex-1">
        <div className="flex-1">
          <DatePicker
            placeholder="Check-in"
            value={dates.checkIn}
            onChange={([date]) => setDates(prev => ({ ...prev, checkIn: date }))}
            options={{ minDate: "today" }}
          />
        </div>

        <div className="flex-1">
          <DatePicker
            placeholder="Check-out"
            value={dates.checkOut}
            onChange={([date]) => setDates(prev => ({ ...prev, checkOut: date }))}
            options={{
              minDate: dates.checkIn ? new Date(dates.checkIn.getTime() + 86400000) : "today"
            }}
          />
        </div>
      </div>

      <div className="relative group md:w-48 z-50">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10">
          <Users size={20} />
        </div>

        {/* Trigger Button */}
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="w-full bg-white/50 hover:bg-white focus:bg-white text-left rounded-xl py-4 pl-12 pr-4 text-slate-900 focus:ring-2 focus:ring-primary-200 transition-all outline-none h-full flex items-center"
        >
          <span className="truncate">
            {guests.adults} Adult{guests.adults > 1 && 's'}, {guests.children} Child{guests.children !== 1 && 'ren'}
          </span>
        </button>

        {/* Dropdown */}
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-100 p-4 z-20 space-y-4">
              {/* Adults */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">Adults</div>
                  <div className="text-xs text-slate-500">Ages 13+</div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setGuests(prev => ({ ...prev, adults: Math.max(1, prev.adults - 1) }))}
                    className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-600"
                    disabled={guests.adults <= 1}
                  >
                    -
                  </button>
                  <span className="w-4 text-center font-medium">{guests.adults}</span>
                  <button
                    type="button"
                    onClick={() => setGuests(prev => ({ ...prev, adults: prev.adults + 1 }))}
                    className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-600"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Children */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">Children</div>
                  <div className="text-xs text-slate-500">Ages 0-12</div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setGuests(prev => ({ ...prev, children: Math.max(0, prev.children - 1) }))}
                    className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-600"
                    disabled={guests.children <= 0}
                  >
                    -
                  </button>
                  <span className="w-4 text-center font-medium">{guests.children}</span>
                  <button
                    type="button"
                    onClick={() => setGuests(prev => ({ ...prev, children: prev.children + 1 }))}
                    className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-600"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <button type="submit" className="btn-primary flex items-center justify-center gap-2 px-8 py-4 rounded-xl md:w-auto">
        <Search size={20} />
        <span>Search</span>
      </button>
    </form>
  )
}
