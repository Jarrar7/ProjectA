import React, { useState } from 'react';

const CourseScheduleTable = ({ schedule, participants, onBack }) => {
    const [activeTab, setActiveTab] = useState('schedule');

    return (
        <div>
            <button onClick={onBack} className="mb-4 text-blue-500">
                &larr; Back to Courses
            </button>

            <div className="mb-4">
                <button
                    onClick={() => setActiveTab('schedule')}
                    className={`mr-4 px-4 py-2 rounded ${activeTab === 'schedule' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                    Course Schedule
                </button>
                <button
                    onClick={() => setActiveTab('participants')}
                    className={`px-4 py-2 rounded ${activeTab === 'participants' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                    Course Participants
                </button>
            </div>

            {activeTab === 'schedule' && (
                <div>
                    <h2 className="text-2xl font-bold mb-4">Course Schedule</h2>
                    <table className="min-w-full bg-white shadow-md rounded-lg">
                        <thead>
                            <tr>
                                <th className="py-2 px-4 border-b">Date</th>
                                <th className="py-2 px-4 border-b">Hours of Lecture</th>
                                <th className="py-2 px-4 border-b">Room</th>
                            </tr>
                        </thead>
                        <tbody>
                            {schedule && schedule.length > 0 ? (
                                schedule.map((entry, index) => (
                                    <tr key={index}>
                                        <td className="py-2 px-4 border-b">{`${entry.date} (${entry.dayOfWeek})`}</td>
                                        <td className="py-2 px-4 border-b">{entry.hours}</td>
                                        <td className="py-2 px-4 border-b">{entry.room}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td className="py-2 px-4 text-center" colSpan="3">No schedule available</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'participants' && (
                <div>
                    <h2 className="text-2xl font-bold mb-4">Course Participants</h2>
                    <table className="min-w-full bg-white shadow-md rounded-lg">
                        <thead>
                            <tr>
                                <th className="py-2 px-4 border-b">Name</th>
                            </tr>
                        </thead>
                        <tbody>
                            {participants && participants.length > 0 ? (
                                participants.map((participant, index) => (
                                    <tr key={index}>
                                        <td className="py-2 px-4 border-b">{participant.name}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td className="py-2 px-4 text-center">No participants available</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default CourseScheduleTable;
