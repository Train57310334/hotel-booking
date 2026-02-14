import React, { useMemo } from 'react';
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.css";
import "flatpickr/dist/themes/airbnb.css"; // Clean, modern base theme
import { Calendar } from "lucide-react";

export default function DatePicker({
    value,
    onChange,
    options = {},
    placeholder = "Select Date",
    className = "",
    wrapperClassName = "",
}) {
    const formattedValue = useMemo(() => {
        return value ? new Date(value) : null;
    }, [value]);

    const memoizedOptions = useMemo(() => ({
        dateFormat: "Y-m-d",
        disableMobile: "true",
        ...options,
    }), [options]);

    return (
        <div className={`relative group w-full ${wrapperClassName}`}>
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors pointer-events-none z-10">
                <Calendar size={20} />
            </div>
            <Flatpickr
                value={formattedValue}
                onChange={(selectedDates) => {
                    if (selectedDates && selectedDates.length > 0) {
                        // Fix: Manually format to local YYYY-MM-DD to avoid UTC shifts
                        const date = selectedDates[0];
                        const offset = date.getTimezoneOffset();
                        const localDate = new Date(date.getTime() - (offset * 60 * 1000));
                        onChange([localDate.toISOString().split('T')[0]]);
                    } else {
                        onChange([]);
                    }
                }}
                options={memoizedOptions}
                className={`w-full bg-white/50 hover:bg-white focus:bg-white border-none rounded-xl py-4 pl-12 pr-4 text-slate-900 focus:ring-2 focus:ring-primary-200 transition-all outline-none cursor-pointer ${className}`}
                placeholder={placeholder}
            />
        </div>
    );
}
