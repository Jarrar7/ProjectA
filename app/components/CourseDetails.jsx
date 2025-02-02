import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import CsvUploader from "./CsvUploader";
import { toast } from "react-toastify";


export default function CourseDetails({
    selectedCourse,
    enrolledStudents,
    teacher,
    onBack,
    onAddStudent, // Handler passed from ManageCourses
    onRemoveStudent,
    onUpdateEnrolledStudents
}) {
    const [studentId, setStudentId] = useState("");
    const [editedCourseCode, setEditedCourseCode] = useState(selectedCourse.course_code);
    const [editedYear, setEditedYear] = useState(selectedCourse.year);
    const [editedSemester, setEditedSemester] = useState(selectedCourse.semester);
    const [sessions, setSessions] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newSession, setNewSession] = useState({
        date: "",
        start_time: "",
        end_time: "",
        room: "",
    });

    const handleSaveCourseDetails = async () => {
        try {
            const { error } = await supabase
                .from("courses")
                .update({
                    course_code: editedCourseCode,
                    year: editedYear,
                    semester: editedSemester
                })
                .eq("id", selectedCourse.id);

            if (error) {
                console.error("Error updating course details:", error.message);
                toast.error("Failed to update course details.");
            } else {
                toast.success("Course details updated successfully!");
            }
        } catch (err) {
            console.error("Error saving course details:", err);
        }
    };


    const handleAddStudent = async () => {

        if (!studentId) {
            toast.error("Please enter a valid Student ID.");
            return;
        }

        try {
            await onAddStudent(studentId, selectedCourse.id); // Pass studentId as is
            toast.success("Student added successfully.");
            setStudentId("");
        } catch (error) {
            toast.error(error.message || "Error adding student.");
        }
    };

    const handleRemoveStudent = async (studentId) => {
        try {
            await onRemoveStudent(studentId, selectedCourse.id);
        } catch (error) {
            toast.error(error.message || "Error removing student.");
        }
    };

    useEffect(() => {
        const fetchSessions = async () => {
            if (!selectedCourse?.id) return;

            const { data, error } = await supabase
                .from("class_sessions")
                .select("id, date, start_time, end_time, room")
                .eq("course_id", selectedCourse.id);

            if (error) {
                console.error("Error fetching sessions:", error);
            } else {
                console.log("Fetched sessions:", data); // Log the sessions
                setSessions(data);
            }
        };

        fetchSessions();
    }, [selectedCourse]);


    const handleAddSession = async () => {


        if (!newSession.date || !newSession.start_time || !newSession.end_time || !newSession.room) {
            toast.error("Please fill in all the fields.");
            return;
        }

        try {
            // Insert the new session into the database
            const { data, error } = await supabase.from("class_sessions").insert([
                {
                    course_id: selectedCourse.id,
                    date: newSession.date,
                    start_time: newSession.start_time,
                    end_time: newSession.end_time,
                    room: newSession.room,
                },
            ]);

            if (error) {
                toast.error(error.message || "Error adding session.");
            } else {
                // Re-fetch sessions from the database after insertion
                const { data: refreshedSessions, error: fetchError } = await supabase
                    .from("class_sessions")
                    .select("*")
                    .eq("course_id", selectedCourse.id);

                if (fetchError) {
                    toast.error(fetchError.message || "Error fetching updated sessions.");
                } else {
                    setSessions(refreshedSessions); // Update sessions with the latest data
                    toast.success("Session added successfully.");
                    setNewSession({ date: "", start_time: "", end_time: "", room: "" }); // Reset form fields
                    setIsModalOpen(false); // Close the modal
                }
            }
        } catch (error) {
            toast.error(error.message || "Error adding session.");
        }
    };

    const handleDelete = async (sessionId) => {
        const { error } = await supabase
            .from("class_sessions")
            .delete()
            .eq("id", sessionId);

        if (error) {
            toast.error("Error deleting session:", error);
        } else {
            setSessions((prevSessions) =>
                prevSessions.filter((session) => session.id !== sessionId)
            );
            toast.success("Session Removed Successfully")
        }
    };

    return (
        <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-lg transition-all">
            <button onClick={onBack} className="text-blue-600 dark:text-blue-400 font-semibold mb-6 hover:underline">
                Back to Courses
            </button>

            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                {selectedCourse.course_name}
            </h2>

            <div className="border-t-4 border-gray-300 dark:border-gray-600 pt-6 mb-5 mt-5"></div>

            {/* Course Details */}
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                Course Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Editable Course Code */}
                <div>
                    <label className="text-gray-600 dark:text-gray-300">Course Code:</label>
                    <input
                        type="text"
                        value={editedCourseCode}
                        onChange={(e) => setEditedCourseCode(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white py-2 px-3 shadow-sm"
                    />
                </div>

                {/* Editable Year */}
                <div>
                    <label className="text-gray-600 dark:text-gray-300">Year:</label>
                    <input
                        type="number"
                        value={editedYear}
                        onChange={(e) => setEditedYear(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white py-2 px-3 shadow-sm"
                    />
                </div>

                {/* Editable Semester */}
                <div>
                    <label className="text-gray-600 dark:text-gray-300">Semester:</label>
                    <select
                        value={editedSemester}
                        onChange={(e) => setEditedSemester(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white py-2 px-3 shadow-sm"
                    >
                        <option value="1">Semester 1</option>
                        <option value="2">Semester 2</option>
                    </select>
                </div>
            </div>

            {/* Save Changes Button */}
            <button
                onClick={handleSaveCourseDetails}
                className="mt-4 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-500 dark:bg-blue-700 dark:hover:bg-blue-600"
            >
                Save Changes
            </button>


            <div className="border-t-4 border-gray-300 dark:border-gray-600 pt-6 mb-5 mt-5"></div>

            {/* Teacher Details */}
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Teacher(s)</h3>
            {teacher ? (
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                    {teacher.firstName} {teacher.lastName} ({teacher.human_id})
                </p>
            ) : (
                <p className="text-red-500 dark:text-red-400 mb-4">No teacher assigned.</p>
            )}

            <div className="border-t-4 border-gray-300 dark:border-gray-600 pt-6 mb-5 mt-5"></div>

            {/* Add Session Section */}
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Manage Sessions</h3>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white dark:bg-gray-900 border-collapse shadow-md rounded-lg">
                    <thead className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white">
                        <tr>
                            <th className="py-3 px-4 border-b text-left">Date</th>
                            <th className="py-3 px-4 border-b text-left">Hours of Lecture</th>
                            <th className="py-3 px-4 border-b text-left">Room</th>
                            <th className="py-3 px-4 border-b text-left">Delete</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sessions.length > 0 ? (
                            sessions.map((session) => {
                                const hoursOfLecture = `${session.start_time} - ${session.end_time}`;
                                return (
                                    <tr key={session.id} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                                        <td className="py-3 px-4 border-b">{session.date}</td>
                                        <td className="py-3 px-4 border-b">{hoursOfLecture}</td>
                                        <td className="py-3 px-4 border-b">{session.room}</td>
                                        <td className="py-3 px-4 border-b">
                                            <button
                                                onClick={() => handleDelete(session.id)}
                                                className="bg-red-500 dark:bg-red-600 text-white px-3 py-1 rounded hover:bg-red-600 dark:hover:bg-red-700"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td className="py-3 px-4 border-b text-center" colSpan={4}>
                                    No sessions found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                <div className="flex justify-end">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-green-500 dark:bg-green-600 text-white px-4 py-2 rounded hover:bg-green-600 dark:hover:bg-green-700 mt-4"
                    >
                        Add Session
                    </button>
                </div>

                {/* Add Session Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white dark:bg-gray-900 p-6 rounded shadow-lg w-96">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Add New Session</h3>
                            <div className="space-y-4">
                                <input
                                    type="date"
                                    value={newSession.date}
                                    onChange={(e) => setNewSession({ ...newSession, date: e.target.value })}
                                    className="border dark:border-gray-600 dark:bg-gray-700 dark:text-white p-2 rounded w-full"
                                />
                                <input
                                    type="time"
                                    value={newSession.start_time}
                                    onChange={(e) => setNewSession({ ...newSession, start_time: e.target.value })}
                                    className="border dark:border-gray-600 dark:bg-gray-700 dark:text-white p-2 rounded w-full"
                                />
                                <input
                                    type="time"
                                    value={newSession.end_time}
                                    onChange={(e) => setNewSession({ ...newSession, end_time: e.target.value })}
                                    className="border dark:border-gray-600 dark:bg-gray-700 dark:text-white p-2 rounded w-full"
                                />
                                <input
                                    type="text"
                                    placeholder="Room"
                                    value={newSession.room}
                                    onChange={(e) => setNewSession({ ...newSession, room: e.target.value })}
                                    className="border dark:border-gray-600 dark:bg-gray-700 dark:text-white p-2 rounded w-full"
                                />
                            </div>
                            <div className="flex justify-end space-x-4 mt-4">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="bg-gray-300 dark:bg-gray-600 px-4 py-2 rounded hover:bg-gray-400 dark:hover:bg-gray-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddSession}
                                    className="bg-green-500 dark:bg-green-600 text-white px-4 py-2 rounded hover:bg-green-600 dark:hover:bg-green-700"
                                >
                                    Add Session
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="border-t-4 border-gray-300 dark:border-gray-600 pt-6 mb-5 mt-5"></div>

            {/* Bulk Add Students */}
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Bulk Add Students</h3>
            <CsvUploader
                courseId={selectedCourse.id}
                onStudentsAdded={(newStudents) => {
                    onUpdateEnrolledStudents([...enrolledStudents, ...newStudents]);
                }}
            />

            <div className="border-t-4 border-gray-300 dark:border-gray-600 pt-6 mb-5 mt-5"></div>

            {/* Add Student */}
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mt-6 mb-2">Add Student</h3>
            <div className="flex items-center gap-4 mt-2">
                <input
                    type="text"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="Enter Student ID"
                    className="border dark:border-gray-600 dark:bg-gray-700 dark:text-white p-2 rounded w-full focus:ring-blue-500"
                />
                <button
                    onClick={handleAddStudent}
                    className="bg-green-500 dark:bg-green-600 text-white px-4 py-2 rounded hover:bg-green-600 dark:hover:bg-green-700"
                >
                    Add Student
                </button>
            </div>

            <div className="border-t-4 border-gray-300 dark:border-gray-600 pt-6 mb-5 mt-5"></div>

            {/* Enrolled Students */}
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mt-6 mb-2">Enrolled Students</h3>
            {enrolledStudents.length > 0 ? (
                <ul className="space-y-2 mt-2">
                    {enrolledStudents.map((student, index) =>
                        student ? (
                            <li
                                key={index}
                                className="flex justify-between items-center border p-2 rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                            >
                                <span className="text-gray-700 dark:text-white">
                                    {student.firstName} {student.lastName} ({student.human_id})
                                </span>
                                <button
                                    onClick={() => handleRemoveStudent(student.student_id, selectedCourse.id)}
                                    className="bg-red-500 dark:bg-red-600 text-white px-3 py-1 rounded hover:bg-red-600 dark:hover:bg-red-700"
                                >
                                    Remove
                                </button>
                            </li>
                        ) : (
                            <li key={index} className="text-red-500 dark:text-red-400">Student data unavailable</li>
                        )
                    )}
                </ul>
            ) : (
                <p className="text-red-500 dark:text-red-400 mt-2">No students enrolled.</p>
            )}
        </div>
    );

}

