import { useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { Search, Users, Calendar } from 'lucide-react';
import DatePicker from './DatePicker';
import toast from 'react-hot-toast';

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
  const [errors, setErrors] = useState({ checkIn: false, checkOut: false });

  const checkInRef = useRef(null);
  const checkOutRef = useRef(null);

  const handleSearch = (e) => {
    e.preventDefault();

    setErrors({ checkIn: false, checkOut: false });

    // ✅ BUG FIX: Dates are stored as ISO strings ("YYYY-MM-DD") from DatePicker now.
    const isDateValid = (d) => d && !isNaN(new Date(d).getTime());

    let hasError = false;
    const newErrors = { checkIn: false, checkOut: false };

    if (!isDateValid(dates.checkIn)) {
      newErrors.checkIn = true;
      hasError = true;
      if (checkInRef.current?.flatpickr?.input) checkInRef.current.flatpickr.input.focus();
    } else if (!isDateValid(dates.checkOut)) {
      newErrors.checkOut = true;
      hasError = true;
      if (checkOutRef.current?.flatpickr?.input) checkOutRef.current.flatpickr.input.focus();
    } else if (new Date(dates.checkOut) <= new Date(dates.checkIn)) {
      newErrors.checkOut = true;
      hasError = true;
      toast.error('Check-out must be after check-in');
      if (checkOutRef.current?.flatpickr?.input) checkOutRef.current.flatpickr.input.focus();
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    const params = new URLSearchParams();
    const toLocalISO = (dateStr) => {
      // It's already "YYYY-MM-DD" from state
      return dateStr;
    }

    params.append('checkIn', toLocalISO(dates.checkIn));
    params.append('checkOut', toLocalISO(dates.checkOut));
    params.append('adults', guests.adults);
    params.append('children', guests.children);
    if (query.hotelId) params.append('hotelId', query.hotelId);

    router.push(`/search?${params.toString()}`);
  };

  const InputWrapper = ({ label, icon, children, className = "", hasError = false }) => (
    <div className={`relative flex-1 bg-theme-bg hover:bg-theme-card focus-within:bg-theme-card transition-all duration-200 border-2 ${hasError ? 'border-red-500/80 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'border-transparent hover:border-theme-border focus-within:!border-theme-accent'} rounded-[2rem] group ${className}`}>
      <label className={`absolute top-3 left-12 text-[10px] font-bold uppercase tracking-wider pointer-events-none transition-colors ${hasError ? 'text-red-500/80' : 'text-theme-muted group-focus-within:text-theme-accent'}`}>
        {label}
      </label>
      <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors pointer-events-none ${hasError ? 'text-red-500/80' : 'text-theme-muted group-focus-within:text-theme-accent'}`}>
        {icon}
      </div>
      {children}
    </div>
  );

  return (
    <form
      onSubmit={handleSearch}
      className="bg-theme-card/80 backdrop-blur-xl p-2 rounded-[2.5rem] flex flex-col md:flex-row gap-2 shadow-sm shadow-theme-border border border-theme-border w-full max-w-6xl mx-auto"
    >
      {/* Check-in */}
      <InputWrapper label="Check-in" icon={<Calendar size={18} />} hasError={errors.checkIn}>
        <DatePicker
          innerRef={checkInRef}
          placeholder="Add date"
          value={dates.checkIn}
          onChange={([date]) => {
            setDates(prev => ({ ...prev, checkIn: date }));
            setErrors(prev => ({ ...prev, checkIn: false }));
          }}
          options={{ minDate: "today", dateFormat: "D, M j" }}
          className="w-full h-16 bg-transparent focus:ring-0 pt-7 pb-2 pl-12 text-sm font-semibold text-theme-text placeholder:text-theme-muted cursor-pointer"
          wrapperClassName="h-full !static" // !static to override relative
        />
        {/* Hide DatePicker's internal icon since we provide our own in wrapper for consistency */}
        <style jsx global>{`
           .h-16 .flatpickr-mobile { height: 100%; }
        `}</style>
      </InputWrapper>

      {/* Check-out */}
      <InputWrapper label="Check-out" icon={<Calendar size={18} />} hasError={errors.checkOut}>
        <DatePicker
          innerRef={checkOutRef}
          placeholder="Add date"
          value={dates.checkOut}
          onChange={([date]) => {
            setDates(prev => ({ ...prev, checkOut: date }));
            setErrors(prev => ({ ...prev, checkOut: false }));
          }}
          options={{
            minDate: dates.checkIn ? new Date(new Date(dates.checkIn).getTime() + 86400000) : "today",
            dateFormat: "D, M j"
          }}
          className="w-full h-16 bg-transparent focus:ring-0 pt-7 pb-2 pl-12 text-sm font-semibold text-theme-text placeholder:text-theme-muted cursor-pointer"
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
          className="w-full h-16 bg-transparent border-none focus:ring-0 pt-7 pb-2 pl-12 text-sm font-semibold text-theme-text placeholder:text-theme-muted"
        />
      </InputWrapper>

      {/* Children */}
      <InputWrapper label="Children" icon={<Users size={18} />} className="flex-[0.8]">
        <input
          type="number"
          min="0"
          value={guests.children}
          onChange={(e) => setGuests(prev => ({ ...prev, children: Math.max(0, parseInt(e.target.value) || 0) }))}
          className="w-full h-16 bg-transparent border-none focus:ring-0 pt-7 pb-2 pl-12 text-sm font-semibold text-theme-text placeholder:text-theme-muted"
        />
      </InputWrapper>

      {/* Submit Button */}
      <button type="submit" className="w-full md:w-auto px-8 h-16 bg-theme-accent hover:opacity-90 text-white font-bold rounded-[2rem] shadow-[0_8px_20px_-6px_rgba(0,0,0,0.1)] transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 group whitespace-nowrap">
        <Search size={20} className="group-hover:-translate-y-0.5 transition-transform" />
        <span className="text-lg">Search</span>
      </button>
    </form>
  )
}
