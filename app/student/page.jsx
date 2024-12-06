"use client";
import 'react-calendar/dist/Calendar.css';


import { useUser } from "../context/UserContext"




import CalendarComponent from '../components/CalendarComponent';
import Messages from '../components/Messages';
import { useState, useEffect } from "react";
import SidebarStudentTeacher from "../components/SidebarStudentTeacher";
import Header from "../components/Header";
import ParticipanceTable from "../components/ParticipanceTable.jsx";
import YearSemesterFilter from "../components/YearSemesterFilter";

import Profile from "../components/Profile";
import Notifications from "../components/Settings";

import { supabase } from "../../lib/supabaseClient";
import withRoleProtection from "../components/hoc/withRoleProtection";

function StudentDashboard() {
    const [activeSection, setActiveSection] = useState("dashboard");
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const { logout, user } = useUser();

    // Fetch courses for the logged-in student
    useEffect(() => {

        const fetchCourses = async () => {
            if (!user) return;

            setLoading(true);

            try {
                // Fetch enrollments for the student
                const { data: enrollments, error: enrollmentsError } = await supabase
                    .from("enrollments")
                    .select("course_id")
                    .eq("student_id", user.id);
                //console.log("user's session is: " + JSON.stringify(user.session))

                if (enrollmentsError) {
                    console.error("Error fetching enrollments:", enrollmentsError);
                    return;
                }

                // Fetch course details based on enrolled course IDs
                const courseIds = enrollments.map((enrollment) => enrollment.course_id);

                const { data: courses, error: coursesError } = await supabase
                    .from("courses")
                    .select("*")
                    .in("id", courseIds);

                if (coursesError) {
                    console.error("Error fetching courses:", coursesError);
                    return;
                }

                setCourses(courses);
            } catch (error) {
                console.error("Error fetching courses:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, [user]);

    const handleCourseClick = (course) => {
        setSelectedCourse(course);
    };

    const handleBackClick = () => {
        setSelectedCourse(null);
    };

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    return (
        <main>
            <div className="flex h-screen">
                {/* Sidebar */}
                <SidebarStudentTeacher
                    activeSection={activeSection}
                    setActiveSection={setActiveSection}
                    logout={logout}
                />

                {/* Main Content */}
                <div className="flex-1 flex flex-col">
                    {/* Header */}
                    <Header />

                    {/* Content Area */}
                    <main className="flex-1 bg-gray-100 p-6 overflow-auto">
                        {activeSection === "dashboard" && !selectedCourse && (
                            <div>
                                <h2 className="text-2xl font-bold mb-4">Your Courses</h2>
                                <YearSemesterFilter />

                                <div className="grid grid-cols-3 gap-6">
                                    {courses.map((course) => (
                                        <div key={course.id} className="bg-white shadow-md rounded-lg p-6">
                                            <button onClick={() => handleCourseClick(course)}>
                                                {course.course_name}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {selectedCourse && (
                            <ParticipanceTable
                                data={selectedCourse.schedule || []}
                                onBack={handleBackClick}
                            />
                        )}

                        {activeSection === 'messages' && (
                            <Messages />
                        )}

                        {activeSection === "calendar" && <CalendarComponent />}
                        {activeSection === "profile" && <Profile />}
                        {activeSection === "settings" && <Notifications />}
                    </main>
                </div>
            </div>
        </main>
    );
}

export default withRoleProtection(StudentDashboard, ["student"]);
