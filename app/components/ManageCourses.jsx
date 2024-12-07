"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import YearSemesterFilter from "./YearSemesterFilter";
import CourseList from "./CourseList";
import CourseDetails from "./CourseDetails";
import CourseModal from "./CourseModal";

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

    const handleSelectCourse = async (course) => {
        setSelectedCourse(course);
        try {
            const { data: studentsData, error: studentsError } = await supabase
                .from("enrollments")
                .select("student_id, profiles:student_id(firstName, lastName, human_id)")
                .eq("course_id", course.id);
            if (studentsError) throw studentsError;
            setEnrolledStudents(studentsData.map((enrollment) => enrollment.profiles || null));

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

    const handleBack = () => {
        setSelectedCourse(null);
        setEnrolledStudents([]);
        setTeacher(null);
    };

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

    const handleSaveCourse = async () => {
        try {
            if (selectedCourse) {
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
                const { data, error } = await supabase.from("courses").insert(formData).select("*");
                if (error) throw error;

                // Ensure the data is an array (since we're adding a single course)
                if (Array.isArray(data)) {
                    setCourses((prevCourses) => [...prevCourses, ...data]);
                } else if (data) {
                    setCourses((prevCourses) => [...prevCourses, data]);
                }

            }
            handleCloseModal();
        } catch (error) {
            console.error("Error saving course:", error.message);
        }
    };

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

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Manage Courses</h1>
            <YearSemesterFilter
                selectedYear={yearFilter}
                setSelectedYear={setYearFilter}
                selectedSemester={semesterFilter}
                setSelectedSemester={setSemesterFilter}
            />
            {!selectedCourse ? (
                <CourseList
                    courses={courses}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    yearFilter={yearFilter}
                    semesterFilter={semesterFilter}
                    onSelectCourse={handleSelectCourse}
                    onAddCourse={() => handleOpenModal()}
                    onEditCourse={handleOpenModal}
                    onDeleteCourse={handleDeleteCourse}
                />
            ) : (
                <CourseDetails
                    selectedCourse={selectedCourse}
                    enrolledStudents={enrolledStudents}
                    teacher={teacher}
                    onBack={handleBack}
                />
            )}
            {isModalOpen && (
                <CourseModal
                    formData={formData}
                    setFormData={setFormData}
                    onSaveCourse={handleSaveCourse}
                    onClose={handleCloseModal}
                    selectedCourse={selectedCourse}
                />
            )}
        </div>
    );
}
