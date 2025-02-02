"use client";
import "react-calendar/dist/Calendar.css";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";

import SidebarStudentTeacher from "../components/SidebarStudentTeacher";
import Header from "../components/Header";

import CourseScheduleTable from "../components/CourseScheduleTable";
import CourseSearch from "../components/CourseSearch"; // Updated to filter by year & semester
import Messages from "../components/Messages";
import CalendarComponent from "../components/CalendarComponent";
import Profile from "../components/Profile";
import { useUser } from "../context/UserContext";
import withRoleProtection from "../components/hoc/withRoleProtection";

function TeacherDashboard() {
    const [activeSection, setActiveSection] = useState("dashboard");
    const { logout, loading, user } = useUser();
    const [items, setItems] = useState([]); // Dynamically fetched courses
    const [filteredCourses, setFilteredCourses] = useState([]); // State for filtered courses
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [courseSchedule, setCourseSchedule] = useState([]);
    const [courseParticipants, setParticipants] = useState([]);

    useEffect(() => {
        if (!user || loading) return;

        const fetchCourses = async () => {
            try {
                const { data: courses, error } = await supabase
                    .from("courses")
                    .select("id, course_name, year, semester")
                    .eq("teacher_id", user.id);

                if (error) {
                    console.error("Error fetching courses:", error.message);
                    setItems([]);
                } else {
                    setItems(courses || []);
                    setFilteredCourses(courses || []); // Default to all courses
                }
            } catch (err) {
                console.error("Error fetching courses:", err);
            }
        };

        fetchCourses();
    }, [user, loading]);

    const handleCourseClick = async (course) => {
        setSelectedCourse(course);

        try {
            const { data: schedule, error: scheduleError } = await supabase
                .from("class_sessions")
                .select("*")
                .eq("course_id", course.id);

            if (scheduleError) {
                console.error("Error fetching course schedule:", scheduleError.message);
                return;
            }

            setCourseSchedule(schedule);

            const { data: participants, error: participantsError } = await supabase.rpc(
                "fetch_participant_attendance",
                { course_uuid: course.id }
            );

            if (participantsError) {
                console.error("Error fetching participants:", participantsError.message);
                return;
            }

            setParticipants(
                participants.map((participant) => ({
                    id: participant.student_id,
                    human_id: participant.human_id,
                    name: participant.full_name || "Unknown User",
                    attendance: `${participant.attended_sessions}/${participant.total_sessions}`,
                }))
            );
        } catch (err) {
            console.error("Error fetching course details:", err);
        }
    };

    const handleBackClick = () => {
        setSelectedCourse(null);
        setCourseSchedule([]);
        setParticipants([]);
    };

    const handleSectionChange = (section) => {
        setActiveSection(section);

        if (section !== "dashboard") {
            setSelectedCourse(null);
        }
    };

    return (
        <div className="flex h-screen">
            {/* Sidebar */}
            <SidebarStudentTeacher
                activeSection={activeSection}
                setActiveSection={handleSectionChange}
                logout={logout}
            />

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-screen dark:bg-gray-900">
                {/* Header */}
                <Header />

                {/* Content Area */}
                <div className="flex-1 bg-gray-100 dark:bg-gray-800 p-6 overflow-auto">
                    {activeSection === "dashboard" && !selectedCourse && (
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
                                Your Courses
                            </h2>

                            {/* Course Search - Now filters by Year & Semester */}
                            <CourseSearch courses={items} setFilteredCourses={setFilteredCourses} />

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {filteredCourses.map((course) => (
                                    <div
                                        key={course.id}
                                        className="bg-white dark:bg-gray-900 shadow-md rounded-lg p-6"
                                    >
                                        <button
                                            onClick={() => handleCourseClick(course)}
                                            className="text-gray-800 dark:text-gray-200"
                                        >
                                            {course.course_name} (Year {course.year}, Semester {course.semester})
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {selectedCourse && (
                        <CourseScheduleTable
                            schedule={courseSchedule}
                            participants={courseParticipants}
                            onBack={handleBackClick}
                            selectedCourse={selectedCourse}
                        />
                    )}

                    {activeSection === "messages" && <Messages />}

                    {activeSection === "calendar" && <CalendarComponent />}

                    {activeSection === "profile" && (
                        <div className="flex-1 overflow-auto">
                            <Profile />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default withRoleProtection(TeacherDashboard, ["teacher"]);
