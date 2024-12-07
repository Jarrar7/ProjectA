export default function CourseDetails({ selectedCourse, enrolledStudents, teacher, onBack }) {
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
            <h3 className="text-lg font-semibold mt-4">Enrolled Students</h3>
            {enrolledStudents.length > 0 ? (
                <ul className="list-disc ml-6">
                    {enrolledStudents.map((student, index) =>
                        student ? (
                            <li key={index} className="text-gray-700">
                                {student.firstName} {student.lastName} ({student.human_id})
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
}
