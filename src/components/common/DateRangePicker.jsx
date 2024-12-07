import React from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const DateRangePicker = ({ dateRange, onChange }) => {
    return (
        <div className="flex items-center gap-2">
            <div className="relative">
                <DatePicker
                    selected={dateRange.startDate}
                    onChange={date => onChange({ ...dateRange, startDate: date })}
                    selectsStart
                    startDate={dateRange.startDate}
                    endDate={dateRange.endDate}
                    className="rounded-md border border-gray-300 px-3 py-2 text-sm"
                    placeholderText="Start Date"
                />
            </div>
            <span className="text-gray-500">to</span>
            <div className="relative">
                <DatePicker
                    selected={dateRange.endDate}
                    onChange={date => onChange({ ...dateRange, endDate: date })}
                    selectsEnd
                    startDate={dateRange.startDate}
                    endDate={dateRange.endDate}
                    minDate={dateRange.startDate}
                    className="rounded-md border border-gray-300 px-3 py-2 text-sm"
                    placeholderText="End Date"
                />
            </div>
        </div>
    );
};

export default DateRangePicker; 