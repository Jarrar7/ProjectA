"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import EditableParticipanceTable from "./EditableParticipanceTable";

const EditAttendanceModal = ({ student, courseId, onClose }) => {
    const [attendanceData, setAttendanceData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAttendanceRecords = async () => {
            if (!student.id || !courseId) {
                console.error("Missing student ID or course ID");
                return;
            }

            try {
                setLoading(true);

                // Fetch attendance records for the student
                const { data: attendanceRecords, error: attendanceError } = await supabase
                    .from("attendance_records")
                    .select("session_id, attended_hours, total_hours")
                    .eq("student_id", student.id);

                if (attendanceError) {
                    console.error("Error fetching attendance records:", attendanceError.message);
                    return;
                }

                // Fetch sessions for the specific course
                const { data: sessions, error: sessionError } = await supabase
                    .from("class_sessions")
                    .select("id, date, start_time, end_time, room")
                    .eq("course_id", courseId); // Use the correct courseId prop

                if (sessionError) {
                    console.error("Error fetching session data:", sessionError.message);
                    return;
                }

                // Map attendance records to sessions
                const attendanceWithSessions = attendanceRecords
                    .map((record) => {
                        const session = sessions.find((s) => s.id === record.session_id);
                        return session
                            ? {
                                ...record,
                                date: session.date,
                                start_time: session.start_time,
                                end_time: session.end_time,
                                room: session.room,
                            }
                            : null;
                    })
                    .filter(Boolean);

                setAttendanceData(attendanceWithSessions);
            } catch (err) {
                console.error("Error fetching attendance records:", err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAttendanceRecords();
    }, [student.id, courseId]); // Use courseId instead of student.course_id

    const saveAttendanceChanges = async (updatedData) => {
        try {
            const updates = updatedData.map(({ session_id, attended_hours, total_hours }) => ({
                session_id,
                attended_hours,
                total_hours, // Include the total_hours field
                student_id: student.id, // Include student ID for upserting
            }));

            const { error } = await supabase
                .from("attendance_records")
                .upsert(updates, {
                    onConflict: ["session_id", "student_id"], // Specify composite keys
                });

            if (error) {
                console.error("Error saving attendance changes:", error.message);
                alert("Failed to save changes.");
                return;
            }

            alert("Attendance updated successfully!");
            onClose(); // Close modal after saving
        } catch (err) {
            console.error("Error saving attendance changes:", err.message);
        }
    };



    return (
        <div className="modal-overlay">
            <div className="modal">
                <button onClick={onClose} className="mb-4 text-blue-500">
                    &larr; Back to Courses
                </button>
                <h2 className="text-2xl font-bold mb-6">
                    Edit Attendance for {student.name}
                </h2>
                {loading ? (
                    <div className="loading-container">
                        <div className="spinner"></div>
                        <p>Loading...</p>
                    </div>
                ) : (
                    <EditableParticipanceTable
                        data={attendanceData}
                        onSave={saveAttendanceChanges}
                        onCancel={onClose}
                    />
                )}
            </div>
        </div>
    );
};

export default EditAttendanceModal;
