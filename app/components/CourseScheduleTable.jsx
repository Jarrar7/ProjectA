import React, { useState } from 'react';

const CourseScheduleTable = ({ schedule, participants, onBack }) => {
    const [activeTab, setActiveTab] = useState('schedule');
    const [showModal, setShowModal] = useState(false); // To handle modal visibility
    const [selectedRow, setSelectedRow] = useState(null); // To store the data of the selected row

    // Function to handle the "Edit" button click
    const handleEditClick = (entry) => {
        setSelectedRow(entry); // Set the row data
        setShowModal(true); // Show the modal
    };

    return (
        <div>
            {/* Back to Courses Button */}
            {!showModal && (
                <button onClick={onBack} className="mb-4 text-blue-500">
                    &larr; Back to Courses
                </button>
            )}

            {/* Tab Switcher */}
            {!showModal && (
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
            )}

            {/* Modal for Editing */}
            {showModal && selectedRow && (
                <div className="modal-overlay">
                    <div className="mt-4">
                        <button onClick={() => setShowModal(false)} className="mb-4 text-blue-500">
                            &larr; Back to Course Schedule
                        </button>
                    </div>
                    <div className="modal">
                        <h2 className="text-2xl font-bold mb-6">Upload Attendance Photos</h2>
                        <p><strong>Date:</strong> {selectedRow.date} ({selectedRow.dayOfWeek})</p>
                        <p><strong>Hours of Lecture:</strong> {selectedRow.hours}</p>
                        <p><strong>Room:</strong> {selectedRow.room}</p>

                        <div className="mt-8">
                            <label htmlFor="file-upload" className="block mb-4 font-bold text-left">
                                Upload Photos:
                            </label>
                            <div className="flex justify-center">
                                <input
                                    type="file"
                                    id="file-upload"
                                    className="mt-2 p-8 border border-gray-300 rounded-lg w-3/4"
                                />
                            </div>
                        </div>

                        <div className="mt-4 flex justify-center">
                            <button className="mt-4 bg-blue-500 text-white py-2 px-6 rounded-lg">
                                Upload
                            </button>
                        </div>
                    </div>
                </div>
            )}



            {/* Tab Content */}
            {!showModal && activeTab === 'schedule' && ( // Only show the table if modal is not open
                <div>
                    <h2 className="text-2xl font-bold mb-4">Course Schedule</h2>
                    <table className="min-w-full bg-white shadow-md rounded-lg">
                        <thead>
                            <tr>
                                <th className="py-2 px-4 border-b">Date</th>
                                <th className="py-2 px-4 border-b">Hours of Lecture</th>
                                <th className="py-2 px-4 border-b">Room</th>
                                <th className="py-2 px-4 border-b">Upload Photos</th>
                            </tr>
                        </thead>
                        <tbody>
                            {schedule && schedule.length > 0 ? (
                                schedule.map((entry, index) => (
                                    <tr key={index}>
                                        <td className="py-2 px-4 border-b text-center">{`${entry.date} (${entry.dayOfWeek})`}</td>
                                         <td className="py-2 px-4 border-b text-center">{entry.hours}</td>
                                         <td className="py-2 px-4 border-b text-center">{entry.room}</td>
                                         <td className="py-2 px-4 border-b text-center">
                                            <button
                                                className="btn btn-primary"
                                                onClick={() => handleEditClick(entry)} // Trigger the edit functionality
                                            >
                                                Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td className="py-2 px-4 text-center" colSpan="4">No schedule available</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'participants' && !showModal && ( // Show participants table only if modal is not open
                <div>
                    <h2 className="text-2xl font-bold mb-4">Course Participants</h2>
                    <table className="min-w-full bg-white shadow-md rounded-lg">
                        <thead>
                            <tr>
                                <th className="py-2 px-4 border-b">ID</th>
                                <th className="py-2 px-4 border-b">Name</th>
                                <th className="py-2 px-4 border-b">Attendance</th>
                                <th className="py-2 px-4 border-b">Edit Attendance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {participants && participants.length > 0 ? (
                                participants.map((participant, index) => (
                                    <tr key={index}>
                                        <td className="py-2 px-4 border-b text-center">{participant.id}</td>
                                        <td className="py-2 px-4 border-b text-center">{participant.name}</td>
                                        <td className="py-2 px-4 border-b text-center">{participant.attendance}</td>
                                        <td className="py-2 px-4 border-b text-center">
                                            <button
                                                className="btn btn-primary"
                                                onClick={() => handleEditClick(entry)} // Trigger the edit functionality
                                            >
                                                Edit
                                            </button>
                                        </td>   
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td className="py-2 px-4 text-center" colSpan="1">No participants available</td>
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
