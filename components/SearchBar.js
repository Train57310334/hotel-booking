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
  const [guests, setGuests] = useState(query.guests || 1);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (dates.checkIn) params.append('checkIn', dates.checkIn.toISOString().split('T')[0]);
    if (dates.checkOut) params.append('checkOut', dates.checkOut.toISOString().split('T')[0]);
    params.append('guests', guests);

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

      <div className="relative group md:w-32">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors pointer-events-none z-10">
          <Users size={20} />
        </div>
        <input
          type="number"
          name="guests"
          min="1"
          value={guests}
          onChange={(e) => setGuests(e.target.value)}
          className="w-full bg-white/50 hover:bg-white focus:bg-white border-none rounded-xl py-4 pl-12 pr-4 text-slate-900 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
          placeholder="Guests"
        />
      </div>

      <button type="submit" className="btn-primary flex items-center justify-center gap-2 px-8 py-4 rounded-xl md:w-auto">
        <Search size={20} />
        <span>Search</span>
      </button>
    </form>
  )
}
