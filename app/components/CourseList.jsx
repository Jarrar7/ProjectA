export default function CourseList({
    courses,
    searchTerm,
    setSearchTerm,
    yearFilter,
    semesterFilter,
    onSelectCourse,
    onAddCourse,
    onEditCourse,
    onDeleteCourse,
}) {
    // Filter courses based on the search term, year, and semester filters
    const filteredCourses = courses.filter((course) => {
        const matchesSearchTerm = course.course_name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesYear = yearFilter ? course.year === parseInt(yearFilter) : true;
        const matchesSemester = semesterFilter ? course.semester === parseInt(semesterFilter) : true;

        return matchesSearchTerm && matchesYear && matchesSemester;
    });

    return (
        <div>
            {/* Search Input */}
            <div className="flex items-center mb-4">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search courses..."
                    className="border p-2 rounded w-full mr-4"
                />
                <button
                    onClick={onAddCourse}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                    Add Course
                </button>
            </div>

            {/* Courses List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course) => (
                    <div key={course.id} className="bg-white shadow-md rounded-lg p-6 relative">
                        <h2 className="font-bold text-xl mb-2">{course.course_name}</h2>
                        <p className="text-gray-700 mb-1">Code: {course.course_code}</p>
                        <p className="text-gray-700 mb-1">Year: {course.year}</p>
                        <p className="text-gray-700 mb-4">Semester: {course.semester}</p>
                        <div className="flex space-x-4">
                            <button
                                onClick={() => onSelectCourse(course)}
                                className="text-blue-500 hover:underline"
                            >
                                View Details
                            </button>
                            <button
                                onClick={() => onEditCourse(course)}
                                className="text-yellow-500 hover:underline"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => onDeleteCourse(course.id)}
                                className="text-red-500 hover:underline"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
