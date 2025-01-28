import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import CsvUploader from "./CsvUploader";

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
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessageSession, setErrorMessageSession] = useState("");
    const [successMessageSession, setSuccessMessageSession] = useState("");
    const [sessions, setSessions] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newSession, setNewSession] = useState({
        date: "",
        start_time: "",
        end_time: "",
        room: "",
    });

    const handleAddStudent = async () => {
        setErrorMessage("");
        setSuccessMessage("");

        if (!studentId) {
            setErrorMessage("Please enter a valid Student ID.");
            return;
        }

        try {
            await onAddStudent(studentId, selectedCourse.id); // Pass studentId as is
            //setSuccessMessage("Student added successfully.");
            setStudentId("");
        } catch (error) {
            setErrorMessage(error.message || "Error adding student.");
        }
    };

    const handleRemoveStudent = async (studentId) => {
        try {
            await onRemoveStudent(studentId, selectedCourse.id);
        } catch (error) {
            setErrorMessage(error.message || "Error removing student.");
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
        setErrorMessageSession("");
        setSuccessMessageSession("");

        if (!newSession.date || !newSession.start_time || !newSession.end_time || !newSession.room) {
            setErrorMessageSession("Please fill in all the fields.");
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
                setErrorMessageSession(error.message || "Error adding session.");
            } else {
                // Re-fetch sessions from the database after insertion
                const { data: refreshedSessions, error: fetchError } = await supabase
                    .from("class_sessions")
                    .select("*")
                    .eq("course_id", selectedCourse.id);

                if (fetchError) {
                    setErrorMessageSession(fetchError.message || "Error fetching updated sessions.");
                } else {
                    setSessions(refreshedSessions); // Update sessions with the latest data
                    setSuccessMessageSession("Session added successfully.");
                    setNewSession({ date: "", start_time: "", end_time: "", room: "" }); // Reset form fields
                    setIsModalOpen(false); // Close the modal
                }
            }
        } catch (error) {
            setErrorMessageSession(error.message || "Error adding session.");
        }
    };

    const handleDelete = async (sessionId) => {
        const { error } = await supabase
            .from("class_sessions")
            .delete()
            .eq("id", sessionId);

        if (error) {
            console.error("Error deleting session:", error);
        } else {
            setSessions((prevSessions) =>
                prevSessions.filter((session) => session.id !== sessionId)
            );
        }
    };

    return (
        <div className="p-6 bg-gray-50 rounded-lg shadow-lg">
            <button onClick={onBack} className="text-blue-600 font-semibold mb-6 hover:underline">
                Back to Courses
            </button>

            <h2 className="text-3xl font-bold text-gray-800 mb-2">{selectedCourse.course_name}</h2>

            <div className="border-t-4 border-gray-300 pt-6 mb-5 mt-5"></div>

            <h3 className="text-xl font-semibold text-gray-800 mb-2">Course Details</h3>
            <div className="grid grid-cols-1 justify-between  sm:grid-cols-3 ">
                <p className="text-gray-600 mb-1">Code: {selectedCourse.course_code}</p>
                <p className="text-gray-600 mb-1">Year: {selectedCourse.year}</p>
                <p className="text-gray-600 mb-4">Semester: {selectedCourse.semester}</p>
            </div>

            <div className="border-t-4 border-gray-300 pt-6 mb-5 mt-5"></div>

            <h3 className="text-xl font-semibold text-gray-800 mb-2">Teacher(s)</h3>

            {teacher ? (
                <p className="text-gray-700 mb-4">
                    {teacher.firstName} {teacher.lastName} ({teacher.human_id})
                </p>
            ) : (
                <p className="text-red-500 mb-4">No teacher assigned.</p>
            )}

            <div className="border-t-4 border-gray-300 pt-6 mb-5 mt-5"></div>

            <h3 className="text-xl font-semibold text-gray-800 mb-2">Manage Sessions</h3>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border-collapse shadow-md rounded-lg">
                    <thead className="bg-gray-200 text-gray-800">
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
                                    <tr key={session.id} className="hover:bg-gray-100">
                                        <td className="py-3 px-4 border-b">{session.date}</td>
                                        <td className="py-3 px-4 border-b">{hoursOfLecture}</td>
                                        <td className="py-3 px-4 border-b">{session.room}</td>
                                        <td className="py-3 px-4 border-b">
                                            <button
                                                onClick={() => handleDelete(session.id)}
                                                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
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
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mt-4"
                    >
                        Add Session
                    </button>
                </div>

                {errorMessageSession && <p className="text-red-500 mt-2">{errorMessageSession}</p>}
                {successMessageSession && <p className="text-green-500 mt-2">{successMessageSession}</p>}

                {/* Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white p-6 rounded shadow-lg w-96">
                            <h3 className="text-lg font-semibold mb-4">Add New Session</h3>
                            <div className="space-y-4">
                                <input
                                    type="date"
                                    value={newSession.date}
                                    onChange={(e) =>
                                        setNewSession({ ...newSession, date: e.target.value })
                                    }
                                    className="border p-2 rounded w-full"
                                    placeholder="Date"
                                />
                                <input
                                    type="time"
                                    value={newSession.start_time}
                                    onChange={(e) =>
                                        setNewSession({ ...newSession, start_time: e.target.value })
                                    }
                                    className="border p-2 rounded w-full"
                                    placeholder="Start Time"
                                />
                                <input
                                    type="time"
                                    value={newSession.end_time}
                                    onChange={(e) =>
                                        setNewSession({ ...newSession, end_time: e.target.value })
                                    }
                                    className="border p-2 rounded w-full"
                                    placeholder="End Time"
                                />
                                <input
                                    type="text"
                                    value={newSession.room}
                                    onChange={(e) =>
                                        setNewSession({ ...newSession, room: e.target.value })
                                    }
                                    className="border p-2 rounded w-full"
                                    placeholder="Room"
                                />
                            </div>
                            <div className="flex justify-end space-x-4 mt-4">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddSession}
                                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                                >
                                    Add Session
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="border-t-4 border-gray-300 pt-6 mb-5 mt-5"></div>

            <h3 className="text-xl font-semibold text-gray-800 mb-2">Bulk Add Students</h3>

            {/* CSV Upload Component */}
            <CsvUploader
                courseId={selectedCourse.id}
                onStudentsAdded={(newStudents) => {
                    onUpdateEnrolledStudents([...enrolledStudents, ...newStudents]); // Notify parent of the update
                }}
            />

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-2">Add Student</h3>
            <div className="flex items-center gap-4 mt-2">
                <input
                    type="text"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="Enter Student ID"
                    className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    onClick={handleAddStudent}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                    Add Student
                </button>

            </div>
            {errorMessage && <p className="text-red-500 mt-2">{errorMessage}</p>}
            {successMessage && <p className="text-green-500 mt-2">{successMessage}</p>}

            <div className="border-t-4 border-gray-300 pt-6 mb-5 mt-5"></div>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-2">Enrolled Students</h3>
            {enrolledStudents.length > 0 ? (
                <ul className="space-y-2 mt-2">
                    {enrolledStudents.map((student, index) =>
                        student ? (
                            <li
                                key={index}
                                className="flex justify-between items-center border p-2 rounded bg-gray-100 hover:bg-gray-200"
                            >
                                <span className="text-gray-700">
                                    {student.firstName} {student.lastName} ({student.human_id})
                                </span>
                                <button
                                    onClick={() => handleRemoveStudent(student.student_id, selectedCourse.id)}
                                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                                >
                                    Remove
                                </button>
                            </li>
                        ) : (
                            <li key={index} className="text-red-500">Student data unavailable</li>
                        )
                    )}
                </ul>
            ) : (
                <p className="text-red-500 mt-2">No students enrolled.</p>
            )}
        </div>
    );
}


