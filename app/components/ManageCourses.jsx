"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import YearSemesterFilter from "./YearSemesterFilter";

export default function ManageCourses() {
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [enrolledStudents, setEnrolledStudents] = useState([]);
    const [teacher, setTeacher] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        course_name: "",
        course_code: "",
        year: "",
        semester: "",
        teacher_id: "",
    });
    const [yearFilter, setYearFilter] = useState("");
    const [semesterFilter, setSemesterFilter] = useState("");

    // Fetch courses on component mount
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const { data: coursesData, error } = await supabase.from("courses").select("*");
                if (error) throw error;
                setCourses(coursesData);
            } catch (error) {
                console.error("Error fetching courses:", error.message);
            }
        };
        fetchCourses();
    }, []);

    // Handle selecting a course to view its details
    const handleSelectCourse = async (course) => {
        setSelectedCourse(course);
        try {
            // Fetch enrolled students
            const { data: studentsData, error: studentsError } = await supabase
                .from("enrollments")
                .select("student_id, profiles:student_id(firstName, lastName, human_id)")
                .eq("course_id", course.id);
            if (studentsError) throw studentsError;

            // Map enrolled student profiles
            setEnrolledStudents(studentsData.map((enrollment) => enrollment.profiles || null));

            // Fetch teacher details
            const { data: teacherData, error: teacherError } = await supabase
                .from("profiles")
                .select("firstName, lastName, human_id")
                .eq("id", course.teacher_id)
                .maybeSingle();
            if (teacherError) throw teacherError;

            setTeacher(teacherData || null);
        } catch (error) {
            console.error("Error fetching course details:", error.message);
        }
    };

    // Handle clearing selected course
    const handleBack = () => {
        setSelectedCourse(null);
        setEnrolledStudents([]);
        setTeacher(null);
    };

    // Handle opening the modal for adding or editing a course
    const handleOpenModal = (course = null) => {
        setIsModalOpen(true);
        if (course) {
            setFormData({
                course_name: course.course_name,
                course_code: course.course_code,
                year: course.year,
                semester: course.semester,
                teacher_id: course.teacher_id,
            });
        } else {
            setFormData({
                course_name: "",
                course_code: "",
                year: "",
                semester: "",
                teacher_id: "",
            });
        }
    };

    // Handle closing the modal
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setFormData({
            course_name: "",
            course_code: "",
            year: "",
            semester: "",
            teacher_id: "",
        });
    };

    // Handle adding or editing a course
    const handleSaveCourse = async () => {
        try {
            if (selectedCourse) {
                // Edit course
                const { error } = await supabase
                    .from("courses")
                    .update(formData)
                    .eq("id", selectedCourse.id);
                if (error) throw error;
                setCourses((prevCourses) =>
                    prevCourses.map((course) =>
                        course.id === selectedCourse.id ? { ...course, ...formData } : course
                    )
                );
            } else {
                // Add course
                const { data, error } = await supabase.from("courses").insert(formData);
                if (error) throw error;
                setCourses((prevCourses) => [...prevCourses, ...data]);
            }
            handleCloseModal();
        } catch (error) {
            console.error("Error saving course:", error.message);
        }
    };

    // Handle deleting a course
    const handleDeleteCourse = async (id) => {
        const confirmDelete = confirm("Are you sure you want to delete this course?");
        if (confirmDelete) {
            try {
                const { error } = await supabase.from("courses").delete().eq("id", id);
                if (error) throw error;
                setCourses((prevCourses) => prevCourses.filter((course) => course.id !== id));
            } catch (error) {
                console.error("Error deleting course:", error.message);
            }
        }
    };

    // Filter courses based on search term, year, and semester
    const filteredCourses = courses.filter((course) => {
        return (
            course.course_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
            (yearFilter ? course.year === parseInt(yearFilter) : true) &&
            (semesterFilter ? course.semester === parseInt(semesterFilter) : true)
        );
    });

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Manage Courses</h1>
            <YearSemesterFilter
                selectedYear={yearFilter}
                setSelectedYear={setYearFilter}
                selectedSemester={semesterFilter}
                setSelectedSemester={setSemesterFilter}
            />
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
                    onClick={() => handleOpenModal()}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                    Add Course
                </button>
            </div>

            {!selectedCourse ? (
                // Display Courses List
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCourses.map((course) => (
                        <div key={course.id} className="bg-white shadow-md rounded-lg p-6 relative">
                            <h2 className="font-bold text-xl mb-2">{course.course_name}</h2>
                            <p className="text-gray-700 mb-1">Code: {course.course_code}</p>
                            <p className="text-gray-700 mb-1">Year: {course.year}</p>
                            <p className="text-gray-700 mb-4">Semester: {course.semester}</p>
                            <div className="flex space-x-4">
                                <button
                                    onClick={() => handleSelectCourse(course)}
                                    className="text-blue-500 hover:underline"
                                >
                                    View Details
                                </button>
                                <button
                                    onClick={() => handleOpenModal(course)}
                                    className="text-yellow-500 hover:underline"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDeleteCourse(course.id)}
                                    className="text-red-500 hover:underline"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                // Display Selected Course Details
                <div>
                    <button onClick={handleBack} className="text-blue-500 underline mb-4">
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
            )}

            {/* Modal for Add/Edit Course */}
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="bg-black opacity-50 absolute inset-0" onClick={handleCloseModal}></div>
                    <div className="bg-white p-6 rounded-lg shadow-lg z-10 w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-4">{selectedCourse ? "Edit Course" : "Add Course"}</h2>
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-1">Course Name</label>
                            <input
                                type="text"
                                value={formData.course_name}
                                onChange={(e) => setFormData({ ...formData, course_name: e.target.value })}
                                className="border p-2 rounded w-full"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-1">Course Code</label>
                            <input
                                type="text"
                                value={formData.course_code}
                                onChange={(e) => setFormData({ ...formData, course_code: e.target.value })}
                                className="border p-2 rounded w-full"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-1">Year</label>
                            <input
                                type="number"
                                value={formData.year}
                                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                                className="border p-2 rounded w-full"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-1">Semester</label>
                            <input
                                type="number"
                                value={formData.semester}
                                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                                className="border p-2 rounded w-full"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-1">Teacher ID</label>
                            <input
                                type="text"
                                value={formData.teacher_id}
                                onChange={(e) => setFormData({ ...formData, teacher_id: e.target.value })}
                                className="border p-2 rounded w-full"
                            />
                        </div>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={handleCloseModal}
                                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveCourse}
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}