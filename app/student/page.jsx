"use client";
import 'react-calendar/dist/Calendar.css';
import { useState, useEffect } from "react";
import SidebarStudentTeacher from "../components/SidebarStudentTeacher";
import Header from "../components/Header";
import ParticipanceTable from "../components/ParticipanceTable";
import YearSemesterFilter from "../components/YearSemesterFilter";
import Messages from "../components/Messages"
import CalendarComponent from "../components/CalendarComponent";
import Profile from "../components/Profile";
import { useUser } from "../context/UserContext";
import { supabase } from "../../lib/supabaseClient";
import withRoleProtection from "../components/hoc/withRoleProtection";
import CourseSearch from "../components/CourseSearch";


function StudentDashboard() {
    const [activeSection, setActiveSection] = useState("dashboard");
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const { logout, user } = useUser();
    const [attendanceData, setAttendanceData] = useState([]); // To hold attendance data
    const [filteredCourses, setFilteredCourses] = useState([]);

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
                setFilteredCourses(courses);
            } catch (error) {
                console.error("Error fetching courses:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, [user]);

    // Fetch attendance records for the selected course
    const fetchAttendanceData = async (courseId) => {
        console.log("Fetching attendance data for course:", courseId); // Log the start of the function

        try {
            // Fetch session data for the given courseId
            const { data: sessionData, error: sessionError } = await supabase
                .from("class_sessions")
                .select("id, date, start_time, end_time, room")
                .eq("course_id", courseId);

            if (sessionError) {
                console.error("Error fetching class sessions:", sessionError.message);
                return;
            }

            // Extract session IDs and other session details
            const sessionDetails = sessionData.map(session => ({
                session_id: session.id,
                date: session.date,
                start_time: session.start_time,
                end_time: session.end_time,
                room: session.room
            }));

            // Fetch attendance records for the student based on session IDs
            const { data, error } = await supabase
                .from("attendance_records")
                .select("attended_hours, total_hours, session_id, student_id")
                .eq("student_id", user.id)
                .in("session_id", sessionDetails.map(session => session.session_id)); // Use the session IDs

            if (error) {
                console.error("Error fetching attendance data:", error.message);
                return;
            }

            // Log the raw data to inspect its structure
            console.log("Fetched Attendance Data:", data);

            // Combine session details with attendance data
            const attendanceData = sessionDetails.map(session => {
                const attendance = data.find(att => att.session_id === session.session_id);
                return {
                    ...session,
                    attended_hours: attendance ? attendance.attended_hours : 0,
                    total_hours: attendance ? attendance.total_hours : 0
                };
            });

            // Set the combined attendance data
            setAttendanceData(attendanceData);
        } catch (err) {
            console.error("Error fetching attendance data:", err);
        }
    };

    const handleCourseClick = (course) => {
        setSelectedCourse(course);
        fetchAttendanceData(course.id); // Fetch attendance data when course is clicked
    };

    const handleBackClick = () => {
        setSelectedCourse(null);
        setAttendanceData([]);
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading...</p>
            </div>
        );
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

                                {/* Course search component */}
                                <CourseSearch courses={courses} setFilteredCourses={setFilteredCourses} />

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                    {filteredCourses.map((course) => (
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
                                data={attendanceData}
                                onBack={handleBackClick}
                            />
                        )}

                        {activeSection === 'messages' && (
                            <Messages />
                        )}

                        {activeSection === "calendar" && <CalendarComponent />}
                        {activeSection === "profile" && <Profile />}
                    </main>
                </div>
            </div>
        </main>
    );
}

export default withRoleProtection(StudentDashboard, ["student"]);
