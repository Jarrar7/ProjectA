// Updated CourseDetails Component
import { useState } from "react";

export default function CourseDetails({
    selectedCourse,
    enrolledStudents,
    teacher,
    onBack,
    onAddStudent, // Handler passed from ManageCourses
    onRemoveStudent
}) {
    const [studentId, setStudentId] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

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


    return (
        <div>
            <button onClick={onBack} className="text-blue-500 underline mb-4">
                Back to Courses
            </button>

            <h2 className="text-2xl font-bold mt-4 mb-2">{selectedCourse.course_name}</h2>
            <p className="text-gray-700 mb-1">Code: {selectedCourse.course_code}</p>
            <p className="text-gray-700 mb-1">Year: {selectedCourse.year}</p>
            <p className="text-gray-700 mb-4">Semester: {selectedCourse.semester}</p>

            <h3 className="text-lg font-semibold mt-4">Teacher</h3>
            {teacher ? (
                <p className="text-gray-700">
                    {teacher.firstName} {teacher.lastName} ({teacher.human_id})
                </p>
            ) : (
                <p className="text-red-500">No teacher assigned.</p>
            )}

            <h3 className="text-lg font-semibold mt-4">Add Student</h3>
            <div className="flex items-center space-x-4 mt-2">
                <input
                    type="text"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="Enter Student ID"
                    className="border p-2 rounded w-full"
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

            <h3 className="text-lg font-semibold mt-4">Enrolled Students</h3>
            {enrolledStudents.length > 0 ? (
                <ul className="space-y-2"> {/* Add spacing between list items */}
                    {enrolledStudents.map((student, index) =>
                        student ? (
                            <li
                                key={index}
                                className="flex justify-between items-center border p-2 rounded bg-gray-100"
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
                <p className="text-red-500">No students enrolled.</p>
            )}

        </div>
    );
};

