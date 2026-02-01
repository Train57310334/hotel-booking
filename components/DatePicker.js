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
    return (
        <div className={`relative group w-full ${wrapperClassName}`}>
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors pointer-events-none z-10">
                <Calendar size={20} />
            </div>
            <Flatpickr
                value={value}
                onChange={(selectedDates) => {
                    // Return array for range, or single date depending on config
                    onChange(selectedDates);
                }}
                options={{
                    dateFormat: "Y-m-d",
                    disableMobile: "true", // Force custom picker on mobile for consistency
                    ...options,
                }}
                className={`w-full bg-white/50 hover:bg-white focus:bg-white border-none rounded-xl py-4 pl-12 pr-4 text-slate-900 focus:ring-2 focus:ring-primary-200 transition-all outline-none cursor-pointer ${className}`}
                placeholder={placeholder}
            />
        </div>
    );
}
