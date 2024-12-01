import React, { useState } from 'react';

const ParticipanceTable = ({ data, onBack }) => {
    const [activeTab, setActiveTab] = useState('participation');

    return (
        <div>
            <button onClick={onBack} className="mb-4 text-blue-500">
                &larr; Back to Courses
            </button>

            <div>
                <h2 className="text-2xl font-bold mb-4">Participation Records</h2>
                <table className="min-w-full bg-white shadow-md rounded-lg">
                    <thead>
                        <tr>
                            <th className="py-2 px-4 border-b text-center">Date</th>
                            <th className="py-2 px-4 border-b text-center">Hours of Lecture</th>
                            <th className="py-2 px-4 border-b text-center">Room</th>
                            <th className="py-2 px-4 border-b text-center">Participation</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data && data.length > 0 ? (
                            data.map((entry, index) => {
                                const isAttendedFull = entry.attendedHours === entry.totalHours;
                                return (
                                    <tr key={index}>
                                        <td className="py-2 px-4 border-b text-center">{`${entry.date} (${entry.dayOfWeek})`}</td>
                                        <td className="py-2 px-4 border-b text-center">{entry.hours}</td>
                                        <td className="py-2 px-4 border-b text-center">{entry.room}</td>
                                        <td 
                                            className={`py-2 px-4 border-b text-center ${isAttendedFull ? 'text-green-500' : 'text-red-500'}`}
                                        >
                                            {`${entry.attendedHours}/${entry.totalHours}`}
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td className="py-2 px-4 text-center" colSpan="4">No participation records available</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ParticipanceTable;
