import React, { useState, useEffect, useRef } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
} from "lucide-react";

/**
 * Custom Datepicker Component matching Padham Travels' brand palette (#008ba3)
 * Features:
 * - Click anywhere on container/input to open
 * - Min / Max date boundary enforcement (e.g. minDate="today")
 * - Single clean chevron Month & Year dropdowns
 * - Solid teal selected date circle with white text
 * - Soft teal hover states (bg-sky-50 text-sky-900)
 */
export const CustomDatePicker = ({
  value,
  onChange,
  minDate,
  maxDate,
  placeholder = "Select date",
  disabled = false,
  required = false,
  className = "",
  id,
  name,
  error = false,
  inputRef,
  placement = "auto",
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [resolvedPlacement, setResolvedPlacement] = useState(placement);
  const containerRef = useRef(null);
  const internalInputRef = useRef(null);
  const activeInputRef = inputRef || internalInputRef;

  // Determine if popper should open upwards or downwards
  useEffect(() => {
    if (placement === "top") {
      setResolvedPlacement("top");
    } else if (placement === "bottom") {
      setResolvedPlacement("bottom");
    } else if (showDatePicker && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      if (spaceBelow < 380 && rect.top > 320) {
        setResolvedPlacement("top");
      } else {
        setResolvedPlacement("bottom");
      }
    }
  }, [placement, showDatePicker]);

  // Normalize / Parse Date safely into local Date without UTC offset issues
  const parseDate = (val) => {
    if (!val) return null;
    if (val instanceof Date) return isNaN(val.getTime()) ? null : val;
    if (typeof val === "string") {
      const parts = val.split("T")[0].split("-");
      if (parts.length === 3) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        const d = parseInt(parts[2], 10);
        return new Date(y, m, d);
      }
      const parsed = new Date(val);
      return isNaN(parsed.getTime()) ? null : parsed;
    }
    return null;
  };

  const selectedDate = parseDate(value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Evaluate effective min/max bounds
  const getEffectiveMinDate = () => {
    if (!minDate) return null;
    if (minDate === "today") return new Date(today);
    if (minDate === "tomorrow") {
      const d = new Date(today);
      d.setDate(d.getDate() + 1);
      return d;
    }
    const parsed = parseDate(minDate);
    if (parsed) parsed.setHours(0, 0, 0, 0);
    return parsed;
  };

  const getEffectiveMaxDate = () => {
    if (!maxDate) return null;
    if (maxDate === "today") {
      const d = new Date(today);
      d.setHours(23, 59, 59, 999);
      return d;
    }
    const parsed = parseDate(maxDate);
    if (parsed) parsed.setHours(23, 59, 59, 999);
    return parsed;
  };

  const effectiveMinDate = getEffectiveMinDate();
  const effectiveMaxDate = getEffectiveMaxDate();

  const minYear = effectiveMinDate ? effectiveMinDate.getFullYear() : today.getFullYear() - 100;
  const maxYear = effectiveMaxDate ? effectiveMaxDate.getFullYear() : today.getFullYear() + 20;

  // Active view year and month
  const [viewYear, setViewYear] = useState(() => {
    if (selectedDate) return selectedDate.getFullYear();
    if (effectiveMinDate && effectiveMinDate > today) return effectiveMinDate.getFullYear();
    return today.getFullYear();
  });

  const [viewMonth, setViewMonth] = useState(() => {
    if (selectedDate) return selectedDate.getMonth();
    if (effectiveMinDate && effectiveMinDate > today) return effectiveMinDate.getMonth();
    return today.getMonth();
  });

  useEffect(() => {
    if (selectedDate) {
      setViewYear(selectedDate.getFullYear());
      setViewMonth(selectedDate.getMonth());
    }
  }, [value]);

  // Click outside listener to close dropdown
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowDatePicker(false);
      }
    };
    if (showDatePicker) {
      document.addEventListener("mousedown", handleOutsideClick);
      document.addEventListener("touchstart", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [showDatePicker]);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const yearOptions = [];
  for (let y = maxYear; y >= minYear; y--) {
    yearOptions.push(y);
  }

  const isPrevMonthDisabled = Boolean(
    effectiveMinDate &&
      (viewYear < effectiveMinDate.getFullYear() ||
        (viewYear === effectiveMinDate.getFullYear() && viewMonth <= effectiveMinDate.getMonth()))
  );

  const isNextMonthDisabled = Boolean(
    effectiveMaxDate &&
      (viewYear > effectiveMaxDate.getFullYear() ||
        (viewYear === effectiveMaxDate.getFullYear() && viewMonth >= effectiveMaxDate.getMonth()))
  );

  const prevMonth = (e) => {
    e?.stopPropagation?.();
    if (isPrevMonthDisabled) return;
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const nextMonth = (e) => {
    e?.stopPropagation?.();
    if (isNextMonthDisabled) return;
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const isMonthDisabled = (mIdx) => {
    if (effectiveMaxDate && viewYear === effectiveMaxDate.getFullYear() && mIdx > effectiveMaxDate.getMonth()) {
      return true;
    }
    if (effectiveMinDate && viewYear === effectiveMinDate.getFullYear() && mIdx < effectiveMinDate.getMonth()) {
      return true;
    }
    return false;
  };

  const handleYearChange = (newYear) => {
    let newMonth = viewMonth;
    if (effectiveMaxDate && newYear === effectiveMaxDate.getFullYear() && newMonth > effectiveMaxDate.getMonth()) {
      newMonth = effectiveMaxDate.getMonth();
    }
    if (effectiveMinDate && newYear === effectiveMinDate.getFullYear() && newMonth < effectiveMinDate.getMonth()) {
      newMonth = effectiveMinDate.getMonth();
    }
    setViewYear(newYear);
    setViewMonth(newMonth);
  };

  const isDayDisabled = (day) => {
    const targetDate = new Date(viewYear, viewMonth, day);
    targetDate.setHours(0, 0, 0, 0);

    if (effectiveMaxDate && targetDate > effectiveMaxDate) return true;
    if (effectiveMinDate && targetDate < effectiveMinDate) return true;

    return false;
  };

  const handleSelectDay = (day, e) => {
    e?.stopPropagation?.();
    if (isDayDisabled(day)) return;
    const m = (viewMonth + 1).toString().padStart(2, "0");
    const d = day.toString().padStart(2, "0");
    const formatted = `${viewYear}-${m}-${d}`;
    onChange(formatted);
    setShowDatePicker(false);
  };

  const handleClear = (e) => {
    e?.stopPropagation?.();
    onChange("");
    setShowDatePicker(false);
  };

  const handleSelectToday = (e) => {
    e?.stopPropagation?.();
    const todayDay = today.getDate();
    if (isDayDisabled(todayDay)) return;
    const m = (today.getMonth() + 1).toString().padStart(2, "0");
    const d = todayDay.toString().padStart(2, "0");
    const formatted = `${today.getFullYear()}-${m}-${d}`;
    onChange(formatted);
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    setShowDatePicker(false);
  };

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  const isToday = (day) => {
    return (
      today.getFullYear() === viewYear &&
      today.getMonth() === viewMonth &&
      today.getDate() === day
    );
  };

  const isSelected = (day) => {
    if (!selectedDate) return false;
    return (
      selectedDate.getFullYear() === viewYear &&
      selectedDate.getMonth() === viewMonth &&
      selectedDate.getDate() === day
    );
  };

  const formatDisplay = (val) => {
    if (!val) return "";
    const d = parseDate(val);
    if (!d) return val;
    return d.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleTriggerClick = () => {
    if (disabled) return;
    setShowDatePicker((prev) => !prev);
    if (activeInputRef.current?.showPicker) {
      try {
        // Safe check for native showPicker if applicable
      } catch {
        // ignore
      }
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Click-Anywhere Date Input Container */}
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={handleTriggerClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleTriggerClick();
          } else if (e.key === "Escape" && showDatePicker) {
            setShowDatePicker(false);
          }
        }}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-left text-sm transition cursor-pointer select-none ${
          error
            ? "border-red-400 bg-red-50/20 text-red-900 focus:ring-2 focus:ring-red-200"
            : "bg-slate-50 border-slate-200 hover:bg-white hover:border-[#008ba3] focus:outline-none focus:ring-2 focus:ring-[#008ba3]/20 focus:border-[#008ba3]"
        } ${disabled ? "opacity-50 cursor-not-allowed bg-slate-100" : ""} ${className}`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <CalendarIcon className="w-4 h-4 text-[#008ba3] shrink-0" />
          <span className={value ? "text-slate-800 font-medium truncate" : "text-slate-400 truncate"}>
            {value ? formatDisplay(value) : placeholder}
          </span>
        </div>

        {value && !disabled ? (
          <button
            type="button"
            onClick={handleClear}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-md transition cursor-pointer"
            title="Clear date"
            aria-label="Clear date"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
        )}
      </div>

      {/* Hidden real input for form compatibility & ref access */}
      <input
        ref={activeInputRef}
        type="hidden"
        id={id}
        name={name}
        value={value || ""}
        required={required}
        readOnly
      />

      {/* Calendar Dropdown Popper */}
      {showDatePicker && (
        <div
          className={`absolute z-50 p-4 bg-white rounded-2xl shadow-2xl border border-slate-100 w-72 sm:w-80 ${
            resolvedPlacement === "top"
              ? "bottom-full mb-2 right-0 left-auto sm:right-0"
              : "top-full mt-2 left-0 right-auto sm:right-auto"
          } animate-in fade-in-50 zoom-in-95 duration-150`}
          style={{
            minWidth: "290px",
            ...(resolvedPlacement === "top"
              ? { bottom: "100%", marginBottom: "8px" }
              : { top: "100%", marginTop: "8px" }),
          }}
        >
          {/* Header Navigation with Month & Year Selectors */}
          <div className="flex items-center justify-between mb-3.5 gap-1.5 pb-3 border-b border-slate-100">
            <button
              type="button"
              onClick={prevMonth}
              disabled={isPrevMonthDisabled}
              className={`p-1.5 rounded-lg text-slate-600 transition ${
                isPrevMonthDisabled
                  ? "opacity-25 cursor-not-allowed"
                  : "hover:bg-sky-50 hover:text-[#008ba3] cursor-pointer"
              }`}
              title="Previous Month"
              aria-label="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Month & Year Selectors with Clean Single Chevrons */}
            <div className="flex items-center gap-2">
              {/* Month Selector */}
              <div className="relative">
                <select
                  value={viewMonth}
                  onChange={(e) => setViewMonth(parseInt(e.target.value, 10))}
                  style={{
                    appearance: "none",
                    WebkitAppearance: "none",
                    MozAppearance: "none",
                    backgroundImage: "none",
                  }}
                  className="appearance-none bg-slate-50 hover:bg-sky-50/60 border border-slate-200 text-slate-800 text-xs font-bold py-1.5 pl-3 pr-7 rounded-xl cursor-pointer focus:outline-none focus:border-[#008ba3] focus:ring-1 focus:ring-[#008ba3] transition"
                >
                  {months.map((m, idx) => (
                    <option key={m} value={idx} disabled={isMonthDisabled(idx)}>
                      {m}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Year Selector */}
              <div className="relative">
                <select
                  value={viewYear}
                  onChange={(e) => handleYearChange(parseInt(e.target.value, 10))}
                  style={{
                    appearance: "none",
                    WebkitAppearance: "none",
                    MozAppearance: "none",
                    backgroundImage: "none",
                  }}
                  className="appearance-none bg-slate-50 hover:bg-sky-50/60 border border-slate-200 text-slate-800 text-xs font-bold py-1.5 pl-3 pr-7 rounded-xl cursor-pointer focus:outline-none focus:border-[#008ba3] focus:ring-1 focus:ring-[#008ba3] transition"
                >
                  {yearOptions.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <button
              type="button"
              onClick={nextMonth}
              disabled={isNextMonthDisabled}
              className={`p-1.5 rounded-lg text-slate-600 transition ${
                isNextMonthDisabled
                  ? "opacity-25 cursor-not-allowed"
                  : "hover:bg-sky-50 hover:text-[#008ba3] cursor-pointer"
              }`}
              title="Next Month"
              aria-label="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((dayName) => (
              <div
                key={dayName}
                className="text-[11px] font-bold text-slate-400 uppercase py-0.5 tracking-wider"
              >
                {dayName}
              </div>
            ))}
          </div>

          {/* Day Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {/* Blank leading days */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="w-8 h-8 mx-auto" />
            ))}

            {/* Days in Month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const disabledDay = isDayDisabled(dayNum);
              const selected = isSelected(dayNum);
              const todayMatch = isToday(dayNum);

              let btnClass = "w-8 h-8 rounded-full text-xs font-medium flex items-center justify-center mx-auto transition-all ";

              if (disabledDay) {
                btnClass += "text-slate-300 opacity-30 cursor-not-allowed pointer-events-none";
              } else if (selected) {
                btnClass += "bg-[#008ba3] text-white font-bold shadow-sm cursor-pointer";
              } else if (todayMatch) {
                btnClass += "border-2 border-[#008ba3] text-[#008ba3] font-bold hover:bg-sky-50 hover:text-sky-900 cursor-pointer";
              } else {
                btnClass += "text-slate-700 hover:bg-sky-50 hover:text-sky-900 cursor-pointer";
              }

              return (
                <button
                  key={dayNum}
                  type="button"
                  disabled={disabledDay}
                  onClick={(e) => handleSelectDay(dayNum, e)}
                  className={btnClass}
                >
                  {dayNum}
                </button>
              );
            })}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 text-xs">
            <button
              type="button"
              onClick={handleClear}
              className="text-slate-400 hover:text-slate-700 font-medium transition cursor-pointer"
            >
              Clear
            </button>

            {minDate === "today" || minDate === "tomorrow" || (effectiveMinDate && effectiveMinDate > today) ? (
              <span className="text-[11px] font-medium text-slate-400">
                Future travel dates only
              </span>
            ) : (
              <button
                type="button"
                onClick={handleSelectToday}
                disabled={isDayDisabled(today.getDate())}
                className="text-[#008ba3] hover:text-[#0e7490] font-bold transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Today
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDatePicker;
