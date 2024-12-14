import { useState } from "react";
import FileUploadComponent from "./FileUploadComponent";
import { supabase } from "../../lib/supabaseClient";

const CourseScheduleTable = ({ schedule, participants, onBack }) => {
    const [activeTab, setActiveTab] = useState("schedule");
    const [showModal, setShowModal] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const [uploading, setUploading] = useState(false);

    // Handle the "Edit" button click for a session
    const handleEditClickCourse = (entry) => {
        setSelectedRow(entry);
        setShowModal(true);
    };

    // Save file paths to the `uploaded_images` table in Supabase
    const saveFilePathsToDatabase = async (sessionId, filePaths) => {
        try {
            console.log("Saving file paths to database:", { sessionId, filePaths }); // Debugging

            setUploading(true);

            const insertData = filePaths.map((filePath) => ({
                session_id: sessionId,
                file_path: filePath,
            }));

            const { data, error } = await supabase.from("uploaded_images").insert(insertData);

            if (error) {
                console.error("Error saving file paths to database:", error.message);
                throw error;
            }

            console.log("File paths saved to database:", data); // Debugging
            alert("Images uploaded successfully!");
        } catch (error) {
            console.error("Failed to save images to the database:", error.message);
            alert("Failed to save images to the database.");
        } finally {
            setUploading(false);
            setShowModal(false); // Close modal after saving
        }
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
                        onClick={() => setActiveTab("schedule")}
                        className={`mr-4 px-4 py-2 rounded ${activeTab === "schedule" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"
                            }`}
                    >
                        Course Schedule
                    </button>
                    <button
                        onClick={() => setActiveTab("participants")}
                        className={`px-4 py-2 rounded ${activeTab === "participants" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"
                            }`}
                    >
                        Course Participants
                    </button>
                </div>
            )}

            {/* Course Schedule Table */}
            {!showModal && activeTab === "schedule" && (
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
                                        <td className="py-2 px-4 border-b text-center">{entry.date}</td>
                                        <td className="py-2 px-4 border-b text-center">{`${entry.start_time} - ${entry.end_time}`}</td>
                                        <td className="py-2 px-4 border-b text-center">{entry.room}</td>
                                        <td className="py-2 px-4 border-b text-center">
                                            <button
                                                className="btn btn-primary"
                                                onClick={() => handleEditClickCourse(entry)}
                                            >
                                                Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td className="py-2 px-4 text-center" colSpan="4">
                                        No schedule available
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Course Participants Table */}
            {!showModal && activeTab === "participants" && (
                <div>
                    <h2 className="text-2xl font-bold mb-4">Course Participants</h2>
                    <table className="min-w-full bg-white shadow-md rounded-lg">
                        <thead>
                            <tr>
                                <th className="py-2 px-4 border-b">ID</th>
                                <th className="py-2 px-4 border-b">Name</th>
                                <th className="py-2 px-4 border-b">Attendance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {participants && participants.length > 0 ? (
                                participants.map((participant, index) => (
                                    <tr key={index}>
                                        <td className="py-2 px-4 border-b text-center">{participant.human_id}</td>
                                        <td className="py-2 px-4 border-b text-center">{participant.name}</td>
                                        <td className="py-2 px-4 border-b text-center">{participant.attendance}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td className="py-2 px-4 text-center" colSpan="3">
                                        No participants available
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}


            {/* Modal for Uploading Photos */}
            {showModal && selectedRow && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2 className="text-2xl font-bold mb-6">Upload Attendance Photos</h2>
                        <p>
                            <strong>Date:</strong> {selectedRow.date}
                        </p>
                        <p>
                            <strong>Hours of Lecture:</strong> {selectedRow.start_time} - {selectedRow.end_time}
                        </p>
                        <p>
                            <strong>Room:</strong> {selectedRow.room}
                        </p>

                        <FileUploadComponent
                            sessionId={selectedRow.id}
                            onFilesUploaded={(uploadedPaths) => saveFilePathsToDatabase(selectedRow.id, uploadedPaths)}
                        />

                        <button
                            onClick={() => setShowModal(false)}
                            className="mt-4 text-blue-500"
                            disabled={uploading}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseScheduleTable;
