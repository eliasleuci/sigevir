import { useState, useRef, useEffect } from 'react';
import { HiOutlineCalendar } from 'react-icons/hi';
import dayjs from 'dayjs';

const DatePicker = ({
  value,
  onChange,
  label,
  minDate,
  maxDate,
  placeholder = 'Seleccionar fecha',
  className = '',
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(value ? dayjs(value) : dayjs());
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const daysInMonth = viewDate.daysInMonth();
  const firstDayOfMonth = viewDate.startOf('month').day();
  const today = dayjs().format('YYYY-MM-DD');
  const selected = value ? dayjs(value).format('YYYY-MM-DD') : null;

  const handleSelect = (day) => {
    const date = viewDate.date(day).format('YYYY-MM-DD');
    onChange?.(date);
    setIsOpen(false);
  };

  const prevMonth = () => setViewDate(viewDate.subtract(1, 'month'));
  const nextMonth = () => setViewDate(viewDate.add(1, 'month'));

  const isDisabled = (day) => {
    const date = viewDate.date(day);
    if (minDate && date.isBefore(dayjs(minDate), 'day')) return true;
    if (maxDate && date.isAfter(dayjs(maxDate), 'day')) return true;
    return false;
  };

  const displayValue = value ? dayjs(value).format('DD/MM/YYYY') : '';

  return (
    <div className={`relative ${className}`} ref={ref}>
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
      )}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center gap-2 px-3 py-2.5 border rounded-lg text-sm transition-all ${
          error ? 'border-red-300' : 'border-gray-300'
        } ${value ? 'text-gray-900' : 'text-gray-400'} hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500`}
      >
        <HiOutlineCalendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
        <span className="flex-1 text-left">{displayValue || placeholder}</span>
      </button>

      {error && <p className="mt-1 text-xs text-red-600 font-medium">{error}</p>}

      {isOpen && (
        <div className="absolute top-full mt-1 left-0 bg-white border border-gray-200 rounded-xl shadow-xl z-50 p-3 w-64">
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1 hover:bg-gray-100 rounded-lg text-gray-500"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-sm font-semibold text-gray-700">
              {viewDate.format('MMMM YYYY')}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="p-1 hover:bg-gray-100 rounded-lg text-gray-500"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-7 gap-0.5 text-center mb-1">
            {['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'].map((d) => (
              <div key={d} className="text-[11px] font-semibold text-gray-400 py-1">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0.5">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
              const dateStr = viewDate.date(day).format('YYYY-MM-DD');
              const disabled = isDisabled(day);
              const isSelected = selected === dateStr;
              const isToday = today === dateStr;

              return (
                <button
                  key={day}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleSelect(day)}
                  className={`text-sm py-1 rounded-lg transition-colors ${
                    isSelected
                      ? 'bg-blue-600 text-white font-semibold'
                      : isToday
                      ? 'bg-blue-50 text-blue-600 font-semibold'
                      : disabled
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePicker;
