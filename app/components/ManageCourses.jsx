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
    });

    const handleSelectCourse = async (course) => {
        setSelectedCourse(course);

        try {
            const { data: studentsData, error: studentsError } = await supabase
                .from("enrollments")
                .select("student_id, profiles:student_id(firstName, lastName, human_id)")
                .eq("course_id", course.id);

            if (studentsError) throw studentsError;

            // Include both the student_id and the profile details
            setEnrolledStudents(
                studentsData.map((enrollment) => ({
                    student_id: enrollment.student_id,
                    ...enrollment.profiles, // Add profile details (firstName, lastName, human_id)
                }))
            );

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

    const handleAddStudent = async (studentId, courseId) => {
        try {
            // Validate the Student ID (Ensure it exists in the profiles table)
            const { data: student, error: validationError } = await supabase
                .from("profiles")
                .select("id")
                .eq("human_id", studentId) // Validate based on `human_id`
                .single();

            if (validationError || !student) {
                throw new Error("Invalid Student ID. Please check and try again.");
            }

            // Check if the student is already enrolled in the course
            const { data: existingEnrollment, error: enrollmentCheckError } = await supabase
                .from("enrollments")
                .select("*")
                .eq("student_id", student.id)
                .eq("course_id", courseId)
                .single();

            if (existingEnrollment) {
                throw new Error("This student is already enrolled in the course.");
            }

            if (enrollmentCheckError && enrollmentCheckError.code !== "PGRST116") {
                // Ignore the "Row not found" error (PGRST116) as it means the student is not enrolled
                throw enrollmentCheckError;
            }

            // Insert the student into the enrollments table
            const { error: insertError } = await supabase.from("enrollments").insert({
                student_id: student.id, // Use the profile ID
                course_id: courseId,
            });

            if (insertError) {
                throw new Error("Failed to enroll student. Please try again later.");
            }

            // Fetch the updated list of enrolled students
            const { data: updatedStudents, error: fetchError } = await supabase
                .from("enrollments")
                .select("student_id, profiles:student_id(firstName, lastName, human_id)")
                .eq("course_id", courseId);

            if (fetchError) {
                throw new Error("Failed to fetch updated students list.");
            }

            setEnrolledStudents(updatedStudents.map((enrollment) => enrollment.profiles || null));
            alert("Student successfully added!");
        } catch (error) {
            alert(error.message);
        }
    };

    const handleRemoveStudent = async (studentId, courseId) => {
        try {
            // Validate input
            if (!studentId || !courseId) {
                console.error("Invalid studentId or courseId:", { studentId, courseId });
                alert("Failed to remove student. Invalid data provided.");
                return;
            }

            console.log("Removing student with ID:", studentId);
            console.log("From course with ID:", courseId);

            // Check if the student is enrolled in the course
            const { data: existingEnrollment, error: enrollmentCheckError } = await supabase
                .from("enrollments")
                .select("*")
                .eq("student_id", studentId)
                .eq("course_id", courseId)
                .single();

            console.log("Existing enrollment fetched:", existingEnrollment, "Error:", enrollmentCheckError);

            if (!existingEnrollment) {
                throw new Error("This student is not enrolled in the course.");
            }

            if (enrollmentCheckError && enrollmentCheckError.code !== "PGRST116") {
                throw enrollmentCheckError;
            }

            // Remove the student from the enrollments table
            const { error: deleteError } = await supabase
                .from("enrollments")
                .delete()
                .eq("student_id", studentId)
                .eq("course_id", courseId);

            if (deleteError) {
                throw new Error("Failed to remove student. Please try again later.");
            }

            console.log("Student successfully removed. Fetching updated list...");

            // Fetch the updated list of enrolled students
            const { data: updatedStudents, error: fetchError } = await supabase
                .from("enrollments")
                .select("student_id, profiles:student_id(firstName, lastName, human_id)")
                .eq("course_id", courseId);

            console.log("Updated students list:", updatedStudents);

            if (fetchError) {
                throw new Error("Failed to fetch updated students list.");
            }

            setEnrolledStudents(updatedStudents.map((enrollment) => enrollment.profiles || null));
            alert("Student successfully removed!");
        } catch (error) {
            console.error("Error removing student:", error);
            alert(error.message || "An error occurred while removing the student.");
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
                    onAddStudent={handleAddStudent}
                    onRemoveStudent={handleRemoveStudent}

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
