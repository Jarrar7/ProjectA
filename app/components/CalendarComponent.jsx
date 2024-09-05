"use client";
import 'react-calendar/dist/Calendar.css'; 
import Calendar from 'react-calendar';
import { useState } from 'react';

export default function CalendarComponent({ events, selectedDate, onDateChange }) {
    return (
        <div className="calendar-content flex flex-col items-center">
            <h2 className="text-2xl font-bold mb-4">Calendar</h2>
            <div className="flex flex-col items-center justify-center w-full">
                <div className="w-full md:w-1/2 lg:w-1/3 mb-8">
                    <Calendar
                        onChange={onDateChange}
                        value={selectedDate}
                        className="bg-white shadow-lg rounded-lg"
                    />
                </div>
                <div className="w-full md:w-1/2 lg:w-1/3">
                    <h3 className="font-semibold mb-2">Events on {selectedDate.toDateString()}:</h3>
                    <ul className="space-y-2">
                        {events[selectedDate.toISOString().slice(0, 10)]?.map((event, index) => (
                            <li key={index} className="bg-white p-4 rounded-lg shadow-md">
                                {event}
                            </li>
                        )) || <p>No events</p>}
                    </ul>
                </div>
            </div>
        </div>
    );
}
