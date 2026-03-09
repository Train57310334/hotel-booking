import { useState } from 'react';
import { useRouter } from 'next/router';
import { Search, Users, Calendar } from 'lucide-react';
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

  const handleSearch = (e) => {
    e.preventDefault();

    // ✅ BUG FIX: Validate that both dates are selected before searching
    if (!dates.checkIn || !dates.checkOut) {
      alert('Please select both check-in and check-out dates');
      return;
    }
    // ✅ Ensure checkOut is strictly after checkIn
    if (dates.checkOut <= dates.checkIn) {
      alert('Check-out must be after check-in');
      return;
    }

    const params = new URLSearchParams();
    const toLocalISO = (date) => {
      const offset = date.getTimezoneOffset()
      const local = new Date(date.getTime() - (offset * 60 * 1000))
      return local.toISOString().split('T')[0]
    }

    params.append('checkIn', toLocalISO(dates.checkIn));
    params.append('checkOut', toLocalISO(dates.checkOut));
    params.append('adults', guests.adults);
    params.append('children', guests.children);
    if (query.hotelId) params.append('hotelId', query.hotelId);

    router.push(`/search?${params.toString()}`);
  };

  const InputWrapper = ({ label, icon, children, className = "" }) => (
    <div className={`relative flex-1 bg-slate-50 hover:bg-white focus-within:bg-white transition-all duration-200 border border-transparent hover:border-slate-200 focus-within:!border-emerald-500 rounded-full group ${className}`}>
      <label className="absolute top-3 left-12 text-[10px] font-bold text-slate-400 uppercase tracking-wider pointer-events-none group-focus-within:text-emerald-600 transition-colors">
        {label}
      </label>
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors pointer-events-none">
        {icon}
      </div>
      {children}
    </div>
  );

  return (
    <form
      onSubmit={handleSearch}
      className="bg-white/80 backdrop-blur-xl p-2 rounded-[2.5rem] flex flex-col md:flex-row gap-2 shadow-2xl shadow-slate-200/50 border border-white/50 w-full max-w-6xl mx-auto"
    >
      {/* Check-in */}
      <InputWrapper label="Check-in" icon={<Calendar size={18} />}>
        <DatePicker
          placeholder="Add date"
          value={dates.checkIn}
          onChange={([date]) => setDates(prev => ({ ...prev, checkIn: date }))}
          options={{ minDate: "today", dateFormat: "D, M j" }}
          className="w-full h-16 bg-transparent border-none focus:ring-0 pt-7 pb-2 pl-12 text-sm font-semibold text-slate-700 placeholder:text-slate-300 cursor-pointer"
          wrapperClassName="h-full !static" // !static to override relative
        />
        {/* Hide DatePicker's internal icon since we provide our own in wrapper for consistency */}
        <style jsx global>{`
           .h-16 .flatpickr-mobile { height: 100%; }
        `}</style>
      </InputWrapper>

      {/* Check-out */}
      <InputWrapper label="Check-out" icon={<Calendar size={18} />}>
        <DatePicker
          placeholder="Add date"
          value={dates.checkOut}
          onChange={([date]) => setDates(prev => ({ ...prev, checkOut: date }))}
          options={{
            minDate: dates.checkIn ? new Date(new Date(dates.checkIn).getTime() + 86400000) : "today",
            dateFormat: "D, M j"
          }}
          className="w-full h-16 bg-transparent border-none focus:ring-0 pt-7 pb-2 pl-12 text-sm font-semibold text-slate-700 placeholder:text-slate-300 cursor-pointer"
          wrapperClassName="h-full !static"
        />
      </InputWrapper>

      {/* Adults */}
      <InputWrapper label="Adults" icon={<Users size={18} />} className="flex-[0.8]">
        <input
          type="number"
          min="1"
          value={guests.adults}
          onChange={(e) => setGuests(prev => ({ ...prev, adults: Math.max(1, parseInt(e.target.value) || 0) }))}
          className="w-full h-16 bg-transparent border-none focus:ring-0 pt-7 pb-2 pl-12 text-sm font-semibold text-slate-700 placeholder:text-slate-300"
        />
      </InputWrapper>

      {/* Children */}
      <InputWrapper label="Children" icon={<Users size={18} />} className="flex-[0.8]">
        <input
          type="number"
          min="0"
          value={guests.children}
          onChange={(e) => setGuests(prev => ({ ...prev, children: Math.max(0, parseInt(e.target.value) || 0) }))}
          className="w-full h-16 bg-transparent border-none focus:ring-0 pt-7 pb-2 pl-12 text-sm font-semibold text-slate-700 placeholder:text-slate-300"
        />
      </InputWrapper>

      {/* Submit Button */}
      <button type="submit" className="w-full md:w-auto px-8 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold rounded-full shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 group whitespace-nowrap">
        <Search size={20} className="group-hover:-translate-y-0.5 transition-transform" />
        <span className="text-lg">Search</span>
      </button>
    </form>
  )
}
