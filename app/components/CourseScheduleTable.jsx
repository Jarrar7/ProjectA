"use client";
import { useState } from "react";
import FileUploadComponent from "./FileUploadComponent";
import EditAttendanceModal from "./EditAttendanceModal";
import { supabase } from "../../lib/supabaseClient";

const CourseScheduleTable = ({ schedule, participants, onBack, selectedCourse }) => {
    const [activeTab, setActiveTab] = useState("schedule");
    const [showEditAttendanceModal, setShowEditAttendanceModal] = useState(false);
    const [showFileUploadModal, setShowFileUploadModal] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [uploading, setUploading] = useState(false);

    // Handle attendance editing
    const handleEditAttendance = (student) => {
        setSelectedStudent(student);
        setShowEditAttendanceModal(true);
    };

    // Handle the "Edit" button click for a session
    const handleEditClickCourse = (row) => {
        setSelectedRow(row);
        setShowFileUploadModal(true);
    };

    // Close modals
    const closeEditAttendanceModal = () => {
        setShowEditAttendanceModal(false);
        setSelectedStudent(null);
    };

    const closeFileUploadModal = () => {
        setShowFileUploadModal(false);
        setSelectedRow(null);
    };

    // Save file paths to the `uploaded_images` table in Supabase and update attendance
    const saveFilePathsToDatabase = async (sessionId, filePaths) => {
        try {
            console.log("Saving file paths to database:", { sessionId, filePaths });

            setUploading(true);

            // Save file paths to the uploaded_images table
            const insertData = filePaths.map((filePath) => ({
                session_id: sessionId,
                file_path: filePath,
            }));

            const { error: insertError } = await supabase.from("uploaded_images").insert(insertData);
            if (insertError) {
                console.error("Error saving file paths to database:", insertError.message);
                throw new Error("Failed to save file paths to the database.");
            }

            console.log("File paths saved successfully.");

            // Call the attendance update API
            const response = await fetch("/api/auth/attendance", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ session_id: sessionId, photo_urls: filePaths }),
            });

            if (!response.ok) {
                console.error("Error updating attendance:", response.statusText);
                throw new Error("Failed to update attendance.");
            }

            console.log("Attendance updated successfully.");
            alert("Images uploaded and attendance updated successfully!");
        } catch (error) {
            console.error("Error during upload and attendance update:", error.message);
            alert(error.message || "An error occurred while processing the uploaded files.");
        } finally {
            setUploading(false);
            closeFileUploadModal(); // Close the modal
        }
    };

    return (
        <div>
            {/* Back to Courses Button */}
            {!showEditAttendanceModal && !showFileUploadModal && (
                <button onClick={onBack} className="mb-4 text-blue-500 dark:text-blue-400">
                    &larr; Back to Courses
                </button>
            )}

            {/* Tab Switcher */}
            {!showEditAttendanceModal && !showFileUploadModal && (
                <div className="mb-4">
                    <button
                        onClick={() => setActiveTab("schedule")}
                        className={`mr-4 px-4 py-2 rounded ${activeTab === "schedule"
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                            }`}
                    >
                        Course Schedule
                    </button>
                    <button
                        onClick={() => setActiveTab("participants")}
                        className={`px-4 py-2 rounded ${activeTab === "participants"
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                            }`}
                    >
                        Course Participants
                    </button>
                </div>
            )}

            {/* Course Schedule Table */}
            {!showEditAttendanceModal && !showFileUploadModal && activeTab === "schedule" && (
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Course Schedule</h2>
                    <table className="min-w-full bg-white dark:bg-gray-900 shadow-md rounded-lg">
                        <thead className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100">
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
                                    <tr key={index} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                                        <td className="py-2 px-4 border-b text-center">{entry.date}</td>
                                        <td className="py-2 px-4 border-b text-center">{`${entry.start_time} - ${entry.end_time}`}</td>
                                        <td className="py-2 px-4 border-b text-center">{entry.room}</td>
                                        <td className="py-2 px-4 border-b text-center">
                                            <button
                                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                                onClick={() => handleEditClickCourse(entry)}
                                            >
                                                Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td className="py-2 px-4 text-center dark:text-gray-300" colSpan="4">
                                        No schedule available
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Course Participants Table */}
            {!showEditAttendanceModal && !showFileUploadModal && activeTab === "participants" && (
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Course Participants</h2>
                    <table className="min-w-full bg-white dark:bg-gray-900 shadow-md rounded-lg">
                        <thead className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100">
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
                                    <tr key={index} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                                        <td className="py-2 px-4 border-b text-center">{participant.human_id}</td>
                                        <td className="py-2 px-4 border-b text-center">{participant.name}</td>
                                        <td className="py-2 px-4 border-b text-center">{participant.attendance}</td>
                                        <td className="py-2 px-4 border-b text-center">
                                            <button
                                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                                onClick={() => handleEditAttendance(participant)}
                                            >
                                                Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td className="py-2 px-4 text-center dark:text-gray-300" colSpan="4">
                                        No participants available
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal for Editing Attendance */}
            {showEditAttendanceModal && selectedStudent && (
                <EditAttendanceModal
                    student={selectedStudent}
                    courseId={selectedCourse?.id || null}
                    onClose={closeEditAttendanceModal}
                />
            )}

            {/* Modal for Uploading Photos */}
            {showFileUploadModal && selectedRow && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg w-full max-w-md">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
                            Upload Attendance Photos
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300">
                            <strong>Date:</strong> {selectedRow.date}
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                            <strong>Hours of Lecture:</strong> {selectedRow.start_time} - {selectedRow.end_time}
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                            <strong>Room:</strong> {selectedRow.room}
                        </p>

                        <FileUploadComponent
                            sessionId={selectedRow.id}
                            onFilesUploaded={(uploadedPaths) =>
                                saveFilePathsToDatabase(selectedRow.id, uploadedPaths)
                            }
                        />

                        <button
                            onClick={closeFileUploadModal}
                            className="mt-4 text-blue-500 dark:text-blue-400"
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
