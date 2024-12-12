import { useState } from 'react';


const CourseScheduleTable = ({ schedule, participants, onBack }) => {
    const [activeTab, setActiveTab] = useState('schedule');
    const [showModal, setShowModal] = useState(false); // To handle modal visibility for courses
    const [selectedRow, setSelectedRow] = useState(null); // To store the data of the selected row
    const [showParticipantModal, setShowParticipantModal] = useState(false); // To control participant modal
    const [selectedParticipant, setSelectedParticipant] = useState(null); // Store selected participant data

    // Function to handle the "Edit" button click from the course table
    const handleEditClickCourse = (entry) => {
        setSelectedRow(entry); // Set the row data for course schedule
        setShowModal(true); // Show the modal for course schedule
    };

    // Function to handle the "Edit" button click from the participants table
    const handleEditClickParticipant = (participant) => {
        setSelectedParticipant(participant); // Set the selected participant data
        setShowParticipantModal(true); // Show the modal for editing participant attendance
    };

    // Handle changes to attendedHours
    const handleAttendanceChange = (index, newAttendedHours) => {
        const updatedSchedule = [...schedule];
        updatedSchedule[index].attendedHours = newAttendedHours;
        onUpdateSchedule(updatedSchedule); // Call a parent function that updates the state
    };

    // Handle saving changes
    const handleSaveChanges = () => {
        console.log("Updated Schedule:", schedule);
        // Optionally, send updated schedule to the backend or perform additional actions here
    };

    return (
        <div>
            {/* Back to Courses Button */}
            {!showModal && !showParticipantModal && (
                <button onClick={onBack} className="mb-4 text-blue-500">
                    &larr; Back to Courses
                </button>
            )}

            {/* Tab Switcher */}
            {!showModal && !showParticipantModal && (
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

            {/* Modal for Editing Course Schedule */}
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

            {/* Modal for Editing Participant Attendance */}
            {showParticipantModal && selectedParticipant && (
                <div className="modal-overlay">
                    <div className="mt-4">
                        <button onClick={() => setShowParticipantModal(false)} className="mb-4 text-blue-500">
                            &larr; Back to Course Participants
                        </button>
                    </div>
                    <div className="modal">
                        <h2 className="text-2xl font-bold mb-6">Edit Attendance Manually</h2>
                        <p><strong>ID:</strong> {selectedParticipant.id}</p>
                        <p><strong>Name:</strong> {selectedParticipant.name}</p>

                        <h3 className="text-xl font-semibold mb-4">Attendance</h3>
                        <table className="min-w-full bg-white shadow-md rounded-lg">
                            <thead>
                                <tr>
                                    <th className="py-2 px-4 border-b">Date</th>
                                    <th className="py-2 px-4 border-b">Attendance</th>
                                </tr>
                            </thead>
                            <tbody>
                                {schedule.map((entry, index) => {
                                    const { attendedHours, totalHours, date, dayOfWeek } = entry;
                                    const isComplete = attendedHours === totalHours;

                                    return (
                                        <tr key={index}>
                                            <td className="py-2 px-4 border-b text-center">{`${date} (${dayOfWeek})`}</td>
                                            <td className="py-2 px-4 border-b text-center">
                                                <input
                                                    type="number"
                                                    value={entry.attendedHours}
                                                    min="0"
                                                    max={totalHours}
                                                    className={`w-16 text-center ${isComplete ? "text-green-500" : "text-red-500"
                                                        }`}
                                                    onChange={(e) => handleAttendanceChange(index, parseInt(e.target.value))}
                                                />
                                                /{totalHours}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        <div className="mt-4 flex justify-center">
                            <button
                                className="mt-4 bg-blue-500 text-white py-2 px-6 rounded-lg"
                                onClick={handleSaveChanges}
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}



            {/* Course Schedule Table */}
            {!showModal && activeTab === 'schedule' && (
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
                                                onClick={() => handleEditClickCourse(entry)} // Trigger the edit functionality for course
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

            {/* Course Participants Table */}
            {activeTab === 'participants' && !showModal && !showParticipantModal && (
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
                                                onClick={() => handleEditClickParticipant(participant)} // Trigger the edit functionality for participants
                                            >
                                                Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td className="py-2 px-4 text-center" colSpan="4">No participants available</td>
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
