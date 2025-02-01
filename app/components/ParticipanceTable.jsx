import React from "react";

// Function to format date with day of the week in dd/mm/yy format
const formatDateWithDay = (dateStr) => {
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, '0'); // Ensuring 2-digit day
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-indexed
    const year = date.getFullYear().toString().slice(-2); // Get last 2 digits of the year
    const weekday = date.toLocaleString('en-US', { weekday: 'short' });

    return `${day}/${month}/${year} ${weekday}`; // Return formatted date
};


const ParticipanceTable = ({ data, onBack }) => {
    return (
        <div>
            <button onClick={onBack} className="mb-4 text-blue-500 dark:text-blue-400">
                &larr; Back to Courses
            </button>

            <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
                    Participation Records
                </h2>
                <table className="min-w-full bg-white dark:bg-gray-900 shadow-md rounded-lg">
                    <thead className="bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-100">
                        <tr>
                            <th className="py-2 px-4 border-b text-center">Date</th>
                            <th className="py-2 px-4 border-b text-center">Time</th>
                            <th className="py-2 px-4 border-b text-center">Room</th>
                            <th className="py-2 px-4 border-b text-center">Attended Hours</th>
                            <th className="py-2 px-4 border-b text-center">Total Hours</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data && data.length > 0 ? (
                            data.map((entry, index) => {
                                const isAttendedFull = entry.attended_hours === entry.total_hours;
                                return (
                                    <tr
                                        key={index}
                                        className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                                    >
                                        <td className="py-2 px-4 border-b text-center text-gray-800 dark:text-gray-200">
                                            {formatDateWithDay(entry.date)}
                                        </td>
                                        <td className="py-2 px-4 border-b text-center text-gray-800 dark:text-gray-200">
                                            {entry.start_time} - {entry.end_time}
                                        </td>
                                        <td className="py-2 px-4 border-b text-center text-gray-800 dark:text-gray-200">
                                            {entry.room}
                                        </td>
                                        <td
                                            className={`py-2 px-4 border-b text-center ${isAttendedFull ? "text-green-500" : "text-red-500"
                                                }`}
                                        >
                                            {entry.attended_hours}
                                        </td>
                                        <td className="py-2 px-4 border-b text-center text-gray-800 dark:text-gray-200">
                                            {entry.total_hours}
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td
                                    className="py-2 px-4 text-center text-gray-700 dark:text-gray-300"
                                    colSpan="5"
                                >
                                    No participation records available
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

};

export default ParticipanceTable;
