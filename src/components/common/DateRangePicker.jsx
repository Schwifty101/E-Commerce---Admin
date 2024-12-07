import React from 'react';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

const DateRangePicker = ({ onChange, className }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [range, setRange] = React.useState({ from: undefined, to: undefined });

  const handleSelect = (date) => {
    const newRange = {
      ...range,
      ...(range.from && !range.to ? { to: date } : { from: date, to: undefined })
    };
    setRange(newRange);
    
    if (newRange.from && newRange.to) {
      onChange(newRange);
      setIsOpen(false);
    }
  };

  const formatRange = () => {
    if (!range.from) return 'Select date range';
    if (!range.to) return `From ${format(range.from, 'MMM d, yyyy')}`;
    return `${format(range.from, 'MMM d, yyyy')} - ${format(range.to, 'MMM d, yyyy')}`;
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <Calendar className="w-4 h-4 mr-2" />
        {formatRange()}
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 bg-white rounded-md shadow-lg p-4">
          <DayPicker
            mode="range"
            selected={range}
            onSelect={handleSelect}
            numberOfMonths={2}
            defaultMonth={range.from}
            styles={{
              caption: { color: '#374151' },
              head_cell: { color: '#6B7280' },
              cell: { padding: '0.5rem' },
              button: { 
                margin: '0.1rem',
                borderRadius: '0.375rem',
                color: '#374151'
              },
              button_selected: { 
                backgroundColor: '#3B82F6',
                color: 'white'
              }
            }}
          />
          <div className="mt-4 flex justify-end space-x-2">
            <button
              onClick={() => {
                setRange({ from: undefined, to: undefined });
                onChange({ from: null, to: null });
                setIsOpen(false);
              }}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
            >
              Clear
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="px-3 py-1 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker; 