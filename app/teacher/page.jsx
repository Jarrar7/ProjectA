"use client";
import 'react-calendar/dist/Calendar.css';
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";

import SidebarStudentTeacher from '../components/SidebarStudentTeacher';
import Header from '../components/Header';

import CourseScheduleTable from '../components/CourseScheduleTable';
import YearSemesterFilter from '../components/YearSemesterFilter';

import Messages from '../components/Messages';
import CalendarComponent from '../components/CalendarComponent';
import Profile from '../components/Profile';
import Settings from '../components/Settings';

import { useUser } from "../context/UserContext";
import withRoleProtection from "../components/hoc/withRoleProtection";

function TeacherDashboard() {
    const [activeSection, setActiveSection] = useState('dashboard');
    const { logout, user } = useUser();
    const [items, setItems] = useState([]); // Dynamically fetched courses
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [courseSchedule, setCourseSchedule] = useState([]);
    const [courseParticipants, setParticipants] = useState([]);

    useEffect(() => {
        // Fetch teacher's courses on component mount
        const fetchCourses = async () => {
            if (!user) return;

            try {
                const { data: courses, error } = await supabase
                    .from("courses")
                    .select("id, course_name")
                    .eq("teacher_id", user.id);

                if (error) {
                    console.error("Error fetching courses:", error.message);
                    return;
                }

                setItems(courses);
            } catch (err) {
                console.error("Error fetching courses:", err);
            }
        };

        fetchCourses();
    }, [user]);

    const handleCourseClick = async (course) => {
        setSelectedCourse(course);

        try {
            // Fetch course schedule
            const { data: schedule, error: scheduleError } = await supabase
                .from("class_sessions")
                .select("*")
                .eq("course_id", course.id);

            if (scheduleError) {
                console.error("Error fetching course schedule:", scheduleError.message);
                return;
            }

            setCourseSchedule(schedule);




            // Fetch course participants with attendance data
            const { data: participants, error: participantsError } = await supabase.rpc(
                'fetch_participant_attendance', // Use a Supabase function for the SQL
                { course_uuid: course.id } // Pass the course ID
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
                        {/* Conditionally render the grid based on dashboard selection */}
                        {activeSection === 'dashboard' && !selectedCourse && (
                            <div>
                                <h2 className="text-2xl font-bold mb-4">Your Courses</h2>
                                <YearSemesterFilter />
                                <div className="grid grid-cols-3 gap-6">
                                    {items.map((course) => (
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
                            <CourseScheduleTable
                                schedule={courseSchedule}
                                participants={courseParticipants}
                                onBack={handleBackClick}
                            />
                        )}

                        {activeSection === 'messages' && (
                            <Messages />
                        )}

                        {activeSection === 'calendar' && (
                            <CalendarComponent />
                        )}
                        {activeSection === 'profile' && (
                            <div className="flex-1 overflow-auto">
                                <Profile />
                            </div>
                        )}
                        {activeSection === 'settings' && (
                            <div className="flex-1 overflow-auto">
                                <Settings />
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </main>
    );
}

export default withRoleProtection(TeacherDashboard, ["teacher"]);
